import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  budget: number;
  isVerified: boolean; // New field to track email verification status
  verificationToken: string | null; // Token to verify user's email
  tokenExpiration: Date | null; // Expiry time for the verification token
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    budget: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }, // Default is false until verified
    verificationToken: { type: String, default: null }, // Store token for verification
    tokenExpiration: { type: Date, default: null }, // Store expiration time for token
  },
  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
