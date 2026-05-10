import { Router, Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "@restaurant/shared";
import logger from "../../lib/logger.js";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const { status } = req.query;
  const where = status ? { status: String(status).toUpperCase() } : {};
  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { menuItem: true } }, table: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

router.get("/:id", async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id as string },
    include: { items: { include: { menuItem: true } }, table: true },
  });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

router.post("/", validate(CreateOrderSchema), async (req: Request, res: Response) => {
  const { tableId, items } = req.body;
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
    if (!menuItem || !menuItem.available) {
      res.status(400).json({ error: `Menu item ${item.menuItemId} not available` });
      return;
    }
    const unitPrice = Number(menuItem.price);
    total += unitPrice * item.quantity;
    orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice });
  }
  const order = await prisma.order.create({
    data: {
      total,
      tableId: tableId || null,
      items: { create: orderItems },
    },
    include: { items: { include: { menuItem: true } } },
  });
  logger.info({ orderId: order.id, total }, "Order created");
  res.status(201).json(order);
});

router.patch("/:id/status", authenticate, validate(UpdateOrderStatusSchema), async (req: Request, res: Response) => {
  const order = await prisma.order.update({
    where: { id: req.params.id as string },
    data: { status: req.body.status },
    include: { items: { include: { menuItem: true } } },
  });
  logger.info({ orderId: order.id, status: order.status }, "Order status updated");
  res.json(order);
});

export default router;
