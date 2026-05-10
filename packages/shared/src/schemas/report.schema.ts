import { z } from "zod";

export const SalesReportQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const SalesReportItemSchema = z.object({
  period: z.string(),
  totalOrders: z.number().int(),
  totalRevenue: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
});

export const SalesReportSchema = z.object({
  items: z.array(SalesReportItemSchema),
  summary: z.object({
    totalOrders: z.number().int(),
    totalRevenue: z.number().nonnegative(),
    averageOrderValue: z.number().nonnegative(),
  }),
});

export type SalesReportQuery = z.infer<typeof SalesReportQuerySchema>;
export type SalesReport = z.infer<typeof SalesReportSchema>;
