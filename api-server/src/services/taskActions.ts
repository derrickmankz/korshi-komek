import { eq, sql } from "drizzle-orm";
import {
  db,
  tasksTable,
  offersTable,
  usersTable,
  walletTransactionsTable,
  activityTable,
} from "@workspace/db";
import { COMMISSION_PERCENT } from "../lib/currentUser";
import { generateId } from "../lib/ids";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export interface AcceptOfferData {
  taskTitle: string;
  ownerId: string;
  executorId: string;
  useEscrow: boolean;
  priceTenge: number;
}

export async function acceptOfferAction(
  taskId: string,
  offerId: string,
  actorId: string,
): Promise<ActionResult<AcceptOfferData>> {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));
  if (!task) return { ok: false, status: 404, error: "Task not found" };
  if (task.ownerId !== actorId)
    return { ok: false, status: 403, error: "Только владелец может принять отклик" };
  if (task.status !== "open")
    return { ok: false, status: 400, error: "Задание уже не открыто" };

  const [offer] = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.id, offerId));
  if (!offer || offer.taskId !== taskId)
    return { ok: false, status: 404, error: "Отклик не найден" };

  const escrowAmount = task.useEscrow ? offer.priceTenge : null;
  await db
    .update(tasksTable)
    .set({
      status: "in_progress",
      executorId: offer.executorId,
      acceptedOfferId: offer.id,
      escrowAmountTenge: escrowAmount,
      escrowStatus: task.useEscrow ? "held" : null,
    })
    .where(eq(tasksTable.id, taskId));

  await db
    .update(offersTable)
    .set({ status: "accepted" })
    .where(eq(offersTable.id, offer.id));
  await db
    .update(offersTable)
    .set({ status: "declined" })
    .where(
      sql`${offersTable.taskId} = ${taskId} AND ${offersTable.id} <> ${offer.id}`,
    );

  if (task.useEscrow && escrowAmount) {
    await db
      .update(usersTable)
      .set({
        walletHeldTenge: sql`${usersTable.walletHeldTenge} + ${escrowAmount}`,
      })
      .where(eq(usersTable.id, task.ownerId));
    await db.insert(walletTransactionsTable).values({
      id: generateId("wtx"),
      userId: task.ownerId,
      taskId,
      kind: "hold",
      amountTenge: -escrowAmount,
      description: `Заморозка по сделке: ${task.title}`,
    });
  }

  await db.insert(activityTable).values({
    id: generateId("act"),
    kind: "task_accepted",
    message: `Принят отклик по: ${task.title}`,
    taskId,
  });

  return {
    ok: true,
    data: {
      taskTitle: task.title,
      ownerId: task.ownerId,
      executorId: offer.executorId,
      useEscrow: task.useEscrow,
      priceTenge: offer.priceTenge,
    },
  };
}

export interface MarkReadyData {
  taskTitle: string;
  ownerId: string;
  executorId: string;
  executorName: string;
  priceTenge: number;
  alreadyMarked: boolean;
}

export async function markTaskReadyAction(
  taskId: string,
  actorId: string,
): Promise<ActionResult<MarkReadyData>> {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));
  if (!task) return { ok: false, status: 404, error: "Task not found" };
  if (!task.executorId || task.executorId !== actorId)
    return { ok: false, status: 403, error: "Только исполнитель может отметить выполнение" };
  if (task.status !== "in_progress")
    return { ok: false, status: 400, error: "Задание не в работе" };

  const alreadyMarked = task.awaitingReview;

  if (!alreadyMarked) {
    await db
      .update(tasksTable)
      .set({ awaitingReview: true })
      .where(eq(tasksTable.id, taskId));

    await db.insert(activityTable).values({
      id: generateId("act"),
      kind: "task_ready",
      message: `Исполнитель отметил выполненным: ${task.title}`,
      taskId,
    });
  }

  const [executor] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, task.executorId));

  return {
    ok: true,
    data: {
      taskTitle: task.title,
      ownerId: task.ownerId,
      executorId: task.executorId,
      executorName: executor?.name ?? "Сосед",
      priceTenge: task.priceTenge,
      alreadyMarked,
    },
  };
}

// Заказчик принял качество работы → задание переходит в awaiting_payment.
// Реальная выплата происходит только после confirmPaymentAction.
export interface AcceptWorkData {
  taskTitle: string;
  ownerId: string;
  executorId: string | null;
  executorPhone: string | null;
  paymentAmount: number;
}

