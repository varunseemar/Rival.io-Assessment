"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Pagination, Task, TaskQuery } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { TaskFilters } from "@/components/TaskFilters";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/format";

const DEFAULT_QUERY: TaskQuery = {
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 10,
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState<TaskQuery>(DEFAULT_QUERY);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: only admins; everyone else goes back to their own tasks.
  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace("/login");
    else if (user.role !== "ADMIN") router.replace("/tasks");
  }, [authLoading, user, router]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListTasks(query);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchTasks();
  }, [fetchTasks, user]);

  function patchQuery(patch: Partial<TaskQuery>) {
    setQuery((q) => ({ ...q, ...patch }));
  }

  if (authLoading || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-1 text-2xl font-bold">Admin · All Tasks</h1>
        <p className="mb-5 text-sm text-gray-500">
          Viewing tasks across every user.
        </p>

        <div className="mb-5">
          <TaskFilters query={query} onChange={patchQuery} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500 dark:border-gray-700">
            No tasks found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {task.user?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {task.dueDate ? formatDate(task.dueDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              disabled={query.page === 1}
              onClick={() => patchQuery({ page: (query.page ?? 1) - 1 })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={query.page === pagination.totalPages}
              onClick={() => patchQuery({ page: (query.page ?? 1) + 1 })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
