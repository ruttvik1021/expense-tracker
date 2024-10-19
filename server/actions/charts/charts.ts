"use server";
import TransactionModel from "@/models/TransactionModel";
import { getCategories } from "../category/category";
import { CategorySortBy } from "../category/schema";
import { TransactionSortBy } from "../transaction/schema";
import { getTransactions } from "../transaction/transaction";
import { verifySession } from "@/lib/session";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose, { PipelineStage } from "mongoose";

export const getCategoriesForChart = async (
  categoryDate: Date,
  limit?: number
) => {
  const { categories } = await getCategories({
    categoryDate,
    sortBy: CategorySortBy.AMOUNT_SPENT,
    limit,
  });
  return { categories };
};

export const getTop5TransactionsOfMonth = async ({
  month,
  limit = 5,
}: {
  month: string;
  limit?: number;
}) => {
  const { transactions } = await getTransactions({
    month,
    sortBy: TransactionSortBy.AMOUNT,
    limit,
  });
  return (
    transactions
      ?.map((item) => {
        return {
          category: item.category.category,
          amount: item.amount,
          icon: item.category.icon,
          spentOn: item.spentOn,
        };
      })
      .filter((tran) => tran.amount > 0) || []
  );
};

export const getWeeklyTransactionSum = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const startOfWeek = new Date();
  const dayOfWeek = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when the day is Sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Set to end of the week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
        $expr: {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$date",
                  },
                },
                startOfWeek,
              ],
            },
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$date",
                  },
                },
                endOfWeek,
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }, // Sum up the amounts
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  return result.length ? result[0].totalAmount : 0;
};

export const getDailyTransactionSum = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the start of the day

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999); // Set to the end of the day

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
        $expr: {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$date",
                  },
                },
                today,
              ],
            },
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$date",
                  },
                },
                endOfDay,
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }, // Sum up the amounts
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  return result.length ? result[0].totalAmount : 0;
};

export const getMonthlyTransactionSum = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const startOfMonth = new Date();
  startOfMonth.setDate(1); // Set to the 1st day of the month
  startOfMonth.setHours(0, 0, 0, 0); // Start of the day

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to the next month
  endOfMonth.setDate(0); // Go back to the last day of the current month
  endOfMonth.setHours(23, 59, 59, 999); // End of the day

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
        $expr: {
          $and: [
            {
              $gte: [
                {
                  $dateFromString: {
                    dateString: "$date", // Convert the string date to Date
                  },
                },
                startOfMonth, // Compare to the target date
              ],
            },
            {
              $lte: [
                {
                  $dateFromString: {
                    dateString: "$date", // Convert the string date to Date
                  },
                },
                endOfMonth, // Compare to the target date
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }, // Sum up the amounts
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);
  return result.length ? result[0].totalAmount : 0;
};
