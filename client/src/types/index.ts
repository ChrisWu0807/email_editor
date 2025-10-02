// API響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// 用戶類型
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

// 認證類型
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}

// 模板類型
export interface EmailTemplate {
  id: number;
  userId: number;
  name: string;
  subject?: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 活動類型
export interface Campaign {
  id: number;
  userId: number;
  templateId?: number;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  sendgridMessageId?: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  templateName?: string;
  recipientCount?: number;
  sentCount?: number;
}

// 收件人類型
export interface Recipient {
  id: number;
  campaignId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  sendgridMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  unsubscribedAt?: string;
  bouncedAt?: string;
  createdAt: string;
}

// 統計數據類型
export interface CampaignStatistics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalUnsubscribed: number;
  totalBounced: number;
  deliveryRate: string;
  openRate: string;
  clickRate: string;
  unsubscribeRate: string;
  bounceRate: string;
}

export interface StatisticsResponse {
  success: boolean;
  statistics?: CampaignStatistics;
  recipients?: Recipient[];
  statusBreakdown?: Array<{
    status: string;
    count: number;
    openedCount: number;
    clickedCount: number;
    unsubscribedCount: number;
    bouncedCount: number;
  }>;
  error?: string;
}

// Webhook事件類型
export interface SendGridEvent {
  id: number;
  campaignId: number;
  recipientEmail: string;
  eventType: 'delivered' | 'open' | 'click' | 'bounce' | 'unsubscribe' | 'spam_report';
  sendgridMessageId?: string;
  eventData?: Record<string, any>;
  processed: boolean;
  createdAt: string;
}

// 表單類型
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface TemplateForm {
  name: string;
  subject?: string;
  htmlContent: string;
  textContent?: string;
}

export interface CampaignForm {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  recipients: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    customFields?: Record<string, any>;
  }>;
}
