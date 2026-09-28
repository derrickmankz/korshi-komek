import { TaskCategory, TaskStatus, WalletTransactionKind } from "@workspace/api-client-react";

export const categoryLabels: Record<TaskCategory, string> = {
  [TaskCategory.walk_dog]: "Выгулять собаку",
  [TaskCategory.groceries]: "Купить продукты",
  [TaskCategory.parcel_pickup]: "Забрать посылку",
  [TaskCategory.plant_care]: "Полить цветы",
  [TaskCategory.pet_sitting]: "Присмотреть за питомцем",
  [TaskCategory.errand]: "Мелкое поручение",
  [TaskCategory.cleaning_help]: "Помочь с уборкой",
  [TaskCategory.other]: "Другое",
};

export const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.open]: "Открыто",
  [TaskStatus.in_progress]: "В работе",
  [TaskStatus.awaiting_payment]: "Ожидает оплаты",
  [TaskStatus.completed]: "Выполнено",
  [TaskStatus.cancelled]: "Отменено",
};

export const txKindLabels: Record<WalletTransactionKind, string> = {
  [WalletTransactionKind.deposit]: "Пополнение",
  [WalletTransactionKind.hold]: "Заморозка",
  [WalletTransactionKind.release]: "Выплата по сделке",
  [WalletTransactionKind.refund]: "Возврат",
  [WalletTransactionKind.commission]: "Комиссия",
  [WalletTransactionKind.payout]: "Получено",
};

export function formatTenge(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₸";
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }
  return `${(meters / 1000).toFixed(1)} км`;
}
