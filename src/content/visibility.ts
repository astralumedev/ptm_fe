export interface Schedulable {
  hidden?: boolean;
  showFrom?: string; // YYYY-MM-DD
  hideAfter?: string; // YYYY-MM-DD, inclusive
}

/** Nepal time, so a promo ending "Sep 30" stays up until midnight in Pokhara. */
function todayInNepal(now = new Date()) {
  const npt = new Date(now.getTime() + (5 * 60 + 45) * 60_000);
  return npt.toISOString().slice(0, 10);
}

/** True when an item should be on the site right now (not hidden, inside its date window). */
export function isLive(item: Schedulable | null | undefined, now = new Date()) {
  if (!item || item.hidden) return false;
  const today = todayInNepal(now);
  if (item.showFrom && today < item.showFrom.slice(0, 10)) return false;
  if (item.hideAfter && today > item.hideAfter.slice(0, 10)) return false;
  return true;
}

export function liveOnly<T extends Schedulable>(items: T[] | null | undefined): T[] {
  return (items || []).filter((i) => isLive(i));
}
