import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type Source = "body" | "query" | "params";

/**
 * Validates and replaces the chosen request segment with the parsed,
 * type-coerced result. Throws a ZodError handled by the error middleware.
 */
export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    // Express 4 query/params are read-only getters in some setups; assign safely.
    if (source === "body") req.body = parsed;
    else (req as unknown as Record<string, unknown>)[source] = parsed;
    next();
  };
}
