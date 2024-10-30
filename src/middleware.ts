import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  const url = req.nextUrl.clone();

  const protectedRoutes = ["/category", "/transaction", "/dashboard"];
  const unprotectedRoutes = ["/", "/login", "/register"];

  // If user tries to access /verify-email
  if (url.pathname === "/verify-email") {
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    } else {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users trying to access unprotected routes (login/register) to home page
  if (token && unprotectedRoutes.includes(url.pathname)) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect non-logged-in users trying to access protected routes to login
  if (!token && protectedRoutes.includes(url.pathname)) {
    url.pathname = url.pathname === "/register" ? "/register" : "/login";
    return NextResponse.redirect(url);
  }

  // Verify JWT token for protected routes
  if (token) {
    try {
      await jwtVerify(
        token.value,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      return NextResponse.next(); // Proceed to the protected route if the token is valid
    } catch (err) {
      url.pathname = "/login"; // Redirect to login if token verification fails
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next(); // Allow access to all unprotected routes (like / and others)
}

export const config = {
  matcher: [
    "/",
    "/category",
    "/transaction",
    "/dashboard",
    "/verify-email",
    "/login",
    "/register",
  ], // Apply middleware to these routes
};
