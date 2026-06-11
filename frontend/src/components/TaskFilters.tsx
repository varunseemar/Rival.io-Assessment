"use client";

import { TaskQuery, TaskStatus } from "@/lib/types";

interface Props {
  query: TaskQuery;
  onChange: (patch: Partial<TaskQuery>) => void;
}

export function TaskFilters({ query, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <input
        type="search"
        value={query.search ?? ""}
        onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        placeholder="🔍 Search by title…"
        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 sm:w-56"
      />

      <select
        value={query.status ?? ""}
        onChange={(e) =>
          onChange({
            status: (e.target.value || undefined) as TaskStatus | undefined,
            page: 1,
          })
        }
        className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
      >
        <option value="">All statuses</option>
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={query.sortBy ?? "createdAt"}
        onChange={(e) =>
          onChange({ sortBy: e.target.value as TaskQuery["sortBy"], page: 1 })
        }
        className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
      >
        <option value="createdAt">Sort: Created</option>
        <option value="dueDate">Sort: Due date</option>
        <option value="priority">Sort: Priority</option>
      </select>

      <select
        value={query.order ?? "desc"}
        onChange={(e) =>
          onChange({ order: e.target.value as TaskQuery["order"], page: 1 })
        }
        className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
      >
        <option value="desc">↓ Desc</option>
        <option value="asc">↑ Asc</option>
      </select>
    </div>
  );
}
