const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { registerUser, loginUser } = require("../services/authService");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,               // HTTPS only in production
  sameSite: isProduction ? "none" : "strict", // cross-domain in prod, strict locally
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);

  res.cookie("refreshToken", data.refreshToken, cookieOptions);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      accessToken: data.accessToken,
      user: data.user,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);

  res.cookie("refreshToken", data.refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: data.accessToken,
      user: data.user,
    },
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token is missing", 401);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    data: {
      accessToken: newAccessToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
};
