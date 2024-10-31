// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  const url = req.nextUrl.clone();

  const protectedRoutes = ["/category", "/transaction", "/dashboard"];
  const unprotectedRoutes = ["/", "/login", "/register"];

  // Handle /verify-email route
  if (url.pathname === "/verify-email") {
    url.pathname = token ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from unprotected routes to /dashboard
  if (token && unprotectedRoutes.includes(url.pathname)) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect non-logged-in users to /login for protected routes
  if (!token && protectedRoutes.includes(url.pathname)) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If a token is present, verify its validity
  if (token) {
    try {
      await jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      return NextResponse.next(); // Token is valid, proceed as normal
    } catch (err) {
      // If token verification fails, redirect to /login
      url.pathname = "/register" ? "/register" : "/login";
      return NextResponse.redirect(url);
    }
  }

  // Allow access to unprotected routes if no token
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/category",
    "/transaction",
    "/dashboard",
    "/verify-email",
    "/login",
    "/register",
  ],
};
