import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

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

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });

  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );

  return NextResponse.json({ message: "Registration successful" }, { headers });
}
