import type { Request } from "express";

export const DEMO_USER_ID = "user_alia";
export const COMMISSION_PERCENT = 7;

export function getActorId(req: Request): string {
  const cookieUid = (req.signedCookies as Record<string, unknown> | undefined)?.["uid"];
  if (typeof cookieUid === "string" && cookieUid.length > 0) {
    return cookieUid;
  }
  return DEMO_USER_ID;
}
