"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { UpdatePasswordPayload, UpdateProfilePayload } from "./schema";
import TransactionModel from "@/models/TransactionModel";
import mongoose, { PipelineStage } from "mongoose";

export const updateProfile = async (profile: UpdateProfilePayload) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const { name, budget } = profile;

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: decodedToken?.userId },
    { name, budget },
    { new: true, projection: { name: 1, budget: 1 } }
  );
  if (!updatedUser) return { error: "User not updated" };
  return { data: updatedUser };
};

export const getProfile = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const user = await UserModel.findById(decodedToken?.userId, {
    name: 1,
    budget: 1,
    createdAt: 1,
    isVerified: 1,
    _id: 0,
  });
  if (!user) return { error: "User not found" };
  return { data: user.toObject() };
};

export const updatePassword = async (values: UpdatePasswordPayload) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const user = await UserModel.findById(decodedToken?.userId);
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
