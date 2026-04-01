import { db } from "../db";

export async function getActivePlanForUser(userId) {
  return db.userPlans.where({ userId, isActive: 1 }).first();
}

export async function getDayPlanForUser(userId, dayId) {
  const plan = await getActivePlanForUser(userId);
  if (!plan) return null;
  const day = plan.days.find((entry) => entry.id === dayId);
  return day ?? null;
}

export async function updateUserPlanDay(userId, dayId, updater) {
  const plan = await getActivePlanForUser(userId);
  if (!plan) return null;

  const nextDays = plan.days.map((day) => {
    if (day.id !== dayId) return day;
    return updater(day);
  });

  const updated = {
    ...plan,
    days: nextDays,
    updatedBy: "user",
    updatedAt: new Date().toISOString(),
  };

  await db.userPlans.put(updated);
  return updated;
}

export async function listTemplates() {
  return db.templates.toArray();
}

export async function saveTemplate(template) {
  const now = new Date().toISOString();
  const existing = await db.templates.get(template.id);
  const payload = {
    ...template,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.templates.put(payload);
  return payload;
}

