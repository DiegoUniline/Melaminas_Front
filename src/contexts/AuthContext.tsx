import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'carpinteria_auth_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario de localStorage al iniciar
  useEffect(() => {
    const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUserId) {
      const user = mockUsers.find(u => u.id === storedUserId && u.isActive);
      if (user) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): LoginResult => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Ingresa correo y contraseña' };
    }

    const user = mockUsers.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
    );

    if (!user) {
      return { success: false, error: 'Correo o contraseña incorrectos' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Usuario desactivado. Contacta al administrador' };
    }

    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated: !!currentUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
