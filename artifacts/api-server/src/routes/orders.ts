import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { CreateOrderBody, GetOrderResponse } from "@workspace/api-zod";
import {
  createStoredOrder,
  listUnsyncedOrders,
  parseOrderToken,
  retryUnsyncedOrders,
  syncOrder,
  toOrderResponse,
} from "../lib/orders";

const router: IRouter = Router();
const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 5;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

function requestIp(req: { headers: Record<string, string | string[] | undefined>; ip?: string }) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = requestsByIp.get(ip);
  if (!current || current.resetAt <= now) {
    requestsByIp.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }
  current.count += 1;
  return current.count > rateLimitMax;
}

function hasInternalSyncAccess(req: { headers: Record<string, string | string[] | undefined> }) {
  const configuredToken = process.env.SHEETS_WEBHOOK_TOKEN?.trim();
  const providedToken = req.headers["x-sheets-sync-token"];
  return Boolean(
    configuredToken &&
      typeof providedToken === "string" &&
      providedToken.trim() === configuredToken,
  );
}

router.post("/orders", async (req, res): Promise<void> => {
  if (isRateLimited(requestIp(req))) {
    res.status(429).json({ error: "تم تجاوز عدد المحاولات. حاول بعد قليل." });
    return;
  }

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "يرجى التأكد من المعلومات المدخلة." });
    return;
  }
  if (parsed.data.honeypot?.trim()) {
    res.status(400).json({ error: "تعذر إرسال الطلب." });
    return;
  }

  try {
    const order = await createStoredOrder(parsed.data);
    void syncOrder(order).then((synced) => {
      if (!synced) {
        req.log.warn({ orderNumber: order.orderNumber }, "Order saved without Sheet sync");
      }
    });
    res.status(201).json(toOrderResponse(order));
  } catch (error) {
    if (error instanceof Error && error.message === "رمز الخصم غير صالح") {
      res.status(400).json({ error: error.message });
      return;
    }
    req.log.error({ err: error }, "Unable to create order");
    res.status(500).json({ error: "تعذر حفظ الطلب. حاول مرة أخرى." });
  }
});

router.get("/orders/unsynced", async (req, res): Promise<void> => {
  if (!hasInternalSyncAccess(req)) {
    res.status(404).json({ error: "غير موجود." });
    return;
  }

  const orders = await listUnsyncedOrders();
  res.json({
    orders: orders.map((order) => ({
      orderNumber: order.orderNumber,
      orderToken: order.orderToken,
      createdAt: order.createdAt,
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      itemsText: order.itemsText,
      pairs: order.pairs.length,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      synced: order.synced,
      syncAttempts: order.syncAttempts,
      lastSyncAttemptAt: order.lastSyncAttemptAt,
    })),
  });
});

router.post("/orders/unsynced/retry", async (req, res): Promise<void> => {
  if (!hasInternalSyncAccess(req)) {
    res.status(404).json({ error: "غير موجود." });
    return;
  }

  res.json(await retryUnsyncedOrders());
});

router.get("/orders/:orderToken", async (req, res): Promise<void> => {
  const parsed = parseOrderToken(req.params.orderToken);
  if (!parsed.success) {
    res.status(404).json({ error: "الطلب غير موجود." });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderToken, parsed.data.orderToken));

  if (!order) {
    res.status(404).json({ error: "الطلب غير موجود." });
    return;
  }

  res.json(GetOrderResponse.parse(toOrderResponse(order)));
});

export default router;