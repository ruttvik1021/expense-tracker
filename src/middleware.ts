import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const url = req.nextUrl.clone();

  const verifyEmailRoute = ["/verify-email"];
  const protectedRoutes = [
    "/category",
    "/transaction",
    "/dashboard",
    "/profile",
  ];
  const unprotectedRoutes = ["/", "/login", "/register"];
  
  if (verifyEmailRoute.includes(url.pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  
  if (protectedRoutes && token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (unprotectedRoutes && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
