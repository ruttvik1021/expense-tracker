import { connectToDatabase } from "@/lib/mongodb";
import TransactionModel from "@/models/TransactionModel";
import Joi from "joi";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const transactionSchema = Joi.object({
  amount: Joi.number().required(),
  spentOn: Joi.string().empty(""),
  date: Joi.string(),
  category: Joi.string().required(),
});

export async function POST(req: NextRequest) {
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
