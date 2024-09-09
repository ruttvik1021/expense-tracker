import mongoose from "mongoose";

let cachedClient: mongoose.Mongoose | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    console.log("cachedClient", cachedClient)
    return cachedClient;
  }

  try {
    const client = await mongoose.connect(process.env.MONGODB_URI!);
    console.log("client", client)
    cachedClient = client;
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
