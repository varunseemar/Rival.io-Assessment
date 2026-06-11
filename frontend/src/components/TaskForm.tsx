"use client";

import { useState } from "react";
import { Priority, Task, TaskStatus } from "@/lib/types";
import { toDateInput } from "@/lib/format";

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // yyyy-mm-dd or ""
}

interface Props {
  initial?: Task;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

export function TaskForm({ initial, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    status: initial?.status ?? "TODO",
    priority: initial?.priority ?? "MEDIUM",
    dueDate: toDateInput(initial?.dueDate ?? null),
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">
          {initial ? "Edit task" : "New task"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
              placeholder="What needs doing?"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
              placeholder="Optional details"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={values.status}
                onChange={(e) => set("status", e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
              >
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                value={values.priority}
                onChange={(e) => set("priority", e.target.value as Priority)}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="dueDate">
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              value={values.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving…" : initial ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
