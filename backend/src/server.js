
import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import { registerSocketHandlers } from "./socket.js";

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false,
  },
});

// Make io available to Express route handlers.
app.set("io", io);

// Register authenticated connection and room handlers.
registerSocketHandlers(io);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`TaskFlow API running at http://localhost:${PORT}`);
      console.log(`Socket.io enabled for ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error("Failed to start TaskFlow:", error.message);
    process.exit(1);
  }
};

startServer();
