import { db } from "../db";

export async function listSessionsForUser(userId) {
  const sessions = await db.sessions.where("userId").equals(userId).sortBy("startedAt");
  return sessions.reverse();
}

export async function saveSessionRun(sessionRun) {
  await db.sessions.put(sessionRun);
  return sessionRun;
}
