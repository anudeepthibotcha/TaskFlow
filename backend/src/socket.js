
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import Board from "./models/Board.js";
import User from "./models/User.js";

export const boardRoom = (boardId) => `board:${String(boardId)}`;

function extractCookie(req, cookieName) {
  const cookieHeader = req?.headers?.cookie;

  if (!cookieHeader) return null;

  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");

    if (separator < 0) continue;

    const name = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim();

    if (name === cookieName) {
      try {
        return decodeURIComponent(value);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function registerSocketHandlers(io) {
  // Authenticate every Socket.io connection using the Day 2 JWT cookie.
  io.use(async (socket, next) => {
    try {
      if (!process.env.JWT_SECRET) {
        return next(new Error("Authentication configuration unavailable"));
      }

      const token = extractCookie(
        socket.handshake,
        "taskflow_token"
      );

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] }
      );

      if (!payload.sub || !mongoose.isValidObjectId(payload.sub)) {
        return next(new Error("Invalid authentication token"));
      }

      const user = await User.findById(payload.sub).select(
        "_id name email"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };

      return next();
    } catch {
      return next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    console.log(`Authenticated Socket.io connection: ${socket.id}`);

    // Join only after confirming the user's access to this board.
    socket.on("board:join", async (payload, acknowledge) => {
      const ack =
        typeof acknowledge === "function" ? acknowledge : () => {};

      try {
        const boardId = payload?.boardId;

        if (!mongoose.isValidObjectId(boardId)) {
          return ack({
            ok: false,
            message: "Invalid board ID",
          });
        }

        const board = await Board.findOne({
          _id: boardId,
          owner: user.id,
        }).select("_id");

        if (!board) {
          return ack({
            ok: false,
            message: "Board not found or access denied",
          });
        }

        const room = boardRoom(board._id);
        const alreadyJoined = socket.rooms.has(room);

        await socket.join(room);

        ack({
          ok: true,
          boardId: board._id.toString(),
          user: {
            id: user.id,
            name: user.name,
          },
        });

        if (!alreadyJoined) {
          socket.to(room).emit("user:joined", {
            boardId: board._id.toString(),
            user: {
              id: user.id,
              name: user.name,
            },
          });
        }
      } catch (error) {
        console.error("Socket board join failed:", error.message);

        ack({
          ok: false,
          message: "Could not join this board",
        });
      }
    });

    socket.on("board:leave", async (payload, acknowledge) => {
      const ack =
        typeof acknowledge === "function" ? acknowledge : () => {};

      const boardId = payload?.boardId;

      if (!mongoose.isValidObjectId(boardId)) {
        return ack({ ok: false, message: "Invalid board ID" });
      }

      const room = boardRoom(boardId);

      if (socket.rooms.has(room)) {
        socket.to(room).emit("user:left", {
          boardId: String(boardId),
          user: {
            id: user.id,
            name: user.name,
          },
        });

        await socket.leave(room);
      }

      return ack({ ok: true });
    });

    // On a disconnect, tell only the boards this socket was viewing.
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (!room.startsWith("board:")) continue;

        socket.to(room).emit("user:left", {
          boardId: room.slice("board:".length),
          user: {
            id: user.id,
            name: user.name,
          },
        });
      }
    });
  });
}
