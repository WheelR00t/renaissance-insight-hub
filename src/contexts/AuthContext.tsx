import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { User, AuthContextType, RegisterData, GuestData } from '@/types';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.me();
          setUser(response.user);
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      toast.success('Connexion réussie !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      toast.success('Compte créé avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
      throw error;
    }
  };

  const loginAsGuest = async (guestData: GuestData) => {
    try {
      const response = await authAPI.guest(guestData);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      toast.success('Session invité créée !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de la session invité');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    toast.success('Déconnexion réussie');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    loginAsGuest,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};