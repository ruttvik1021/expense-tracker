import mongoose, { Document, Schema } from "mongoose";

export interface SavedConversationDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  history: string; // Stored as a JSON string
  title?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SavedConversationSchema = new Schema<SavedConversationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    history: { type: String, required: true }, // JSON.stringify([...])
    title: { type: String },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const SavedConversationModel =
  mongoose.models.SavedConversation ||
  mongoose.model<SavedConversationDocument>(
    "SavedConversation",
    SavedConversationSchema
  );

export default SavedConversationModel;
