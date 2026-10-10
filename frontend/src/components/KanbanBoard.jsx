
import { useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  GripVertical,
  Plus,
  Tag,
  X,
} from "lucide-react";

import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";

const INITIAL_TASKS = {
  todo: [
    {
      id: "task-101",
      title: "Finalize wireframes",
      description: "Review the login and signup page designs.",
      label: "Design",
      priority: "High",
      dueDate: "Oct 14",
      assignee: "AN",
    },
    {
      id: "task-102",
      title: "Write API tests",
      description: "Prepare test cases for the authentication APIs.",
      label: "Backend",
      priority: "Medium",
      dueDate: "Oct 16",
      assignee: "RK",
    },
    {
      id: "task-103",
      title: "Prepare project documentation",
      description: "Document project requirements and setup steps.",
      label: "Documentation",
      priority: "Low",
      dueDate: "Oct 18",
      assignee: "MS",
    },
  ],
  inProgress: [
    {
      id: "task-201",
      title: "Build dashboard",
      description: "Implement responsive project summary cards.",
      label: "Frontend",
      priority: "High",
      dueDate: "Oct 12",
      assignee: "AN",
    },
    {
      id: "task-202",
      title: "Connect database",
      description: "Configure MongoDB connection and models.",
      label: "Backend",
      priority: "Medium",
      dueDate: "Oct 15",
      assignee: "RK",
    },
  ],
  done: [
    {
      id: "task-301",
      title: "Create repository",
      description: "Initialize the repository and project folders.",
      label: "Setup",
      priority: "Low",
      dueDate: "Oct 08",
      assignee: "AN",
    },
  ],
};

const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700",
    topBorder: "border-t-slate-400",
  },
  {
    id: "inProgress",
    title: "In Progress",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
    topBorder: "border-t-blue-500",
  },
  {
    id: "done",
    title: "Done",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    topBorder: "border-t-emerald-500",
  },
];

const LABEL_STYLES = {
  Design: "bg-violet-50 text-violet-700",
  Frontend: "bg-blue-50 text-blue-700",
  Backend: "bg-cyan-50 text-cyan-700",
  Documentation: "bg-amber-50 text-amber-800",
  Setup: "bg-slate-100 text-slate-700",
  Product: "bg-emerald-50 text-emerald-700",
  Testing: "bg-rose-50 text-rose-700",
};

const PRIORITY_STYLES = {
  High: "text-rose-700 bg-rose-50",
  Medium: "text-amber-700 bg-amber-50",
  Low: "text-slate-600 bg-slate-100",
};

function TaskCard({ task, index, columnId }) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    group: columnId,
    type: "task",
    accept: "task",
  });

  const labelStyle =
    LABEL_STYLES[task.label] || "bg-violet-50 text-violet-700";

  const priorityStyle =
    PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

  return (
    <article
      ref={ref}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm
        transition-shadow hover:shadow-md
        ${isDragging ? "opacity-50 shadow-lg" : ""}
        cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          size={18}
          className="mt-0.5 shrink-0 text-slate-300"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${labelStyle}`}
            >
              {task.label}
            </span>
          </div>

          <h4 className="mt-3 text-sm font-bold leading-5 text-slate-800">
            {task.title}
          </h4>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {task.description}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${priorityStyle}`}
            >
              {task.priority} priority
            </span>

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
              {task.assignee}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <CalendarDays size={13} />
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function BoardColumn({ column, tasks, onAddTask }) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    accept: "task",
    collisionPriority: -1,
  });

  return (
    <section
      ref={ref}
      aria-label={`${column.title} column`}
      className={`flex min-h-[430px] min-w-0 flex-col rounded-2xl
        border border-slate-200 border-t-4 bg-slate-50/80 p-3
        ${column.topBorder}
        ${isDropTarget ? "ring-2 ring-violet-300 ring-offset-1" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 px-1 py-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
          <h3 className="text-sm font-bold text-slate-800">
            {column.title}
          </h3>
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${column.badge}`}>
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(column.id)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-violet-700"
          aria-label={`Add task to ${column.title}`}
          title="Add task"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-3">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            columnId={column.id}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-36 flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 p-4 text-center">
            <div>
              <Circle size={20} className="mx-auto text-slate-300" />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Drop a task here
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddTask(column.id)}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 text-xs font-semibold text-slate-500 transition hover:border-violet-300 hover:bg-white hover:text-violet-700"
        >
          <Plus size={15} />
          Add task
        </button>
      </div>
    </section>
  );
}

