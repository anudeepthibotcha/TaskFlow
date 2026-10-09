
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

const COOKIE_NAME = "taskflow_token";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: ONE_DAY_MS,
  path: "/",
});

// Only return fields that are safe to expose.
const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 1 to 100 characters",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details",
      });
    }

    return next(error);
  }
});

// POST /api/auth/login
router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Invalid email or password",
        });
      }

      try {
        const token = jwt.sign(
          { sub: user._id.toString() },
          process.env.JWT_SECRET,
          {
            algorithm: "HS256",
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
          }
        );

        res.cookie(COOKIE_NAME, token, cookieOptions());

        return res.status(200).json({
          success: true,
          message: "Login successful",
          user: publicUser(user),
        });
      } catch (tokenError) {
        return next(tokenError);
      }
    }
  )(req, res, next);
});

// GET /api/auth/me (protected)
router.get("/me", requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export default router;
