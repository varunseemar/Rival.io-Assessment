"use client";

import { Task } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { PriorityBadge, StatusBadge } from "./Badge";

interface Props {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  pending?: boolean;
  showOwner?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  pending,
  showOwner,
}: Props) {
  const isDone = task.status === "DONE";

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition dark:border-gray-800 dark:bg-gray-900 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onToggleComplete(task)}
          aria-label="Mark complete"
          className="mt-1 h-5 w-5 cursor-pointer rounded"
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate font-semibold ${
              isDone ? "text-gray-400 line-through" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                📅 {formatDate(task.dueDate)}
              </span>
            )}
            {showOwner && task.user && (
              <span className="text-xs text-gray-400">👤 {task.user.email}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="rounded-lg p-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            className="rounded-lg p-2 text-sm transition hover:bg-red-50 dark:hover:bg-red-950"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
