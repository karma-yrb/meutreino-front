import { getUserByEmail, getUserById } from "../storage/repositories/usersRepository";

const SESSION_KEY = "meutreino.session.userId";

export const localAuthService = {
  async login(email, password) {
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return null;
    }
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return getUserById(id);
  },
};

