import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SkyLoader } from "./Sky";
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  if (loading)
    return <SkyLoader label="Restoring your session" />;
  if (error)
    return (
      <main id="main" className="placeholder" role="alert">
        {error}
      </main>
    );
  return user ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}
