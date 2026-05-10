import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive().multipleOf(0.01),
});

export const CreateOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  status: OrderStatusEnum,
  total: z.number().nonnegative().multipleOf(0.01),
  tableId: z.string().uuid().nullable(),
  items: z.array(OrderItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateOrderSchema = z.object({
  tableId: z.string().uuid().optional(),
  items: z.array(CreateOrderItemSchema).min(1),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
});

export type OrderStatus = z.infer<typeof OrderStatusEnum>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
