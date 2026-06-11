import { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE, verifyToken } from "../lib/jwt";
import { Forbidden, Unauthorized } from "../lib/errors";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: "USER" | "ADMIN" };
    }
  }
}

/** Requires a valid JWT (sent via httpOnly cookie or Bearer header). */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined;
    const token = req.cookies?.[AUTH_COOKIE] ?? bearer;
    if (!token) throw Unauthorized();
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(Unauthorized("Invalid or expired token"));
  }
}

/** Requires the authenticated user to have the ADMIN role. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") {
    next(Forbidden("Admin access required"));
    return;
  }
  next();
}
