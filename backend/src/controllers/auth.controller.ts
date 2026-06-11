import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AUTH_COOKIE, signToken } from "../lib/jwt";
import { env } from "../lib/env";
import { Conflict, Unauthorized } from "../lib/errors";
import { LoginInput, SignupInput } from "../validators/auth";

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function signup(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as SignupInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw Unauthorized("Invalid email or password");

  const token = signToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);
  res.json({
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    token,
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(AUTH_COOKIE, { path: "/" });
  res.json({ success: true });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw Unauthorized();
  res.json({ user });
}
