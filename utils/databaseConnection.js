import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToDatabase = async () => {
  try {
    const mongoURI = process.env.DB_URL + "/" + process.env.DB_NAME;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB local");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectToDatabase;
