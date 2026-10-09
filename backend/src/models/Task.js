
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
      required: true,
      min: 0,
      default: 0,
    },
    labels: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

taskSchema.index({ columnId: 1, position: 1 });

export default mongoose.model("Task", taskSchema);
