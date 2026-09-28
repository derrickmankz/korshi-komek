import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, reviewsTable, tasksTable, usersTable } from "@workspace/db";
import { CreateReviewBody } from "@workspace/api-zod";
import { getActorId } from "../lib/currentUser";
import { generateId } from "../lib/ids";
import { serializeReview } from "../lib/serializers";
import { notifyReview } from "../lib/telegram";

const router: IRouter = Router();

router.post("/tasks/:id/reviews", async (req, res): Promise<void> => {
  const id = String(req.params.id);
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (task.status !== "completed") {
    res
      .status(400)
      .json({ error: "Отзыв доступен только после выполнения задания" });
    return;
  }

  const reviewId = generateId("rev");
  const [row] = await db
    .insert(reviewsTable)
    .values({
      id: reviewId,
      taskId: id,
      fromUserId: getActorId(req),
      toUserId: parsed.data.toUserId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? "",
    })
    .returning();

  await db
    .update(usersTable)
    .set({
      ratingSum: sql`${usersTable.ratingSum} + ${parsed.data.rating}`,
      reviewCount: sql`${usersTable.reviewCount} + 1`,
    })
    .where(eq(usersTable.id, parsed.data.toUserId));

  const [from] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  const [to] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.toUserId));

  void notifyReview({
    toUserId: parsed.data.toUserId,
    fromName: from?.name ?? "Сосед",
    taskTitle: task.title,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? "",
  });

  res.status(201).json(serializeReview(row, from!, to!));
});

export default router;
