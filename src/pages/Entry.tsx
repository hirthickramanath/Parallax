import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home } from './Home';
export function Entry() {
  const { user, loading, error } = useAuth();
  // Wait for Firebase to restore the session before deciding which home to show.
  if (loading) return <main id="main" className="placeholder" role="status">Opening your observatory…</main>;
  if (error) return <main id="main" className="placeholder" role="alert">{error}</main>;
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
}
