import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { ERPNEXT_SERVER_URL } from '../config';
import { login as apiLogin } from '../api/auth';

// The context will now only provide the static state
export const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: false,
  error: null,
  serverUrl: ERPNEXT_SERVER_URL,
  login: () => Promise.resolve(),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(email, password);
      if (response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, serverUrl: ERPNEXT_SERVER_URL, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
