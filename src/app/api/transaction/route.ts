import { connectToDatabase } from "@/lib/mongodb";
import TransactionModel from "@/models/TransactionModel";
import Joi from "joi";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const transactionSchema = Joi.object({
  amount: Joi.number().required(),
  spentOn: Joi.string(),
  date: Joi.string(),
  category: Joi.string().required(),
});

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();

    // Get the token from headers
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    const decodedToken = await jwtVerify(
      token.split("Bearer ")[1],
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    // Validate the request body
    const { error } = transactionSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { message: error.details[0]?.message },
        { status: 400 }
      );
    }

    // Destructure validated body
    const { amount, spentOn, date, category } = body;

    // Connect to the database
    await connectToDatabase();

    // Create a new transaction
    const newTransaction = new TransactionModel({
      amount,
      spentOn,
      date,
      category,
      userId: decodedToken.payload?.userId,
    });

    await newTransaction.save();

    return NextResponse.json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (err) {
    console.error("Error creating transaction:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handler for GET requests to fetch transactions
export async function GET(req: Request) {
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

    console.log("before aggregate");

    const transactions = await TransactionModel.aggregate([
      {
        $match: {
          userId,
          deletedAt: null,
        },
      },
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
          category: { category: 1, icon: 1, id: 1 },
        },
      },
    ]);

    console.log("transactions", transactions);

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
