import { connectToDatabase } from "@/lib/mongodb";
import CategoryModel from "@/models/CategoryModel";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

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

    console.log("category", { id });

    if (!id) {
      return NextResponse.json(
        { message: "Bad Request: Missing ID parameter" },
        { status: 400 }
      );
    }

    const category = await CategoryModel.findByIdAndDelete(
      { _id: id },
      { returnOriginal: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: "Not Found: Category not found" },
        { status: 404 }
      );
    }

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
