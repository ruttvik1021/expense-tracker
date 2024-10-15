"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { UpdatePasswordPayload, UpdateProfilePayload } from "./schema";
import TransactionModel from "@/models/TransactionModel";
import mongoose from "mongoose";

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

export const getLastMonthAmount = async (date: Date) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const now = new Date(date);
  const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );
  const transactions = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        date: {
          $gte: firstDayOfLastMonth,
          $lt: firstDayOfThisMonth,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  return { amount: (transactions.length && transactions[0].total) || 0 };
};
