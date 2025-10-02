import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { templateAPI } from '../services/api';
import { EmailTemplate, TemplateForm } from '../types';

const TemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState<TemplateForm>({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchTemplate();
    }
  }, [id, isEdit]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await templateAPI.getTemplate(parseInt(id!));
      if (response.success && response.data) {
        const template = response.data;
        setFormData({
          name: template.name,
          subject: template.subject || '',
          htmlContent: template.htmlContent,
          textContent: template.textContent || ''
        });
      }
    } catch (err) {
      setError('獲取模板失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.htmlContent.trim()) {
      setError('模板名稱和內容為必填項目');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (isEdit && id) {
        const response = await templateAPI.updateTemplate(parseInt(id), formData);
        if (response.success) {
          navigate('/templates');
        } else {
          setError('更新模板失敗');
        }
      } else {
        const response = await templateAPI.createTemplate(formData);
        if (response.success) {
          navigate('/templates');
        } else {
          setError('創建模板失敗');
        }
      }
    } catch (err) {
      setError('保存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof TemplateForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <div className="flex items-center">
          <button
            onClick={() => navigate('/templates')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? '編輯模板' : '創建新模板'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? '修改您的郵件模板' : '設計一個新的郵件模板'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-secondary flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? '編輯' : '預覽'}
          </button>
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="form-label">
                模板名稱 *
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="請輸入模板名稱"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="form-label">
                郵件主題
              </label>
              <input
                type="text"
                id="subject"
                className="form-input"
                placeholder="請輸入郵件主題"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 郵件內容 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">郵件內容</h2>
          
          {previewMode ? (
            <div className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{formData.subject || '郵件主題'}</h3>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.htmlContent || '<p class="text-gray-500">預覽內容將在這裡顯示...</p>' }}
              />
            </div>
          ) : (
            <div>
              <label className="form-label">HTML 內容 *</label>
              <Editor
                apiKey="no-api-key"
                value={formData.htmlContent}
                init={{
                  height: 500,
                  menubar: false,
                  // 離線模式配置
                  license_key: 'gpl',
                  promotion: false,
                  branding: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
                }}
                onEditorChange={(content) => handleChange('htmlContent', content)}
              />
              
              <div className="mt-4">
                <label htmlFor="textContent" className="form-label">
                  純文本內容
                </label>
                <textarea
                  id="textContent"
                  rows={6}
                  className="form-input"
                  placeholder="請輸入純文本內容（可選）"
                  value={formData.textContent}
                  onChange={(e) => handleChange('textContent', e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500">
                  純文本版本將發送給不支持 HTML 的郵件客戶端
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 保存按鈕 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEdit ? '更新模板' : '創建模板'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEditor;
