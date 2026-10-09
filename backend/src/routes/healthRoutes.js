
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running",
  });
});

router.get("/db", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? "connected" : "disconnected",
  });
});

export default router;
