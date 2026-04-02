import { buildDefaultTemplate } from "../../data/defaultTemplate";
import { db } from "./db";

const SEED_VERSION = "2";

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

export async function ensureSeedData() {
  const seedMeta = await db.appMeta.get("seedVersion");
  if (seedMeta?.value === SEED_VERSION) {
    return;
  }

  await db.transaction("rw", db.users, db.templates, db.userPlans, db.sessions, db.appMeta, async () => {
    await db.users.clear();
    await db.templates.clear();
    await db.userPlans.clear();
    await db.sessions.clear();

    const now = new Date().toISOString();
    const users = [
      {
        id: "admin-1",
        email: "admin@local",
        password: "admin123",
        role: "admin",
        firstName: "Admin",
        lastName: "Principal",
        coachId: null,
        assignedUserIds: [],
        profile: {
          sex: "n/a",
          birthYear: 1980,
          weightKg: 0,
          heightCm: 0,
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "coach-1",
        email: "coach@local",
        password: "coach123",
        role: "coach",
        firstName: "Coach",
        lastName: "Equipe A",
        coachId: null,
        assignedUserIds: ["user-1"],
        profile: {
          sex: "n/a",
          birthYear: 1990,
          weightKg: 0,
          heightCm: 0,
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-1",
        email: "user@local",
        password: "user123",
        role: "user",
        firstName: "Client",
        lastName: "Demo",
        coachId: "coach-1",
        assignedUserIds: [],
        profile: {
          sex: "m",
          birthYear: 1998,
          weightKg: 78,
          heightCm: 179,
        },
        createdAt: now,
        updatedAt: now,
      },
    ];
    await db.users.bulkPut(users);

    const template = {
      ...buildDefaultTemplate(),
      createdAt: now,
      updatedAt: now,
    };
    await db.templates.put(template);

    const userPlan = createUserPlanFromTemplate("user-1", template);
    await db.userPlans.put(userPlan);

    await db.appMeta.put({ key: "seedVersion", value: SEED_VERSION });
  });
}

