import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmailTemplate } from '../types';
import { templateAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface TemplateContextType {
  templates: EmailTemplate[];
  loading: boolean;
  refreshTemplates: () => Promise<void>;
  getTemplate: (id: number) => EmailTemplate | undefined;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
};

interface TemplateProviderProps {
  children: ReactNode;
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({ children }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshTemplates = async () => {
    console.log('🔍 [TemplateContext] 嘗試獲取模板列表');
    console.log('🔍 [TemplateContext] 用戶狀態:', user);
    
    if (!user) {
      console.log('🔍 [TemplateContext] 用戶未認證，跳過獲取模板');
      return;
    }

    try {
      setLoading(true);
      const response = await templateAPI.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('🔍 [TemplateContext] 獲取模板列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = (id: number): EmailTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  useEffect(() => {
    console.log('🔍 [TemplateContext] useEffect 觸發，用戶狀態:', user);
    if (user) {
      refreshTemplates();
    }
  }, [user]);

  const value: TemplateContextType = {
    templates,
    loading,
    refreshTemplates,
    getTemplate,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};
