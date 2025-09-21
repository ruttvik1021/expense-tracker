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
});

interface LoginResult {
  success: boolean;
  message: string;
  token: string;
  isEmailVerified: boolean;
}

export async function loginUser(formData: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  try {
    const { email, password } = formData;

    const { error } = schema.validate({ email, password });
    if (error) {
      return {
        success: false,
        message: "Invalid credentials",
        token: "",
        isEmailVerified: false,
      };
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email });

    if (!user) {
      return {
        success: false,
        message: "Invalid credentials",
        token: "",
        isEmailVerified: false,
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return {
        success: false,
        message: "Invalid credentials",
        token: "",
        isEmailVerified: false,
      };
    }

    if (!user.isVerified) {
      const { tokenExpiration, verificationToken } =
        await sendVerificationEmail({ to: email });

      user.verificationToken = verificationToken;
      user.tokenExpiration = tokenExpiration;
      await user.save();
    }

    const token = await new SignJWT({ userId: user._id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    return {
      success: true,
      message: "Login successful",
      token: token || "",
      isEmailVerified: user.isVerified || false,
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      message: "Internal Server Error",
      token: "",
      isEmailVerified: false,
    };
  }
}
