import User from "../models/UserModel.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import RefreshTokens from "../models/RefreshToken.js";
export async function login(req, res, next) {
  const { email, matricule } = req.body;
  try {
    let user = await User.findOne({ email: email, matricule: matricule });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No User with those information" });
    }

    // Check and delete existing refresh token
    await RefreshTokens.findOneAndDelete({ user_id: user._id });

    let payload = {
      id: user._id,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    const newRefreshToken = new RefreshTokens({
      token: refreshToken,
      user_id: user._id,
    });
    let refreshTokenDb = await newRefreshToken.save();
    res.refreshToken = refreshTokenDb.token;
    await User.updateOne(
      { _id: user.id, status: { $not: { $eq: "DONE" } } },
      { status: "LOGIN" }
    );
    user = await User.findOne({ email: email, matricule: matricule });
    let userJWT = {
      refreshToken: refreshToken,
      accessToken: accessToken,
      expiresIn: "24h",
    };
    Object.assign(userJWT, user._doc);
    res.status(200).json(userJWT);
    console.log(userJWT);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}
export async function logout(req, res, next) {
  const id = req.body.payload.id;
  const refreshToken = await RefreshTokens.deleteMany({ user_id: id });
  if (refreshToken.deletedCount > 0) {
    res.cookie("refreshTokens", "", {
      expiresIn: Date.now(),
      httpOnly: true,
    });
    res.status(201).json({ message: "logout" });
  } else {
    res.status(403).json({ message: "logout failed" });
  }
}

export async function getAccessTokenFromRefreshToken(req, res, next) {
  let verify = false;
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  const refreshTokens = await RefreshTokens.find();
  for (let token of refreshTokens) {
    if (token.token == refreshToken) {
      verify = true;
      break;
    }
  }
  if (!verify) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    let newPayload = {
      id: payload.id,
      role: payload.role,
    };
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken(newPayload);
    res.json({ accessToken: accessToken });
  });
}
export async function getUserFromToken(req, res, next) {
  const id = req.body.payload.id;
  const user = await User.findById(id).populate("product");
  let newPayload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(newPayload);
  res.user = user;
  res.accessToken = accessToken;
  next();
}

// get access token from refresh token

function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "24h",
  });
}
