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

  const updatedAt = new Date().toISOString();
  const profile = {
    ...(user.profile ?? {}),
    ...(profilePatch ?? {}),
  };
  await db.users.update(userId, { profile, updatedAt });
  return db.users.get(userId);
}

export async function updateUserIdentity(userId, identityPatch) {
  const user = await db.users.get(userId);
  if (!user) return null;

  const updatedAt = new Date().toISOString();
  await db.users.update(userId, { ...(identityPatch ?? {}), updatedAt });
  return db.users.get(userId);
}
