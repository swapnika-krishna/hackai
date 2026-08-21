import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrId: string, password: string, selectedRole?: 'student' | 'admin') => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    department: string;
    year: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'civicmind_token';
const USER_KEY = 'civicmind_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY) || localStorage.getItem('civicresolve_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('civicresolve_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Validate existing token
    const verifyUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to verify user session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (emailOrId: string, password: string, selectedRole?: 'student' | 'admin') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrId, password, selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error. Please retry.' };
    }
  };

  const register = async (userData: {
    name: string;
    studentId: string;
    email: string;
    phone: string;
    department: string;
    year: string;
    password: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
