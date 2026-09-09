import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const ROLE_HOME: Record<string, string> = {
  cucina: "/cucina",
  sala: "/cassa",
  cassa: "/cassa",
  admin: "/admin",
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    url,
    anonKey,
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

  const path = request.nextUrl.pathname;
  const isStaffArea =
    path.startsWith("/cucina") ||
    path.startsWith("/cassa") ||
    path.startsWith("/admin");

  if (isStaffArea) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("staff_profiles")
      .select("role, active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.active) {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/login";
      url.searchParams.set("error", "not_authorized");
      return NextResponse.redirect(url);
    }

    const allowedRoot = ROLE_HOME[profile.role];
    const isAdmin = profile.role === "admin";
    if (!isAdmin && allowedRoot && !path.startsWith(allowedRoot)) {
      const url = request.nextUrl.clone();
      url.pathname = allowedRoot;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
