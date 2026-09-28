import { Router, type IRouter } from "express";
import { eq, ilike, or, desc, and, ne, gte, sql } from "drizzle-orm";
import { db, usersTable, tasksTable, walletTransactionsTable } from "@workspace/db";
import { getActorId } from "../lib/currentUser";
import { serializeUser, serializeTask } from "../lib/serializers";
import { generateId } from "../lib/ids";

const router: IRouter = Router();

async function requireAdmin(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
): Promise<void> {
  const actorId = getActorId(req);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, actorId));
  if (!user?.isAdmin) {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }
  next();
}

router.use("/admin", requireAdmin);

router.post("/admin/wallet/credit", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const userId = typeof body["userId"] === "string" ? body["userId"].trim() : "";
  const amountTenge = typeof body["amountTenge"] === "number" ? Math.round(body["amountTenge"]) : 0;
  const description =
    typeof body["description"] === "string" && body["description"].trim()
      ? body["description"].trim()
      : amountTenge >= 0
        ? "Ручное пополнение"
        : "Ручное списание";

  if (!userId) {
    res.status(400).json({ error: "userId обязателен" });
    return;
  }
  if (amountTenge === 0) {
    res.status(400).json({ error: "Сумма не может быть 0" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }

  await db
    .update(usersTable)
    .set({ walletBalanceTenge: sql`wallet_balance_tenge + ${amountTenge}` })
    .where(eq(usersTable.id, userId));

  await db.insert(walletTransactionsTable).values({
    id: generateId("wtx"),
    userId,
    taskId: null,
    kind: "manual_credit",
    amountTenge,
    description,
    createdAt: new Date(),
  });

  const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json(serializeUser(updated!));
});

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allUsers, newUsers, allTasks] = await Promise.all([
    db.select({ id: usersTable.id }).from(usersTable),
    db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(gte(usersTable.joinedAt, startOfMonth)),
    db.select().from(tasksTable),
  ]);

  const tasksByStatus = {
    open: 0,
    in_progress: 0,
    awaiting_payment: 0,
    completed: 0,
    cancelled: 0,
  } as Record<string, number>;

  let totalEarnedTenge = 0;
  let totalCommissionTenge = 0;
  let totalEscrowTasks = 0;

  for (const task of allTasks) {
    if (task.status in tasksByStatus) tasksByStatus[task.status]++;
    if (task.status === "completed") {
      totalEarnedTenge += task.priceTenge;
      if (task.escrowCommissionTenge) {
        totalCommissionTenge += task.escrowCommissionTenge;
        totalEscrowTasks++;
      }
    }
  }

  res.json({
    totalUsers: allUsers.length,
    newUsersThisMonth: newUsers.length,
    totalTasks: allTasks.length,
    tasksByStatus,
    totalEarnedTenge,
    totalCommissionTenge,
    totalEscrowTasks,
  });
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const rows = search
    ? await db
        .select()
        .from(usersTable)
        .where(
          or(
            ilike(usersTable.name, `%${search}%`),
            ilike(usersTable.email, `%${search}%`),
            ilike(usersTable.phone, `%${search}%`),
            ilike(usersTable.username, `%${search}%`),
          ),
        )
        .orderBy(desc(usersTable.joinedAt))
    : await db.select().from(usersTable).orderBy(desc(usersTable.joinedAt));

  res.json(rows.map(serializeUser));
});

