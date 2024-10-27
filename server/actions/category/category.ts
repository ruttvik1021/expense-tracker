"use server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import CategoryModel from "@/models/CategoryModel";
import TransactionModel from "@/models/TransactionModel";
import moment from "moment";
import mongoose, { PipelineStage } from "mongoose";
import {
  CategoryCreationDuration,
  CategorySchema,
  CategorySortBy,
  PeriodType,
} from "./schema";

export const createCategory = async (body: CategorySchema) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const { category, icon, budget, periodType, startMonth, creationDuration } =
    body;

  // Check if category already exists
  const isCategoryAlreadyCreated = await CategoryModel.findOne({
    category,
    userId: decodedToken?.userId,
    deletedAt: null,
  });

  if (periodType === PeriodType.ONCE) {
    if (isCategoryAlreadyCreated) {
      return { error: "Category already exists" };
    }

    const newCategory = new CategoryModel({
      category,
      icon,
      budget,
      userId: decodedToken?.userId,
      periodType: periodType,
    });

    await newCategory.save();

    return {
      message: "Category created successfully",
      category: {
        _id: newCategory._id.toString(),
        category: newCategory.category,
        icon: newCategory.icon,
        budget: newCategory.budget,
        totalAmountSpent: 0,
        periodType: periodType,
      },
    };
  } else {
    const categoriesToCreate = [];
    let periodStart: moment.Moment;

    // Determine periodStart based on startMonth and creationDuration
    if (creationDuration === CategoryCreationDuration.NEXT_12_MONTHS) {
      periodStart = moment()
        .month(startMonth - 1)
        .date(1);
      const endPeriod = moment().add(12, "months"); // 12 months from now

      while (periodStart.isBefore(endPeriod)) {
        categoriesToCreate.push(
          new CategoryModel({
            category,
            icon,
            budget,
            userId: decodedToken?.userId,
            createdAt: periodStart.toDate(),
            periodType: periodType,
          })
        );

        // Increment based on periodType
        switch (periodType) {
          case PeriodType.MONTHLY:
            periodStart.add(1, "months");
            break;
          case PeriodType.QUARTERLY:
            periodStart.add(3, "months");
            break;
          case PeriodType.HALF_YEARLY:
            periodStart.add(6, "months");
            break;
          case PeriodType.ANNUALLY:
            periodStart.add(1, "years");
            break;
          default:
            return { error: "Invalid period type" };
        }
      }
    } else if (creationDuration === CategoryCreationDuration.YEAR_END) {
      periodStart = moment()
        .month(startMonth - 1)
        .date(1);
      const endOfYear = moment().endOf("year"); // End of the current year

      while (periodStart.isBefore(endOfYear)) {
        categoriesToCreate.push(
          new CategoryModel({
            category,
            icon,
            budget,
            userId: decodedToken?.userId,
            createdAt: periodStart.toDate(),
            periodType: periodType,
          })
        );

        // Increment based on periodType
        switch (periodType) {
          case PeriodType.MONTHLY:
            periodStart.add(1, "months");
            break;
          case PeriodType.QUARTERLY:
            periodStart.add(3, "months");
            break;
          case PeriodType.HALF_YEARLY:
            periodStart.add(6, "months");
            break;
          case PeriodType.ANNUALLY:
            periodStart.add(1, "years");
            break;
          default:
            return { error: "Invalid period type" };
        }
      }
    } else {
      return { error: "Invalid creation duration" };
    }

    await CategoryModel.insertMany(categoriesToCreate);

    return {
      message: `${categoriesToCreate.length} categories created successfully`,
      categories: categoriesToCreate.map((cat) => ({
        _id: cat._id.toString(),
        category: cat.category,
        icon: cat.icon,
        budget: cat.budget,
        totalAmountSpent: 0,
        periodType: cat.periodType,
      })),
    };
  }
};

export const getCategories = async (body: {
  categoryDate: Date;
  sortBy: CategorySortBy;
  limit?: number;
}) => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const { categoryDate, sortBy, limit } = body;
  const startOfMonth = categoryDate ? new Date(categoryDate) : new Date();
  startOfMonth.setDate(1); // Set to the 1st day of the month
  startOfMonth.setHours(0, 0, 0, 0); // Start of the day

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to the next month
  endOfMonth.setDate(0); // Go back to the last day of the current month
  endOfMonth.setHours(23, 59, 59, 999); // End of the day

  let sortStage: any[] = [];

  switch (sortBy) {
    case CategorySortBy.BUDGET:
      sortStage = [{ $sort: { budget: -1 } }];
      break;
    case CategorySortBy.CATEGORY:
      sortStage = [{ $sort: { category: 1 } }];
      break;
    case CategorySortBy.RECENT_TRANSACTIONS:
      sortStage = [
        {
          $sort: { "transactions.createdAt": -1 },
        },
      ];
      break;
    case CategorySortBy.AMOUNT_SPENT:
      sortStage = []; // Sorting will be handled after $group for amountSpent
      break;
    default:
      sortStage.push({ $sort: { budget: -1 } });
      break;
  }

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(decodedToken?.userId as string),
        deletedAt: null,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $lookup: {
        from: "transactions",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$category", "$$categoryId"] },
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
              deletedAt: null,
            },
          },
          {
            $project: {
              amount: 1, // Ensure this field exists in the transactions collection
              createdAt: 1,
            },
          },
        ],
        as: "transactions",
      },
    },
    {
      $unwind: {
        path: "$transactions",
        preserveNullAndEmptyArrays: true, // Keep categories with no transactions
      },
    },
    {
      $group: {
        _id: "$_id",
        category: { $first: "$category" },
        icon: { $first: "$icon" },
        budget: { $first: "$budget" },
        totalAmountSpent: { $sum: "$transactions.amount" },
        periodType: { $first: "$periodType" },
      },
    },
    ...sortStage, // Apply sorting after $group
  ];

  if (sortBy === CategorySortBy.AMOUNT_SPENT) {
    pipeline.push({
      $sort: { totalAmountSpent: -1 }, // Sort by totalAmountSpent after grouping
    });
  }

  if (limit) {
    pipeline.push({ $limit: limit });
  }

  const categories = await CategoryModel.aggregate(pipeline);

  const serializedCategories = categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
  }));

  return { categories: serializedCategories };
};

export const getCategoryById = async (id: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  const category = await CategoryModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: decodedToken?.userId,
    deletedAt: null,
  });
  return { data: category };
};

export const deleteCategoryById = async (id: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();
  await CategoryModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      userId: decodedToken?.userId,
      deletedAt: null,
    },
    {
      deletedAt: new Date(),
    }
  );

  await TransactionModel.updateMany(
    { category: id },
    {
      $set: {
        deletedAt: new Date(),
      },
    }
  );

  return {
    message: "Category deleted successfully",
    id,
  };
};

export const updateCategoryById = async ({
  id,
  values,
}: {
  id: string;
  values: CategorySchema;
}) => {
  await verifySession();
  await connectToDatabase();
  const updatedCategory = await CategoryModel.findByIdAndUpdate(id, values, {
    new: true,
  });

  const plainObject = updatedCategory.toObject();

  return {
    message: "Category updated successfully",
    category: plainObject,
  };
};
