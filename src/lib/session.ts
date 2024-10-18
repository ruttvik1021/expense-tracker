"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = new TextEncoder().encode(process.env.JWT_SECRET!);

const cookie = {
  name: "token",
  options: {
    sameSite: "lax" as const, // Ensure that the value is correctly typed
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
  duration: 24 * 60 * 60 * 1000, // Duration in milliseconds
};

export async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1day")
    .sign(key);
}

export async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch (error) {
    deleteSession();
    return null;
  }
}

export async function createSession(userData: Record<string, unknown>) {
  const expires = new Date(Date.now() + cookie.duration); // Create a Date object
  const session = await encrypt({ ...userData, expires });
  cookies().set(cookie.name, session, { ...cookie.options, expires });
}

export async function verifySession() {
  const decryptCookie = cookies().get(cookie.name)?.value || "";
  const userData = await decrypt(decryptCookie);
  return userData;
}

export async function deleteSession() {
  cookies().delete(cookie.name);
}
