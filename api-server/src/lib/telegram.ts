import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "./logger";
import {
  acceptOfferAction,
  cancelTaskAction,
  completeTaskAction,
  confirmPaymentAction,
  markTaskReadyAction,
} from "../services/taskActions";

export const BOT_USERNAME = "KorshiKomekBot";
const TOKEN = process.env["TELEGRAM_BOT_TOKEN"];
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

const APP_BASE_URL =
  process.env["PUBLIC_APP_URL"] ??
  (process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : null);

export function isTelegramConfigured(): boolean {
  return Boolean(TOKEN);
}

export function generateLinkToken(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

export function appUrl(path: string): string | null {
  if (!APP_BASE_URL) return null;
  return `${APP_BASE_URL}${path}`;
}

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface ReplyMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

async function tg(method: string, body: unknown): Promise<unknown> {
  if (!API) return null;
  try {
    const res = await fetch(`${API}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok: boolean; description?: string; result?: unknown };
    if (!data.ok) {
      logger.warn({ method, description: data.description }, "Telegram API error");
    }
    return data;
  } catch (err) {
    logger.warn({ err, method }, "Telegram API request failed");
    return null;
  }
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  replyMarkup?: ReplyMarkup,
): Promise<{ messageId: number } | null> {
  const data = (await tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  })) as { ok: boolean; result?: { message_id: number } } | null;
  if (data?.ok && data.result) return { messageId: data.result.message_id };
  return null;
}

async function editMessageText(
  chatId: string,
  messageId: number,
  text: string,
  replyMarkup?: ReplyMarkup,
): Promise<void> {
  await tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : { reply_markup: { inline_keyboard: [] } }),
  });
}

async function answerCallback(callbackId: string, text?: string, alert = false): Promise<void> {
  await tg("answerCallbackQuery", {
    callback_query_id: callbackId,
    ...(text ? { text } : {}),
    show_alert: alert,
  });
}

export async function notifyUser(
  userId: string,
  text: string,
  replyMarkup?: ReplyMarkup,
): Promise<void> {
  if (!API) return;
  const [user] = await db
    .select({ chatId: usersTable.telegramChatId })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user?.chatId) return;
  await sendTelegramMessage(user.chatId, text, replyMarkup);
}

function openTaskButton(taskId: string): InlineKeyboardButton[] | null {
  const url = appUrl(`/tasks/${taskId}`);
  if (!url) return null;
  return [{ text: "Открыть в приложении", url }];
}

function openProfileButton(userId: string): InlineKeyboardButton[] | null {
  const url = appUrl(`/users/${userId}`);
  if (!url) return null;
  return [{ text: "Открыть профиль", url }];
}

export async function notifyNewOffer(args: {
  ownerId: string;
  taskId: string;
  taskTitle: string;
  offerId: string;
  executorName: string;
  priceTenge: number;
}): Promise<void> {
  const buttons: InlineKeyboardButton[][] = [
    [{ text: "Принять отклик", callback_data: `accept:${args.taskId}:${args.offerId}` }],
  ];
  const open = openTaskButton(args.taskId);
  if (open) buttons.push(open);
  await notifyUser(
    args.ownerId,
    `Новый отклик по «${args.taskTitle}»\n${args.executorName} предлагает ${args.priceTenge.toLocaleString("ru-RU")} ₸`,
    { inline_keyboard: buttons },
  );
}

export async function notifyOfferAccepted(args: {
  executorId: string;
  ownerId: string;
  taskId: string;
  taskTitle: string;
  useEscrow: boolean;
  priceTenge: number;
}): Promise<void> {
  const executorButtons: InlineKeyboardButton[][] = [
    [{ text: "Я закончил, ждёт проверки", callback_data: `ready:${args.taskId}` }],
  ];
  const open = openTaskButton(args.taskId);
  if (open) executorButtons.push(open);
  await notifyUser(
    args.executorId,
    `Ваш отклик принят по «${args.taskTitle}»${args.useEscrow ? "\nСумма заморожена в безопасной сделке. Можно приступать." : "\nДоговоритесь с заказчиком о деталях."}\n\nКогда выполните — нажмите «Я закончил, ждёт проверки», и заказчик получит уведомление.`,
    { inline_keyboard: executorButtons },
  );

  const ownerButtons: InlineKeyboardButton[][] = [
    [{ text: "Подтвердить выполнение", callback_data: `complete:${args.taskId}` }],
    [{ text: "Отменить сделку", callback_data: `cancel:${args.taskId}` }],
  ];
  if (open) ownerButtons.push(open);
  await notifyUser(
    args.ownerId,
    `Сделка идёт: «${args.taskTitle}» за ${args.priceTenge.toLocaleString("ru-RU")} ₸.\nКогда сосед всё сделает — нажмите «Подтвердить выполнение».`,
    { inline_keyboard: ownerButtons },
  );
}

export async function notifyTaskAwaitingReview(args: {
  ownerId: string;
  taskId: string;
  taskTitle: string;
  executorName: string;
  priceTenge: number;
}): Promise<void> {
  const buttons: InlineKeyboardButton[][] = [
    [{ text: "Подтвердить выполнение", callback_data: `complete:${args.taskId}` }],
    [{ text: "Отменить сделку", callback_data: `cancel:${args.taskId}` }],
  ];
  const open = openTaskButton(args.taskId);
  if (open) buttons.push(open);
  await notifyUser(
    args.ownerId,
    `${args.executorName} отметил «${args.taskTitle}» как выполненное и ждёт вашей проверки.\nК выплате: ${args.priceTenge.toLocaleString("ru-RU")} ₸ (минус комиссия 7% при безопасной сделке).`,
    { inline_keyboard: buttons },
  );
}

export async function notifyPaymentRequired(args: {
  ownerId: string;
  taskId: string;
  taskTitle: string;
  executorPhone: string | null;
  paymentAmount: number;
}): Promise<void> {
  const phoneStr = args.executorPhone
    ? `\nНомер для перевода: <b>${args.executorPhone}</b>`
    : "\nПопросите исполнителя добавить номер телефона в профиль.";
  const buttons: InlineKeyboardButton[][] = [
    [{ text: "Я оплатил через Kaspi / Halyk", callback_data: `paid:${args.taskId}` }],
  ];
  const open = openTaskButton(args.taskId);
  if (open) buttons.push(open);
  await notifyUser(
    args.ownerId,
    `Работа по «${args.taskTitle}» принята.\n\nПереведите <b>${args.paymentAmount.toLocaleString("ru-RU")} ₸</b> исполнителю через Kaspi или Halyk Bank.${phoneStr}\n\nПосле перевода нажмите кнопку ниже — задание закроется и откроется форма отзыва.`,
    { inline_keyboard: buttons },
  );
}

export async function notifyTaskCompleted(args: {
  executorId: string | null;
  taskId: string;
  taskTitle: string;
  payoutTenge: number | null;
}): Promise<void> {
  if (!args.executorId) return;
  const buttons: InlineKeyboardButton[][] = [];
  const open = openTaskButton(args.taskId);
  if (open) buttons.push(open);
  const payout = args.payoutTenge
    ? ` Заказчик перевёл ${args.payoutTenge.toLocaleString("ru-RU")} ₸ через Kaspi/Halyk.`
    : "";
  await notifyUser(
    args.executorId,
    `Заказчик подтвердил оплату по «${args.taskTitle}».${payout}\n\nОтзыв уже открыт — вы тоже можете оставить отзыв о заказчике.`,
    buttons.length ? { inline_keyboard: buttons } : undefined,
  );
}

export async function notifyTaskCancelled(args: {
  executorId: string | null;
  taskId: string;
  taskTitle: string;
}): Promise<void> {
  if (!args.executorId) return;
  const buttons: InlineKeyboardButton[][] = [];
  const open = openTaskButton(args.taskId);
  if (open) buttons.push(open);
  await notifyUser(
    args.executorId,
    `Задание «${args.taskTitle}» отменено заказчиком.`,
    buttons.length ? { inline_keyboard: buttons } : undefined,
  );
}

export async function notifyReview(args: {
  toUserId: string;
  fromName: string;
  taskTitle: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const buttons: InlineKeyboardButton[][] = [];
  const open = openProfileButton(args.toUserId);
  if (open) buttons.push(open);
  await notifyUser(
    args.toUserId,
    `${args.fromName} оставил вам отзыв ${args.rating}/5 по «${args.taskTitle}».${args.comment ? `\n«${args.comment}»` : ""}`,
    buttons.length ? { inline_keyboard: buttons } : undefined,
  );
}

let pollingStarted = false;

export function startTelegramBot(): void {
  if (!API || pollingStarted) return;
  pollingStarted = true;
  void pollLoop();
}

async function pollLoop(): Promise<void> {
  let offset = 0;
  logger.info({ bot: BOT_USERNAME }, "Telegram bot polling started");
  while (true) {
    try {
      const res = await fetch(
        `${API}/getUpdates?timeout=25&offset=${offset}&allowed_updates=${encodeURIComponent(
          JSON.stringify(["message", "callback_query"]),
        )}`,
      );
      const data = (await res.json()) as {
        ok: boolean;
        result?: TelegramUpdate[];
      };
      if (data.ok && data.result) {
        for (const update of data.result) {
          offset = Math.max(offset, update.update_id + 1);
          try {
            await handleUpdate(update);
          } catch (err) {
            logger.warn({ err, update_id: update.update_id }, "Telegram update handling failed");
          }
        }
      }
    } catch (err) {
      logger.warn({ err }, "Telegram polling iteration failed");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    from?: { first_name?: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message?: {
      chat: { id: number };
      message_id: number;
      text?: string;
    };
    data?: string;
  };
}

async function handleUpdate(update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  const msg = update.message;
  if (!msg?.text) return;
  const chatId = String(msg.chat.id);
  const text = msg.text.trim();

  if (text.startsWith("/start")) {
    const parts = text.split(/\s+/);
    const token = parts[1]?.toUpperCase();
    if (!token) {
      await sendTelegramMessage(
        chatId,
        `Здравствуйте! Это бот «Көрші көмек — Помощь соседа».\n\nЧтобы получать уведомления о ваших заданиях, откройте приложение, зайдите в профиль и нажмите «Привязать Telegram».`,
      );
      return;
    }
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramLinkToken, token));
    if (!user) {
      await sendTelegramMessage(
        chatId,
        `Не нашли такой код привязки. Откройте приложение, зайдите в профиль и нажмите «Привязать Telegram» ещё раз — мы выдадим новый код.`,
      );
      return;
    }
    await db
      .update(usersTable)
      .set({ telegramChatId: chatId, telegramLinkToken: null })
      .where(eq(usersTable.id, user.id));
    await sendTelegramMessage(
      chatId,
      `Готово, ${user.name}! Telegram привязан к вашему профилю «Көрші көмек».\n\nТеперь вы будете получать здесь уведомления о новых откликах, принятых сделках и отзывах — прямо с кнопками действий.`,
    );
    return;
  }

  if (text === "/stop" || text === "/unlink") {
    await db
      .update(usersTable)
      .set({ telegramChatId: null, telegramLinkToken: null })
      .where(eq(usersTable.telegramChatId, chatId));
    await sendTelegramMessage(
      chatId,
      `Telegram отвязан. Уведомления приходить не будут. Привязать снова можно в профиле приложения.`,
    );
    return;
  }

  await sendTelegramMessage(
    chatId,
    `Я отправляю уведомления о ваших заданиях с кнопками действий. Команды:\n/start &lt;код&gt; — привязать аккаунт\n/unlink — отвязать аккаунт`,
  );
}

async function handleCallback(cb: NonNullable<TelegramUpdate["callback_query"]>): Promise<void> {
  if (!cb.message || !cb.data) {
    await answerCallback(cb.id);
    return;
  }
  const chatId = String(cb.message.chat.id);
  const messageId = cb.message.message_id;
  const originalText = cb.message.text ?? "";

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.telegramChatId, chatId));
  if (!user) {
    await answerCallback(cb.id, "Аккаунт не привязан", true);
    return;
  }

  const [action, ...rest] = cb.data.split(":");

  if (action === "accept" && rest.length === 2) {
    const [taskId, offerId] = rest as [string, string];
    const result = await acceptOfferAction(taskId, offerId, user.id);
    if (!result.ok) {
      await answerCallback(cb.id, result.error, true);
      await editMessageText(chatId, messageId, `${originalText}\n\n— ${result.error}`);
      return;
    }
    await answerCallback(cb.id, "Отклик принят");
    await editMessageText(
      chatId,
      messageId,
      `${originalText}\n\nВы приняли этот отклик.`,
    );
    await notifyOfferAccepted({
      executorId: result.data.executorId,
      ownerId: result.data.ownerId,
      taskId,
      taskTitle: result.data.taskTitle,
      useEscrow: result.data.useEscrow,
      priceTenge: result.data.priceTenge,
    });
    return;
  }

  if (action === "ready" && rest.length === 1) {
    const [taskId] = rest as [string];
    const result = await markTaskReadyAction(taskId, user.id);
    if (!result.ok) {
      await answerCallback(cb.id, result.error, true);
      await editMessageText(chatId, messageId, `${originalText}\n\n— ${result.error}`);
      return;
    }
    await answerCallback(cb.id, "Отмечено как выполненное");
    await editMessageText(
      chatId,
      messageId,
      `${originalText}\n\nВы отметили задание как выполненное. Заказчик получил уведомление и подтвердит работу.`,
    );
    if (!result.data.alreadyMarked) {
      await notifyTaskAwaitingReview({
        ownerId: result.data.ownerId,
        taskId,
        taskTitle: result.data.taskTitle,
        executorName: result.data.executorName,
        priceTenge: result.data.priceTenge,
      });
    }
    return;
  }

  if (action === "complete" && rest.length === 1) {
    const [taskId] = rest as [string];
    const result = await completeTaskAction(taskId, user.id);
    if (!result.ok) {
      await answerCallback(cb.id, result.error, true);
      await editMessageText(chatId, messageId, `${originalText}\n\n— ${result.error}`);
      return;
    }
    await answerCallback(cb.id, "Работа принята — ожидается оплата");
    await editMessageText(
      chatId,
      messageId,
      `${originalText}\n\nВы приняли работу. Переведите оплату исполнителю через Kaspi/Halyk.`,
    );
    await notifyPaymentRequired({
      ownerId: result.data.ownerId,
      taskId,
      taskTitle: result.data.taskTitle,
      executorPhone: result.data.executorPhone,
      paymentAmount: result.data.paymentAmount,
    });
    return;
  }

  if (action === "paid" && rest.length === 1) {
    const [taskId] = rest as [string];
    const result = await confirmPaymentAction(taskId, user.id);
    if (!result.ok) {
      await answerCallback(cb.id, result.error, true);
      await editMessageText(chatId, messageId, `${originalText}\n\n— ${result.error}`);
      return;
    }
    await answerCallback(cb.id, "Оплата подтверждена, задание закрыто");
    await editMessageText(
      chatId,
      messageId,
      `${originalText}\n\nОплата подтверждена. Задание завершено, отзыв открыт.`,
    );
    await notifyTaskCompleted({
      executorId: result.data.executorId,
      taskId,
      taskTitle: result.data.taskTitle,
      payoutTenge: result.data.paymentAmount,
    });
    return;
  }

  if (action === "cancel" && rest.length === 1) {
    const [taskId] = rest as [string];
    const result = await cancelTaskAction(taskId, user.id);
    if (!result.ok) {
      await answerCallback(cb.id, result.error, true);
      await editMessageText(chatId, messageId, `${originalText}\n\n— ${result.error}`);
      return;
    }
    await answerCallback(cb.id, "Сделка отменена");
    await editMessageText(
      chatId,
      messageId,
      `${originalText}\n\nВы отменили сделку.`,
    );
    await notifyTaskCancelled({
      executorId: result.data.executorId,
      taskId,
      taskTitle: result.data.taskTitle,
    });
    return;
  }

  await answerCallback(cb.id);
}
