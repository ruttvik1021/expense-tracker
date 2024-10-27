import mongoose, { Document, Schema } from "mongoose";

// Define the Category interface based on the Mongoose document
export interface TransactionDocument extends Document {
  amount: number;
  spentOn: string;
  date: string;
  userId: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  deletedAt: Date;
  source?: mongoose.Schema.Types.ObjectId;
}

// Define the Category schema
const TransactionSchema: Schema<TransactionDocument> = new Schema(
  {
    amount: { type: Number, required: true },
    spentOn: { type: String, default: "" },
    date: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: Schema.Types.ObjectId, ref: "Source", required: false },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the Category model
const TransactionModel =
  mongoose.models.Transactions ||
  mongoose.model<TransactionDocument>("Transactions", TransactionSchema);

export default TransactionModel;
