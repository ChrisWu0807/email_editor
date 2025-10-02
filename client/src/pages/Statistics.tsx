import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Eye, 
  MousePointer,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import { statisticsAPI } from '../services/api';
import { CampaignStatistics } from '../types';

const Statistics: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await statisticsAPI.getOverview();
      if (response.success && response.data) {
        setOverview(response.data.overview);
      }
    } catch (error) {
      console.error('獲取統計數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '總活動數',
      value: overview?.campaigns?.total_campaigns || 0,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: '總收件人',
      value: overview?.recipients?.total_recipients || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: '總開信數',
      value: overview?.recipients?.opened_recipients || 0,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: '總點擊數',
      value: overview?.recipients?.clicked_recipients || 0,
      icon: MousePointer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const rateCards = [
    {
      title: '送達率',
      value: `${overview?.overallStats?.deliveryRate || 0}%`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: '開信率',
      value: `${overview?.overallStats?.openRate || 0}%`,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: '點擊率',
      value: `${overview?.overallStats?.clickRate || 0}%`,
      icon: MousePointer,
      color: 'text-purple-600'
    },
    {
      title: '退訂率',
      value: `${overview?.overallStats?.unsubscribeRate || 0}%`,
      icon: UserMinus,
      color: 'text-red-600'
    },
    {
      title: '退信率',
      value: `${overview?.overallStats?.bounceRate || 0}%`,
      icon: AlertTriangle,
      color: 'text-orange-600'
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
          <h1 className="text-2xl font-bold text-gray-900">統計分析</h1>
          <p className="text-gray-600">查看您的郵件營銷效果數據</p>
        </div>
        <Link
          to="/campaigns"
          className="btn-primary flex items-center"
        >
          <Mail className="h-4 w-4 mr-2" />
          查看活動
        </Link>
      </div>

      {/* 總體統計卡片 */}
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

      {/* 效果統計 */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">效果統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {rateCards.map((rate, index) => {
            const Icon = rate.icon;
            return (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3`}>
                  <Icon className={`h-6 w-6 ${rate.color}`} />
                </div>
                <p className="text-sm font-medium text-gray-600">{rate.title}</p>
                <p className={`text-2xl font-bold ${rate.color}`}>{rate.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 活動統計詳情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活動狀態分佈 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">活動狀態分佈</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">草稿</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.campaigns?.draft_campaigns || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">已發送</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.campaigns?.sent_campaigns || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">發送失敗</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.campaigns?.failed_campaigns || 0}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium text-gray-900">總計</span>
              <span className="text-sm font-bold text-gray-900">
                {overview?.campaigns?.total_campaigns || 0}
              </span>
            </div>
          </div>
        </div>

        {/* 收件人統計 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">收件人統計</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">總收件人</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.recipients?.total_recipients || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">已發送</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.recipients?.sent_recipients || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">已開信</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.recipients?.opened_recipients || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">已點擊</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.recipients?.clicked_recipients || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">已退訂</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.recipients?.unsubscribed_recipients || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">退信</span>
              <span className="text-sm font-medium text-gray-900">
                {overview?.recipients?.bounced_recipients || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">統計數據說明</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>統計數據會根據 SendGrid 的 webhook 事件實時更新。</p>
              <p>開信率 = 開信數 / 送達數 × 100%</p>
              <p>點擊率 = 點擊數 / 送達數 × 100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
