import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import "./config/passport.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import columnRoutes from "./routes/columnRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

// Allow the frontend to make requests with cookies.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Cookie parsing must happen before protected routes.
app.use(cookieParser());

// Initialize Passport without server-side sessions.
app.use(passport.initialize());

// Root endpoint.
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to TaskFlow API",
  });
});

// Health checks.
app.use("/api/health", healthRoutes);

// Authentication routes.
app.use("/api/auth", authRoutes);

// Board routes.
app.use("/api/boards", boardRoutes);

/*
 * Match column endpoints before entering columnRoutes.
 *
 * This prevents router.use(requireAuth) inside columnRoutes
 * from returning 401 for unrelated, nonexistent API paths.
 */
function matchesColumnRoute(path, method) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";

  const isBoardColumnsRoute =
    /^\/boards\/[^/]+\/columns$/.test(normalizedPath) &&
    ["GET", "POST", "HEAD"].includes(method);

  const isSingleColumnRoute =
    /^\/columns\/[^/]+$/.test(normalizedPath) &&
    ["PATCH", "DELETE"].includes(method);

  return isBoardColumnsRoute || isSingleColumnRoute;
}

app.use("/api", (req, res, next) => {
  if (!matchesColumnRoute(req.path, req.method)) {
    return next();
  }

  return columnRoutes(req, res, next);
});

/*
 * Match task endpoints before entering taskRoutes.
 */
function matchesTaskRoute(path, method) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";

  const isBoardTasksRoute =
    /^\/boards\/[^/]+\/tasks$/.test(normalizedPath) &&
    ["GET", "POST", "HEAD"].includes(method);

  const isReorderRoute =
    /^\/boards\/[^/]+\/tasks\/reorder$/.test(normalizedPath) &&
    method === "PATCH";

  const isSingleTaskRoute =
    /^\/tasks\/[^/]+$/.test(normalizedPath) &&
    ["PATCH", "DELETE"].includes(method);

  return (
    isBoardTasksRoute ||
    isReorderRoute ||
    isSingleTaskRoute
  );
}

app.use("/api", (req, res, next) => {
  if (!matchesTaskRoute(req.path, req.method)) {
    return next();
  }

  return taskRoutes(req, res, next);
});

// Handle unknown routes only after all route modules.
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Central error handler.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;