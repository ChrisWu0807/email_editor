import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmailTemplate } from '../types';
import { templateAPI } from '../services/api';

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
  const [loading, setLoading] = useState(true);

  const refreshTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('獲取模板列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = (id: number): EmailTemplate | undefined => {
    return templates.find(template => template.id === id);
  };

  useEffect(() => {
    refreshTemplates();
  }, []);

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
