import type { Response } from "express";

const COOKIE_NAME = "uid";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function setSessionCookie(res: Response, userId: string): void {
  res.cookie(COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    signed: true,
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}
