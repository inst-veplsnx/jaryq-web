"use client";

import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import { User } from "@/types";

let _authSubscription: { unsubscribe: () => void } | null = null;

async function fetchProfile(userId: string): Promise<User | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    _authSubscription?.unsubscribe();
    _authSubscription = null;

    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ session, user: profile, loading: false });
      } else {
        set({ loading: false });
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event: string, session: import("@supabase/supabase-js").Session | null) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({ session, user: profile, loading: false, error: null });
        } else {
          set({ session: null, user: null, loading: false });
        }
      });

      _authSubscription = subscription;
    } catch {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Қате орын алды";
      set({ error: msg, loading: false });
      return { error: msg };
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Қате орын алды";
      set({ error: msg, loading: false });
      return { error: msg };
    }
  },

  signOut: async () => {
    _authSubscription?.unsubscribe();
    _authSubscription = null;
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    set({ user: null, session: null, error: null, loading: false });
  },
}));
