import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Send, Plus, Trash2 } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { campaignAPI, templateAPI } from '../services/api';
import { CampaignForm, EmailTemplate } from '../types';

const CampaignEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState<CampaignForm>({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    templateId: undefined,
    recipients: []
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newRecipient, setNewRecipient] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    fetchTemplates();
    if (isEdit && id) {
      fetchCampaign();
    }
  }, [id, isEdit]);

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('獲取模板失敗:', err);
    }
  };

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getCampaign(parseInt(id!));
      if (response.success && response.data) {
        const campaign = response.data;
        setFormData({
          name: campaign.name,
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          textContent: campaign.textContent,
          templateId: campaign.templateId,
          recipients: campaign.recipients || []
        });
      }
    } catch (err) {
      setError('獲取活動失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        subject: template.subject || prev.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent || prev.textContent
      }));
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient.email.trim()) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, { ...newRecipient }]
      }));
      setNewRecipient({ email: '', firstName: '', lastName: '' });
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim() || !formData.htmlContent.trim()) {
      setError('活動名稱、主題和內容為必填項目');
      return;
    }

    if (formData.recipients.length === 0) {
      setError('請至少添加一個收件人');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (isEdit && id) {
        // 更新活動邏輯（需要實現）
        navigate('/campaigns');
      } else {
        const response = await campaignAPI.createCampaign(formData);
        if (response.success) {
          navigate('/campaigns');
        } else {
          setError('創建活動失敗');
        }
      }
    } catch (err) {
      setError('保存失敗，請稍後再試');
    } finally {
      setSaving(false);
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
        <div className="flex items-center">
          <button
            onClick={() => navigate('/campaigns')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? '編輯活動' : '創建新活動'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? '修改您的郵件活動' : '創建一個新的郵件活動'}
            </p>
          </div>
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
                活動名稱 *
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="請輸入活動名稱"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="templateId" className="form-label">
                選擇模板
              </label>
              <select
                id="templateId"
                className="form-input"
                value={formData.templateId || ''}
                onChange={(e) => handleTemplateChange(parseInt(e.target.value))}
              >
                <option value="">請選擇模板</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 郵件內容 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">郵件內容</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="form-label">
                郵件主題 *
              </label>
              <input
                type="text"
                id="subject"
                className="form-input"
                placeholder="請輸入郵件主題"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="form-label">HTML 內容 *</label>
              <Editor
                apiKey="your-tinymce-api-key"
                value={formData.htmlContent}
                init={{
                  height: 400,
                  menubar: false,
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
                onEditorChange={(content) => setFormData(prev => ({ ...prev, htmlContent: content }))}
              />
            </div>
          </div>
        </div>

        {/* 收件人列表 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">收件人列表</h2>
          
          {/* 添加收件人 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="email"
              className="form-input"
              placeholder="郵箱地址"
              value={newRecipient.email}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
            />
            <input
              type="text"
              className="form-input"
              placeholder="名字"
              value={newRecipient.firstName}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <input
              type="text"
              className="form-input"
              placeholder="姓氏"
              value={newRecipient.lastName}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, lastName: e.target.value }))}
            />
            <button
              type="button"
              onClick={handleAddRecipient}
              className="btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加
            </button>
          </div>

          {/* 收件人列表 */}
          {formData.recipients.length > 0 ? (
            <div className="space-y-2">
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{recipient.email}</span>
                    {(recipient.firstName || recipient.lastName) && (
                      <span className="text-sm text-gray-500">
                        {recipient.firstName} {recipient.lastName}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">尚未添加收件人</p>
          )}
        </div>

        {/* 保存按鈕 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
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
            {isEdit ? '更新活動' : '創建活動'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignEditor;
