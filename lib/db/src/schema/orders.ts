import { createInsertSchema } from "drizzle-zod";
import { integer, jsonb, pgTable, serial, text, timestamp, uuid, boolean, numeric } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type StoredOrderPair = {
  color: string;
  size: string;
};

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: integer("order_number").notNull().unique(),
  orderToken: uuid("order_token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  pairs: jsonb("pairs").$type<StoredOrderPair[]>().notNull(),
  itemsText: text("items_text").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2, mode: "number" }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2, mode: "number" }).notNull(),
  shipping: text("shipping").notNull().default(""),
  total: numeric("total", { precision: 10, scale: 2, mode: "number" }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  synced: boolean("synced").notNull().default(false),
  syncAttempts: integer("sync_attempts").notNull().default(0),
  lastSyncAttemptAt: timestamp("last_sync_attempt_at", { withTimezone: true }),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;