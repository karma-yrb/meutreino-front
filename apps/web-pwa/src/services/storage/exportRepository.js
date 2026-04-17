import { db } from "./db";

/**
 * Collect all user-owned data from IndexedDB for a given userId.
 * Returns a serialisable object suitable for JSON export.
 */
export async function exportUserData(userId) {
  const [userPlans, sessions, weightHistory] = await Promise.all([
    db.userPlans.where("userId").equals(userId).toArray(),
    db.sessions.where("userId").equals(userId).toArray(),
    db.weightHistory.where("userId").equals(userId).toArray(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    userId,
    userPlans,
    sessions,
    weightHistory,
  };
}

/**
 * Trigger a browser download of a JSON file.
 * Safe for use in click handlers — no async needed.
 */
export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
