import { db } from "../db";

// A "running" session is stale after 24 h (e.g. phone died mid-workout).
// A "paused" session has no TTL — the user explicitly paused, it stays resumable
// until they complete or stop it.
const RUNNING_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function listSessionsForUser(userId) {
  const sessions = await db.sessions.where("userId").equals(userId).sortBy("startedAt");
  return sessions.reverse();
}

export async function saveSessionRun(sessionRun) {
  await db.sessions.put(sessionRun);
  return sessionRun;
}

/**
 * Find a resumable session (running or paused) for a given user+day
 * that was started less than 2 hours ago.
 * Returns null when no valid in-progress session exists.
 */
export async function getLastCompletedSessionForDay(userId, dayId) {
  const candidates = await db.sessions
    .where("userId")
    .equals(userId)
    .filter((s) => s.dayId === dayId)
    .toArray();

  const completed = candidates
    .filter((s) => s.status === "completed" || s.status === "stopped")
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return completed[0] ?? null;
}

/**
 * Returns a plain object mapping dayId → most-relevant session for the current week.
 * Priority order: running/paused > completed/stopped (most recent wins within a tier).
 * @param {string} userId
 * @param {number} sinceMs  - epoch ms for the start of the window (e.g. Monday 00:00)
 */
export async function getWeekSessionStatusMap(userId, sinceMs) {
  const sessions = await db.sessions
    .where("userId")
    .equals(userId)
    .filter((s) => new Date(s.startedAt).getTime() >= sinceMs)
    .toArray();

  const map = new Map();
  for (const s of sessions) {
    const existing = map.get(s.dayId);
    const isActive = s.status === "running" || s.status === "paused";
    const existingIsActive =
      existing && (existing.status === "running" || existing.status === "paused");

    if (!existing) {
      map.set(s.dayId, s);
    } else if (isActive && !existingIsActive) {
      // Active session always wins over a finished one
      map.set(s.dayId, s);
    } else if (!isActive && !existingIsActive) {
      // Both finished — keep most recent
      if (new Date(s.startedAt) > new Date(existing.startedAt)) {
        map.set(s.dayId, s);
      }
    }
  }
  return Object.fromEntries(map);
}

export async function getActiveSessionForDay(userId, dayId, nowMs = Date.now()) {
  const candidates = await db.sessions
    .where("[userId+dayId]")
    .equals([userId, dayId])
    .toArray();

  const active = candidates
    .filter((s) => {
      if (s.status === "paused") return true; // paused: no TTL
      if (s.status === "running") {
        const startMs = new Date(s.startedAt).getTime();
        return nowMs - startMs < RUNNING_SESSION_TTL_MS;
      }
      return false;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return active[0] ?? null;
}

/**
 * Returns all resumable in-progress sessions for a user across all days,
 * most recent first.
 * - paused: no TTL
 * - running: within 24 h
 * Used to offer a "reprendre" CTA after login.
 */
export async function getResumableSessionsForUser(userId, nowMs = Date.now()) {
  const all = await db.sessions.where("userId").equals(userId).toArray();
  return all
    .filter((s) => {
      if (s.status === "paused") return true;
      if (s.status === "running") {
        return nowMs - new Date(s.startedAt).getTime() < RUNNING_SESSION_TTL_MS;
      }
      return false;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}
