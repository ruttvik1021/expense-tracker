import mongoose, { Document, Schema } from "mongoose";

// Define the Category interface based on the Mongoose document
export interface TransactionDocument extends Document {
  amount: number;
  spentOn: string;
  date: string;
  userId: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

// Define the Category schema
const TransactionSchema: Schema<TransactionDocument> = new Schema(
  {
    amount: { type: Number, required: true },
    spentOn: { type: String },
    date: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the Category model
const TransactionModel =
  mongoose.models.transactions ||
  mongoose.model<TransactionDocument>("Transactions", TransactionSchema);

export default TransactionModel;
