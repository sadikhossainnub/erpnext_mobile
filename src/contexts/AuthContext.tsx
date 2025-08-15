import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { ERPNEXT_SERVER_URL } from '../config';
import { login as apiLogin, get_user_roles } from '../api/auth';

export const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  error: null,
  serverUrl: ERPNEXT_SERVER_URL,
  login: () => Promise.resolve(),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      if (user && user.roles.length === 0) {
        const rolesResponse = await get_user_roles();
        if (rolesResponse.data) {
          const updatedUser = { ...user, roles: rolesResponse.data };
          setUser(updatedUser);
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          setError(rolesResponse.error || 'Failed to fetch user roles');
        }
      }
    };
    fetchRoles();
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(email, password);
      if (response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
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
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, serverUrl: ERPNEXT_SERVER_URL, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
