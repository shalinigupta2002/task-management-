import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!token,
      role: user?.role || null,
      isSuperAdmin: user?.role === "SUPER_ADMIN",
      isAdmin: user?.role === "MAIN_ADMIN",
      isSubAdmin: user?.role === "SUB_ADMIN",
      isEmployee: user?.role === "EMPLOYEE",
    }),
    [token, user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}