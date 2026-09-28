import type {
  ActivityRow,
  OfferRow,
  ReviewRow,
  TaskRow,
  User,
  WalletTransactionRow,
} from "@workspace/db";
import { COMMISSION_PERCENT } from "./currentUser";

export function serializeUser(u: User) {
  const rating =
    u.reviewCount > 0
      ? Math.round((u.ratingSum / u.reviewCount) * 10) / 10
      : 0;
  return {
    id: u.id,
    name: u.name,
    username: u.username ?? null,
    email: u.email ?? null,
    phone: u.phone ?? null,
    addressLine: u.addressLine ?? null,
    avatarUrl: u.avatarUrl ?? null,
    bio: u.bio ?? null,
    rating,
    reviewCount: u.reviewCount,
    completedJobs: u.completedJobs,
    city: u.city ?? null,
    district: u.district ?? null,
    isAdmin: u.isAdmin,
    joinedAt: u.joinedAt.toISOString(),
    walletBalanceTenge: u.walletBalanceTenge,
  };
}

export function serializeTask(
  t: TaskRow,
  owner: User,
  executor: User | null,
  offerCount: number,
) {
  const paymentPhone =
    t.status === "awaiting_payment" && executor?.phone ? executor.phone : null;
  const paymentAmount =
    t.status === "awaiting_payment"
      ? (t.escrowAmountTenge ?? t.priceTenge)
      : null;

  return {
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    status: t.status,
    awaitingReview: t.awaitingReview,
    priceTenge: t.priceTenge,
    useEscrow: t.useEscrow,
    address: t.address,
    distanceMeters: t.distanceMeters,
    latitude: t.latitude,
    longitude: t.longitude,
    deadline: t.deadline ? t.deadline.toISOString() : null,
    owner: serializeUser(owner),
    executor: executor ? serializeUser(executor) : null,
    offerCount,
    createdAt: t.createdAt.toISOString(),
    paymentPhone,
    paymentAmount,
  };
}

export function serializeOffer(o: OfferRow, executor: User) {
  return {
    id: o.id,
    taskId: o.taskId,
    executor: serializeUser(executor),
    priceTenge: o.priceTenge,
    message: o.message,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  };
}

export function serializeReview(r: ReviewRow, fromUser: User, toUser: User) {
  return {
    id: r.id,
    taskId: r.taskId,
    fromUser: serializeUser(fromUser),
    toUser: serializeUser(toUser),
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  };
}

export function serializeWalletTx(t: WalletTransactionRow) {
  return {
    id: t.id,
    kind: t.kind,
    amountTenge: t.amountTenge,
    taskId: t.taskId ?? null,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  };
}

export function serializeActivity(a: ActivityRow) {
  return {
    id: a.id,
    kind: a.kind,
    message: a.message,
    taskId: a.taskId ?? null,
    userName: a.userName ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

export function serializeEscrow(t: TaskRow) {
  return {
    active: t.useEscrow,
    amountTenge: t.escrowAmountTenge ?? null,
    commissionTenge: t.escrowCommissionTenge ?? null,
    commissionPercent: COMMISSION_PERCENT,
    payoutTenge: t.escrowPayoutTenge ?? null,
    status: t.escrowStatus ?? "none",
  };
}
