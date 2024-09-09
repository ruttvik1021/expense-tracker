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
        {
          message: error.details[0]?.message,
        },
        { status: 400 }
      );
    }

    const { email, password } = body;

    await connectToDatabase();

    const isUserAlreadyRegistered = await UserModel.findOne({ email });

    if (isUserAlreadyRegistered) {
      return NextResponse.json(
        { message: "User already exist" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ message: "Login successful", token });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
