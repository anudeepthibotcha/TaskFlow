
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";

import { api } from "./api.js";
import AuthPage from "./components/AuthPage.jsx";
import KanbanBoard from "./components/KanbanBoard.jsx";

function BoardCard({ board, onOpen, onDelete }) {
  const progress =
    board.total > 0 ? Math.round((board.done / board.total) * 100) : 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
          <FolderKanban size={22} />
        </div>
        <button
          type="button"
          title="Delete board"
          aria-label={`Delete ${board.name}`}
          onClick={() => onDelete(board)}
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {board.name}
      </h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
        {board.description || "No description provided."}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-500">Task progress</span>
          <span className="font-semibold text-slate-700">
            {progress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {board.done} of {board.total} tasks completed
        </p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(board)}
        className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Open board
      </button>
    </article>
  );
}

function CreateBoardModal({ onClose, onCreate, loading }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2
          id="board-modal-title"
          className="text-xl font-bold text-slate-900"
        >
          Create a board
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your board and default columns will be saved to MongoDB.
        </p>

        <label
          htmlFor="new-board-name"
          className="mt-5 block text-sm font-semibold text-slate-700"
        >
          Board name
        </label>
        <input
          id="new-board-name"
          autoFocus
          required
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          placeholder="e.g. Website Development"
        />

        <label
          htmlFor="new-board-description"
          className="mt-4 block text-sm font-semibold text-slate-700"
        >
          Description
        </label>
        <textarea
          id="new-board-description"
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          placeholder="Describe this project..."
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-600">
            {error}
          </p>
        )}

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
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create board"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [activeSection, setActiveSection] = useState("My Boards");

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");

  async function loadBoards() {
    const result = await api("/boards");
    setBoards(result.boards);
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const result = await api("/auth/me");

        if (!active) return;

        setUser(result.user);

        const boardResult = await api("/boards");

        if (active) {
          setBoards(boardResult.boards);
        }
      } catch (err) {
        if (active) {
          if (err.status !== 401) {
            setError(err.message);
          }
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    setError("");
    await loadBoards();
  }

  async function openBoard(board) {
    setError("");

    try {
      const result = await api(`/boards/${board.id}`);
      setSelectedBoard(result.board);
      setActiveSection("My Boards");
    } catch (err) {
      setError(err.message);
    }
  }

  async function createBoard(details) {
    setCreatingBoard(true);

    try {
      const result = await api("/boards", {
        method: "POST",
        body: details,
      });

      setBoards((current) => [
        result.board,
        ...current.filter((board) => board.id !== result.board.id),
      ]);

      setCreateOpen(false);
      setSelectedBoard(result.board);
      setActiveSection("My Boards");
    } finally {
      setCreatingBoard(false);
    }
  }

  async function deleteBoard(board) {
    const confirmed = window.confirm(
      `Delete "${board.name}" and all its columns and tasks?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api(`/boards/${board.id}`, { method: "DELETE" });

      setBoards((current) =>
        current.filter((item) => item.id !== board.id)
      );

      if (selectedBoard?.id === board.id) {
        setSelectedBoard(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (err) {
      setError(err.message);
    } finally {
      setUser(null);
      setSelectedBoard(null);
      setBoards([]);
    }
  }

  const filteredBoards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(query) ||
        board.description.toLowerCase().includes(query)
    );
  }, [boards, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] text-sm text-slate-500">
        Loading TaskFlow...
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {error && (
          <div
            role="alert"
            className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700"
          >
            {error}
          </div>
        )}
        <AuthPage onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-950 text-slate-300 lg:flex">
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="rounded-xl bg-violet-500 p-2.5 text-white">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TaskFlow</h1>
            <p className="text-xs text-slate-500">Project manager</p>
          </div>
        </div>

        <div className="px-4 pt-6">
          {[
            { name: "Overview", icon: LayoutDashboard },
            { name: "My Boards", icon: FolderKanban },
            { name: "My Tasks", icon: ListTodo },
            { name: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const selected = activeSection === item.name;

            return (
              <button
                type="button"
                key={item.name}
                onClick={() => {
                  setActiveSection(item.name);
                  setSelectedBoard(null);
                  setError("");
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? "bg-violet-500 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <p className="truncate px-2 text-sm font-semibold text-white">
            {user.name}
          </p>
          <p className="truncate px-2 pt-1 text-xs text-slate-500">
            {user.email}
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="flex min-h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-7">
          <div>
            <p className="text-xs text-slate-400">
              Team Workspace / {selectedBoard?.name || activeSection}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Welcome, {user.name}
            </p>
          </div>

          {!selectedBoard && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus size={17} />
              New Board
            </button>
          )}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-7 sm:py-9">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
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

          {selectedBoard ? (
            <KanbanBoard
              key={selectedBoard.id}
              board={selectedBoard}
              onBack={() => setSelectedBoard(null)}
              onBoardUpdated={loadBoards}
            />
          ) : activeSection === "Settings" ||
            activeSection === "My Tasks" ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {activeSection}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                This section will be expanded in a later milestone.
              </p>
              <button
                type="button"
                onClick={() => setActiveSection("My Boards")}
                className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Go to my boards
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-medium text-violet-700">
                    Your team's workspace
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    My Boards
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Boards are retrieved from your TaskFlow database.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    aria-label="Search saved boards"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search boards..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onOpen={openBoard}
                    onDelete={deleteBoard}
                  />
                ))}
              </div>

              {filteredBoards.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <FolderKanban
                    size={28}
                    className="mx-auto text-slate-400"
                  />
                  <p className="mt-3 font-semibold text-slate-800">
                    {boards.length === 0
                      ? "No saved boards yet"
                      : "No matching boards"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a board to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    Create your first board
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {createOpen && (
        <CreateBoardModal
          onClose={() => setCreateOpen(false)}
          onCreate={createBoard}
          loading={creatingBoard}
        />
      )}
    </div>
  );
}
