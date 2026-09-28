import { Router, type IRouter } from "express";
import { eq, desc, inArray } from "drizzle-orm";
import {
  db,
  tasksTable,
  offersTable,
  usersTable,
  type User,
} from "@workspace/db";
import { CreateOfferBody, AcceptOfferBody } from "@workspace/api-zod";
import { getActorId } from "../lib/currentUser";
import { generateId } from "../lib/ids";
import {
  serializeOffer,
  serializeTask,
  serializeEscrow,
} from "../lib/serializers";
import { notifyNewOffer, notifyOfferAccepted } from "../lib/telegram";
import { acceptOfferAction } from "../services/taskActions";

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

router.get("/tasks/:id/offers", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const offerRows = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.taskId, id))
    .orderBy(desc(offersTable.createdAt));
  const userMap = await loadUserMap(offerRows.map((o) => o.executorId));
  res.json(offerRows.map((o) => serializeOffer(o, userMap.get(o.executorId)!)));
});

router.post("/tasks/:id/offers", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (task.ownerId === getActorId(req)) {
    res.status(400).json({ error: "Нельзя откликнуться на своё задание" });
    return;
  }
  if (task.status !== "open") {
    res.status(400).json({ error: "Задание уже не принимает отклики" });
    return;
  }
  const offerId = generateId("off");
  const [row] = await db
    .insert(offersTable)
    .values({
      id: offerId,
      taskId: id,
      executorId: getActorId(req),
      priceTenge: parsed.data.priceTenge,
      message: parsed.data.message ?? "",
      status: "pending",
    })
    .returning();
  const [executor] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  void notifyNewOffer({
    ownerId: task.ownerId,
    taskId: id,
    taskTitle: task.title,
    offerId: row.id,
    executorName: executor?.name ?? "Сосед",
    priceTenge: row.priceTenge,
  });
  res.status(201).json(serializeOffer(row, executor!));
});

router.post("/tasks/:id/accept", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const parsed = AcceptOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await acceptOfferAction(id, parsed.data.offerId, getActorId(req));
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  void notifyOfferAccepted({
    executorId: result.data.executorId,
    ownerId: result.data.ownerId,
    taskId: id,
    taskTitle: result.data.taskTitle,
    useEscrow: result.data.useEscrow,
    priceTenge: result.data.priceTenge,
  });

  const [updated] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id));
  const offerRows = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.taskId, id))
    .orderBy(desc(offersTable.createdAt));
  const userIds = [updated.ownerId];
  if (updated.executorId) userIds.push(updated.executorId);
  for (const o of offerRows) userIds.push(o.executorId);
  const userMap = await loadUserMap(userIds);

  res.json({
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
  });
});

export default router;
