
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TaskFlow API",
  });
});

app.use("/api/health", healthRoutes);

export default app;
