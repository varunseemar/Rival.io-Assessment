import { Priority, TaskStatus } from "@/lib/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  DONE: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}
