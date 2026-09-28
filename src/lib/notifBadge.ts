export const NOTIF_LAST_SEEN_KEY = "notif_last_seen_at";

export function countUnseen(events: { createdAt: string }[]): number {
  const raw = localStorage.getItem(NOTIF_LAST_SEEN_KEY);
  if (!raw) return events.length;
  const lastSeen = new Date(raw).getTime();
  return events.filter((e) => new Date(e.createdAt).getTime() > lastSeen).length;
}
