
import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

columnSchema.index({ boardId: 1, position: 1 });

export default mongoose.model("Column", columnSchema);
