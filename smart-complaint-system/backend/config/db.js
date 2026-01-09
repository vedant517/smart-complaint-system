import mongoose from "mongoose";

const connectDB = async () => {
  const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/complaints";
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB Connected to", MONGO_URI);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    throw err;
  }
};

export default connectDB;
