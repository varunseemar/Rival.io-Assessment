"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";

interface Props {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    // Client-side validation.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please enter a valid email address");
      return;
    }
    if (isSignup && password.length < 8) {
      setFieldError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(email, password);
      router.replace("/tasks");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-1 text-2xl font-bold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {isSignup ? "Sign up to start managing tasks" : "Log in to TaskFlow"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
              placeholder={isSignup ? "At least 8 characters" : "••••••••"}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </div>

          {fieldError && (
            <p className="text-sm text-red-600 dark:text-red-400">{fieldError}</p>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              No account?{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
