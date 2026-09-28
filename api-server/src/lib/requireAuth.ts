import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const uid = (req.signedCookies as Record<string, unknown> | undefined)?.["uid"];
  if (typeof uid !== "string" || uid.length === 0) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  next();
}
