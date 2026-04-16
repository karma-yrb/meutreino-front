import Dexie from "dexie";

export const db = new Dexie("meutreino");

db.version(1).stores({
  users: "id, email, role, coachId",
  templates: "id, monthLabel, createdByAdminId",
  userPlans: "id, userId, isActive, version, sourceTemplateId",
  sessions: "id, userId, status, startedAt, dayId",
  appMeta: "key",
});

db.version(2).stores({
  users: "id, email, role, coachId",
  templates: "id, monthLabel, createdByAdminId",
  userPlans: "id, [userId+isActive], userId, isActive, version, sourceTemplateId",
  sessions: "id, userId, status, startedAt, dayId",
  appMeta: "key",
});

db.version(3).stores({
  users: "id, email, role, coachId",
  templates: "id, monthLabel, createdByAdminId",
  userPlans: "id, [userId+isActive], userId, isActive, version, sourceTemplateId",
  sessions: "id, userId, [userId+dayId], status, startedAt, dayId",
  appMeta: "key",
});

db.version(4).stores({
  users: "id, email, role, coachId",
  templates: "id, monthLabel, createdByAdminId",
  userPlans: "id, [userId+isActive], userId, isActive, version, sourceTemplateId",
  sessions: "id, userId, [userId+dayId], status, startedAt, dayId",
  weightHistory: "++id, userId, recordedAt",
  appMeta: "key",
});
