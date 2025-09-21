"use server";

import { sendVerificationEmail } from "@/lib/mailService";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

interface RegisterResult {
  success: boolean;
  message: string;
  token?: string;
}

export async function registerUser(formData: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<RegisterResult> {
  try {
    const { email, password, confirmPassword } = formData;

    const { error } = schema.validate({ email, password, confirmPassword });
    if (error) {
      return {
        success: false,
        message: error.details[0]?.message || "Validation error",
      };
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { tokenExpiration, verificationToken } = await sendVerificationEmail({
      to: email,
    });

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      tokenExpiration,
    });

    await newUser.save();

    const token = await new SignJWT({ userId: newUser._id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    return { success: true, message: "Signup successful", token };
  } catch (err) {
    console.error("Register error:", err);
    return { success: false, message: "Internal Server Error" };
  }
}
