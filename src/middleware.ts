// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  const url = req.nextUrl.clone();

  
  const verifyEmailRoute = ["/verify-email"]
  const protectedRoutes = ["/category", "/transaction", "/dashboard", '/profile'];
  const unprotectedRoutes = ["/", "/login", "/register"];

  // Handle /verify-email route
  if (verifyEmailRoute.includes(url.pathname)) {
    url.pathname = token ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if(protectedRoutes.includes(url.pathname)) {
    if (token) {
      try {
        await jwtVerify(
          token.value,
          new TextEncoder().encode(process.env.JWT_SECRET!)
        );
        return NextResponse.next(); // Token is valid, proceed as normal
      } catch (err) {
        // If token verification fails, redirect to /login
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if(unprotectedRoutes.includes(url.pathname)){
    if (token) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/category", "/transaction", "/dashboard", "/verify-email", "/login", "/register", '/profile'],
};
