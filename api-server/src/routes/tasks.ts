import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or, sql, inArray } from "drizzle-orm";
import {
  db,
  tasksTable,
  usersTable,
  offersTable,
  activityTable,
  type TaskRow,
  type User,
} from "@workspace/db";
import { CreateTaskBody } from "@workspace/api-zod";
import { getActorId } from "../lib/currentUser";
import { generateId } from "../lib/ids";
import {
  serializeTask,
  serializeOffer,
  serializeEscrow,
} from "../lib/serializers";
import {
  notifyTaskAwaitingReview,
  notifyTaskCancelled,
  notifyTaskCompleted,
  notifyPaymentRequired,
} from "../lib/telegram";
import {
  cancelTaskAction,
  completeTaskAction,
  confirmPaymentAction,
  markTaskReadyAction,
} from "../services/taskActions";
import { distanceFromCityCenterMeters } from "../lib/cities";

const router: IRouter = Router();

async function loadUserMap(ids: string[]): Promise<Map<string, User>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map();
  const rows = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.id, unique));
  return new Map(rows.map((u) => [u.id, u] as const));
}

async function attachOfferCounts(
  rows: TaskRow[],
): Promise<Map<string, number>> {
  if (rows.length === 0) return new Map();
  const counts = await db
    .select({
      taskId: offersTable.taskId,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(offersTable)
    .where(
      inArray(
        offersTable.taskId,
        rows.map((r) => r.id),
      ),
    )
    .groupBy(offersTable.taskId);
  return new Map(counts.map((c) => [c.taskId, Number(c.count)] as const));
}

async function serializeTaskList(rows: TaskRow[]) {
  const userIds: string[] = [];
  for (const t of rows) {
    userIds.push(t.ownerId);
    if (t.executorId) userIds.push(t.executorId);
  }
  const userMap = await loadUserMap(userIds);
  const offerCounts = await attachOfferCounts(rows);
  return rows.map((t) =>
    serializeTask(
      t,
      userMap.get(t.ownerId)!,
      t.executorId ? userMap.get(t.executorId) ?? null : null,
      offerCounts.get(t.id) ?? 0,
    ),
  );
}

router.get("/tasks", async (req, res): Promise<void> => {
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const maxDistanceRaw =
    typeof req.query.maxDistanceMeters === "string"
      ? Number(req.query.maxDistanceMeters)
      : undefined;

  const conditions = [];
  if (category) conditions.push(eq(tasksTable.category, category));
  if (status) conditions.push(eq(tasksTable.status, status));
  if (search && search.trim().length > 0) {
    const pattern = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(tasksTable.title, pattern),
        ilike(tasksTable.description, pattern),
        ilike(tasksTable.address, pattern),
      )!,
    );
  }
  if (maxDistanceRaw && Number.isFinite(maxDistanceRaw)) {
    conditions.push(sql`${tasksTable.distanceMeters} <= ${maxDistanceRaw}`);
  }

  const rows = await db
    .select()
    .from(tasksTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(tasksTable.createdAt))
    .limit(100);

  res.json(await serializeTaskList(rows));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = generateId("task");
  const ownerId = getActorId(req);
  const [owner] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, ownerId));
  if (!owner) {
    res.status(404).json({ error: "Current user not found" });
    return;
  }
  const distance = distanceFromCityCenterMeters(
    owner.city,
    parsed.data.latitude,
    parsed.data.longitude,
  );
  const [row] = await db
    .insert(tasksTable)
    .values({
      id,
      ownerId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: "open",
      priceTenge: parsed.data.priceTenge,
      useEscrow: parsed.data.useEscrow,
      address: parsed.data.address,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      distanceMeters: distance,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      escrowStatus: parsed.data.useEscrow ? "none" : null,
    })
    .returning();

  await db.insert(activityTable).values({
    id: generateId("act"),
    kind: "task_created",
    message: `${owner?.name ?? "Сосед"} опубликовал: ${row.title}`,
    taskId: row.id,
    userName: owner?.name ?? null,
  });

  res.status(201).json(serializeTask(row, owner!, null, 0));
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const offerRows = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.taskId, id))
    .orderBy(desc(offersTable.createdAt));

  const userIds = [task.ownerId];
  if (task.executorId) userIds.push(task.executorId);
  for (const o of offerRows) userIds.push(o.executorId);
  const userMap = await loadUserMap(userIds);

  const owner = userMap.get(task.ownerId)!;
  const executor = task.executorId ? userMap.get(task.executorId) ?? null : null;
  const offers = offerRows.map((o) =>
    serializeOffer(o, userMap.get(o.executorId)!),
  );

  res.json({
    task: serializeTask(task, owner, executor, offerRows.length),
    offers,
    escrow: serializeEscrow(task),
  });
});

router.get("/my/tasks", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.ownerId, getActorId(req)))
    .orderBy(desc(tasksTable.createdAt));
  res.json(await serializeTaskList(rows));
});

router.get("/my/jobs", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.executorId, getActorId(req)))
    .orderBy(desc(tasksTable.createdAt));
  res.json(await serializeTaskList(rows));
});

async function loadTaskBundle(id: string) {
  const [updated] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id));
  const offerRows = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.taskId, id));
  const userIds = [updated.ownerId];
  if (updated.executorId) userIds.push(updated.executorId);
  for (const o of offerRows) userIds.push(o.executorId);
  const userMap = await loadUserMap(userIds);
  return {
    task: serializeTask(
      updated,
      userMap.get(updated.ownerId)!,
      updated.executorId ? userMap.get(updated.executorId) ?? null : null,
      offerRows.length,
    ),
    offers: offerRows.map((o) =>
      serializeOffer(o, userMap.get(o.executorId)!),
    ),
    escrow: serializeEscrow(updated),
  };
}

router.post("/tasks/:id/ready", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const result = await markTaskReadyAction(id, getActorId(req));
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  if (!result.data.alreadyMarked) {
    void notifyTaskAwaitingReview({
      ownerId: result.data.ownerId,
      taskId: id,
      taskTitle: result.data.taskTitle,
      executorName: result.data.executorName,
      priceTenge: result.data.priceTenge,
    });
  }
  res.json(await loadTaskBundle(id));
});

router.post("/tasks/:id/complete", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const result = await completeTaskAction(id, getActorId(req));
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  void notifyPaymentRequired({
    ownerId: result.data.ownerId,
    taskId: id,
    taskTitle: result.data.taskTitle,
    executorPhone: result.data.executorPhone,
    paymentAmount: result.data.paymentAmount,
  });
  res.json(await loadTaskBundle(id));
});

router.post("/tasks/:id/confirm-payment", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const result = await confirmPaymentAction(id, getActorId(req));
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  void notifyTaskCompleted({
    executorId: result.data.executorId,
    taskId: id,
    taskTitle: result.data.taskTitle,
    payoutTenge: result.data.paymentAmount,
  });
  res.json(await loadTaskBundle(id));
});

router.post("/tasks/:id/cancel", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const result = await cancelTaskAction(id, getActorId(req));
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  void notifyTaskCancelled({
    executorId: result.data.executorId,
    taskId: id,
    taskTitle: result.data.taskTitle,
  });
  res.json(await loadTaskBundle(id));
});

export default router;
