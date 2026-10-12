import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import {
  DragDropProvider,
  useDroppable,
} from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";

import { createTaskFlowSocket } from "../socket.js";
import { api } from "../api.js";

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
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

const COLUMN_COLORS = [
  "border-t-slate-400",
  "border-t-blue-500",
  "border-t-emerald-500",
  "border-t-violet-500",
  "border-t-amber-500",
];

function TaskCard({ task, index, columnId, onEdit, onDelete }) {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    group: columnId,
    type: "task",
    accept: "task",
  });

  const labelStyle =
    LABEL_STYLES[task.label] || LABEL_STYLES.Product;

  const priorityStyle =
    PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

  return (
    <article
      ref={ref}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm
        transition-shadow hover:shadow-md
        ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          size={18}
          className="mt-1 shrink-0 cursor-grab text-slate-300 active:cursor-grabbing"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${labelStyle}`}
            >
              {task.label || "Product"}
            </span>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(task, columnId)}
                aria-label={`Edit ${task.title}`}
                title="Edit task"
                className="rounded-md p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-700"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete ${task.title}`}
                title="Delete task"
                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <h4 className="mt-3 text-sm font-bold leading-5 text-slate-800">
            {task.title}
          </h4>

          <p className="mt-2 break-words text-xs leading-5 text-slate-500">
            {task.description || "No description provided."}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${priorityStyle}`}
            >
              {task.priority || "Medium"} priority
            </span>

            <div
              title={task.assignee || "Unassigned"}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700"
            >
              {task.assignee
                ? task.assignee.slice(0, 2).toUpperCase()
                : "—"}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <CalendarDays size={13} />
            <span>{task.dueDate || "Not set"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function BoardColumn({
  column,
  index,
  tasks,
  onAddTask,
  onRename,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
}) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    accept: "task",
    collisionPriority: -1,
  });

  const dotColors = [
    "bg-slate-400",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
  ];

  return (
    <section
      ref={ref}
      aria-label={`${column.title} column`}
      className={`flex min-h-[420px] min-w-0 flex-col rounded-2xl border border-slate-200 border-t-4 bg-slate-50/80 p-3 ${
        COLUMN_COLORS[index % COLUMN_COLORS.length]
      } ${isDropTarget ? "ring-2 ring-violet-300 ring-offset-1" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 px-1 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              dotColors[index % dotColors.length]
            }`}
          />

          <h3 className="truncate text-sm font-bold text-slate-800">
            {column.title}
          </h3>

          <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
            {tasks.length}
          </span>
        </div>

        <details className="relative shrink-0">
          <summary
            className="list-none cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-white"
            aria-label={`${column.title} options`}
          >
            <MoreHorizontal size={18} />
          </summary>

          <div className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => onRename(column)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
            >
              Rename column
            </button>

            <button
              type="button"
              onClick={() => onDeleteColumn(column)}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Delete column
            </button>
          </div>
        </details>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-3">
        {tasks.map((task, taskIndex) => (
          <TaskCard
            key={task.id}
            task={task}
            index={taskIndex}
            columnId={column.id}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-400">
            Drop tasks here
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

function TaskFormModal({
  task,
  columnTitle,
  draft,
  setDraft,
  onClose,
  onSave,
  saving,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSave}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="task-form-title"
              className="text-xl font-bold text-slate-900"
            >
              {task ? "Edit task" : "Create task"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {task
                ? "Update the task details."
                : `Add to ${columnTitle}.`}
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
          className="mt-5 block text-sm font-semibold text-slate-700"
        >
          Title
        </label>

        <input
          id="task-title"
          required
          maxLength={200}
          autoFocus
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
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
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.target.value })
          }
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
              value={draft.label}
              onChange={(event) =>
                setDraft({ ...draft, label: event.target.value })
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
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
              value={draft.priority}
              onChange={(event) =>
                setDraft({ ...draft, priority: event.target.value })
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <label
          htmlFor="task-assignee"
          className="mt-4 block text-sm font-semibold text-slate-700"
        >
          Assignee initials (optional)
        </label>

        <input
          id="task-assignee"
          maxLength={100}
          value={draft.assignee}
          onChange={(event) =>
            setDraft({ ...draft, assignee: event.target.value })
          }
          placeholder="e.g. AN"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
        />

        <label
          htmlFor="task-due-date"
          className="mt-4 block text-sm font-semibold text-slate-700"
        >
          Due date (optional)
        </label>

        <input
          id="task-due-date"
          type="date"
          value={
            /^\d{4}-\d{2}-\d{2}$/.test(draft.dueDate)
              ? draft.dueDate
              : ""
          }
          onChange={(event) =>
            setDraft({
              ...draft,
              dueDate: event.target.value || "Not set",
            })
          }
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
        />

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
            disabled={saving}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : task
                ? "Save changes"
                : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}

const EMPTY_DRAFT = {
  title: "",
  description: "",
  label: "Product",
  priority: "Medium",
  dueDate: "Not set",
  assignee: "",
};

export default function KanbanBoard({
  board,
  onBack,
  onBoardUpdated,
}) {
  const [columns, setColumns] = useState(board.columns || []);

  const initialTasks = Object.fromEntries(
    (board.columns || []).map((column) => [
      column.id,
      column.tasks || [],
    ])
  );

  const [tasksByColumn, setTasksByColumn] = useState(initialTasks);
  const tasksRef = useRef(initialTasks);
  const previousTasks = useRef(initialTasks);

  const [taskModal, setTaskModal] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Real-time connection and presence state.
  const [realtimeStatus, setRealtimeStatus] = useState("connecting");
  const [presenceNotice, setPresenceNotice] = useState("");

  // Subscribe to live board changes.
  useEffect(() => {
    const socket = createTaskFlowSocket();
    let active = true;

    async function refreshFromServer(payload) {
      if (
        payload?.boardId &&
        String(payload.boardId) !== String(board.id)
      ) {
        return;
      }

      try {
        const result = await api(`/boards/${board.id}`);

        if (!active) return;

        const latestColumns = result.board.columns || [];

        const nextTasks = Object.fromEntries(
          latestColumns.map((column) => [
            column.id,
            column.tasks || [],
          ])
        );

        setColumns(latestColumns);

        // Synchronize rendered state and the drag-and-drop reference.
        tasksRef.current = nextTasks;
        setTasksByColumn(nextTasks);

        // Refresh dashboard summaries when a callback is provided.
        await onBoardUpdated?.();
      } catch (err) {
        if (!active) return;

        setError(
          `Unable to refresh board: ${err.message}`
        );
      }
    }

    function handleConnect() {
      if (!active) return;

      setRealtimeStatus("joining");

      // Join the board room after each connection or reconnection.
      socket.emit(
        "board:join",
        { boardId: board.id },
        async (result) => {
          if (!active) return;

          if (!result?.ok) {
            setRealtimeStatus("offline");

            setError(
              result?.message ||
                "Unable to join the board room"
            );

            return;
          }

          setRealtimeStatus("live");

          // Fetch the current database state after joining.
          await refreshFromServer({
            boardId: board.id,
          });
        }
      );
    }

    function handleDisconnect() {
      if (!active) return;

      setRealtimeStatus("reconnecting");
    }

    function handleConnectError(socketError) {
      if (!active) return;

      setRealtimeStatus("offline");

      setError(
        `Real-time connection failed: ${socketError.message}`
      );
    }

    function handleBoardChange(payload) {
      void refreshFromServer(payload);
    }

    function handleUserJoined(payload) {
      if (
        payload?.boardId &&
        String(payload.boardId) !== String(board.id)
      ) {
        return;
      }

      if (payload?.user?.name) {
        setPresenceNotice(
          `${payload.user.name} joined this board.`
        );
      }
    }

    function handleUserLeft(payload) {
      if (
        payload?.boardId &&
        String(payload.boardId) !== String(board.id)
      ) {
        return;
      }

      if (payload?.user?.name) {
        setPresenceNotice(
          `${payload.user.name} left this board.`
        );
      }
    }

    async function handleBoardDeleted(payload) {
      if (
        payload?.boardId &&
        String(payload.boardId) !== String(board.id)
      ) {
        return;
      }

      setError(
        "This board was deleted or access was removed."
      );

      try {
        await onBoardUpdated?.();
      } catch (err) {
        console.error(
          "Unable to refresh boards after deletion:",
          err
        );
      } finally {
        if (active) {
          onBack();
        }
      }
    }

    const boardEvents = [
      "task:moved",
      "task:created",
      "task:updated",
      "task:deleted",
      "column:created",
      "column:updated",
      "column:deleted",
      "board:updated",
    ];

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    boardEvents.forEach((eventName) => {
      socket.on(eventName, handleBoardChange);
    });

    socket.on("user:joined", handleUserJoined);
    socket.on("user:left", handleUserLeft);
    socket.on("board:deleted", handleBoardDeleted);

    socket.connect();

    return () => {
      active = false;

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      boardEvents.forEach((eventName) => {
        socket.off(eventName, handleBoardChange);
      });

      socket.off("user:joined", handleUserJoined);
      socket.off("user:left", handleUserLeft);
      socket.off("board:deleted", handleBoardDeleted);

      // Disconnecting removes this socket from its board rooms.
      socket.disconnect();
    };
  }, [board.id]);

  function updateTasks(nextOrUpdater) {
    const next =
      typeof nextOrUpdater === "function"
        ? nextOrUpdater(tasksRef.current)
        : nextOrUpdater;

    tasksRef.current = next;
    setTasksByColumn(next);
  }

  function showError(err) {
    setError(
      err.message ||
        "The operation could not be completed."
    );
  }

  async function refreshDashboard() {
    try {
      await onBoardUpdated?.();
    } catch (err) {
      showError(err);
    }
  }

  async function handleCreateColumn() {
    const title = window.prompt(
      "Enter a name for the new column:"
    );

    if (!title?.trim()) return;

    setError("");

    try {
      const result = await api(
        `/boards/${board.id}/columns`,
        {
          method: "POST",
          body: { title: title.trim() },
        }
      );

      const newColumn = result.column;

      setColumns((current) =>
        [...current, newColumn].sort(
          (a, b) => a.position - b.position
        )
      );

      updateTasks({
        ...tasksRef.current,
        [newColumn.id]: [],
      });

      await refreshDashboard();
    } catch (err) {
      showError(err);
    }
  }

  async function handleRenameColumn(column) {
    const title = window.prompt(
      "Enter the new column name:",
      column.title
    );

    if (
      !title?.trim() ||
      title.trim() === column.title
    ) {
      return;
    }

    setError("");

    try {
      const result = await api(
        `/columns/${column.id}`,
        {
          method: "PATCH",
          body: { title: title.trim() },
        }
      );

      setColumns((current) =>
        current.map((item) =>
          item.id === column.id
            ? {
                ...item,
                title: result.column.title,
              }
            : item
        )
      );

      await refreshDashboard();
    } catch (err) {
      showError(err);
    }
  }

  async function handleDeleteColumn(column) {
    const confirmed = window.confirm(
      `Delete "${column.title}" and all tasks inside it?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api(`/columns/${column.id}`, {
        method: "DELETE",
      });

      setColumns((current) =>
        current.filter(
          (item) => item.id !== column.id
        )
      );

      const next = { ...tasksRef.current };

      delete next[column.id];

      updateTasks(next);

      await refreshDashboard();
    } catch (err) {
      showError(err);
    }
  }

  function openTaskForm(columnId, task = null) {
    setDraft(
      task
        ? {
            title: task.title || "",
            description: task.description || "",
            label: task.label || "Product",
            priority: task.priority || "Medium",
            dueDate: task.dueDate || "Not set",
            assignee: task.assignee || "",
          }
        : { ...EMPTY_DRAFT }
    );

    setTaskModal({ columnId, task });
    setError("");
  }

  function closeTaskForm() {
    setTaskModal(null);
    setDraft({ ...EMPTY_DRAFT });
  }

  async function handleSaveTask(event) {
    event.preventDefault();

    if (!taskModal || !draft.title.trim()) return;

    setSaving(true);
    setError("");

    const body = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      label: draft.label,
      priority: draft.priority,
      dueDate: draft.dueDate || "Not set",
      assignee: draft.assignee.trim(),
    };

    try {
      if (taskModal.task) {
        const result = await api(
          `/tasks/${taskModal.task.id}`,
          {
            method: "PATCH",
            body,
          }
        );

        updateTasks((current) => ({
          ...current,
          [taskModal.columnId]: (
            current[taskModal.columnId] || []
          ).map((task) =>
            task.id === result.task.id
              ? result.task
              : task
          ),
        }));
      } else {
        const result = await api(
          `/boards/${board.id}/tasks`,
          {
            method: "POST",
            body: {
              ...body,
              columnId: taskModal.columnId,
            },
          }
        );

        updateTasks((current) => ({
          ...current,
          [taskModal.columnId]: [
            ...(current[taskModal.columnId] || []),
            result.task,
          ],
        }));
      }

      closeTaskForm();

      await refreshDashboard();
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTask(task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api(`/tasks/${task.id}`, {
        method: "DELETE",
      });

      updateTasks((current) => ({
        ...current,
        ...Object.fromEntries(
          Object.entries(current).map(
            ([columnId, tasks]) => [
              columnId,
              tasks.filter(
                (item) => item.id !== task.id
              ),
            ]
          )
        ),
      }));

      await refreshDashboard();
    } catch (err) {
      showError(err);
    }
  }

  async function persistTaskOrder(finalTasks) {
    const payload = {
      columns: columns.map((column) => ({
        columnId: column.id,
        taskIds: (
          finalTasks[column.id] || []
        ).map((task) => task.id),
      })),
    };

    try {
      await api(
        `/boards/${board.id}/tasks/reorder`,
        {
          method: "PATCH",
          body: payload,
        }
      );

      await refreshDashboard();
    } catch (err) {
      updateTasks(
        structuredClone(previousTasks.current)
      );

      showError(err);
    }
  }

  const totalTasks = Object.values(
    tasksByColumn
  ).reduce(
    (total, tasks) => total + tasks.length,
    0
  );

  const completedTasks = columns
    .filter(
      (column) =>
        column.title.trim().toLowerCase() === "done"
    )
    .reduce(
      (total, column) =>
        total +
        (tasksByColumn[column.id] || []).length,
      0
    );

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-700"
      >
        <ArrowLeft size={17} />
        Back to boards
      </button>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-violet-700">
            Project workspace
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {board.name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {board.description ||
              "Organize your tasks and track progress."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            role="status"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
              realtimeStatus === "live"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : realtimeStatus === "offline"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                realtimeStatus === "live"
                  ? "bg-emerald-500"
                  : realtimeStatus === "offline"
                    ? "bg-rose-500"
                    : "bg-amber-500"
              }`}
            />

            {realtimeStatus === "live"
              ? "Live updates"
              : realtimeStatus === "joining"
                ? "Joining board..."
                : realtimeStatus === "reconnecting"
                  ? "Reconnecting..."
                  : realtimeStatus === "offline"
                    ? "Realtime offline"
                    : "Connecting..."}
          </span>

          <button
            type="button"
            onClick={handleCreateColumn}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={17} />
            Add column
          </button>
        </div>
      </div>

      {presenceNotice && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          <span>{presenceNotice}</span>

          <button
            type="button"
            onClick={() => setPresenceNotice("")}
            className="rounded-md px-2 py-1 text-violet-500 hover:bg-violet-100"
            aria-label="Dismiss presence notification"
          >
            ×
          </button>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <Tag size={17} className="text-violet-600" />
          Board progress
        </div>

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
                totalTasks
                  ? (completedTasks / totalTasks) * 100
                  : 0
              }%`,
            }}
          />
        </div>

        <span className="text-xs font-medium text-slate-500">
          {completedTasks} of {totalTasks} complete
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              realtimeStatus === "live"
                ? "bg-emerald-500"
                : realtimeStatus === "joining" ||
                    realtimeStatus === "connecting" ||
                    realtimeStatus === "reconnecting"
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
          />

          <span className="font-medium text-slate-500">
            {realtimeStatus === "live"
              ? "Live updates connected"
              : realtimeStatus === "joining"
                ? "Joining board..."
                : realtimeStatus === "connecting"
                  ? "Connecting to live updates..."
                  : realtimeStatus === "reconnecting"
                    ? "Connection interrupted — reconnecting..."
                    : "Live updates unavailable"}
          </span>
        </div>

        {presenceNotice && (
          <p role="status" className="text-xs text-slate-500">
            {presenceNotice}
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="mt-7 overflow-x-auto pb-4">
        <DragDropProvider
          onDragStart={() => {
            previousTasks.current = structuredClone(
              tasksRef.current
            );
          }}
          onDragOver={(event) => {
            if (
              event.operation.source?.type !== "task"
            ) {
              return;
            }

            updateTasks((current) =>
              move(current, event)
            );
          }}
          onDragEnd={(event) => {
            if (event.canceled) {
              updateTasks(
                structuredClone(previousTasks.current)
              );
              return;
            }

            persistTaskOrder(
              structuredClone(tasksRef.current)
            );
          }}
        >
          <div
            className="grid items-start gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.max(
                columns.length,
                1
              )}, minmax(270px, 1fr))`,
              minWidth: `${
                Math.max(columns.length, 1) * 286
              }px`,
            }}
          >
            {columns.map((column, index) => (
              <BoardColumn
                key={column.id}
                column={column}
                index={index}
                tasks={tasksByColumn[column.id] || []}
                onAddTask={(columnId) =>
                  openTaskForm(columnId)
                }
                onRename={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
                onEditTask={openTaskForm}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        </DragDropProvider>
      </div>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        Changes are saved to the TaskFlow API. If a save fails,
        check the error message and backend terminal before retrying.
      </p>

      {taskModal && (
        <TaskFormModal
          task={taskModal.task}
          columnTitle={
            columns.find(
              (column) =>
                column.id === taskModal.columnId
            )?.title || "this column"
          }
          draft={draft}
          setDraft={setDraft}
          onClose={closeTaskForm}
          onSave={handleSaveTask}
          saving={saving}
        />
      )}
    </div>
  );
}