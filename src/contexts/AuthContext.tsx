import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AuthService, User, LoginResponse } from "../services/authService";

const AUTH_KEY = "auth_token";
const USER_KEY = "auth_user";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessSection: (section: string) => boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (savedToken && savedUser) {
      try {
        // Validate token is still valid
        if (AuthService.isTokenValid(savedToken)) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          // Token expired, clear storage
          localStorage.removeItem(AUTH_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (error) {
        console.error('Error loading saved auth data:', error);
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: Boolean(token && user),
    user,
    isLoading,
    login: async (username: string, password: string): Promise<LoginResponse> => {
      setIsLoading(true);
      try {
        const response = await AuthService.login(username, password);
        
        if (response.success && response.data) {
          console.log('🔐 [AUTH] Setting user and token:', response.data.user);
          setToken(response.data.token);
          setUser(response.data.user);
          localStorage.setItem(AUTH_KEY, response.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
          console.log('🔐 [AUTH] Authentication state should now be true');
        }
        
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    logout: () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
    },
    hasPermission: (permission: string) => {
      if (!user) return false;
      return AuthService.hasPermission(user.permissions, permission);
    },
    canAccessSection: (section: string) => {
      if (!user) return false;
      return AuthService.canAccessSection(user.permissions, section);
    }
  }), [token, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
