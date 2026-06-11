import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { NotFound } from "../lib/errors";
import { emitToUser } from "../lib/socket";
import { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "../validators/task";

/**
 * Records a task change for the activity log. Best-effort: never blocks the
 * main response if logging fails.
 */
async function logActivity(
  taskId: string,
  userId: string,
  action: string,
  changes?: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { taskId, userId, action, changes: changes ?? Prisma.JsonNull },
    });
  } catch (e) {
    console.error("Failed to write activity log:", e);
  }
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateTaskInput;
  const userId = req.user!.id;

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      userId,
    },
  });

  await logActivity(task.id, userId, "created");
  emitToUser(userId, "task:created", task);
  res.status(201).json({ task });
}

export async function listTasks(req: Request, res: Response): Promise<void> {
  const { status, search, sortBy, order, page, limit } =
    req.query as unknown as ListTasksQuery;

  // Admins viewing /tasks still only see their own here; cross-user access is
  // exposed via the dedicated admin route.
  const where: Prisma.TaskWhereInput = { userId: req.user!.id };
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const task = await prisma.task.findFirst({
    where: { id, userId: req.user!.id },
    include: {
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!task) throw NotFound("Task not found");
  res.json({ task });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;
  const input = req.body as UpdateTaskInput;

  // Ensure the task exists AND belongs to the user before updating.
  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw NotFound("Task not found");

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    },
  });

  await logActivity(task.id, userId, "updated", input as Prisma.InputJsonValue);
  emitToUser(userId, "task:updated", task);
  res.json({ task });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) throw NotFound("Task not found");

  await prisma.task.delete({ where: { id } });
  emitToUser(userId, "task:deleted", { id });
  res.status(204).send();
}

/** ADMIN-only: list all tasks across all users. */
export async function adminListTasks(req: Request, res: Response): Promise<void> {
  const { status, search, sortBy, order, page, limit } =
    req.query as unknown as ListTasksQuery;

  const where: Prisma.TaskWhereInput = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, email: true } } },
    }),
  ]);

  res.json({
    data: tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
