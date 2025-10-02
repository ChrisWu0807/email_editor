import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Copy, Trash2, FileText } from 'lucide-react';
import { templateAPI } from '../services/api';
import { EmailTemplate } from '../types';

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      setError('獲取模板列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('確定要刪除這個模板嗎？')) {
      try {
        const response = await templateAPI.deleteTemplate(id);
        if (response.success) {
          setTemplates(templates.filter(t => t.id !== id));
        }
      } catch (err) {
        setError('刪除模板失敗');
      }
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const response = await templateAPI.duplicateTemplate(template.id, `${template.name} (副本)`);
      if (response.success && response.data) {
        setTemplates([...templates, response.data]);
      }
    } catch (err) {
      setError('複製模板失敗');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模板管理</h1>
          <p className="text-gray-600">創建和管理您的郵件模板</p>
        </div>
        <Link
          to="/templates/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          創建新模板
        </Link>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* 模板列表 */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有模板</h3>
          <p className="mt-1 text-sm text-gray-500">開始創建您的第一個郵件模板</p>
          <div className="mt-6">
            <Link
              to="/templates/new"
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              創建模板
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  {template.subject && (
                    <p className="mt-1 text-sm text-gray-600">{template.subject}</p>
                  )}
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? '啟用' : '停用'}
                    </span>
                    <span className="ml-2">
                      創建於 {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 模板預覽 */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="text-sm text-gray-700 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: template.htmlContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                  }}
                />
              </div>

              {/* 操作按鈕 */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-2">
                  <Link
                    to={`/templates/${template.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    編輯
                  </Link>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    複製
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
