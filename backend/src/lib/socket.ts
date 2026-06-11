import { Server as HttpServer } from "http";
import { Server as IoServer, Socket } from "socket.io";
import { env } from "./env";
import { verifyToken } from "./jwt";
import { parse as parseCookie } from "cookie";
import { AUTH_COOKIE } from "./jwt";

let io: IoServer | null = null;

/**
 * Real-time layer. Each authenticated socket joins a room named after its
 * user id, so task mutations can be pushed only to the owning user.
 */
export function initSocket(server: HttpServer): IoServer {
  io = new IoServer(server, {
    cors: { origin: env.corsOrigin, credentials: true },
  });

  io.use((socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const cookies = parseCookie(cookieHeader);
      const token = cookies[AUTH_COOKIE];
      if (!token) return next(new Error("unauthorized"));
      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
  });

  return io;
}

type TaskEvent = "task:created" | "task:updated" | "task:deleted";

/** Emit a task event to the owning user's room. */
export function emitToUser(userId: string, event: TaskEvent, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}
