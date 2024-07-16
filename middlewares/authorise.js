import "dotenv/config";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
    if (err) return res.sendStatus(403);
    const user = await User.findById(payload.id);
    req.body["payload"] = user;
    req.payload = user;
    next();
  });
}
