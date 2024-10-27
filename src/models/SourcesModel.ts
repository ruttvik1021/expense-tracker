import mongoose, { Document, Schema } from "mongoose";

export interface SourceDocument extends Document {
  source: string;
  userId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

const SourceSchema: Schema<SourceDocument> = new Schema(
  {
    source: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const SourceModel =
  mongoose.models.Source ||
  mongoose.model<SourceDocument>("Source", SourceSchema);

export default SourceModel;
