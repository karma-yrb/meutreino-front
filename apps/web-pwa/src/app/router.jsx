import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ProtectedRoute, RoleRoute } from "../components/ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { DayPage } from "../pages/DayPage";
import { SessionRunPage } from "../pages/SessionRunPage";
import { WeekPage } from "../pages/WeekPage";
import { ProfilePage } from "../pages/ProfilePage";
import { AdminTemplatesPage } from "../pages/AdminTemplatesPage";
import { CoachUsersPage } from "../pages/CoachUsersPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRouter() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const basename = base && base !== "/" ? base : undefined;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="jour/:dayId" element={<DayPage />} />
          <Route path="session/:dayId" element={<SessionRunPage />} />
          <Route path="semaine" element={<WeekPage />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route
            path="admin/templates"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminTemplatesPage />
              </RoleRoute>
            }
          />
          <Route
            path="coach/users"
            element={
              <RoleRoute allowedRoles={["coach"]}>
                <CoachUsersPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
