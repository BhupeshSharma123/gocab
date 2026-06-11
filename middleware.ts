import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  customer: ["/customer", "/api/rides", "/api/payments"],
  driver: ["/driver"],
  admin: ["/admin"],
};

const PUBLIC_ROUTES = ["/login", "/register", "/verify", "/api/webhook", "/"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options, maxAge: 0 });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some(r => path.startsWith(r))) return response;

  // Redirect to login if not authenticated
  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile) {
    // Check role-based access
    const isAdmin = path.startsWith("/admin") && profile.role !== "admin";
    const isDriver = path.startsWith("/driver") && profile.role !== "driver";
    const isCustomer = path.startsWith("/customer") && profile.role !== "customer";

    if (isAdmin) return NextResponse.redirect(new URL("/login", request.url));
    if (isDriver && profile.role === "customer") return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    if (isCustomer && profile.role === "driver") return NextResponse.redirect(new URL("/driver/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.svg).*)"],
};
