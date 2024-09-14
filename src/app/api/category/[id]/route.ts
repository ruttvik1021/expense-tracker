import { connectToDatabase } from "@/lib/mongodb";
import CategoryModel from "@/models/CategoryModel";
import Joi from "joi";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const schema = Joi.object({
  category: Joi.string().optional(),
  icon: Joi.string().optional(),
  budget: Joi.number().optional(),
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

    const category = await CategoryModel.findById(id);

    if (!category) {
      return NextResponse.json(
        { message: "Not Found: Category not found" },
        { status: 404 }
      );
    }

    if (category.deletedAt) {
      return NextResponse.json(
        { message: "Category already deleted" },
        { status: 400 }
      );
    }

    await CategoryModel.findByIdAndUpdate(
      { _id: id },
      {
        deletedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Category deleted successfully",
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
    const category = await CategoryModel.findById(id);

    if (!category) {
      return NextResponse.json(
        { message: "Not Found: Category not found" },
        { status: 404 }
      );
    }

    if (category.deletedAt) {
      return NextResponse.json(
        { message: "Category is deleted and cannot be updated" },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const { error } = schema.validate(body);

    if (error) {
      return NextResponse.json(
        { message: error.details[0]?.message },
        { status: 400 }
      );
    }

    // Update the category with the provided data
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      body, // Only fields provided in the request will be updated
      { new: true } // Return the updated document
    );

    return NextResponse.json({
      message: "Category updated successfully",
      category: updatedCategory,
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
    const category = await CategoryModel.findById(id);

    if (!category || category.deletedAt) {
      return NextResponse.json(
        { message: "Not Found: Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (err) {
    console.error("Internal Server Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
