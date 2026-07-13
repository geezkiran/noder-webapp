import mongoose from "mongoose";

export async function connectDatabase(uri: string) {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}
