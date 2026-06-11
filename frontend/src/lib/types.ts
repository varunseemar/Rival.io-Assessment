export type Role = "USER" | "ADMIN";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: { id: string; email: string };
  activities?: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTasks {
  data: Task[];
  pagination: Pagination;
}

export interface TaskQuery {
  status?: TaskStatus;
  search?: string;
  sortBy?: "dueDate" | "priority" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
