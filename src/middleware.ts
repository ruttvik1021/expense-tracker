// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
  const url = req.nextUrl.clone();

  if (!token) {
    // Clone the request URL object
    url.pathname = "/login"; // Specify the absolute path
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(
      token.value,
      new TextEncoder().encode("your-generated-token")
    );
    return NextResponse.next();
  } catch (err) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard"],
};
