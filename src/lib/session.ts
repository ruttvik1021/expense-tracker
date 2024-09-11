// import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const key = new TextEncoder().encode(process.env.JWT_SECRET!);

const cookie = {
  name: "session",
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
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userData: Record<string, unknown>) {
  const expires = new Date(Date.now() + cookie.duration); // Create a Date object
  const session = await encrypt({ ...userData, expires });

  cookies().set(cookie.name, session, { ...cookie.options, expires }); // Use Date object directly
  redirect("/");
}

export async function verifySession() {
  const decryptCookie = cookies().get(cookie.name)?.value;
  const userData = await decrypt(decryptCookie || "");
  if (!userData) {
    redirect("/login");
  }
  return userData;
}

export async function deleteSession() {
  cookies().delete(cookie.name);
  redirect("/login");
}
