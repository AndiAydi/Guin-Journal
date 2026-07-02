"import React, { createContext, useContext, useEffect, useState, useCallback } from \"react\";
import { http } from \"../lib/api\";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await http.get(\"/auth/me\");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: skip /me when returning from OAuth so AuthCallback can exchange first
    if (typeof window !== \"undefined\" && window.location.hash?.includes(\"session_id=\")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const signOut = async () => {
    try { await http.post(\"/auth/logout\"); } catch {}
    localStorage.removeItem(\"jg_token\");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
"