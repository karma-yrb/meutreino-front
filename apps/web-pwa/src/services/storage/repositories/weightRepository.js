import { db } from "../db";

const MAX_WEIGHT_KG = 500;

export async function addWeightRecord(userId, weightKg) {
  if (!userId || !weightKg || weightKg <= 0 || weightKg > MAX_WEIGHT_KG) return null;
  const record = {
    userId,
    weightKg,
    recordedAt: new Date().toISOString(),
  };
  await db.weightHistory.add(record);
  return record;
}

export async function upsertWeightForToday(userId, weightKg) {
  if (!userId || !weightKg || weightKg <= 0 || weightKg > MAX_WEIGHT_KG) return null;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const existing = await db.weightHistory
    .where("userId")
    .equals(userId)
    .filter((r) => {
      const d = new Date(r.recordedAt);
      return d >= todayStart && d <= todayEnd;
    })
    .first();

  if (existing) {
    await db.weightHistory.update(existing.id, { weightKg });
    return { ...existing, weightKg };
  }

  const record = { userId, weightKg, recordedAt: new Date().toISOString() };
  const id = await db.weightHistory.add(record);
  return { ...record, id };
}

export async function deleteWeightRecord(id) {
  await db.weightHistory.delete(id);
}

export async function listWeightHistory(userId) {
  const records = await db.weightHistory
    .where("userId")
    .equals(userId)
    .sortBy("recordedAt");
  return records;
}
