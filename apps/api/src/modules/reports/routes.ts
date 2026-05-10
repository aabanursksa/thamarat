import { Router, Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { authenticate, requireRole } from "../../middleware/auth.js";

const router = Router();

router.get("/sales", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  const { dateFrom, dateTo } = req.query;
  const from = dateFrom ? new Date(String(dateFrom)) : new Date(new Date().setHours(0, 0, 0, 0));
  const to = dateTo ? new Date(String(dateTo)) : new Date();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      status: { notIn: ["CANCELLED"] },
    },
    select: { total: true, createdAt: true },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, o: { total: string | number | null }) => sum + Number(o.total), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  res.json({
    items: orders.map((o: { total: string | number | null; createdAt: Date }) => ({
      date: o.createdAt.toISOString().slice(0, 10),
      amount: Number(o.total),
    })),
    summary: { totalOrders, totalRevenue, averageOrderValue },
  });
});

export default router;