router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (typeof body["name"] === "string" && body["name"].trim().length >= 2) {
    updates["name"] = body["name"].trim();
  }
  if (typeof body["username"] === "string") {
    const u = body["username"].trim().toLowerCase();
    if (u.length === 0) {
      updates["username"] = null;
    } else if (!/^[a-z0-9_]{3,30}$/.test(u)) {
      res.status(400).json({ error: "Никнейм: только латиница, цифры и _ (3–30 символов)" });
      return;
    } else {
      const [taken] = await db
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.username, u), ne(usersTable.id, id)));
      if (taken) {
        res.status(409).json({ error: "Этот никнейм уже занят" });
        return;
      }
      updates["username"] = u;
    }
  } else if (body["username"] === null) {
    updates["username"] = null;
  }

  if (typeof body["email"] === "string") {
    const e = body["email"].trim().toLowerCase() || null;
    if (e) {
      const [taken] = await db
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.email, e), ne(usersTable.id, id)));
      if (taken) {
        res.status(409).json({ error: "Этот email уже используется" });
        return;
      }
    }
    updates["email"] = e;
  } else if (body["email"] === null) {
    updates["email"] = null;
  }

  if (typeof body["phone"] === "string") {
    const p = body["phone"].trim() || null;
    if (p) {
      const [taken] = await db
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.phone, p), ne(usersTable.id, id)));
      if (taken) {
        res.status(409).json({ error: "Этот телефон уже используется" });
        return;
      }
    }
    updates["phone"] = p;
  } else if (body["phone"] === null) {
    updates["phone"] = null;
  }

  if (typeof body["addressLine"] === "string") {
    updates["addressLine"] = body["addressLine"].trim() || null;
  } else if (body["addressLine"] === null) {
    updates["addressLine"] = null;
  }

  if (typeof body["bio"] === "string") {
    updates["bio"] = body["bio"].trim() || null;
  } else if (body["bio"] === null) {
    updates["bio"] = null;
  }

  if (typeof body["isAdmin"] === "boolean") {
    const actorId = getActorId(req);
    if (id === actorId && body["isAdmin"] === false) {
      res.status(400).json({ error: "Нельзя снять права администратора с самого себя" });
      return;
    }
    updates["isAdmin"] = body["isAdmin"];
  }

  if (typeof body["password"] === "string") {
    const pwd = body["password"];
    if (pwd.length < 6) {
      res.status(400).json({ error: "Новый пароль должен быть не короче 6 символов" });
      return;
    }
    const bcrypt = await import("bcryptjs");
    updates["passwordHash"] = await bcrypt.default.hash(pwd, 10);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Нет данных для обновления" });
    return;
  }

  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }
  res.json(serializeUser(user));
});

router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const actorId = getActorId(req);
  if (id === actorId) {
    res.status(400).json({ error: "Нельзя удалить собственный аккаунт через панель администратора" });
    return;
  }
  await db.update(tasksTable).set({ status: "cancelled" }).where(eq(tasksTable.ownerId, id));
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

router.get("/admin/tasks", async (req, res): Promise<void> => {
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  let query = db
    .select()
    .from(tasksTable)
    .orderBy(desc(tasksTable.createdAt))
    .$dynamic();

  if (status) {
    query = query.where(eq(tasksTable.status, status));
  }
  if (search) {
    query = query.where(ilike(tasksTable.title, `%${search}%`));
  }

  const rows = await query.limit(200);

  const ownerIds = [...new Set(rows.map((r) => r.ownerId))];
  const executorIds = [...new Set(rows.map((r) => r.executorId).filter(Boolean) as string[])];
  const allIds = [...new Set([...ownerIds, ...executorIds])];

  const users =
    allIds.length > 0
      ? await db.select().from(usersTable).where(
          or(...allIds.map((uid) => eq(usersTable.id, uid)))!,
        )
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const serialized = rows.map((t) => {
    const owner = userMap.get(t.ownerId);
    const executor = t.executorId ? userMap.get(t.executorId) ?? null : null;
    if (!owner) return null;
    return serializeTask(t, owner, executor ?? null, 0);
  }).filter(Boolean);

  res.json(serialized);
});

router.delete("/admin/tasks/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Задание не найдено" });
    return;
  }
  await db.update(tasksTable).set({ status: "cancelled" }).where(eq(tasksTable.id, id));
  res.json({ ok: true });
});

export default router;
