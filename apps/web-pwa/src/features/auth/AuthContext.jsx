import { useEffect, useMemo, useState } from "react";
import { localAuthService } from "../../services/auth/localAuthService";
import { ensureSeedData } from "../../services/storage/seed";
import { AuthContext } from "./authContextObject";

/**
 * Ask the browser to grant persistent storage for this origin so that
 * IndexedDB data is not evicted under storage pressure.
 * Best-effort: silently ignored if the API is unavailable (older browsers, SSR).
 */
async function requestStoragePersistence() {
  try {
    if (navigator?.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    // Non-blocking — persistence is a best-effort enhancement
  }
}

export function AuthProvider({ children }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function bootstrap() {
      await requestStoragePersistence();
      await ensureSeedData();
      const user = await localAuthService.getCurrentUser();
      setCurrentUser(user);
      setIsBootstrapping(false);
    }

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isBootstrapping,
      isAuthenticated: Boolean(currentUser),
      async login(email, password) {
        const user = await localAuthService.login(email, password);
        setCurrentUser(user);
        return user;
      },
      async logout() {
        await localAuthService.logout();
        setCurrentUser(null);
      },
      async refreshCurrentUser() {
        const user = await localAuthService.getCurrentUser();
        setCurrentUser(user);
        return user;
      },
    }),
    [currentUser, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
