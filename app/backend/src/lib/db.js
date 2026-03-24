import mongoose from "mongoose";

import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    if (!ENV.DB_URL) {
      console.warn("⚠️ DB_URL not defined, skipping database connection");
      return;
    }
    const conn = await mongoose.connect(ENV.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log("✅ Connected to MongoDB:", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error);
    console.warn("⚠️ Continuing without database connection");
    // Don't exit, continue without DB
  }
};

