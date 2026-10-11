
import mongoose from "mongoose";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";

export const isValidId = (id) => mongoose.isValidObjectId(id);

export async function findOwnedBoard(boardId, userId, session = null) {
  if (!isValidId(boardId)) {
    return null;
  }

  let query = Board.findOne({
    _id: boardId,
    owner: userId,
  });

  if (session) {
    query = query.session(session);
  }

  return query;
}

export function taskToDto(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description || "",
    boardId: task.boardId.toString(),
    columnId: task.columnId.toString(),
    position: task.position ?? 0,
    label: task.label || task.labels?.[0] || "Product",
    priority: task.priority || "Medium",
    dueDate: task.dueDate || "Not set",
    assignee: task.assignee || "",
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export async function buildBoardDto(board) {
  const [columns, tasks] = await Promise.all([
    Column.find({ boardId: board._id }).sort({ position: 1 }),
    Task.find({ boardId: board._id }).sort({
      position: 1,
      createdAt: 1,
    }),
  ]);

  const columnDtos = columns.map((column) => {
    const columnId = column._id.toString();

    return {
      id: columnId,
      title: column.title,
      position: column.position,
      tasks: tasks
        .filter((task) => task.columnId.toString() === columnId)
        .map(taskToDto),
    };
  });

  const doneColumnIds = new Set(
    columns
      .filter((column) => column.title.trim().toLowerCase() === "done")
      .map((column) => column._id.toString())
  );

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description || "",
    category: "General",
    color: "violet",
    due: "Not set",
    members: [],
    total: tasks.length,
    done: tasks.filter((task) =>
      doneColumnIds.has(task.columnId.toString())
    ).length,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    columns: columnDtos,
  };
}
