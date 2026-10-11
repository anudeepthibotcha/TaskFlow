
import express from "express";
import mongoose from "mongoose";

import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import requireAuth from "../middleware/requireAuth.js";
import {
  buildBoardDto,
  findOwnedBoard,
} from "../utils/boardData.js";
import {
  handleRouteError,
  httpError,
} from "../utils/routeError.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/boards
router.get("/", async (req, res) => {
  try {
    const boards = await Board.find({
      owner: req.user._id,
    }).sort({ updatedAt: -1 });

    const result = await Promise.all(
      boards.map((board) => buildBoardDto(board))
    );

    return res.json({ success: true, boards: result });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// POST /api/boards
router.post("/", async (req, res) => {
  let session;

  try {
    const { name, description = "" } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      throw httpError(400, "Board name is required");
    }

    if (name.trim().length > 100) {
      throw httpError(400, "Board name cannot exceed 100 characters");
    }

    if (
      typeof description !== "string" ||
      description.trim().length > 1000
    ) {
      throw httpError(400, "Invalid board description");
    }

    session = await mongoose.startSession();
    let boardId;

    await session.withTransaction(async () => {
      const [board] = await Board.create(
        [
          {
            name: name.trim(),
            description: description.trim(),
            owner: req.user._id,
          },
        ],
        { session }
      );

      boardId = board._id;

      await Column.create(
        [
          {
            title: "To Do",
            boardId,
            position: 0,
          },
          {
            title: "In Progress",
            boardId,
            position: 1,
          },
          {
            title: "Done",
            boardId,
            position: 2,
          },
        ],
        { session }
      );
    });

    const savedBoard = await Board.findOne({
      _id: boardId,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Board created successfully",
      board: await buildBoardDto(savedBoard),
    });
  } catch (error) {
    return handleRouteError(res, error);
  } finally {
    if (session) await session.endSession();
  }
});

// GET /api/boards/:boardId
router.get("/:boardId", async (req, res) => {
  try {
    const board = await findOwnedBoard(
      req.params.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Board not found");
    }

    return res.json({
      success: true,
      board: await buildBoardDto(board),
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// PATCH /api/boards/:boardId
router.patch("/:boardId", async (req, res) => {
  try {
    const board = await findOwnedBoard(
      req.params.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Board not found");
    }

    const updates = {};

    if (req.body?.name !== undefined) {
      if (
        typeof req.body.name !== "string" ||
        !req.body.name.trim() ||
        req.body.name.trim().length > 100
      ) {
        throw httpError(400, "Invalid board name");
      }

      updates.name = req.body.name.trim();
    }

    if (req.body?.description !== undefined) {
      if (
        typeof req.body.description !== "string" ||
        req.body.description.trim().length > 1000
      ) {
        throw httpError(400, "Invalid board description");
      }

      updates.description = req.body.description.trim();
    }

    if (Object.keys(updates).length === 0) {
      throw httpError(400, "No valid fields supplied to update");
    }

    Object.assign(board, updates);
    await board.save();

    return res.json({
      success: true,
      board: await buildBoardDto(board),
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// DELETE /api/boards/:boardId
router.delete("/:boardId", async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const board = await findOwnedBoard(
        req.params.boardId,
        req.user._id,
        session
      );

      if (!board) {
        throw httpError(404, "Board not found");
      }

      await Task.deleteMany(
        { boardId: board._id },
        { session }
      );

      await Column.deleteMany(
        { boardId: board._id },
        { session }
      );

      await Board.deleteOne(
        { _id: board._id, owner: req.user._id },
        { session }
      );
    });

    return res.json({
      success: true,
      message: "Board deleted successfully",
    });
  } catch (error) {
    return handleRouteError(res, error);
  } finally {
    if (session) await session.endSession();
  }
});

export default router;
