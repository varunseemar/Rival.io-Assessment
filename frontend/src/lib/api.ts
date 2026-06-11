import {
  PaginatedTasks,
  Task,
  TaskQuery,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Thin fetch wrapper: sends cookies, parses the consistent error shape. */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.error?.message ?? "Request failed";
    throw new ApiError(res.status, message, body?.error?.details);
  }
  return body as T;
}

function toQueryString(query: TaskQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // ---- Auth ----
  signup: (email: string, password: string) =>
    request<{ user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me"),

  // ---- Tasks ----
  listTasks: (query: TaskQuery = {}) =>
    request<PaginatedTasks>(`/tasks${toQueryString(query)}`),
  getTask: (id: string) => request<{ task: Task }>(`/tasks/${id}`),
  createTask: (data: Partial<Task>) =>
    request<{ task: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTask: (id: string, data: Partial<Task>) =>
    request<{ task: Task }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),

  // ---- Admin ----
  adminListTasks: (query: TaskQuery = {}) =>
    request<PaginatedTasks>(`/tasks/admin/all${toQueryString(query)}`),
};

export { API_URL };