function CreateTaskModal({
  columnTitle,
  onClose,
  onSubmit,
  title,
  setTitle,
  description,
  setDescription,
  label,
  setLabel,
  priority,
  setPriority,
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-heading"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="create-task-heading"
              className="text-xl font-bold text-slate-900"
            >
              Create a task
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              New task in {columnTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <label
          htmlFor="task-title"
          className="mt-6 block text-sm font-semibold text-slate-700"
        >
          Task title
        </label>
        <input
          id="task-title"
          required
          maxLength={200}
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Implement login page"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <label
          htmlFor="task-description"
          className="mt-4 block text-sm font-semibold text-slate-700"
        >
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the work to complete..."
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-label"
              className="block text-sm font-semibold text-slate-700"
            >
              Label
            </label>
            <select
              id="task-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option>Product</option>
              <option>Design</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Testing</option>
              <option>Documentation</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-semibold text-slate-700"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Create task
          </button>
        </div>
      </form>
    </div>
  );
}

export default function KanbanBoard({ board, onBack }) {
  const [tasks, setTasks] = useState(() =>
    structuredClone(INITIAL_TASKS)
  );

  const previousTasks = useRef(INITIAL_TASKS);

  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskLabel, setTaskLabel] = useState("Product");
  const [taskPriority, setTaskPriority] = useState("Medium");

  const totalTasks = Object.values(tasks).reduce(
    (total, columnTasks) => total + columnTasks.length,
    0
  );

  const completedTasks = tasks.done.length;

  function openTaskModal(columnId) {
    setNewTaskColumn(columnId);
    setTaskTitle("");
    setTaskDescription("");
    setTaskLabel("Product");
    setTaskPriority("Medium");
  }

  function closeTaskModal() {
    setNewTaskColumn(null);
    setTaskTitle("");
    setTaskDescription("");
  }

  function handleCreateTask(event) {
    event.preventDefault();

    const cleanTitle = taskTitle.trim();

    if (!cleanTitle || !newTaskColumn) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: cleanTitle,
      description: taskDescription.trim() || "No description provided.",
      label: taskLabel,
      priority: taskPriority,
      dueDate: "Not set",
      assignee: "U",
    };

    setTasks((currentTasks) => ({
      ...currentTasks,
      [newTaskColumn]: [...currentTasks[newTaskColumn], newTask],
    }));

    closeTaskModal();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
      >
        <ArrowLeft size={17} />
        Back to boards
      </button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
            <CheckCircle2 size={16} />
            Project workspace
          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {board?.name || "TaskFlow Board"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {board?.description ||
              "Organize tasks, track progress, and keep your team moving."}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
            <Tag size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-500">Tasks on this board</p>
            <p className="text-lg font-bold text-slate-900">{totalTasks}</p>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="font-semibold text-slate-700">Board progress</span>
        <div
          className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Board task completion"
          aria-valuemin={0}
          aria-valuemax={totalTasks || 1}
          aria-valuenow={completedTasks}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
              }%`,
            }}
          />
        </div>
        <span className="text-xs font-medium text-slate-500">
          {completedTasks} of {totalTasks} complete
        </span>
      </div>

      <div className="mt-7 overflow-x-auto pb-4">
        <DragDropProvider
          onDragStart={() => {
            previousTasks.current = structuredClone(tasks);
          }}
          onDragOver={(event) => {
            const { source } = event.operation;

            if (source?.type !== "task") return;

            setTasks((currentTasks) => move(currentTasks, event));
          }}
          onDragEnd={(event) => {
            if (event.canceled) {
              setTasks(structuredClone(previousTasks.current));
            }
          }}
        >
          <div className="grid min-w-[850px] grid-cols-3 items-start gap-4">
            {COLUMNS.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={tasks[column.id]}
                onAddTask={openTaskModal}
              />
            ))}
          </div>
        </DragDropProvider>
      </div>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        Tip: drag a task to another column to update its workflow status.
        Changes currently exist in frontend memory and are not saved to MongoDB.
      </p>

      {newTaskColumn && (
        <CreateTaskModal
          columnTitle={
            COLUMNS.find((column) => column.id === newTaskColumn)?.title ||
            "the board"
          }
          onClose={closeTaskModal}
          onSubmit={handleCreateTask}
          title={taskTitle}
          setTitle={setTaskTitle}
          description={taskDescription}
          setDescription={setTaskDescription}
          label={taskLabel}
          setLabel={setTaskLabel}
          priority={taskPriority}
          setPriority={setTaskPriority}
        />
      )}
    </div>
  );
}
