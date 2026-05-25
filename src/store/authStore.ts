"use client";

import { create } from "zustand";
import type { Session, User as SupabaseAuthUser, AuthChangeEvent } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { User } from "@/types";
import { translateAuthError } from "@/lib/authTranslations";

let _authSubscription: { unsubscribe: () => void } | null = null;
let _initPromise: Promise<void> | null = null;
let _profileHydrationToken = 0;

function readMetadataString(authUser: SupabaseAuthUser, key: string): string {
  const value = authUser.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

function buildFallbackUser(authUser: SupabaseAuthUser): User {
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    full_name:
      readMetadataString(authUser, "full_name") ||
      readMetadataString(authUser, "name"),
    created_at: authUser.created_at ?? new Date().toISOString(),
  };
}

function mergeProfileWithFallback(profile: User, fallback: User): User {
  return {
    ...fallback,
    ...profile,
    email: profile.email || fallback.email,
    full_name: profile.full_name || fallback.full_name,
    created_at: profile.created_at || fallback.created_at,
  };
}

async function fetchProfile(userId: string): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

async function getOrCreateProfile(session: Session): Promise<User | null> {
  const fallback = buildFallbackUser(session.user);
  const existingProfile = await fetchProfile(fallback.id);
  if (existingProfile) {
    return mergeProfileWithFallback(existingProfile, fallback);
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: fallback.id,
        email: fallback.email,
        full_name: fallback.full_name ?? "",
      })
      .select("*")
      .single();

    if (!error && data) {
      return mergeProfileWithFallback(data, fallback);
    }
  } catch {
    // If RLS or a trigger race blocks insert, keep using the auth fallback.
  }

  const profileAfterInsertAttempt = await fetchProfile(fallback.id);
  return profileAfterInsertAttempt
    ? mergeProfileWithFallback(profileAfterInsertAttempt, fallback)
    : null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  const hydrateProfile = async (session: Session, token: number) => {
    const profile = await getOrCreateProfile(session);
    if (!profile || token !== _profileHydrationToken) return;

    set((state) => {
      if (state.session?.user.id !== session.user.id) return state;
      return { user: profile };
    });
  };

  const applySession = (session: Session) => {
    const fallbackUser = buildFallbackUser(session.user);
    const token = ++_profileHydrationToken;

    set((state) => ({
      session,
      user:
        state.user?.id === fallbackUser.id
          ? {
              ...fallbackUser,
              ...state.user,
              email: fallbackUser.email || state.user.email,
            }
          : fallbackUser,
      loading: false,
      error: null,
    }));

    setTimeout(() => {
      void hydrateProfile(session, token);
    }, 0);
  };

  const clearSession = () => {
    _profileHydrationToken += 1;
    set({ session: null, user: null, loading: false, error: null });
  };

  return {
    user: null,
    session: null,
    loading: true,
    error: null,

    initialize: async () => {
      if (_initPromise) return _initPromise;
      _authSubscription?.unsubscribe();
      _authSubscription = null;

      _initPromise = (async () => {
        try {
          const supabase = getSupabaseClient();

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
              applySession(session);
            } else {
              clearSession();
            }
          });

          _authSubscription = subscription;

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) throw error;

          if (session?.user) {
            applySession(session);
          } else {
            clearSession();
          }
        } catch (err: unknown) {
          const translatedError = translateAuthError(
            (err as Error)?.message ?? "Инициализация сәтсіз аяқталды"
          );
          set({
            session: null,
            user: null,
            loading: false,
            error: translatedError,
          });
        }
      })().finally(() => {
        _initPromise = null;
      });

      return _initPromise;
    },

    signIn: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          const translated = translateAuthError(error.message);
          set({ error: translated, loading: false });
          return { error: translated };
        }
        if (data.session?.user) {
          applySession(data.session);
        } else {
          set({ loading: false });
        }
        return {};
      } catch (err: unknown) {
        const msg = translateAuthError((err as Error)?.message || "Қате орын алды");
        set({ error: msg, loading: false });
        return { error: msg };
      }
    },

    signUp: async (email, password, fullName) => {
      set({ loading: true, error: null });
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) {
          const translated = translateAuthError(error.message);
          set({ error: translated, loading: false });
          return { error: translated };
        }
        if (data.session?.user) {
          applySession(data.session);
        } else {
          set({ loading: false });
        }
        return {};
      } catch (err: unknown) {
        const msg = translateAuthError((err as Error)?.message || "Қате орын алды");
        set({ error: msg, loading: false });
        return { error: msg };
      }
    },

    signOut: async () => {
      try {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      clearSession();
    },
  };
});
