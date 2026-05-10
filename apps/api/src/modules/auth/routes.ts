import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { signToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt.js";
import { validate } from "../../middleware/validate.js";
import { LoginSchema, RegisterSchema } from "@restaurant/shared";
import logger from "../../lib/logger.js";

const router = Router();

router.post("/register", validate(RegisterSchema), async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: "admin" },
  });
  logger.info({ userId: user.id }, "User registered");
  res.status(201).json({
    token: signToken({ userId: user.id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user.id }),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.post("/login", validate(LoginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  logger.info({ userId: user.id }, "User logged in");
  res.json({
    token: signToken({ userId: user.id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user.id }),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }
  try {
    const { userId } = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({
      token: signToken({ userId: user.id, role: user.role }),
      refreshToken: signRefreshToken({ userId: user.id }),
    });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;
