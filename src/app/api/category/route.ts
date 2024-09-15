import { connectToDatabase } from "@/lib/mongodb";
import CategoryModel from "@/models/CategoryModel";
import Joi from "joi";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const schema = Joi.object({
  category: Joi.string().required(),
  icon: Joi.string().required(),
  budget: Joi.number().required(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorised",
        },
        { status: 401 }
      );
    }

    const decodedToken = await jwtVerify(
      token.split("Bearer ")[1],
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    const { error } = schema.validate(body);
    if (error) {
      return NextResponse.json(
        {
          message: error.details[0]?.message,
        },
        { status: 400 }
      );
    }

    const { category, icon, budget } = body;

    await connectToDatabase();

    const isCateogryAlreadyCreated = await CategoryModel.findOne({
      category,
      userId: decodedToken.payload?.userId,
      deletedAt: null,
    });

    if (isCateogryAlreadyCreated) {
      return NextResponse.json(
        { message: "Category already exist" },
        { status: 400 }
      );
    }

    const newCategory = new CategoryModel({
      category,
      icon,
      budget,
      userId: decodedToken.payload?.userId,
    });

    await newCategory.save();

    return NextResponse.json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    await connectToDatabase();
    // const now = new Date();
    // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const endOfMonth = new Date(
    //  now.getFullYear(),
    //  now.getMonth() + 1,
    //  0,
    //);

    const categories = await CategoryModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
          deletedAt: null,
        },
      },
      { $sort: { createdAt: -1 } },
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
                    // { $gte: ["$createdAt", startOfMonth] },
                    // { $lte: ["$createdAt", endOfMonth] },
                  ],
                },
                // deletedAt: null,
              },
            },
            {
              $project: {
                amount: 1, // Assuming 'amount' is the field you want to sum
                // createdAt: 1,
                // Add other fields you might need
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $unwind: "$transactions",
      },
      {
        $group: {
          _id: "$_id",
          category: { $first: "$category" },
          icon: { $first: "$icon" },
          budget: { $first: "$budget" },
          totalAmountSpent: { $sum: "$transactions.amount" },
        },
      },
    ]);

    return NextResponse.json({
      categories,
    });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
