import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); // Use req.cookies.get to access cookies
  const url = req.nextUrl.clone();

  const verifyEmailRoute = ["/verify-email"];
  const protectedRoutes = [
    "/category",
    "/transaction",
    "/dashboard",
    "/profile",
    "/chat",
  ];
  const unprotectedRoutes = ["/", "/login", "/register"];

  // Handle /verify-email route
  if (verifyEmailRoute.includes(url.pathname)) {
    url.pathname = token ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (protectedRoutes.includes(url.pathname)) {
    if (token) {
      try {
        await jwtVerify(
          token?.value,
          new TextEncoder().encode(process.env.JWT_SECRET!)
        );
        return NextResponse.next(); // Token is valid, proceed as normal
      } catch (err) {
        url.pathname = "/login"; // If token verification fails, redirect to /login
        return NextResponse.redirect(url);
      }
    }
    url.pathname = "/login"; // If no token, redirect to /login
    return NextResponse.redirect(url);
  }

  if (unprotectedRoutes.includes(url.pathname)) {
    if (token) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

// Use explicit paths in the matcher
export const config = {
  matcher: [
    "/verify-email",
    "/category",
    "/transaction",
    "/dashboard",
    "/profile",
    "/",
    "/login",
    "/register",
    "/chat",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
