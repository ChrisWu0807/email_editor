import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye } from 'lucide-react';
import { campaignAPI } from '../services/api';
import { Campaign } from '../types';

const CampaignPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getCampaign(parseInt(id!));
      if (response.success && response.data) {
        setCampaign(response.data);
      }
    } catch (err) {
      setError('獲取活動失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setError('請輸入測試郵箱地址');
      return;
    }

    try {
      setSending(true);
      setError('');
      const response = await campaignAPI.previewCampaign(parseInt(id!), testEmail);
      if (response.success) {
        alert('測試郵件發送成功！');
        setTestEmail('');
      } else {
        setError('測試郵件發送失敗');
      }
    } catch (err) {
      setError('測試郵件發送失敗');
    } finally {
      setSending(false);
    }
  };

  const handleSendCampaign = async () => {
    if (window.confirm('確定要發送這個活動嗎？發送後無法撤回。')) {
      try {
        setSending(true);
        setError('');
        const response = await campaignAPI.sendCampaign(parseInt(id!));
        if (response.success) {
          alert('活動發送成功！');
          navigate('/campaigns');
        } else {
          setError('活動發送失敗');
        }
      } catch (err) {
        setError('活動發送失敗');
      } finally {
        setSending(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">活動不存在</h3>
        <p className="mt-1 text-sm text-gray-500">請檢查活動ID是否正確</p>
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
            <h1 className="text-2xl font-bold text-gray-900">活動預覽</h1>
            <p className="text-gray-600">預覽和發送您的郵件活動</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/campaigns/${id}/edit`)}
            className="btn-secondary"
          >
            編輯活動
          </button>
          {campaign.status === 'draft' && (
            <button
              onClick={handleSendCampaign}
              disabled={sending}
              className="btn-primary flex items-center"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              發送活動
            </button>
          )}
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* 活動信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 活動詳情 */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">活動詳情</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">活動名稱</span>
                <p className="text-sm text-gray-900">{campaign.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">郵件主題</span>
                <p className="text-sm text-gray-900">{campaign.subject}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">狀態</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                  campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status === 'sent' ? '已發送' :
                   campaign.status === 'sending' ? '發送中' :
                   campaign.status === 'failed' ? '發送失敗' :
                   '草稿'}
                </span>
              </div>
              {campaign.sentAt && (
                <div>
                  <span className="text-sm font-medium text-gray-600">發送時間</span>
                  <p className="text-sm text-gray-900">
                    {new Date(campaign.sentAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 測試郵件 */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">發送測試郵件</h3>
            <div className="space-y-3">
              <input
                type="email"
                className="form-input"
                placeholder="輸入測試郵箱地址"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <button
                onClick={handleSendTest}
                disabled={sending || !testEmail.trim()}
                className="btn-secondary w-full flex items-center justify-center"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                發送測試
              </button>
            </div>
          </div>
        </div>

        {/* 郵件預覽 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">郵件預覽</h3>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                預覽模式
              </div>
            </div>
            
            {/* 郵件內容預覽 */}
            <div className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">{campaign.subject}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  發件人: your-company@example.com
                </p>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.htmlContent }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;
