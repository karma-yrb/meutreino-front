import { getUserByEmail, getUserById } from "../storage/repositories/usersRepository";
import { verifyPassword } from "./passwordHash";

const SESSION_KEY = "meutreino.session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const localAuthService = {
  async login(email, password) {
    const user = await getUserByEmail(email);
    if (!user) return null;
    const valid = await verifyPassword(password, email, user.password);
    if (!valid) return null;
    const expiresAt = Date.now() + SESSION_TTL_MS;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, expiresAt }));
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    let session;
    try {
      session = JSON.parse(raw);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (!session?.userId || !session?.expiresAt || Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return getUserById(session.userId);
  },
};

