import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireEnv } from "@/lib/env";

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const PROTECTED_PATHS = [
  "/home",
  "/books",
  "/new-arrivals",
  "/popular",
  "/genres",
  "/search",
  "/favorites",
  "/library",
  "/profile",
];

const AUTH_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname === p);

  if (isProtected && !user) {
    // Preserve where the user was headed so login can send them back there
    // instead of always dumping them on /home.
    const url = request.nextUrl.clone();
    const redirectTarget = pathname + request.nextUrl.search;
    url.search = "";
    url.pathname = "/login";
    url.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    const redirect = url.searchParams.get("redirect");
    const safe =
      redirect && redirect.startsWith("/") && !redirect.startsWith("//");
    url.search = "";
    url.pathname = safe ? redirect : "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|json|mp3|m4a|aac|woff|woff2|ttf)$).*)",
  ],
};
