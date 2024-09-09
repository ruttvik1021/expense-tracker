import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password)
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 }
    );

  await connectToDatabase();

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new UserModel({
    email,
    password: hashedPassword,
  });

  await newUser.save();

  const token = await new SignJWT({ userId: newUser._id })
    .setProtectedHeader({ alg: "HS256" }) // Algorithm used to sign
    .setIssuedAt() // Optional - sets 'iat' claim (issued at)
    .setExpirationTime("24h") // Optional - sets 'exp' claim (expiration)
    .sign(secret); // Signing key

  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );

  return NextResponse.json({ message: "Registration successful" }, { headers });
}
