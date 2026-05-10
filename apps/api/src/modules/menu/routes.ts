import { Router, Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
} from "@restaurant/shared";

export const categoryRoutes = Router();

categoryRoutes.get("/", async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  res.json(categories);
});

categoryRoutes.post(
  "/",
  authenticate,
  requireRole("admin"),
  validate(CreateCategorySchema),
  async (req: Request, res: Response) => {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  }
);

categoryRoutes.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  validate(UpdateCategorySchema),
  async (req: Request, res: Response) => {
    const category = await prisma.category.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(category);
  }
);

categoryRoutes.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    await prisma.category.delete({ where: { id: req.params.id as string } });
    res.status(204).end();
  }
);

export const menuRoutes = Router();

menuRoutes.get("/", async (_req: Request, res: Response) => {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
  });
  res.json(items);
});

menuRoutes.get("/:id", async (req: Request, res: Response) => {
  const item = await prisma.menuItem.findUnique({
    where: { id: req.params.id as string },
    include: { category: true },
  });
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(item);
});

menuRoutes.post(
  "/",
  authenticate,
  requireRole("admin"),
  validate(CreateMenuItemSchema),
  async (req: Request, res: Response) => {
    const item = await prisma.menuItem.create({ data: req.body });
    res.status(201).json(item);
  }
);

menuRoutes.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  validate(UpdateMenuItemSchema),
  async (req: Request, res: Response) => {
    const item = await prisma.menuItem.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(item);
  }
);

menuRoutes.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    await prisma.menuItem.delete({ where: { id: req.params.id as string } });
    res.status(204).end();
  }
);
