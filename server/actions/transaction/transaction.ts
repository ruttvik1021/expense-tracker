"use server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import TransactionModel from "@/models/TransactionModel";
import mongoose, { PipelineStage } from "mongoose";
import { ITransaction, ITransactionFilter } from "./schema";

export const addTransactionFn = async (values: ITransaction) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const { amount, spentOn, date, category, source } = values;
  const newTransaction = new TransactionModel({
    amount,
    spentOn,
    date,
    category,
    userId: decodedToken?.userId,
    source,
  });

  await newTransaction.save();

  return {
    message: "Transaction created successfully",
    transaction: newTransaction.toObject(),
  };
};

export const getTransactions = async (body: Partial<ITransactionFilter>) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const { categoryId, month, sortBy, limit } = body;
  const startOfMonth = month ? new Date(month) : new Date();
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
        ...(categoryId
          ? { category: new mongoose.Types.ObjectId(categoryId as string) }
          : {}),
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
      $addFields: {
        dateAsDate: {
          $dateFromString: {
            dateString: "$date", // Convert the string date to a Date object
          },
        },
      },
    },
    { $sort: { dateAsDate: -1 } },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $lookup: {
        from: "sources",
        localField: "source",
        foreignField: "_id",
        as: "source",
      },
    },
    { $unwind: "$source" },
    {
      $project: {
        _id: 1,
        amount: 1,
        spentOn: 1,
        date: 1,
        source: { source: 1, _id: 1 },
        category: { category: 1, icon: 1, _id: 1 },
      },
    },
  ];

  if (sortBy) {
    pipeline.push({ $sort: { [sortBy]: -1 } });
  }

  if (limit) {
    pipeline.push({ $limit: limit });
  }

  const transactions = await TransactionModel.aggregate(pipeline);

  return { transactions };
};

export const getTransactionById = async (id: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const transaction = await TransactionModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: decodedToken?.userId,
    deletedAt: null,
  });
  return { data: transaction };
};

export const deleteTransactionFn = async (id: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  await TransactionModel.findOneAndDelete(
    { _id: id, userId: decodedToken?.userId, deletedAt: null },
    {
      deletedAt: new Date(),
    }
  );
  return {
    message: "Transaction deleted successfully",
    id,
  };
};

export const updateTransactionFn = async ({
  id,
  values,
}: {
  id: string;
  values: ITransaction;
}) => {
  await verifySession();
  await connectToDatabase();
  const updatedTransaction = await TransactionModel.findByIdAndUpdate(
    id,
    values, // Only fields provided in the request will be updated
    { new: true } // Return the updated document
  );
  const plainObject = updatedTransaction.toObject();
  return {
    message: "Transaction updated successfully",
    transaction: plainObject,
  };
};
