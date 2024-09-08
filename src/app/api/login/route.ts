// app/api/login/route.ts

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

  const user = await UserModel.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 }
    );
  }

  // Perform validation of the user credentials here
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || "your-secret",
    { expiresIn: "1h" }
  );

  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );

  return NextResponse.json({ message: "Login successful" }, { headers });
}
