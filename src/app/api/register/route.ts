import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import Joi from "joi";
import crypto from "crypto";
import nodemailer from "nodemailer";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex"); // Generate a random 32-byte string
}

const TOKEN_EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

export function isTokenExpired(expirationDate: Date): boolean {
  return Date.now() > new Date(expirationDate).getTime();
}

const getVerificationLink = (uniqueCode: string) => {
  return `${process.env.PROD_URL}/verify-email?token=${uniqueCode}`;
};

const signUpTemplate = (link: string) => {
  const url = getVerificationLink(link);
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Expense Tracker</title>
      </head>
      <body>
        <h1>Welcome to Expense Tracker</h1>
        <p>We are glad to have you on our platform.</p>
        <p>Click the below link to verify your email:</p>
        <a href="${url}" target='_blank'>${url}</a>
      </body>
      </html>
    `;
};

const sendVerificationEmail = async ({
  to,
  link,
}: {
  to: string;
  link: string;
}) => {
  const mailOptions = {
    from: "Talk-n-book@gmail.com",
    to,
    subject: "Email verification",
    html: signUpTemplate(link),
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  await transporter.sendMail(mailOptions);
};

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

    const verificationToken = generateRandomToken(); // Or use JWT method
    const tokenExpiration = new Date(Date.now() + TOKEN_EXPIRATION_DURATION); // 1 day

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      tokenExpiration,
    });

    await newUser.save();
    sendVerificationEmail({ to: email, link: verificationToken });

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
