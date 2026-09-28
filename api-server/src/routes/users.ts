import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, reviewsTable } from "@workspace/db";
import { getActorId } from "../lib/currentUser";
import { serializeUser, serializeReview } from "../lib/serializers";
import {
  BOT_USERNAME,
  generateLinkToken,
  isTelegramConfigured,
} from "../lib/telegram";
import { isValidCityName } from "../lib/cities";

const router: IRouter = Router();

router.get("/me", async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  if (!user) {
    res.status(404).json({ error: "Current user not found" });
    return;
  }
  res.json(serializeUser(user));
});

function telegramStatus(user: {
  telegramChatId: string | null;
  telegramLinkToken: string | null;
}) {
  const linked = Boolean(user.telegramChatId);
  const linkToken = !linked ? user.telegramLinkToken : null;
  return {
    linked,
    configured: isTelegramConfigured(),
    botUsername: BOT_USERNAME,
    linkToken,
    linkUrl: linkToken ? `https://t.me/${BOT_USERNAME}?start=${linkToken}` : null,
  };
}

router.patch("/me", async (req, res): Promise<void> => {
  const actorId = getActorId(req);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (typeof body["name"] === "string" && body["name"].trim().length >= 2) {
    updates["name"] = body["name"].trim();
  }
  if (body["bio"] === null) {
    updates["bio"] = null;
  } else if (typeof body["bio"] === "string") {
    updates["bio"] = body["bio"].trim() || null;
  }
  if (body["phone"] === null) {
    updates["phone"] = null;
  } else if (typeof body["phone"] === "string") {
    const p = body["phone"].replace(/[\s\-()]/g, "").trim();
    updates["phone"] = p.length > 0 ? p : null;
  }
  if (body["addressLine"] === null) {
    updates["addressLine"] = null;
  } else if (typeof body["addressLine"] === "string") {
    const a = body["addressLine"].trim();
    updates["addressLine"] = a.length > 0 ? a : null;
    updates["district"] = a.length > 0 ? a : null;
  }
  if (body["city"] === null) {
    updates["city"] = null;
  } else if (typeof body["city"] === "string") {
    const c = body["city"].trim();
    if (c.length > 0 && !isValidCityName(c)) {
      res.status(400).json({ error: "Укажите корректное название города" });
      return;
    }
    updates["city"] = c.length > 0 ? c : null;
  }
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Нет данных для обновления" });
    return;
  }
  await db.update(usersTable).set(updates).where(eq(usersTable.id, actorId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, actorId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(serializeUser(user));
});

router.get("/me/telegram", async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  if (!user) {
    res.status(404).json({ error: "Current user not found" });
    return;
  }
  res.json(telegramStatus(user));
});

router.post("/me/telegram", async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  if (!user) {
    res.status(404).json({ error: "Current user not found" });
    return;
  }
  if (user.telegramChatId) {
    res.json(telegramStatus(user));
    return;
  }
  const token = user.telegramLinkToken ?? generateLinkToken();
  if (!user.telegramLinkToken) {
    await db
      .update(usersTable)
      .set({ telegramLinkToken: token })
      .where(eq(usersTable.id, getActorId(req)));
  }
  res.json(telegramStatus({ ...user, telegramLinkToken: token }));
});

router.delete("/me/telegram", async (req, res): Promise<void> => {
  await db
    .update(usersTable)
    .set({ telegramChatId: null, telegramLinkToken: null })
    .where(eq(usersTable.id, getActorId(req)));
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  res.json(telegramStatus(user!));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const reviewRows = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.toUserId, id))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(20);

  const userIds = new Set<string>();
  for (const r of reviewRows) {
    userIds.add(r.fromUserId);
    userIds.add(r.toUserId);
  }
  const otherUsers =
    userIds.size > 0
      ? await db.select().from(usersTable)
      : [];
  const userMap = new Map(otherUsers.map((u) => [u.id, u] as const));
  userMap.set(user.id, user);

  const recentReviews = reviewRows.map((r) =>
    serializeReview(r, userMap.get(r.fromUserId)!, userMap.get(r.toUserId)!),
  );

  res.json({ user: serializeUser(user), recentReviews });
});

export default router;
