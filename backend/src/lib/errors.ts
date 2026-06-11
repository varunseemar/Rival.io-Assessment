/** Application error with an associated HTTP status code. */
export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const NotFound = (msg = "Resource not found") => new AppError(404, msg);
export const Unauthorized = (msg = "Authentication required") => new AppError(401, msg);
export const Forbidden = (msg = "You do not have access to this resource") =>
  new AppError(403, msg);
export const Conflict = (msg = "Resource already exists") => new AppError(409, msg);
export const BadRequest = (msg = "Invalid request", details?: unknown) =>
  new AppError(400, msg, details);
