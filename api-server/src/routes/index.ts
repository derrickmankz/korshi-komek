import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import tasksRouter from "./tasks";
import offersRouter from "./offers";
import reviewsRouter from "./reviews";
import walletRouter from "./wallet";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import { requireAuth } from "../lib/requireAuth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(usersRouter);
router.use(tasksRouter);
router.use(offersRouter);
router.use(reviewsRouter);
router.use(walletRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(messagesRouter);
router.use(notificationsRouter);

export default router;
