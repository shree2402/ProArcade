import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GalleryPage } from "./pages/GalleryPage";
import { useAuth } from "./state/AuthContext";
import { AppShell } from "./components/AppShell";

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading, onboardingRequired } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-arcade-cyan">Loading arcade core...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (onboardingRequired && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="gallery" element={<GalleryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
