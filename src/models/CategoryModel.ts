import mongoose, { Document, Schema } from "mongoose";

// Define the Category interface based on the Mongoose document
export interface CategoryDocument extends Document {
  category: string;
  icon: string;
  budget: number;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

// Define the Category schema
const CategorySchema: Schema<CategoryDocument> = new Schema(
  {
    category: { type: String, required: true },
    icon: { type: String, required: true },
    budget: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the Category model
const CategoryModel =
  mongoose.models.Category ||
  mongoose.model<CategoryDocument>("Category", CategorySchema);

export default CategoryModel;
