import { Router, type IRouter } from "express";
import { and, eq, asc } from "drizzle-orm";
import { db, tasksTable, taskMessagesTable, usersTable } from "@workspace/db";
import { getActorId } from "../lib/currentUser";
import { generateId } from "../lib/ids";

const router: IRouter = Router();

async function getTaskParticipant(taskId: string, actorId: string) {
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  if (!task) return null;
  const isParticipant = task.ownerId === actorId || task.executorId === actorId;
  return isParticipant ? task : null;
}

router.get("/tasks/:id/messages", async (req, res): Promise<void> => {
  const actorId = getActorId(req);
  const task = await getTaskParticipant(req.params.id!, actorId);
  if (!task) {
    res.status(403).json({ error: "Нет доступа к чату этого задания" });
    return;
  }

  const rows = await db
    .select({
      id: taskMessagesTable.id,
      taskId: taskMessagesTable.taskId,
      fromUserId: taskMessagesTable.fromUserId,
      fromUserName: usersTable.name,
      text: taskMessagesTable.text,
      createdAt: taskMessagesTable.createdAt,
    })
    .from(taskMessagesTable)
    .innerJoin(usersTable, eq(taskMessagesTable.fromUserId, usersTable.id))
    .where(eq(taskMessagesTable.taskId, req.params.id!))
    .orderBy(asc(taskMessagesTable.createdAt));

  res.json({
    messages: rows.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

router.post("/tasks/:id/messages", async (req, res): Promise<void> => {
  const actorId = getActorId(req);
  const task = await getTaskParticipant(req.params.id!, actorId);
  if (!task) {
    res.status(403).json({ error: "Нет доступа к чату этого задания" });
    return;
  }
  if (task.status === "cancelled") {
    res.status(400).json({ error: "Нельзя писать в отменённое задание" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const text = typeof body["text"] === "string" ? body["text"].trim() : "";
  if (!text || text.length > 2000) {
    res.status(400).json({ error: "Сообщение должно быть от 1 до 2000 символов" });
    return;
  }

  const id = generateId("msg");
  await db.insert(taskMessagesTable).values({
    id,
    taskId: req.params.id!,
    fromUserId: actorId,
    text,
    createdAt: new Date(),
  });

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, actorId));
  const createdAt = new Date();

  res.status(201).json({
    id,
    taskId: req.params.id!,
    fromUserId: actorId,
    fromUserName: sender?.name ?? "Пользователь",
    text,
    createdAt: createdAt.toISOString(),
  });
});

export default router;
