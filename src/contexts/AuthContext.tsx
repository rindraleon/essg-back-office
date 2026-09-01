/* eslint-disable react-refresh/only-export-components -- fichier unique
   volontaire : le contexte, le hook `useAuth` et le provider vivent ensemble
   (demande explicite de l'équipe). Fast Refresh reste fonctionnel, il
   recharge simplement le fichier entier lors d'une modification. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { login as loginService, verifyToken } from '@/services';
import { logoutCurrentSession } from '@/services/session.service';
import { setAuthToken, clearAuthToken, hasAuthToken } from '@/api';
import type { User } from '@/types';

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

function useAuthController(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback((verified: User | null) => {
    setUser(verified);
    setIsAuthenticated(verified !== null);
  }, []);

  const resetUser = useCallback(() => {
    applyUser(null);
  }, [applyUser]);

  useEffect(() => {
    let cancelled = false;
    const initAuth = async () => {
      // Pas de jeton en cookie : état déconnecté, aucune requête nécessaire.
      if (!hasAuthToken()) {
        if (!cancelled) {
          resetUser();
          setIsLoading(false);
        }
        return;
      }
      const verified = await verifyToken();
      if (!cancelled) {
        applyUser(verified);
        setIsLoading(false);
      }
    };
    void initAuth();
    return () => {
      cancelled = true;
    };
  }, [applyUser, resetUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginService(email, password);
      setAuthToken(response.accessToken);
      const verified = await verifyToken();
      applyUser(verified);
    },
    [applyUser]
  );

  const logout = useCallback(async () => {
    try {
      // Révocation côté serveur de la session courante (Spec §9) : les autres
      // appareils du compte restent connectés.
      await logoutCurrentSession();
    } catch {
      // Session déjà expirée ou révoquée : la déconnexion locale reste valide.
    } finally {
      clearAuthToken();
      resetUser();
    }
  }, [resetUser]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await verifyToken();
    if (fresh) applyUser(fresh);
  }, [applyUser]);

  return useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      username: user?.email ?? '',
      isAdmin: user?.role === 'admin',
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [isAuthenticated, isLoading, user, login, logout, updateUser, refreshUser]
  );
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useAuthController();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
