import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

export const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  error: null,
  login: () => Promise.resolve(),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session expiry in milliseconds (30 minutes)
  const SESSION_EXPIRY_TIME = 30 * 60 * 1000;

  useEffect(() => {
    const loadUserAndServerUrl = async () => {
      const storedUser = await AsyncStorage.getItem('user');

      if (storedUser) {
        const parsedUser: User & { loginTime?: number } = JSON.parse(storedUser);
        if (parsedUser.loginTime && (Date.now() - parsedUser.loginTime > SESSION_EXPIRY_TIME)) {
          console.log('Session expired. Logging out...');
          await logout();
        } else {
          setUser(parsedUser);
        }
      }
      setIsLoading(false);
    };
    loadUserAndServerUrl();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (user && user.loginTime) {
      const timeRemaining = SESSION_EXPIRY_TIME - (Date.now() - user.loginTime);
      if (timeRemaining > 0) {
        timer = setTimeout(() => {
          console.log('Session expired due to inactivity. Logging out...');
          logout();
        }, timeRemaining);
      } else {
        // Session already expired
        console.log('Session already expired on load. Logging out...');
        logout();
      }
    }
    return () => clearTimeout(timer);
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(email, password);
      if (response.data) {
        const loginTime = Date.now();
        const userData = { ...response.data, loginTime };
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
