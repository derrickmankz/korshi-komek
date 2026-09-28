import { Router, type IRouter } from "express";
import { desc, eq, gte, sql } from "drizzle-orm";
import {
  db,
  tasksTable,
  usersTable,
  activityTable,
} from "@workspace/db";
import { COMMISSION_PERCENT } from "../lib/currentUser";
import { serializeUser, serializeActivity } from "../lib/serializers";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [openCount] = await db
    .select({ c: sql<number>`cast(count(*) as int)` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "open"));

  const [inProgressCount] = await db
    .select({ c: sql<number>`cast(count(*) as int)` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "in_progress"));

  const [completedCount] = await db
    .select({ c: sql<number>`cast(count(*) as int)` })
    .from(tasksTable)
    .where(
      sql`${tasksTable.status} = 'completed' AND ${tasksTable.createdAt} >= ${since.toISOString()}`,
    );

  const [avg] = await db
    .select({
      avg: sql<number>`coalesce(cast(avg(${tasksTable.priceTenge}) as int), 0)`,
    })
    .from(tasksTable)
    .where(eq(tasksTable.status, "open"));

  const [held] = await db
    .select({
      sum: sql<number>`coalesce(cast(sum(${tasksTable.escrowAmountTenge}) as int), 0)`,
    })
    .from(tasksTable)
    .where(eq(tasksTable.escrowStatus, "held"));

  const categoryRows = await db
    .select({
      category: tasksTable.category,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(tasksTable)
    .where(eq(tasksTable.status, "open"))
    .groupBy(tasksTable.category);

  res.json({
    openTasksCount: Number(openCount?.c ?? 0),
    inProgressCount: Number(inProgressCount?.c ?? 0),
    completedTodayCount: Number(completedCount?.c ?? 0),
    averagePriceTenge: Number(avg?.avg ?? 0),
    totalEscrowHeldTenge: Number(held?.sum ?? 0),
    commissionPercent: COMMISSION_PERCENT,
    categoryCounts: categoryRows.map((r) => ({
      category: r.category,
      count: Number(r.count),
    })),
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(20);
  res.json(rows.map(serializeActivity));
});

router.get("/dashboard/top-helpers", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(usersTable)
    .where(gte(usersTable.reviewCount, 1))
    .orderBy(
      desc(sql`${usersTable.ratingSum}::float / nullif(${usersTable.reviewCount}, 0)`),
      desc(usersTable.reviewCount),
    )
    .limit(8);
  res.json(rows.map(serializeUser));
});

export default router;
