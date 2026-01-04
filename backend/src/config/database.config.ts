import mongoose from "mongoose";
import { config } from "./app.config";

export async function connectDatabase(): Promise<void> {
  if (!config.MONGO_URI) {
    console.warn("MongoDB URI missing");
    return;
  }

  await mongoose.connect(config.MONGO_URI);
  console.log("Connected to Mongo database");
}
