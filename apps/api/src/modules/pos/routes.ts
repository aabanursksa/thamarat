import { Router, Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { CreateOrderSchema } from "@restaurant/shared";
import logger from "../../lib/logger.js";

const router = Router();

router.post("/order", authenticate, validate(CreateOrderSchema), async (req: Request, res: Response) => {
  const { items, tableId } = req.body;
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
    if (!menuItem) {
      res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      return;
    }
    const unitPrice = Number(menuItem.price);
    total += unitPrice * item.quantity;
    orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice });
  }
  const order = await prisma.order.create({
    data: {
      total,
      status: "CONFIRMED",
      tableId: tableId || null,
      items: { create: orderItems },
    },
    include: { items: { include: { menuItem: true } }, table: true },
  });
  logger.info({ orderId: order.id, total, source: "pos" }, "POS order created");
  res.status(201).json(order);
});

router.get("/active", authenticate, async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] } },
    include: { items: { include: { menuItem: true } }, table: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

export default router;
