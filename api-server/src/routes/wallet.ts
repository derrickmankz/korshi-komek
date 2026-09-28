import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable, walletTransactionsTable } from "@workspace/db";
import { getActorId } from "../lib/currentUser";
import { serializeWalletTx } from "../lib/serializers";

const router: IRouter = Router();

router.get("/wallet", async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, getActorId(req)));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const txs = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.userId, getActorId(req)))
    .orderBy(desc(walletTransactionsTable.createdAt))
    .limit(50);
  res.json({
    balanceTenge: user.walletBalanceTenge,
    heldTenge: user.walletHeldTenge,
    transactions: txs.map(serializeWalletTx),
  });
});

export default router;
