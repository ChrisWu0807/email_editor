import axios, { AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  AuthResponse, 
  EmailTemplate, 
  Campaign, 
  StatisticsResponse,
  SendGridEvent,
  LoginForm,
  RegisterForm,
  TemplateForm,
  CampaignForm
} from '../types';

// API基礎配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔍 [API] 請求攔截器 - 請求 URL:', config.url);
    console.log('🔍 [API] 請求攔截器 - Token 存在:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔍 [API] 請求攔截器 - 添加 Authorization 頭');
    }
    return config;
  },
  (error) => {
    console.error('🔍 [API] 請求攔截器錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理認證錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認證API
export const authAPI = {
  // 登入
  login: async (data: LoginForm): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data;
  },

  // 註冊
  register: async (data: RegisterForm): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  // 獲取當前用戶信息
  getMe: async (): Promise<ApiResponse> => {
    console.log('🔍 [API] 調用 getMe API');
    console.log('🔍 [API] 請求 URL:', '/auth/me');
    console.log('🔍 [API] Base URL:', API_BASE_URL);
    
    try {
      const response: AxiosResponse<ApiResponse> = await api.get('/auth/me');
      console.log('🔍 [API] getMe 響應狀態:', response.status);
      console.log('🔍 [API] getMe 響應數據:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔍 [API] getMe 請求失敗:', error);
      throw error;
    }
  },

  // 更新用戶信息
  updateProfile: async (data: { username: string; email: string }): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put('/auth/me', data);
    return response.data;
  },

  // 修改密碼
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.put('/auth/password', data);
    return response.data;
  },
};

// 模板API
export const templateAPI = {
  // 獲取所有模板
  getTemplates: async (): Promise<ApiResponse<EmailTemplate[]>> => {
    const response: AxiosResponse<ApiResponse<EmailTemplate[]>> = await api.get('/templates');
    return response.data;
  },

  // 獲取單個模板
  getTemplate: async (id: number): Promise<ApiResponse<EmailTemplate>> => {
    const response: AxiosResponse<ApiResponse<EmailTemplate>> = await api.get(`/templates/${id}`);
    return response.data;
  },

  // 創建模板
  createTemplate: async (data: TemplateForm): Promise<ApiResponse<EmailTemplate>> => {
    const response: AxiosResponse<ApiResponse<EmailTemplate>> = await api.post('/templates', data);
    return response.data;
  },

  // 更新模板
  updateTemplate: async (id: number, data: TemplateForm & { isActive?: boolean }): Promise<ApiResponse<EmailTemplate>> => {
    const response: AxiosResponse<ApiResponse<EmailTemplate>> = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  // 刪除模板
  deleteTemplate: async (id: number): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/templates/${id}`);
    return response.data;
  },

  // 複製模板
  duplicateTemplate: async (id: number, name: string): Promise<ApiResponse<EmailTemplate>> => {
    const response: AxiosResponse<ApiResponse<EmailTemplate>> = await api.post(`/templates/${id}/duplicate`, { name });
    return response.data;
  },
};

// 活動API
export const campaignAPI = {
  // 獲取所有活動
  getCampaigns: async (): Promise<ApiResponse<Campaign[]>> => {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await api.get('/campaigns');
    return response.data;
  },

  // 獲取單個活動
  getCampaign: async (id: number): Promise<ApiResponse<Campaign & { recipients: any[] }>> => {
    const response: AxiosResponse<ApiResponse<Campaign & { recipients: any[] }>> = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  // 創建活動
  createCampaign: async (data: CampaignForm): Promise<ApiResponse<Campaign>> => {
    const response: AxiosResponse<ApiResponse<Campaign>> = await api.post('/campaigns', data);
    return response.data;
  },

  // 發送活動
  sendCampaign: async (id: number): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/campaigns/${id}/send`);
    return response.data;
  },

  // 預覽郵件
  previewCampaign: async (id: number, email: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/campaigns/${id}/preview`, { email });
    return response.data;
  },

  // 刪除活動
  deleteCampaign: async (id: number): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
};

// 統計API
export const statisticsAPI = {
  // 獲取活動統計
  getCampaignStats: async (id: number): Promise<StatisticsResponse> => {
    const response: AxiosResponse<StatisticsResponse> = await api.get(`/statistics/campaign/${id}`);
    return response.data;
  },

  // 獲取總體統計
  getOverview: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get('/statistics/overview');
    return response.data;
  },

  // 獲取時間序列數據
  getTimeframeData: async (startDate: string, endDate: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get('/statistics/timeframe', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // 同步統計數據
  syncStats: async (campaignId: number): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/statistics/sync/${campaignId}`);
    return response.data;
  },
};

// Webhook API
export const webhookAPI = {
  // 獲取webhook事件
  getEvents: async (campaignId?: number, eventType?: string, processed?: boolean): Promise<ApiResponse<SendGridEvent[]>> => {
    const params: any = {};
    if (campaignId) params.campaignId = campaignId;
    if (eventType) params.eventType = eventType;
    if (processed !== undefined) params.processed = processed;

    const response: AxiosResponse<ApiResponse<SendGridEvent[]>> = await api.get('/webhooks/events', { params });
    return response.data;
  },

  // 重新處理事件
  retryEvent: async (eventId: number): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.post(`/webhooks/events/${eventId}/retry`);
    return response.data;
  },
};

export default api;
