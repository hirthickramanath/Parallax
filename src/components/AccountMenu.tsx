import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function AccountMenu() {
  const { user, loading, logout } = useAuth(); const [error, setError] = useState(false);
  if (loading) return null;
  if (!user) return <Link to="/login" className="account-link">Sign in</Link>;
  return <div className="account-menu"><span className="account-name">{user.displayName || user.email || 'Learner'}</span><button className="text-button" onClick={() => { setError(false); void logout().catch(() => setError(true)); }}>Sign out</button>{error && <span role="alert">Could not sign out. Try again.</span>}</div>;
}
