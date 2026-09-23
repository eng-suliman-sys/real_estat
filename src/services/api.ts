import {
  User,
  Project,
  Unit,
  Lead,
  LeadActivity,
  FollowUpTask,
  Appointment,
  Investor,
  InvestmentRecord,
  Installment,
  Invoice,
  DocumentItem,
  ChatMessage,
  NotificationItem,
  AuditLog,
  IntegrationStatus,
  UserRole,
  CrmActivityItem,
} from '../types';

let currentUserId = 'usr_fawaz'; // default to Fawaz Sous

export function setApiActiveUser(userId: string) {
  currentUserId = userId;
}

const headers = () => ({
  'Content-Type': 'application/json',
  'x-octa-user-id': currentUserId,
});

export const api = {
  // Auth
  async login(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password: pass }),
    });
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/users', { headers: headers() });
    const data = await res.json();
    return data.users || [];
  },

  async switchRole(role?: UserRole, userId?: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ role, userId }),
    });
    const data = await res.json();
    if (data.user) {
      setApiActiveUser(data.user.id);
    }
    return data;
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects', { headers: headers() });
    const data = await res.json();
    return data.projects || [];
  },

  async getProject(slug: string): Promise<Project & { units: Unit[]; documents: DocumentItem[] }> {
    const res = await fetch(`/api/projects/${slug}`, { headers: headers() });
    const data = await res.json();
    return data.project;
  },

  // Units & Inventory
  async getUnits(params?: Record<string, string>): Promise<Unit[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/units?${query}`, { headers: headers() });
    const data = await res.json();
    return data.units || [];
  },

  async reserveUnit(
    unitId: string,
    clientId?: string,
    clientName?: string,
    notes?: string
  ): Promise<{ success: boolean; unit?: Unit; error?: string }> {
    const res = await fetch(`/api/units/${unitId}/reserve`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ clientId, clientName, notes }),
    });
    return res.json();
  },

  async releaseUnit(
    unitId: string,
    reason?: string
  ): Promise<{ success: boolean; unit?: Unit; error?: string }> {
    const res = await fetch(`/api/units/${unitId}/release`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async updateUnitStatus(
    unitId: string,
    status: string,
    reason?: string
  ): Promise<{ success: boolean; unit?: Unit; error?: string }> {
    const res = await fetch(`/api/units/${unitId}/status`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ status, reason }),
    });
    return res.json();
  },

  async createUnit(unitData: Partial<Unit>): Promise<{ success: boolean; unit?: Unit }> {
    const res = await fetch('/api/units', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(unitData),
    });
    return res.json();
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    const res = await fetch('/api/leads', { headers: headers() });
    const data = await res.json();
    return data.leads || [];
  },

  async createLead(leadData: Partial<Lead>): Promise<{ success: boolean; lead: Lead }> {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(leadData),
    });
    return res.json();
  },

  async updateLeadStage(leadId: string, stage: string, notes?: string): Promise<{ success: boolean; lead: Lead }> {
    const res = await fetch(`/api/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ stage, notes }),
    });
    return res.json();
  },

  async assignLead(leadId: string, agentId: string): Promise<{ success: boolean; lead: Lead }> {
    const res = await fetch(`/api/leads/${leadId}/assign`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ agentId }),
    });
    return res.json();
  },

  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    const res = await fetch(`/api/leads/${leadId}/activities`, { headers: headers() });
    const data = await res.json();
    return data.activities || [];
  },

  async addLeadActivity(
    leadId: string,
    activity: { type: string; title: string; description: string }
  ): Promise<{ success: boolean; activity: LeadActivity }> {
    const res = await fetch(`/api/leads/${leadId}/activities`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(activity),
    });
    return res.json();
  },

  // Follow Ups
  async getFollowUps(agentId?: string): Promise<FollowUpTask[]> {
    const query = agentId ? `?agentId=${agentId}` : '';
    const res = await fetch(`/api/follow-ups${query}`, { headers: headers() });
    const data = await res.json();
    return data.followUps || [];
  },

  async completeFollowUp(taskId: string): Promise<{ success: boolean; task: FollowUpTask }> {
    const res = await fetch(`/api/follow-ups/${taskId}/complete`, {
      method: 'PATCH',
      headers: headers(),
    });
    return res.json();
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch('/api/appointments', { headers: headers() });
    const data = await res.json();
    return data.appointments || [];
  },

  async createAppointment(data: Partial<Appointment>): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAppointmentStatus(appId: string, status: string): Promise<{ success: boolean; appointment: Appointment }> {
    const res = await fetch(`/api/appointments/${appId}/status`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Investors & Portfolio
  async getInvestors(): Promise<Investor[]> {
    const res = await fetch('/api/investors', { headers: headers() });
    const data = await res.json();
    return data.investors || [];
  },

  async getInvestorPortfolio(investorId: string): Promise<{
    investor: Investor;
    investments: InvestmentRecord[];
    installments: Installment[];
    documents: DocumentItem[];
  }> {
    const res = await fetch(`/api/investors/${investorId}/portfolio`, { headers: headers() });
    const data = await res.json();
    return data;
  },

  // Invoices & Payments
  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch('/api/invoices', { headers: headers() });
    const data = await res.json();
    return data.invoices || [];
  },

  async recordPayment(
    invoiceId: string,
    paymentMethod: string,
    referenceNoBank: string
  ): Promise<{ success: boolean; invoice: Invoice }> {
    const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ paymentMethod, referenceNoBank }),
    });
    return res.json();
  },

  // Documents
  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch('/api/documents', { headers: headers() });
    const data = await res.json();
    return data.documents || [];
  },

  async uploadDocument(docData: Partial<DocumentItem>): Promise<{ success: boolean; document: DocumentItem }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(docData),
    });
    return res.json();
  },

  // Messages
  async getMessages(): Promise<ChatMessage[]> {
    const res = await fetch('/api/messages', { headers: headers() });
    const data = await res.json();
    return data.messages || [];
  },

  async sendMessage(msg: Partial<ChatMessage>): Promise<{ success: boolean; message: ChatMessage }> {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(msg),
    });
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications', { headers: headers() });
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationRead(notifId: string): Promise<void> {
    await fetch(`/api/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: headers(),
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: headers(),
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs', { headers: headers() });
    const data = await res.json();
    return data.auditLogs || [];
  },

  // Integrations
  async getIntegrations(): Promise<IntegrationStatus[]> {
    const res = await fetch('/api/integrations', { headers: headers() });
    const data = await res.json();
    return data.integrations || [];
  },

  async testIntegration(service: string, apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`/api/integrations/${encodeURIComponent(service)}/test`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  },

  // Reports
  async getReportsOverview(): Promise<any> {
    const res = await fetch('/api/reports/overview', { headers: headers() });
    const data = await res.json();
    return data.data;
  },

  // CRM Activities Feed
  async getCrmActivities(): Promise<CrmActivityItem[]> {
    const res = await fetch('/api/crm/recent-activities', { headers: headers() });
    const data = await res.json();
    return data.activities || [];
  },

  async simulateCrmActivity(payload: {
    eventType: string;
    clientName?: string;
    stage?: string;
    appointmentType?: string;
  }): Promise<{ success: boolean; activity: CrmActivityItem }> {
    const res = await fetch('/api/crm/activities/simulate', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
