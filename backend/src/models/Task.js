
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true,
      index: true,
    },
    position: {
      type: Number,
      min: 0,
      default: 0,
    },
    label: {
      type: String,
      trim: true,
      default: "Product",
      maxlength: 50,
    },
    labels: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: {
      type: String,
      trim: true,
      default: "Not set",
      maxlength: 50,
    },
    assignee: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
  },
  { timestamps: true }
);

taskSchema.index({ columnId: 1, position: 1 });

export default mongoose.model("Task", taskSchema);
