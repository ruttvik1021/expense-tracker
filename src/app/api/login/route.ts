// app/api/login/route.ts

import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import Joi from "joi";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = schema.validate(body);
    if (error) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = body;

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
    const token = await new SignJWT({ userId: user._id })
      .setProtectedHeader({ alg: "HS256" }) // Algorithm used to sign
      .setIssuedAt() // Optional - sets 'iat' claim (issued at)
      .setExpirationTime("24h") // Optional - sets 'exp' claim (expiration)
      .sign(secret); // Signing key

    const headers = new Headers();
    headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
    );

    return NextResponse.json({ message: "Login successful" }, { headers });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
