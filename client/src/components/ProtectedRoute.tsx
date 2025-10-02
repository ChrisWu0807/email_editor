import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🔍 [ProtectedRoute] 當前路徑:', location.pathname);
  console.log('🔍 [ProtectedRoute] 用戶狀態:', user);
  console.log('🔍 [ProtectedRoute] 加載狀態:', loading);

  if (loading) {
    console.log('🔍 [ProtectedRoute] 正在加載，顯示加載動畫');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🔍 [ProtectedRoute] 沒有用戶，重定向到登錄頁面');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🔍 [ProtectedRoute] 用戶已認證，渲染受保護的內容');
  return <>{children}</>;
};

export default ProtectedRoute;
