import { connectToDatabase } from "@/lib/mongodb";
import TransactionModel from "@/models/TransactionModel";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    // Extract the token from the Authorization header
    const authorizationHeader = req.headers.get("authorization");

    if (!authorizationHeader) {
      return NextResponse.json(
        { message: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const token = authorizationHeader.split("Bearer ")[1].trim();

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token format" },
        { status: 401 }
      );
    }

    // Verify the token
    let decodedToken;
    try {
      decodedToken = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return NextResponse.json(
        { message: "Unauthorized: Token verification failed" },
        { status: 401 }
      );
    }

    const userId = decodedToken.payload?.userId;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: User ID missing in token" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();
    const body = await req.json();

    const { categoryId, month } = body;
    const startOfMonth = month ? new Date(month) : new Date();
    startOfMonth.setDate(1); // Set to the 1st day of the month
    startOfMonth.setHours(0, 0, 0, 0); // Start of the day

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1); // Move to the next month
    endOfMonth.setDate(0); // Go back to the last day of the current month
    endOfMonth.setHours(23, 59, 59, 999); // End of the day

    const transactions = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
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
      { $sort: { createdAt: -1 } },
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
        $project: {
          _id: 1,
          amount: 1,
          spentOn: 1,
          date: 1,
          category: { category: 1, icon: 1, _id: 1 },
        },
      },
    ]);

    return NextResponse.json({
      transactions,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
