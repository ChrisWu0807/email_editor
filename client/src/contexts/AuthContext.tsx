import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginForm, RegisterForm } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginForm) => Promise<boolean>;
  register: (data: RegisterForm) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { username: string; email: string }) => Promise<boolean>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const response = await authAPI.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('認證初始化失敗:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginForm): Promise<boolean> => {
    try {
      const response = await authAPI.login(data);
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('登入失敗:', error);
      return false;
    }
  };

  const register = async (data: RegisterForm): Promise<boolean> => {
    try {
      const response = await authAPI.register(data);
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('註冊失敗:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (data: { username: string; email: string }): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新資料失敗:', error);
      return false;
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<boolean> => {
    try {
      const response = await authAPI.changePassword(data);
      return response.success;
    } catch (error) {
      console.error('修改密碼失敗:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
