import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/types';
import api from '@/lib/api';
import { mapApiUser, ApiUser } from '@/lib/mappers';

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
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
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        // Convertir fecha de string a Date
        user.createdAt = new Date(user.createdAt);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Ingresa correo y contraseña' };
    }

    const response = await api.post<ApiUser>('/usuarios/login', {
      correo: trimmedEmail,
      password: trimmedPassword
    });

    if (!response.success) {
      return { success: false, error: response.error || 'Credenciales inválidas' };
    }

    if (!response.data) {
      return { success: false, error: 'Error al obtener datos del usuario' };
    }

    // Verificar si el usuario está activo
    if (response.data.activo !== 'Y') {
      return { success: false, error: 'Usuario desactivado. Contacta al administrador' };
    }

    const user = mapApiUser(response.data);
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    
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
