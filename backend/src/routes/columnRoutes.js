
import express from "express";
import mongoose from "mongoose";

import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import requireAuth from "../middleware/requireAuth.js";
import {
  findOwnedBoard,
  isValidId,
} from "../utils/boardData.js";
import {
  handleRouteError,
  httpError,
} from "../utils/routeError.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/boards/:boardId/columns
router.get("/boards/:boardId/columns", async (req, res) => {
  try {
    const board = await findOwnedBoard(
      req.params.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Board not found");
    }

    const columns = await Column.find({
      boardId: board._id,
    }).sort({ position: 1 });

    return res.json({
      success: true,
      columns: columns.map((column) => ({
        id: column._id.toString(),
        title: column.title,
        position: column.position,
      })),
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// POST /api/boards/:boardId/columns
router.post("/boards/:boardId/columns", async (req, res) => {
  try {
    const board = await findOwnedBoard(
      req.params.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Board not found");
    }

    const { title } = req.body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100
    ) {
      throw httpError(400, "A valid column title is required");
    }

    const position = await Column.countDocuments({
      boardId: board._id,
    });

    const column = await Column.create({
      title: title.trim(),
      boardId: board._id,
      position,
    });

    return res.status(201).json({
      success: true,
      message: "Column created successfully",
      column: {
        id: column._id.toString(),
        title: column.title,
        position: column.position,
        tasks: [],
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// PATCH /api/columns/:columnId
router.patch("/columns/:columnId", async (req, res) => {
  try {
    const { columnId } = req.params;

    if (!isValidId(columnId)) {
      throw httpError(400, "Invalid column ID");
    }

    const column = await Column.findById(columnId);

    if (!column) {
      throw httpError(404, "Column not found");
    }

    const board = await findOwnedBoard(
      column.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Column not found");
    }

    const { title } = req.body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100
    ) {
      throw httpError(400, "A valid column title is required");
    }

    column.title = title.trim();
    await column.save();

    return res.json({
      success: true,
      message: "Column updated successfully",
      column: {
        id: column._id.toString(),
        title: column.title,
        position: column.position,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// DELETE /api/columns/:columnId
router.delete("/columns/:columnId", async (req, res) => {
  let session;

  try {
    if (!isValidId(req.params.columnId)) {
      throw httpError(400, "Invalid column ID");
    }

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const column = await Column.findById(
        req.params.columnId
      ).session(session);

      if (!column) {
        throw httpError(404, "Column not found");
      }

      const board = await findOwnedBoard(
        column.boardId,
        req.user._id,
        session
      );

      if (!board) {
        throw httpError(404, "Column not found");
      }

      // Tasks in this column are deleted in the same transaction.
      await Task.deleteMany(
        {
          boardId: board._id,
          columnId: column._id,
        },
        { session }
      );

      await Column.deleteOne(
        {
          _id: column._id,
          boardId: board._id,
        },
        { session }
      );
    });

    return res.json({
      success: true,
      message: "Column and its tasks deleted successfully",
    });
  } catch (error) {
    return handleRouteError(res, error);
  } finally {
    if (session) await session.endSession();
  }
});

export default router;
