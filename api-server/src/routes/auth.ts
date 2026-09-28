import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { generateId } from "../lib/ids";
import { setSessionCookie, clearSessionCookie } from "../lib/sessionCookie";
import { serializeUser } from "../lib/serializers";
import { isValidCityName } from "../lib/cities";
import {
  createEmailVerificationToken,
  hashEmailVerificationToken,
  sendVerificationEmail,
} from "../lib/emailVerification";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name = typeof body["name"] === "string" ? body["name"].trim() : "";
  const email = typeof body["email"] === "string" ? body["email"].trim().toLowerCase() : "";
  const password = typeof body["password"] === "string" ? body["password"] : "";
  const addressLine = typeof body["addressLine"] === "string" ? body["addressLine"].trim() : "";
  const city = typeof body["city"] === "string" ? body["city"].trim() : "";

  if (name.length < 2) {
    res.status(400).json({ error: "Укажите имя (минимум 2 символа)" });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "Укажите email" });
    return;
  }
  if (email && !isEmail(email)) {
    res.status(400).json({ error: "Укажите корректный email" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Пароль должен быть не короче 6 символов" });
    return;
  }
  if (!city) {
    res.status(400).json({ error: "Выберите город" });
    return;
  }
  if (!isValidCityName(city)) {
    res.status(400).json({ error: "Укажите корректное название города" });
    return;
  }
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "Этот email уже зарегистрирован" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verification = createEmailVerificationToken();
  const id = generateId("user");
  let user: typeof usersTable.$inferSelect | undefined;
  try {
    [user] = await db
      .insert(usersTable)
      .values({
        id,
        name,
        username: null,
        email,
        emailVerifiedAt: null,
        emailVerificationTokenHash: verification.tokenHash,
        emailVerificationExpiresAt: verification.expiresAt,
        phone: null,
        passwordHash,
        addressLine: addressLine || null,
        city: city || null,
        district: addressLine || null,
      })
      .returning();
  } catch (error) {
    const databaseError = error as { code?: string; constraint?: string };
    if (
      databaseError.code === "23505" &&
      databaseError.constraint === "users_email_unique"
    ) {
      res.status(409).json({ error: "Этот email уже зарегистрирован" });
      return;
    }
    throw error;
  }

  try {
    await sendVerificationEmail(email, name, verification.token);
  } catch (error) {
    logger.error({ err: error, userId: user.id }, "Failed to send verification email");
    res.status(503).json({
      error: "Аккаунт создан, но письмо не отправилось. Попробуйте запросить письмо повторно.",
      emailVerificationRequired: true,
    });
    return;
  }

  res.status(201).json({
    message: "Проверьте почту и перейдите по ссылке из письма",
    email,
    emailVerificationRequired: true,
  });
});

router.get("/auth/verify-email", async (req, res): Promise<void> => {
  const token = typeof req.query["token"] === "string" ? req.query["token"] : "";
  const appUrl = process.env["PUBLIC_APP_URL"]?.replace(/\/$/, "");
  const resultUrl = (result: "success" | "invalid") =>
    appUrl ? `${appUrl}/?email_verified=${result}` : null;

  if (!token) {
    const target = resultUrl("invalid");
    if (target) {
      res.redirect(target);
    } else {
      res.status(400).json({ error: "Ссылка подтверждения недействительна" });
    }
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.emailVerificationTokenHash, hashEmailVerificationToken(token)),
        gt(usersTable.emailVerificationExpiresAt, new Date()),
      ),
    );

  if (!user) {
    const target = resultUrl("invalid");
    if (target) {
      res.redirect(target);
    } else {
      res.status(400).json({ error: "Ссылка подтверждения недействительна или устарела" });
    }
    return;
  }

  const [verifiedUser] = await db
    .update(usersTable)
    .set({
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    })
    .where(eq(usersTable.id, user.id))
    .returning();

  const target = resultUrl("success");
  if (target) {
    res.redirect(target);
  } else {
    res.json({ message: "Email подтверждён", user: serializeUser(verifiedUser!) });
  }
});

router.post("/auth/resend-verification", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const email = typeof body["email"] === "string" ? body["email"].trim().toLowerCase() : "";
  const genericMessage = "Если аккаунт с таким email существует и ещё не подтверждён, новое письмо уже отправляется.";

  if (!email || !isEmail(email)) {
    res.status(200).json({ message: genericMessage });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.email || user.emailVerifiedAt) {
    res.status(200).json({ message: genericMessage });
    return;
  }

  const verification = createEmailVerificationToken();
  await db
    .update(usersTable)
    .set({
      emailVerificationTokenHash: verification.tokenHash,
      emailVerificationExpiresAt: verification.expiresAt,
    })
    .where(eq(usersTable.id, user.id));

  try {
    await sendVerificationEmail(user.email, user.name, verification.token);
  } catch (error) {
    logger.error({ err: error, userId: user.id }, "Failed to resend verification email");
  }

  res.status(200).json({ message: genericMessage });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const email = typeof body["email"] === "string" ? body["email"].trim().toLowerCase() : "";
  const password = typeof body["password"] === "string" ? body["password"] : "";

  if (!email || !password) {
    res.status(400).json({ error: "Введите email и пароль" });
    return;
  }
  if (!isEmail(email)) {
    res.status(400).json({ error: "Укажите корректный email" });
    return;
  }

  const [candidate] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!candidate || !candidate.passwordHash) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }
  const ok = await bcrypt.compare(password, candidate.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }
  if (!candidate.emailVerifiedAt) {
    res.status(403).json({
      error: "Подтвердите email по ссылке из письма, прежде чем входить",
      emailVerificationRequired: true,
    });
    return;
  }
  setSessionCookie(res, candidate.id);
  res.json(serializeUser(candidate));
});

router.post("/auth/demo", async (_req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, "user_alia"));
  if (!user) {
    res.status(404).json({ error: "Демо-пользователь не найден" });
    return;
  }
  setSessionCookie(res, user.id);
  res.json(serializeUser(user));
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

export default router;
