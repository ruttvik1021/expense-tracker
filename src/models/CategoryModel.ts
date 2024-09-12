import mongoose, { Document, Schema } from "mongoose";

// Define the Category interface based on the Mongoose document
export interface ICategory extends Document {
  category: string;
  icon: string;
  budget: number;
  userId: mongoose.Schema.Types.ObjectId; // Reference to a User document
  createdAt: Date;
  updatedAt: Date;
}

// Define the Category schema
const CategorySchema: Schema<ICategory> = new Schema(
  {
    category: { type: String, required: true },
    icon: { type: String, required: true },
    budget: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create or retrieve the Category model
const CategoryModel =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default CategoryModel;
