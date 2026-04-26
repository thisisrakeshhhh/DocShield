import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constant.js";

dotenv.config();

const buildMongoUri = (rawUri, dbName) => {
  if (!rawUri) {
    throw new Error("MONGODB_URL is missing in server/.env");
  }

  if (!rawUri.startsWith("mongodb://") && !rawUri.startsWith("mongodb+srv://")) {
    throw new Error(
      'Invalid MONGODB_URL. It must start with "mongodb://" or "mongodb+srv://"'
    );
  }

  const [base, query = ""] = rawUri.split("?");

  if (/\/[^/]+$/.test(base) && !base.endsWith(".net")) {
    return query ? `${base}?${query}` : base;
  }

  const normalizedBase = base.endsWith("/") ? `${base}${dbName}` : `${base}/${dbName}`;
  return query ? `${normalizedBase}?${query}` : normalizedBase;
};

const connectDB = async () => {
  try {
    const mongoUri = buildMongoUri(process.env.MONGODB_URL, DB_NAME);
    const connectionInstance = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected at host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
