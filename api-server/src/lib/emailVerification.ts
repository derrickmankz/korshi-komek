import { createHash, randomBytes } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const APP_BASE_URL =
  process.env["PUBLIC_APP_URL"] ??
  (process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : null);
const FROM_EMAIL =
  process.env["RESEND_FROM_EMAIL"] ?? "Көрші көмек <onboarding@resend.dev>";

export function createEmailVerificationToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashEmailVerificationToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  };
}

export function hashEmailVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verificationLink(token: string): string | null {
  if (!APP_BASE_URL) return null;
  return `${APP_BASE_URL.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const link = verificationLink(token);
  if (!link) {
    throw new Error("PUBLIC_APP_URL is not configured");
  }

  const connectors = new ReplitConnectors();
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: "Подтвердите email — Көрші көмек",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #18212f; max-width: 560px; margin: 0 auto;">
          <h2>Добро пожаловать в «Көрші көмек»</h2>
          <p>Здравствуйте, ${escapeHtml(name)}!</p>
          <p>Нажмите кнопку ниже, чтобы подтвердить этот email и активировать аккаунт.</p>
          <p>
            <a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
              Подтвердить email
            </a>
          </p>
          <p style="font-size:13px;color:#667085;">Ссылка действует 24 часа. Если вы не создавали аккаунт, это письмо можно удалить.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email request failed (${response.status}): ${body.slice(0, 300)}`);
  }
}