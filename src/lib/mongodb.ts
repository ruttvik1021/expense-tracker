import mongoose from "mongoose";

let cachedClient: mongoose.Mongoose | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = await mongoose.connect(process.env.MONGODB_URI!);
    cachedClient = client;
    return client;
  } catch (error) {
    throw new Error("Failed to connect to MongoDB");
  }
}