import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Mail, 
  FileText, 
  Send, 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointer
} from 'lucide-react';
import { statisticsAPI } from '../services/api';

interface OverviewStats {
  campaigns: {
    total_campaigns: number;
    sent_campaigns: number;
    draft_campaigns: number;
    failed_campaigns: number;
  };
  recipients: {
    total_recipients: number;
    sent_recipients: number;
    opened_recipients: number;
    clicked_recipients: number;
    unsubscribed_recipients: number;
    bounced_recipients: number;
  };
  overallStats: {
    deliveryRate: string;
    openRate: string;
    clickRate: string;
    unsubscribeRate: string;
    bounceRate: string;
  };
}

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await statisticsAPI.getOverview();
        if (response.success && response.data) {
          setOverview(response.data.overview);
        }
      } catch (error) {
        console.error('獲取儀表板數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const quickActions = [
    {
      title: '創建新模板',
      description: '設計郵件模板',
      icon: FileText,
      href: '/templates/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '發送活動',
      description: '創建並發送郵件活動',
      icon: Send,
      href: '/campaigns/new',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '查看統計',
      description: '分析郵件效果',
      icon: BarChart3,
      href: '/statistics',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const statCards = [
    {
      title: '總活動數',
      value: overview?.campaigns.total_campaigns || 0,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: '已發送',
      value: overview?.campaigns.sent_campaigns || 0,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: '總收件人',
      value: overview?.recipients.total_recipients || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: '開信率',
      value: `${overview?.overallStats.openRate || 0}%`,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
          <p className="text-gray-600">歡迎回來！這裡是您的郵件營銷概覽</p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速操作 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="block p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 整體統計 */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 效果統計 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">效果統計</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">送達率</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.overallStats.deliveryRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">開信率</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.overallStats.openRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">點擊率</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.overallStats.clickRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">退訂率</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.overallStats.unsubscribeRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">退信率</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.overallStats.bounceRate}%
                </span>
              </div>
            </div>
          </div>

          {/* 活動狀態 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">活動狀態</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">草稿</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.campaigns.draft_campaigns}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">已發送</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.campaigns.sent_campaigns}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">發送失敗</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.campaigns.failed_campaigns}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">總計</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.campaigns.total_campaigns}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
