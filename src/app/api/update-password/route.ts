import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import Joi from "joi";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const schema = Joi.object({
  currentPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = schema.validate(body);
    if (error) {
      return NextResponse.json(
        {
          message: error.details[0]?.message,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = body;

    // Token verification
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await jwtVerify(token.split("Bearer ")[1], secret);

    const { userId } = decodedToken.payload;

    // Connect to database
    await connectToDatabase();

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Compare current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Incorrect current password" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
