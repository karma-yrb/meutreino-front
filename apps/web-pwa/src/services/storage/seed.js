import { buildDefaultTemplate } from "../../data/defaultTemplate";
import { db } from "./db";
import { hashPassword } from "../auth/passwordHash";

// Bump this version whenever the seed content changes.
// Devices with real user data (sessions) will only receive a "soft" re-seed
// (system accounts + templates refreshed, user sessions/plans/weight untouched).
const SEED_VERSION = "9";

function createUserPlanFromTemplate(userId, template) {
  return {
    id: `plan-${userId}-${template.monthLabel}`,
    userId,
    sourceTemplateId: template.id,
    version: `${template.monthLabel}-v1`,
    isActive: 1,
    days: JSON.parse(JSON.stringify(template.days)),
    updatedBy: "system",
    updatedAt: new Date().toISOString(),
  };
}

async function buildSystemUsers(now) {
  const [adminHash, coachHash, userHash] = await Promise.all([
    hashPassword("admin123", "admin@local"),
    hashPassword("coach123", "coach@local"),
    hashPassword("user123", "user@local"),
  ]);
  return [
    {
      id: "admin-1",
      email: "admin@local",
      password: adminHash,
      role: "admin",
      firstName: "Admin",
      lastName: "Principal",
      coachId: null,
      assignedUserIds: [],
      profile: { sex: "n/a", birthYear: 1980, weightKg: 0, heightCm: 0 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "coach-1",
      email: "coach@local",
      password: coachHash,
      role: "coach",
      firstName: "Coach",
      lastName: "Equipe A",
      coachId: null,
      assignedUserIds: ["user-1"],
      profile: { sex: "n/a", birthYear: 1990, weightKg: 0, heightCm: 0 },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-1",
      email: "user@local",
      password: userHash,
      role: "user",
      firstName: "Client",
      lastName: "Démo",
      coachId: "coach-1",
      assignedUserIds: [],
      profile: { sex: "m", birthYear: 1998, weightKg: 78, heightCm: 179 },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export async function ensureSeedData() {
  const seedMeta = await db.appMeta.get("seedVersion");
  if (seedMeta?.value === SEED_VERSION) return;

  const now = new Date().toISOString();
  const users = await buildSystemUsers(now);
  const template = { ...buildDefaultTemplate(), createdAt: now, updatedAt: now };

  const sessionCount = await db.sessions.count();
  const weightCount = await db.weightHistory.count();
  const hasUserActivity = sessionCount > 0 || weightCount > 0;

  if (hasUserActivity) {
    // Device already has real user activity — soft seed only.
    // Only update the password hash on existing accounts; all other fields
    // (profile, firstName, lastName, assignedUserIds, etc.) are preserved.
    // New system accounts from seedUsers that don't exist yet are inserted.
    await db.transaction("rw", db.users, db.templates, db.appMeta, async () => {
      for (const seedUser of users) {
        const existing = await db.users.get(seedUser.id);
        if (existing) {
          // Preserve every field — only refresh the hashed password
          await db.users.put({ ...existing, password: seedUser.password });
        } else {
          await db.users.put(seedUser);
        }
      }
      await db.templates.put(template);
      await db.appMeta.put({ key: "seedVersion", value: SEED_VERSION });
    });
  } else {
    // Fresh device — full seed.
    await db.transaction("rw", db.users, db.templates, db.userPlans, db.sessions, db.appMeta, async () => {
      await db.users.clear();
      await db.templates.clear();
      await db.userPlans.clear();
      await db.sessions.clear();

      await db.users.bulkPut(users);
      await db.templates.put(template);
      const userPlan = createUserPlanFromTemplate("user-1", template);
      await db.userPlans.put(userPlan);
      await db.appMeta.put({ key: "seedVersion", value: SEED_VERSION });
    });
  }
}
