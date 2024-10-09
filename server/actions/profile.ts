"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { UpdatePasswordPayload, UpdateProfilePayload } from "../schema";
import UserModel from "@/models/UserModel";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Joi from "joi";
import bcrypt from "bcryptjs";

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
});

export const updateProfile = async (profile: UpdateProfilePayload) => {
  const cookie = cookies().get("token")?.value || "";
  const decodedToken = await jwtVerify(
    cookie,
    new TextEncoder().encode(process.env.JWT_SECRET!)
  );
  await connectToDatabase();
  const { name, budget } = profile;

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: decodedToken.payload.userId },
    { name, budget },
    { new: true, projection: { name: 1, budget: 1 } }
  );
  if (!updatedUser) return { error: "User not updated" };
  return { data: JSON.stringify(updatedUser) };
};

export const getProfile = async () => {
  const cookie = cookies().get("token")?.value || "";
  const decodedToken = await jwtVerify(
    cookie,
    new TextEncoder().encode(process.env.JWT_SECRET!)
  );
  await connectToDatabase();
  const user = await UserModel.findById(decodedToken.payload.userId, {
    name: 1,
    budget: 1,
    _id: 0,
  });
  if (!user) return { error: "User not found" };
  return { data: JSON.stringify(user) };
};

export const updatePassword = async (values: UpdatePasswordPayload) => {
  const cookie = cookies().get("token")?.value || "";
  const decodedToken = await jwtVerify(
    cookie,
    new TextEncoder().encode(process.env.JWT_SECRET!)
  );
  await connectToDatabase();
  const user = await UserModel.findById(decodedToken.payload.userId);
  const { currentPassword, newPassword } = values;
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return { error: "Invalid password" };
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedNewPassword;
  await user.save();
  return { message: "Password updated successfully" };
};
