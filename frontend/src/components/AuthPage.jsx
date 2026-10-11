
import { useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { api } from "../api.js";

export default function AuthPage({ onAuthenticated, initialError = "" }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "register") {
        await api("/auth/register", {
          method: "POST",
          body: {
            name: name.trim(),
            email: normalizedEmail,
            password,
          },
        });
      }

      // Registration does not issue the JWT cookie in the current
      // backend, so sign in after registration succeeds.
      const result = await api("/auth/login", {
        method: "POST",
        body: {
          email: normalizedEmail,
          password,
        },
      });

      await onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <CheckCircle2 size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              TaskFlow
            </h1>
            <p className="text-sm text-slate-500">
              Your project workspace
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Sign in to access your saved boards."
              : "Register to start organizing your projects."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>
              <input
                id="auth-name"
                required
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>
            <input
              id="auth-email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="auth-password"
              required
              type="password"
              minLength={8}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              Use at least 8 characters.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <LoaderCircle size={17} className="animate-spin" />}
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode((current) =>
                current === "login" ? "register" : "login"
              );
              setError("");
            }}
            className="font-semibold text-violet-700 hover:text-violet-900"
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
