import express from "express";
import mongoose from "mongoose";

import Column from "../models/Column.js";
import Task from "../models/Task.js";
import requireAuth from "../middleware/requireAuth.js";

import {
  findOwnedBoard,
  isValidId,
  taskToDto,
} from "../utils/boardData.js";

import {
  handleRouteError,
  httpError,
} from "../utils/routeError.js";

import { emitBoardEvent } from "../utils/boardEvents.js";

const router = express.Router();

router.use(requireAuth);

// GET /api/boards/:boardId/tasks
router.get("/boards/:boardId/tasks", async (req, res) => {
  try {
    const board = await findOwnedBoard(
      req.params.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Board not found");
    }

    const filter = {
      boardId: board._id,
    };

    if (req.query.columnId !== undefined) {
      if (!isValidId(req.query.columnId)) {
        throw httpError(400, "Invalid column ID");
      }

      const column = await Column.findOne({
        _id: req.query.columnId,
        boardId: board._id,
      });

      if (!column) {
        throw httpError(404, "Column not found");
      }

      filter.columnId = column._id;
    }

    const tasks = await Task.find(filter).sort({
      position: 1,
      createdAt: 1,
    });

    return res.json({
      success: true,
      tasks: tasks.map(taskToDto),
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// POST /api/boards/:boardId/tasks
router.post("/boards/:boardId/tasks", async (req, res) => {
  try {
    const board = await findOwnedBoard(
      req.params.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Board not found");
    }

    const {
      title,
      description = "",
      columnId,
      label = "Product",
      priority = "Medium",
      dueDate = "Not set",
      assignee = "",
    } = req.body ?? {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200
    ) {
      throw httpError(
        400,
        "A valid task title is required"
      );
    }

    if (!isValidId(columnId)) {
      throw httpError(
        400,
        "A valid column ID is required"
      );
    }

    const column = await Column.findOne({
      _id: columnId,
      boardId: board._id,
    });

    if (!column) {
      throw httpError(
        400,
        "Column does not belong to this board"
      );
    }

    if (
      typeof description !== "string" ||
      description.length > 1000
    ) {
      throw httpError(400, "Invalid task description");
    }

    const position = await Task.countDocuments({
      boardId: board._id,
      columnId: column._id,
    });

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      boardId: board._id,
      columnId: column._id,
      position,
      label,
      priority,
      dueDate,
      assignee,
    });

    // Notify connected clients after task creation succeeds.
    emitBoardEvent(req, "task:created", board._id, {
      taskId: task._id.toString(),
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: taskToDto(task),
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// PATCH /api/boards/:boardId/tasks/reorder
router.patch(
  "/boards/:boardId/tasks/reorder",
  async (req, res) => {
    let session;

    try {
      const { boardId } = req.params;
      const { columns } = req.body ?? {};

      if (!Array.isArray(columns)) {
        throw httpError(
          400,
          "A columns array is required"
        );
      }

      session = await mongoose.startSession();

      await session.withTransaction(async () => {
        const board = await findOwnedBoard(
          boardId,
          req.user._id,
          session
        );

        if (!board) {
          throw httpError(404, "Board not found");
        }

        const existingColumns = await Column.find({
          boardId: board._id,
        }).session(session);

        const existingColumnIds = existingColumns.map(
          (column) => column._id.toString()
        );

        const requestedColumnIds = columns.map(
          (column) => column.columnId
        );

        if (
          requestedColumnIds.some(
            (id) => !isValidId(id)
          ) ||
          new Set(requestedColumnIds).size !==
            requestedColumnIds.length ||
          existingColumnIds.length !==
            requestedColumnIds.length ||
          existingColumnIds.some(
            (id) => !requestedColumnIds.includes(id)
          )
        ) {
          throw httpError(
            400,
            "The reorder request must include each board column exactly once"
          );
        }

        for (const column of columns) {
          if (!Array.isArray(column.taskIds)) {
            throw httpError(
              400,
              "Each column must contain taskIds"
            );
          }

          if (
            column.taskIds.some(
              (id) => !isValidId(id)
            )
          ) {
            throw httpError(
              400,
              "Invalid task ID in reorder request"
            );
          }
        }

        const requestedTaskIds = columns.flatMap(
          (column) => column.taskIds
        );

        if (
          new Set(requestedTaskIds).size !==
          requestedTaskIds.length
        ) {
          throw httpError(
            400,
            "A task cannot appear more than once"
          );
        }

        const existingTasks = await Task.find({
          boardId: board._id,
        })
          .select("_id")
          .session(session);

        const existingTaskIds = existingTasks.map(
          (task) => task._id.toString()
        );

        if (
          existingTaskIds.length !==
            requestedTaskIds.length ||
          existingTaskIds.some(
            (id) => !requestedTaskIds.includes(id)
          )
        ) {
          throw httpError(
            400,
            "The reorder request must include every board task exactly once"
          );
        }

        // Update the tasks sequentially within the transaction.
        for (const column of columns) {
          for (
            let position = 0;
            position < column.taskIds.length;
            position++
          ) {
            const result = await Task.updateOne(
              {
                _id: column.taskIds[position],
                boardId: board._id,
              },
              {
                $set: {
                  columnId: column.columnId,
                  position,
                },
              },
              {
                session,
              }
            );

            if (result.matchedCount !== 1) {
              throw httpError(
                400,
                "A task could not be updated during reordering"
              );
            }
          }
        }
      });

      // Emit the event only after the transaction succeeds.
      emitBoardEvent(
        req,
        "task:moved",
        req.params.boardId,
        {
          action: "reordered",
        }
      );

      return res.json({
        success: true,
        message: "Task ordering saved successfully",
      });
    } catch (error) {
      return handleRouteError(res, error);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
);

// PATCH /api/tasks/:taskId
router.patch("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidId(taskId)) {
      throw httpError(400, "Invalid task ID");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw httpError(404, "Task not found");
    }

    const board = await findOwnedBoard(
      task.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Task not found");
    }

    // Save the original column to detect whether the task moves.
    const originalColumnId = task.columnId.toString();

    const fields = [
      "title",
      "description",
      "label",
      "priority",
      "dueDate",
      "assignee",
    ];

    for (const field of fields) {
      if (req.body?.[field] !== undefined) {
        task[field] = req.body[field];
      }
    }

    if (req.body?.columnId !== undefined) {
      if (!isValidId(req.body.columnId)) {
        throw httpError(400, "Invalid column ID");
      }

      const targetColumn = await Column.findOne({
        _id: req.body.columnId,
        boardId: board._id,
      });

      if (!targetColumn) {
        throw httpError(
          400,
          "Column does not belong to this board"
        );
      }

      if (
        targetColumn._id.toString() !==
        task.columnId.toString()
      ) {
        task.columnId = targetColumn._id;

        if (req.body.position === undefined) {
          task.position = await Task.countDocuments({
            boardId: board._id,
            columnId: targetColumn._id,
          });
        }
      }
    }

    if (req.body?.position !== undefined) {
      if (
        !Number.isInteger(req.body.position) ||
        req.body.position < 0
      ) {
        throw httpError(
          400,
          "Position must be a non-negative integer"
        );
      }

      task.position = req.body.position;
    }

    await task.save();

    const newColumnId = task.columnId.toString();

    // Emit the correct event based on whether the column changed.
    emitBoardEvent(
      req,
      newColumnId !== originalColumnId
        ? "task:moved"
        : "task:updated",
      board._id,
      {
        taskId: task._id.toString(),
        columnId: newColumnId,
      }
    );

    return res.json({
      success: true,
      message: "Task updated successfully",
      task: taskToDto(task),
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// DELETE /api/tasks/:taskId
router.delete("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidId(taskId)) {
      throw httpError(400, "Invalid task ID");
    }

    const task = await Task.findById(taskId);

    if (!task) {
      throw httpError(404, "Task not found");
    }

    const board = await findOwnedBoard(
      task.boardId,
      req.user._id
    );

    if (!board) {
      throw httpError(404, "Task not found");
    }

    await Task.deleteOne({
      _id: task._id,
      boardId: board._id,
    });

    // Notify connected clients after the deletion succeeds.
    emitBoardEvent(req, "task:deleted", board._id, {
      taskId: task._id.toString(),
      columnId: task.columnId.toString(),
    });

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

export default router;