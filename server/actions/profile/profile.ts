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

export const getLastMonthAmount = async (date: Date) => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const startOfMonth = new Date(date);
  startOfMonth.setDate(1); // Set to the first day of the current month
  startOfMonth.setHours(0, 0, 0, 0); // Start of the day

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to next month
  endOfMonth.setDate(0); // Go back to the last day of the current month
  endOfMonth.setHours(23, 59, 59, 999); // End of the day

  // Calculate start and end of the previous month
  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1); // Move to last month
  startOfLastMonth.setDate(1); // Set to the first day of the previous month
  startOfLastMonth.setHours(0, 0, 0, 0); // Start of the day

  const endOfLastMonth = new Date(startOfLastMonth);
  endOfLastMonth.setMonth(startOfLastMonth.getMonth() + 1); // Move to next month
  endOfLastMonth.setDate(0); // Last day of the previous month
  endOfLastMonth.setHours(23, 59, 59, 999); // End of the day

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
      },
    },
    {
      $facet: {
        lastMonthTransactions: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $gte: [
                      {
                        $dateFromString: {
                          dateString: "$date",
                        },
                      },
                      startOfLastMonth,
                    ],
                  },
                  {
                    $lte: [
                      {
                        $dateFromString: {
                          dateString: "$date",
                        },
                      },
                      endOfLastMonth,
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" }, // Sum for last month
            },
          },
        ],
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  return {
    amount: result[0].lastMonthTransactions.length
      ? result[0].lastMonthTransactions[0].totalAmount
      : 0,
  };
};
