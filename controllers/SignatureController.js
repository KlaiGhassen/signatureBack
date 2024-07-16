import User from "../models/UserModel.js";
import "dotenv/config";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

function base64ToImage(base64String, filePath) {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  try {
    fs.writeFileSync(filePath, buffer);
    console.log(`Image saved to ${filePath}`);
  } catch (error) {
    console.log(error);
  }
}
export function extractFilename(url) {
  // Match the filename part between the last "/" and ".png"
  const regex = /\/([^/]+\.png)$/;

  // Extract the filename part using the regex
  const match = url.match(regex);

  // If a match is found, return the filename part
  if (match && match[1]) {
    return match[1];
  } else {
    // If no match is found, return null or handle it accordingly
    return null;
  }
}

export async function addSignature(req, res, next) {
  const previousImagePath = req.payload.signatureImage;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const imageName = "signature-" + Date.now() + ".png";
  const absoluteImagePath = path.join(__dirname, "../public", "images");
  base64ToImage(req.body.image, absoluteImagePath + "/" + imageName);

  if (previousImagePath) {
    fs.unlink(
      absoluteImagePath + "/" + extractFilename(previousImagePath),
      (err) => {
        if (err) {
          console.error("Error deleting previous signature image:", err);
        }
      }
    );
  }
  await User.updateOne(
    { _id: req.payload.id },
    {
      signatureImage: `${process.env.IMG_LINK}${imageName}`,
      status: "DONE",
    }
  );
  res.status(200).send({ image: true });
  try {
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}
