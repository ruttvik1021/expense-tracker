// app/actions/conversation.ts

"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { verifySession } from "@/lib/session";
import SavedConversationModel from "@/models/SavedConversation";

/**
 * Get all saved conversations for the logged-in user.
 */
export const getSavedConversations = async () => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const conversations = await SavedConversationModel.find({
    userId: decodedToken?.userId,
    deletedAt: null,
  }).sort({ updatedAt: -1 });

  return conversations;
};

/**
 * Get a single conversation by ID.
 */
export const getSavedConversationById = async (conversationId: string) => {
  const decodedToken = await verifySession();
  await connectToDatabase();

  const conversation = await SavedConversationModel.findOne({
    _id: conversationId,
    userId: decodedToken?.userId,
    deletedAt: null,
  });

  if (!conversation) return null;

  return conversation.toObject();
};

/**
 * Create a new saved conversation.
 */
export const createSavedConversation = async ({
  history,
  title = "Untitled Conversation",
}: {
  history: any[];
  title?: string;
}) => {
  try {
    const decodedToken = await verifySession();
    await connectToDatabase();

    const newConversation = new SavedConversationModel({
      userId: decodedToken?.userId,
      history: JSON.stringify(history),
      title,
    });

    await newConversation.save();

    return {
      message: "Conversation saved successfully",
      conversation: newConversation,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to save conversation",
    };
  }
};

/**
 * Update an existing saved conversation.
 */
export const updateSavedConversation = async ({
  conversationId,
  history,
  title,
}: {
  conversationId: string;
  history?: any[];
  title?: string;
}) => {
  try {
    const decodedToken = await verifySession();
    await connectToDatabase();

    const updateData: any = {};
    if (history) updateData.history = JSON.stringify(history);
    if (title !== undefined) updateData.title = title;

    const updated = await SavedConversationModel.findOneAndUpdate(
      { _id: conversationId, userId: decodedToken?.userId, deletedAt: null },
      updateData,
      { new: true }
    );

    if (!updated) {
      return { error: "Conversation not found or not accessible." };
    }

    return { message: "Conversation updated successfully" };
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to update conversation",
    };
  }
};

/**
 * Soft delete a saved conversation.
 */
export const removeSavedConversation = async (conversationId: string) => {
  try {
    const decodedToken = await verifySession();
    await connectToDatabase();

    const deleted = await SavedConversationModel.findOneAndUpdate(
      { _id: conversationId, userId: decodedToken?.userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!deleted) {
      return { error: "Conversation not found or already deleted." };
    }

    return { message: "Conversation deleted successfully" };
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to delete conversation",
    };
  }
};
