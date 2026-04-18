function getCurrentISOWeekKey() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `weekly-weight-dismissed-${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function isDismissedThisWeek() {
  try {
    return localStorage.getItem(getCurrentISOWeekKey()) === "1";
  } catch {
    return false;
  }
}

export function dismissThisWeek() {
  try {
    localStorage.setItem(getCurrentISOWeekKey(), "1");
  } catch {
    // ignore
  }
}
