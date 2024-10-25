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

export const getCurrentAndLastWeekTransactionSum = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  // Calculate start and end of current week (Monday to Sunday)
  const startOfWeek = new Date();
  const dayOfWeek = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0); // Set start of the current week

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // End of current week
  endOfWeek.setHours(23, 59, 59, 999);

  // Calculate start and end of the previous week (Monday to Sunday)
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7); // Start of last week
  startOfLastWeek.setHours(0, 0, 0, 0);

  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // End of last week
  endOfLastWeek.setHours(23, 59, 59, 999);

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
      },
    },
    {
      $facet: {
        currentWeekTransactions: [
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
              totalAmount: { $sum: "$amount" }, // Sum for current week
            },
          },
        ],
        lastWeekTransactions: [
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
                      startOfLastWeek,
                    ],
                  },
                  {
                    $lte: [
                      {
                        $dateFromString: {
                          dateString: "$date",
                        },
                      },
                      endOfLastWeek,
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" }, // Sum for last week
            },
          },
        ],
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  const currentWeekSum = result[0].currentWeekTransactions.length
    ? result[0].currentWeekTransactions[0].totalAmount
    : 0;
  const lastWeekSum = result[0].lastWeekTransactions.length
    ? result[0].lastWeekTransactions[0].totalAmount
    : 0;

  return {
    current: currentWeekSum,
    prev: lastWeekSum,
  };
};

export const getDailyAndYesterdayTransactionSum = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const endOfDayToday = new Date(today);
  endOfDayToday.setHours(23, 59, 59, 999); // End of today

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // Move date to yesterday
  const startOfYesterday = new Date(yesterday);
  startOfYesterday.setHours(0, 0, 0, 0); // Start of yesterday
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999); // End of yesterday

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
      },
    },
    {
      $facet: {
        todayTransactions: [
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
                      endOfDayToday,
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ],
        yesterdayTransactions: [
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
                      startOfYesterday,
                    ],
                  },
                  {
                    $lte: [
                      {
                        $dateFromString: {
                          dateString: "$date",
                        },
                      },
                      endOfYesterday,
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ],
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  const todaySum = result[0].todayTransactions.length
    ? result[0].todayTransactions[0].totalAmount
    : 0;
  const yesterdaySum = result[0].yesterdayTransactions.length
    ? result[0].yesterdayTransactions[0].totalAmount
    : 0;

  return {
    prev: yesterdaySum,
    current: todaySum,
  };
};

export const getCurrentAndLastMonthTransactionSum = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  // Calculate start and end of the current month
  const startOfMonth = new Date();
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
        currentMonthTransactions: [
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
                      startOfMonth,
                    ],
                  },
                  {
                    $lte: [
                      {
                        $dateFromString: {
                          dateString: "$date",
                        },
                      },
                      endOfMonth,
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" }, // Sum for current month
            },
          },
        ],
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

  const currentMonthSum = result[0].currentMonthTransactions.length
    ? result[0].currentMonthTransactions[0].totalAmount
    : 0;
  const lastMonthSum = result[0].lastMonthTransactions.length
    ? result[0].lastMonthTransactions[0].totalAmount
    : 0;

  return {
    current: currentMonthSum,
    prev: lastMonthSum,
  };
};

export const getLastMonthSummaryData = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const startOfMonth = new Date();
  startOfMonth.setDate(1); // Set to the first day of the current month
  startOfMonth.setHours(0, 0, 0, 0); // Start of the day

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
        // Ensure transactions are from last month
        date: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      },
    },
    {
      $facet: {
        totalAmount: [
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" }, // Total amount spent last month
            },
          },
        ],
        weeklyAvg: [
          {
            $group: {
              _id: null,
              weeklyTotal: { $sum: "$amount" }, // Total amount for each week
              count: { $sum: 1 }, // Count of transactions for each week
            },
          },
          {
            $group: {
              _id: null,
              weeklyAvg: { $avg: { $divide: ["$weeklyTotal", "$count"] } }, // Average for the week
            },
          },
        ],
        dailyAvg: [
          {
            $group: {
              _id: null,
              dailyTotal: { $sum: "$amount" }, // Total amount for each day
              count: { $sum: 1 }, // Count of transactions for each day
            },
          },
          {
            $group: {
              _id: null,
              dailyAvg: { $avg: { $divide: ["$dailyTotal", "$count"] } }, // Average for the day
            },
          },
        ],
      },
    },
    {
      $project: {
        totalAmount: { $arrayElemAt: ["$totalAmount.totalAmount", 0] },
        weeklyAvg: { $arrayElemAt: ["$weeklyAvg.weeklyAvg", 0] },
        dailyAvg: { $arrayElemAt: ["$dailyAvg.dailyAvg", 0] },
      },
    },
  ];

  const result = await TransactionModel.aggregate(pipeline);

  return {
    totalAmount: result[0].totalAmount || 0,
    weeklyAvg: result[0].weeklyAvg || 0,
    dailyAvg: result[0].dailyAvg || 0,
  };
};
