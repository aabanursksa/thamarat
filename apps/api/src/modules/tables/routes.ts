import { Router, Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { CreateTableSchema, UpdateTableSchema } from "@restaurant/shared";

const router = Router();

router.get("/", authenticate, async (_req: Request, res: Response) => {
  const tables = await prisma.table.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { number: "asc" },
  });
  res.json(tables);
});

router.post("/", authenticate, requireRole("admin"), validate(CreateTableSchema), async (req: Request, res: Response) => {
  const table = await prisma.table.create({ data: req.body });
  res.status(201).json(table);
});

router.put("/:id", authenticate, requireRole("admin"), validate(UpdateTableSchema), async (req: Request, res: Response) => {
  const table = await prisma.table.update({ where: { id: req.params.id as string }, data: req.body });
  res.json(table);
});

router.delete("/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  await prisma.table.delete({ where: { id: req.params.id as string } });
  res.status(204).end();
});

export default router;
