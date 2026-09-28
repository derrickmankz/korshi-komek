import { Router, type IRouter } from "express";
import { desc, eq, or, inArray } from "drizzle-orm";
import { db, tasksTable, activityTable } from "@workspace/db";
import { getActorId } from "../lib/currentUser";
import { serializeActivity } from "../lib/serializers";

const router: IRouter = Router();

router.get("/my/notifications", async (req, res): Promise<void> => {
  const actorId = getActorId(req);

  const myTasks = await db
    .select({ id: tasksTable.id })
    .from(tasksTable)
    .where(or(eq(tasksTable.ownerId, actorId), eq(tasksTable.executorId, actorId)));

  if (myTasks.length === 0) {
    res.json({ events: [] });
    return;
  }

  const taskIds = myTasks.map((t) => t.id);

  const events = await db
    .select()
    .from(activityTable)
    .where(inArray(activityTable.taskId, taskIds))
    .orderBy(desc(activityTable.createdAt))
    .limit(60);

  res.json({ events: events.map(serializeActivity) });
});

export default router;
