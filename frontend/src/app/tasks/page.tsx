"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Pagination, Task, TaskQuery } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/TaskCard";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskForm, TaskFormValues } from "@/components/TaskForm";

const DEFAULT_QUERY: TaskQuery = {
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 6,
};

/** Converts form values into the API payload (dueDate -> ISO or null). */
function toPayload(values: TaskFormValues): Partial<Task> {
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
  };
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState<TaskQuery>(DEFAULT_QUERY);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);

  // Redirect unauthenticated users once the session check completes.
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listTasks(query);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Debounce so typing in search doesn't fire a request per keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!user) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchTasks, 250);
    return () => clearTimeout(debounceRef.current);
  }, [fetchTasks, user]);

  // Real-time: refetch when this user's tasks change anywhere.
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const refresh = () => fetchTasks();
    socket.on("task:created", refresh);
    socket.on("task:updated", refresh);
    socket.on("task:deleted", refresh);
    return () => {
      socket.off("task:created", refresh);
      socket.off("task:updated", refresh);
      socket.off("task:deleted", refresh);
    };
  }, [user, fetchTasks]);

  function patchQuery(patch: Partial<TaskQuery>) {
    setQuery((q) => ({ ...q, ...patch }));
  }

  function markPending(id: string, on: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // --- Optimistic: toggle complete ---
  async function handleToggleComplete(task: Task) {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    const prev = tasks;
    setTasks((ts) =>
      ts.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    markPending(task.id, true);
    try {
      await api.updateTask(task.id, { status: newStatus });
    } catch {
      setTasks(prev); // rollback
      setError("Could not update task. Reverted.");
    } finally {
      markPending(task.id, false);
    }
  }

  // --- Optimistic: delete ---
  async function handleDelete(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    const prev = tasks;
    setTasks((ts) => ts.filter((t) => t.id !== task.id));
    try {
      await api.deleteTask(task.id);
    } catch {
      setTasks(prev); // rollback
      setError("Could not delete task. Reverted.");
    }
  }

  async function handleSubmitForm(values: TaskFormValues) {
    if (editing) {
      await api.updateTask(editing.id, toPayload(values));
    } else {
      await api.createTask(toPayload(values));
    }
    setFormOpen(false);
    setEditing(undefined);
    await fetchTasks();
  }

  if (authLoading || !user) {
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
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + New task
          </button>
        </div>

        <div className="mb-5">
          <TaskFilters query={query} onChange={patchQuery} />
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            <span>{error}</span>
            <button onClick={fetchTasks} className="font-medium underline">
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
            <p className="text-gray-500">
              {query.search || query.status
                ? "No tasks match your filters."
                : "No tasks yet. Create your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                pending={pendingIds.has(task.id)}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setEditing(t);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
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

      {formOpen && (
        <TaskForm
          initial={editing}
          onCancel={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
  );
}
