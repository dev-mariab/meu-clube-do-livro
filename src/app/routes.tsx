import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./components/dashboard-layout";
import { HomePage } from "./pages/home-page";
import { LibraryPage } from "./pages/library-page";
import { GoalsPage } from "./pages/goals-page";
import { SettingsPage } from "./pages/settings-page";
import { AuthPage } from "./pages/auth-page";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: AuthPage,
  },
  {
    path: "/",
    Component: () => (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: HomePage },
      { path: "biblioteca", Component: LibraryPage },
      { path: "metas", Component: GoalsPage },
      { path: "configuracoes", Component: SettingsPage },
    ],
  },
]);