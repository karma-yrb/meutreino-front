import { db } from "../db";

export async function addWeightRecord(userId, weightKg) {
  if (!userId || !weightKg || weightKg <= 0) return null;
  const record = {
    userId,
    weightKg,
    recordedAt: new Date().toISOString(),
  };
  await db.weightHistory.add(record);
  return record;
}

export async function listWeightHistory(userId) {
  const records = await db.weightHistory
    .where("userId")
    .equals(userId)
    .sortBy("recordedAt");
  return records;
}
