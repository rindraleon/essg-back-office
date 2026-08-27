import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { login as loginService, verifyToken, logout as logoutService } from '@/services';
import { setAuthToken, clearAuthToken, hasAuthToken } from '@/api';
import type { User } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  username: string;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!hasAuthToken()) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await verifyToken();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginService(email, password);
    setAuthToken(response.accessToken);

    try {
      const userData = await verifyToken();
      if (userData) {
        setUser(userData);
        localStorage.setItem('userRole', userData.role);
      }
    } catch (error) {
      console.error('Error fetching user data after login:', error);
    }

    setIsAuthenticated(true);
  };

  const logout = async () => {
    await logoutService();
    clearAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('userRole');
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  };

  const refreshUser = async () => {
    const fresh = await verifyToken();
    if (fresh) setUser(fresh);
  };

  const username = user?.email || '';
  const isAdmin = user?.role === 'admin';
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      username,
      isAdmin,
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [isAuthenticated, isLoading, user, username, isAdmin],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
