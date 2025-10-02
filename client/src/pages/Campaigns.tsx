import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Send, Eye, Edit, Trash2, Users, Clock } from 'lucide-react';
import { campaignAPI } from '../services/api';
import { Campaign } from '../types';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getCampaigns();
      if (response.success && response.data) {
        setCampaigns(response.data);
      }
    } catch (err) {
      setError('獲取活動列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('確定要刪除這個活動嗎？')) {
      try {
        const response = await campaignAPI.deleteCampaign(id);
        if (response.success) {
          setCampaigns(campaigns.filter(c => c.id !== id));
        }
      } catch (err) {
        setError('刪除活動失敗');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return '已發送';
      case 'sending':
        return '發送中';
      case 'failed':
        return '發送失敗';
      default:
        return '草稿';
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
          <h1 className="text-2xl font-bold text-gray-900">活動管理</h1>
          <p className="text-gray-600">創建和管理您的郵件活動</p>
        </div>
        <Link
          to="/campaigns/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          創建新活動
        </Link>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* 活動列表 */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Send className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有活動</h3>
          <p className="mt-1 text-sm text-gray-500">開始創建您的第一個郵件活動</p>
          <div className="mt-6">
            <Link
              to="/campaigns/new"
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              創建活動
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Send className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {campaign.name}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{campaign.subject}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {campaign.recipientCount || 0}
                      </div>
                      {campaign.sentAt && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(campaign.sentAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/campaigns/${campaign.id}/edit`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/campaigns/${campaign.id}/preview`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {campaign.templateName && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        基於模板: {campaign.templateName}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
