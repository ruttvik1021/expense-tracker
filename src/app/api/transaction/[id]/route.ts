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

export async function DELETE(req: Request) {
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

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "Bad Request: Missing ID parameter" },
        { status: 400 }
      );
    }

    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return NextResponse.json(
        { message: "Not Found: Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.deletedAt) {
      return NextResponse.json(
        { message: "Transaction already deleted" },
        { status: 400 }
      );
    }

    await TransactionModel.findByIdAndUpdate(
      { _id: id },
      {
        deletedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "Bad Request: Missing ID parameter" },
        { status: 400 }
      );
    }

    // Fetch the category to ensure it exists and is not deleted
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return NextResponse.json(
        { message: "Not Found: Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.deletedAt) {
      return NextResponse.json(
        { message: "Transaction is deleted and cannot be updated" },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const { error } = transactionSchema.validate(body);

    if (error) {
      return NextResponse.json(
        { message: error.details[0]?.message },
        { status: 400 }
      );
    }

    // Update the category with the provided data
    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
      id,
      body, // Only fields provided in the request will be updated
      { new: true } // Return the updated document
    );

    return NextResponse.json({
      message: "Transaction updated successfully",
      category: updatedTransaction,
    });
  } catch (err) {
    console.error("Internal Server Error:", err);
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

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "Bad Request: Missing ID parameter" },
        { status: 400 }
      );
    }

    // Fetch the category to ensure it exists and is not deleted
    const transaction = await TransactionModel.findById(id);

    if (!transaction || transaction.deletedAt) {
      return NextResponse.json(
        { message: "Not Found: Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
