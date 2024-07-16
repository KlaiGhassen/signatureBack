import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import connectToDatabase from "./utils/databaseConnection.js";

import { notFoundError, errorHandler } from "./middlewares/error-handler.js";

// import routes
import authRoutes from "./routes/AuthRoute.js";
import userRoutes from "./routes/UserRoute.js";
import signatureRoutes from "./routes/SignatureRoute.js";
import { authenticateToken } from "./middlewares/authorise.js";

const app = express();
const port = process.env.PORT || 3000;

mongoose.set("debug", true);
mongoose.Promise = global.Promise;
connectToDatabase();

app.use(cors("*"));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/img", express.static("public/images"));
app.use("/files", express.static("public/files"));


app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.use("/signature", signatureRoutes);

app.use(notFoundError);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
