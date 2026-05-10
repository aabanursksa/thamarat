import { z } from "zod";

export const TableSchema = z.object({
  id: z.string().uuid(),
  number: z.number().int().positive(),
  qrCode: z.string().nullable(),
});

export const CreateTableSchema = TableSchema.omit({ id: true, qrCode: true });
export const UpdateTableSchema = CreateTableSchema.partial();

export type Table = z.infer<typeof TableSchema>;
export type CreateTable = z.infer<typeof CreateTableSchema>;
