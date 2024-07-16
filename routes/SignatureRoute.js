import express from "express";
import { addSignature } from "../controllers/SignatureController.js";
import multer from "../middlewares/multer-config.js";
import { authenticateToken } from "../middlewares/authorise.js";

const router = express.Router();

router.post(
  "/add-signature",
   authenticateToken,
  // multer("image", 512 * 1024),
  addSignature
);

export default router;
