import mongoose from "mongoose";

let cachedClient: mongoose.Mongoose | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    console.log("DB Already Connected")
    return cachedClient;
  }

  try {
    const client = await mongoose.connect(process.env.MONGODB_URI!);
    console.log("DB Connected")
    cachedClient = client;
    return client;
  } catch (error) {
    console.log(error)
    throw new Error("Failed to connect to MongoDB");
  }
}
