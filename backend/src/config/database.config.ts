import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI as string);
    console.log("Connected to Mongo database");
  } catch (error) {
    console.error("Error connecting to Mongo database");
    process.exit(1);
  }
};

export default connectDatabase;
