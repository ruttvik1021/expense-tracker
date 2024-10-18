"use server";

import {
  isVerificationCodeExpired,
  sendVerificationEmail,
} from "@/lib/mailService";
import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import UserModel from "@/models/UserModel";

export const resendVerificationMail = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const user = await UserModel.findById(decodedToken?.userId);
  const { email } = user;
  const { tokenExpiration, verificationToken } = await sendVerificationEmail({
    to: email,
  });
  await UserModel.findByIdAndUpdate(decodedToken?.userId, {
    verificationToken,
    tokenExpiration,
  });
  return { message: "Verification email sent" };
};

export const verifyEmail = async (token: string) => {
  await connectToDatabase();
  const user = await UserModel.findOne({
    verificationToken: token,
  });
  const isExpired = isVerificationCodeExpired(user?.tokenExpiration);

  if (isExpired) {
    const decodedToken = await verifySession();
    if (decodedToken?.userId) {
      resendVerificationMail();
    }
    return {
      error: `Verification code expired, ${
        decodedToken?.userId
          ? "We have sent a new one"
          : "Login and resend code again"
      }.`,
    };
  }

  if (!user)
    return {
      error: "Invalid verification token.",
    };

  user.isVerified = true;
  user.verificationToken = null;
  user.tokenExpiration = null;
  await user.save();
  return { message: "Email verified" };
};
