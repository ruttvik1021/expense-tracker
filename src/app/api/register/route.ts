import { sendVerificationEmail } from "@/lib/mailService";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().min(8),
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

    const { email, password } = body;

    await connectToDatabase();

    const isUserAlreadyRegistered = await UserModel.findOne({ email });

    if (isUserAlreadyRegistered) {
      return NextResponse.json(
        { message: "User already exist" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("Password hashed")

    const { tokenExpiration, verificationToken } = await sendVerificationEmail({
      to: email,
    });

    console.log("Email Sent")

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      tokenExpiration,
    });

    await newUser.save();

    console.log("User Created")

    // const userNameForEmail = this.configService.get('NODEMAILER_USER');
    // const passwordForEmail = this.configService.get('NODEMAILER_PASS');
    // this.transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: userNameForEmail,
    //     pass: passwordForEmail,
    //   },
    // });

    const token = await new SignJWT({ userId: newUser._id })
      .setProtectedHeader({ alg: "HS256" }) // Algorithm used to sign
      .setIssuedAt() // Optional - sets 'iat' claim (issued at)
      .setExpirationTime("24h") // Optional - sets 'exp' claim (expiration)
      .sign(secret); // Signing key

    return NextResponse.json({ message: "Login successful", token });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
