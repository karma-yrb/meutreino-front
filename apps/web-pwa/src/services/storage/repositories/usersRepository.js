import { db } from "../db";

export async function getUserByEmail(email) {
  return db.users.where("email").equalsIgnoreCase(email).first();
}

export async function getUserById(id) {
  return db.users.get(id);
}

export async function listUsers() {
  return db.users.toArray();
}

export async function listUsersByCoach(coachId) {
  return db.users.where("coachId").equals(coachId).toArray();
}

export async function updateUserProfile(userId, profilePatch) {
  const user = await db.users.get(userId);
  if (!user) return null;

  const updated = {
    ...user,
    profile: {
      ...user.profile,
      ...profilePatch,
    },
    updatedAt: new Date().toISOString(),
  };
  await db.users.put(updated);
  return updated;
}

export async function updateUserIdentity(userId, identityPatch) {
  const user = await db.users.get(userId);
  if (!user) return null;

  const updated = {
    ...user,
    ...identityPatch,
    updatedAt: new Date().toISOString(),
  };
  await db.users.put(updated);
  return updated;
}
