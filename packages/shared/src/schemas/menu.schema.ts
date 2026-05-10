import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
});

export const CreateCategorySchema = CategorySchema.omit({ id: true });
export const UpdateCategorySchema = CreateCategorySchema.partial();

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  price: z.number().positive().multipleOf(0.01),
  image: z.string().url().nullable(),
  available: z.boolean().default(true),
  categoryId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CreateMenuItemSchema = MenuItemSchema.omit({ id: true, createdAt: true });
export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type CreateMenuItem = z.infer<typeof CreateMenuItemSchema>;
