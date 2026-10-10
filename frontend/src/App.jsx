import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import initialBoards from "./data/boards.js";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My Boards", icon: FolderKanban },
  { label: "My Tasks", icon: ListTodo },
  { label: "Settings", icon: Settings },
];

const palette = {
  violet: {
    icon: "bg-violet-100 text-violet-700",
    badge: "bg-violet-50 text-violet-700",
    bar: "bg-violet-500",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700",
    badge: "bg-blue-50 text-blue-700",
    bar: "bg-blue-500",
  },
  amber: {
    icon: "bg-amber-100 text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
  },
};

function Sidebar({
  activeSection,
  setActiveSection,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-white/10 bg-slate-950 text-slate-300
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white shadow-lg shadow-violet-900/30">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              TaskFlow
            </h1>
            <p className="text-xs text-slate-500">Workspace manager</p>
          </div>
          <button
            className="ml-auto rounded-lg p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mx-4 mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-sm font-semibold text-violet-300">
              T
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Team Workspace
              </p>
              <p className="text-xs text-slate-500">Personal workspace</p>
            </div>
            <ChevronDown size={16} className="text-slate-500" />
          </div>
        </div>

        <div className="px-4 pt-8">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const selected = activeSection === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveSection(item.label);
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                    ${
                      selected
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  aria-current={selected ? "page" : undefined}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  {item.label === "My Tasks" && (
                    <span
                      className={`ml-auto rounded-md px-2 py-0.5 text-xs ${
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      8
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-9 px-4">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Support
          </p>

          <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400">
            <CircleHelp size={19} />
            <span>Help center</span>
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-violet-300">
              <Sparkles size={17} />
              <span className="text-sm font-semibold">Stay organized</span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Bring tasks and projects together in one workspace.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Workspace User</p>
              <p className="text-xs text-slate-500">Day 3 preview</p>
            </div>
            <MoreHorizontal size={19} className="text-slate-500" />
          </div>
        </div>
      </aside>
    </>
  );
}

function StatCard({ label, value, caption, icon: Icon, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

function BoardCard({ board }) {
  const colors = palette[board.color] || palette.blue;
  const progress =
    board.total > 0 ? Math.round((board.done / board.total) * 100) : 0;

  return (
    <article className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/20 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}>
          <FolderKanban size={21} />
        </div>
        <MoreHorizontal
          size={21}
          className="text-slate-400 transition group-hover:text-slate-700"
        />
      </div>

      <div className="mt-5">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors.badge}`}>
          {board.category}
        </span>
        <h3 className="mt-3 text-base font-bold text-slate-900">
          {board.name}
        </h3>
        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
          {board.description}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-slate-500">Task progress</span>
          <span className="font-semibold text-slate-700">{progress}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`${board.name} task progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {board.done} of {board.total} tasks completed
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex -space-x-2" aria-label="Sample team members">
          {board.members.map((member, index) => (
            <div
              key={`${board.id}-${member}`}
              title={`Sample member ${member}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${
                index % 3 === 0
                  ? "bg-violet-100 text-violet-700"
                  : index % 3 === 1
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {member}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays size={14} />
          <span>{board.due}</span>
        </div>
      </div>
    </article>
  );
}

function CreateBoardModal({
  onClose,
  onCreate,
  boardName,
  setBoardName,
  boardDescription,
  setBoardDescription,
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onCreate}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-board-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="create-board-title" className="text-xl font-bold text-slate-900">
              Create a board
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Give your next project a name and description.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <label htmlFor="board-name" className="mt-6 block text-sm font-semibold text-slate-700">
          Board name
        </label>
        <input
          id="board-name"
          autoFocus
          maxLength={100}
          required
          value={boardName}
          onChange={(event) => setBoardName(event.target.value)}
          placeholder="e.g. Website Development"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />

        <label htmlFor="board-description" className="mt-4 block text-sm font-semibold text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="board-description"
          rows={3}
          maxLength={500}
          value={boardDescription}
          onChange={(event) => setBoardDescription(event.target.value)}
          placeholder="What is this project about?"
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
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
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            Create board
          </button>
        </div>
      </form>
    </div>
  );
}

function ComingSoon({ title, description, onBack }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <Settings size={25} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      <button
        onClick={onBack}
        className="mt-6 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Back to my boards
      </button>
    </div>
  );
}

export default function App() {
  const [boards, setBoards] = useState(initialBoards);
  const [activeSection, setActiveSection] = useState("My Boards");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const filteredBoards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return boards.filter((board) => {
      return (
        board.name.toLowerCase().includes(query) ||
        board.description.toLowerCase().includes(query) ||
        board.category.toLowerCase().includes(query)
      );
    });
  }, [boards, searchQuery]);

  const totalTasks = boards.reduce((sum, board) => sum + board.total, 0);
  const completedTasks = boards.reduce((sum, board) => sum + board.done, 0);
  const openTasks = totalTasks - completedTasks;

  function closeCreateModal() {
    setCreateOpen(false);
    setBoardName("");
    setBoardDescription("");
  }

  function handleCreateBoard(event) {
    event.preventDefault();

    const name = boardName.trim();

    if (!name) return;

    const newBoard = {
      id: Date.now(),
      name,
      description: boardDescription.trim() || "A new workspace project.",
      category: "General",
      color: "blue",
      due: "Not set",
      done: 0,
      total: 0,
      members: ["U"],
    };

    setBoards((currentBoards) => [newBoard, ...currentBoards]);
    setActiveSection("My Boards");
    setSearchQuery("");
    closeCreateModal();
  }

  const pageTitle =
    activeSection === "Overview"
      ? "Overview"
      : activeSection === "My Tasks"
        ? "My Tasks"
        : activeSection === "Settings"
          ? "Settings"
          : "My Boards";

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400">
                Team Workspace <span className="px-1">/</span> {pageTitle}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Good work starts here
              </p>
            </div>
          </div>

          <div className="ml-3 flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Workspace preview
            </div>
            <div
              aria-label="Notifications (preview only)"
              title="Notifications"
              className="rounded-xl p-2 text-slate-500"
            >
              <Bell size={19} />
            </div>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 sm:flex">
              U
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-7 sm:py-9 lg:px-9">
          {activeSection === "Settings" ? (
            <ComingSoon
              title="Workspace settings"
              description="Workspace preferences and account settings will be added in a later milestone."
              onBack={() => setActiveSection("My Boards")}
            />
          ) : activeSection === "My Tasks" ? (
            <ComingSoon
              title="Your task list is coming next"
              description="Task creation, assignments, and task management will be connected to the backend in the upcoming milestones."
              onBack={() => setActiveSection("My Boards")}
            />
          ) : (
            <>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
                    <Sparkles size={16} />
                    Your team at a glance
                  </div>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {pageTitle}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Organize projects, follow progress, and keep your work moving forward.
                  </p>
                </div>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Plus size={18} />
                  New Board
                </button>
              </div>

              <section
                className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-label="Workspace summary"
              >
                <StatCard
                  label="Total boards"
                  value={boards.length}
                  caption="Projects in this preview"
                  icon={FolderKanban}
                  iconStyle="bg-violet-50 text-violet-600"
                />
                <StatCard
                  label="Open tasks"
                  value={openTasks}
                  caption="Tasks not yet completed"
                  icon={Activity}
                  iconStyle="bg-blue-50 text-blue-600"
                />
                <StatCard
                  label="Completed tasks"
                  value={completedTasks}
                  caption="Tasks marked as completed"
                  icon={CheckCircle2}
                  iconStyle="bg-emerald-50 text-emerald-600"
                />
              </section>

              <section className="mt-10">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Your projects
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Browse and search your workspace boards.
                    </p>
                  </div>

                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="search"
                      aria-label="Search boards"
                      placeholder="Search boards..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBoards.map((board) => (
                    <BoardCard key={board.id} board={board} />
                  ))}
                </div>

                {filteredBoards.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                    <Search size={24} className="mx-auto text-slate-400" />
                    <h4 className="mt-3 font-semibold text-slate-800">
                      No boards found
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Try another search or create a new board.
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </section>

              <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
                <p>TaskFlow · Full Stack Development Internship</p>
                <p>Day 3 UI preview · Sample data only</p>
              </footer>
            </>
          )}
        </main>
      </div>

      {createOpen && (
        <CreateBoardModal
          onClose={closeCreateModal}
          onCreate={handleCreateBoard}
          boardName={boardName}
          setBoardName={setBoardName}
          boardDescription={boardDescription}
          setBoardDescription={setBoardDescription}
        />
      )}
    </div>
  );
}
