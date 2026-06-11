import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { validate } from "../middleware/validate";
import { requireAdmin, requireAuth } from "../middleware/auth";
import {
  createTaskSchema,
  idParamSchema,
  listTasksSchema,
  updateTaskSchema,
} from "../validators/task";
import {
  adminListTasks,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/task.controller";

const router = Router();

// All task routes require authentication.
router.use(requireAuth);

// ADMIN-only: view all users' tasks.
router.get("/admin/all", requireAdmin, validate(listTasksSchema, "query"), asyncHandler(adminListTasks));

router.post("/", validate(createTaskSchema), asyncHandler(createTask));
router.get("/", validate(listTasksSchema, "query"), asyncHandler(listTasks));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(getTask));
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateTaskSchema),
  asyncHandler(updateTask)
);
router.delete("/:id", validate(idParamSchema, "params"), asyncHandler(deleteTask));

export default router;
