import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error";

export function createApp(): Express {
  const app = express();

  // Render (and most PaaS) sit behind a reverse proxy; trust it so Express
  // correctly reads the protocol/IP from X-Forwarded-* headers.
  app.set("trust proxy", 1);

  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRoutes);
  app.use("/tasks", taskRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
