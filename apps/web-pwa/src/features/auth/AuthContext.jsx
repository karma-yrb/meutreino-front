import { useEffect, useMemo, useState } from "react";
import { localAuthService } from "../../services/auth/localAuthService";
import { ensureSeedData } from "../../services/storage/seed";
import { AuthContext } from "./authContextObject";

export function AuthProvider({ children }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function bootstrap() {
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