export async function completeTaskAction(
  taskId: string,
  actorId: string,
): Promise<ActionResult<AcceptWorkData>> {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));
  if (!task) return { ok: false, status: 404, error: "Task not found" };
  if (task.ownerId !== actorId)
    return { ok: false, status: 403, error: "Only owner can accept work" };
  if (task.status !== "in_progress")
    return { ok: false, status: 400, error: "Task is not in progress" };

  const paymentAmount = task.escrowAmountTenge ?? task.priceTenge;

  await db
    .update(tasksTable)
    .set({
      status: "awaiting_payment",
      awaitingReview: false,
    })
    .where(eq(tasksTable.id, taskId));

  await db.insert(activityTable).values({
    id: generateId("act"),
    kind: "task_ready",
    message: `Работа принята, ожидается оплата: ${task.title}`,
    taskId,
  });

  let executorPhone: string | null = null;
  if (task.executorId) {
    const [executor] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, task.executorId));
    executorPhone = executor?.phone ?? null;
  }

  return {
    ok: true,
    data: {
      taskTitle: task.title,
      ownerId: task.ownerId,
      executorId: task.executorId,
      executorPhone,
      paymentAmount,
    },
  };
}

// Заказчик перевёл деньги через Kaspi/Halyk и нажал «Я оплатил».
// Только после этого задание становится completed и открывается отзыв.
export interface ConfirmPaymentData {
  taskTitle: string;
  ownerId: string;
  executorId: string | null;
  paymentAmount: number;
}

export async function confirmPaymentAction(
  taskId: string,
  actorId: string,
): Promise<ActionResult<ConfirmPaymentData>> {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));
  if (!task) return { ok: false, status: 404, error: "Task not found" };
  if (task.ownerId !== actorId)
    return { ok: false, status: 403, error: "Only owner can confirm payment" };
  if (task.status !== "awaiting_payment")
    return { ok: false, status: 400, error: "Task is not awaiting payment" };

  const paymentAmount = task.escrowAmountTenge ?? task.priceTenge;
  const commission = task.useEscrow ? Math.round((paymentAmount * COMMISSION_PERCENT) / 100) : 0;
  const payout = paymentAmount - commission;

  await db
    .update(tasksTable)
    .set({
      status: "completed",
      escrowStatus: task.useEscrow ? "released" : null,
      escrowCommissionTenge: commission || null,
      escrowPayoutTenge: payout || null,
    })
    .where(eq(tasksTable.id, taskId));

  if (task.executorId) {
    await db
      .update(usersTable)
      .set({ completedJobs: sql`${usersTable.completedJobs} + 1` })
      .where(eq(usersTable.id, task.executorId));
  }

  // Снять заморозку с кошелька заказчика (учётная запись — реальные деньги ушли через Kaspi)
  if (task.useEscrow && task.escrowAmountTenge) {
    await db
      .update(usersTable)
      .set({
        walletHeldTenge: sql`greatest(${usersTable.walletHeldTenge} - ${task.escrowAmountTenge}, 0)`,
      })
      .where(eq(usersTable.id, task.ownerId));
    await db.insert(walletTransactionsTable).values({
      id: generateId("wtx"),
      userId: task.ownerId,
      taskId,
      kind: "release",
      amountTenge: -paymentAmount,
      description: `Оплата через Kaspi/Halyk: ${task.title}`,
    });
  }

  await db.insert(activityTable).values({
    id: generateId("act"),
    kind: "task_completed",
    message: `Задание выполнено и оплачено: ${task.title}`,
    taskId,
  });

  return {
    ok: true,
    data: {
      taskTitle: task.title,
      ownerId: task.ownerId,
      executorId: task.executorId,
      paymentAmount: payout,
    },
  };
}

export interface CancelTaskData {
  taskTitle: string;
  ownerId: string;
  executorId: string | null;
}

export async function cancelTaskAction(
  taskId: string,
  actorId: string,
): Promise<ActionResult<CancelTaskData>> {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, taskId));
  if (!task) return { ok: false, status: 404, error: "Task not found" };
  if (task.ownerId !== actorId)
    return { ok: false, status: 403, error: "Only owner can cancel" };
  if (task.status === "completed")
    return { ok: false, status: 400, error: "Already completed" };

  if (task.useEscrow && task.escrowStatus === "held" && task.escrowAmountTenge) {
    const amount = task.escrowAmountTenge;
    await db
      .update(usersTable)
      .set({
        walletHeldTenge: sql`greatest(${usersTable.walletHeldTenge} - ${amount}, 0)`,
      })
      .where(eq(usersTable.id, task.ownerId));
    await db.insert(walletTransactionsTable).values({
      id: generateId("wtx"),
      userId: task.ownerId,
      taskId,
      kind: "refund",
      amountTenge: amount,
      description: `Возврат по отменённой сделке: ${task.title}`,
    });
  }

  await db
    .update(tasksTable)
    .set({
      status: "cancelled",
      awaitingReview: false,
      escrowStatus: task.useEscrow ? "refunded" : null,
    })
    .where(eq(tasksTable.id, taskId));

  await db.insert(activityTable).values({
    id: generateId("act"),
    kind: "task_cancelled",
    message: `Сделка отменена: ${task.title}`,
    taskId,
  });

  return {
    ok: true,
    data: {
      taskTitle: task.title,
      ownerId: task.ownerId,
      executorId: task.executorId,
    },
  };
}
