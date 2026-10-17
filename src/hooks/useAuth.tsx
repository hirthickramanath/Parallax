import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(
    () =>
      onAuthStateChanged(
        auth,
        (value) => {
          setUser(value);
          setLoading(false);
          setError(null);
        },
        () => {
          setLoading(false);
          setError(
            "Your session could not be restored. Please reload and try again.",
          );
        },
      ),
    [],
  );
  return (
    <AuthContext.Provider
      value={{ user, loading, error, logout: () => signOut(auth) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth requires AuthProvider");
  return state;
}
