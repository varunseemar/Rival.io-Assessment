import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { loginSchema, signupSchema } from "../validators/auth";
import { login, logout, me, signup } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", validate(signupSchema), asyncHandler(signup));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
