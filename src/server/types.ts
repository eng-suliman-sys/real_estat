export type UserRole =
  | 'ADMIN'
  | 'MANAGEMENT'
  | 'SALES_MANAGER'
  | 'SALES_AGENT'
  | 'INVESTOR'
  | 'CLIENT'
  | 'ACCOUNTANT'
  | 'DOCUMENT_MANAGER';

export type UnitStatus =
  | 'Available'
  | 'Reserved'
  | 'Hold'
  | 'Sold'
  | 'Blocked'
  | 'Under Contract';

export type ProjectStatus =
  | 'Upcoming'
  | 'Launching'
  | 'Under Construction'
  | 'Ready'
  | 'Completed';

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPERTY INTEREST'
  | 'VIEWING'
  | 'OFFER'
  | 'NEGOTIATION'
  | 'RESERVATION'
  | 'CONTRACT'
  | 'CLOSED'
  | 'LOST';

export type LeadSource =
  | 'Website'
  | 'WhatsApp'
  | 'Instagram'
  | 'Facebook'
  | 'Google'
  | 'Referral'
  | 'Walk-in'
  | 'Phone'
  | 'Property Portal'
  | 'Campaign'
  | 'Other';

export type AppointmentType =
  | 'Property Viewing'
  | 'Site Visit'
  | 'Sales Meeting'
  | 'Investor Meeting'
  | 'Virtual Tour'
  | 'Contract Meeting';

export type AppointmentStatus =
  | 'Requested'
  | 'Confirmed'
  | 'Rescheduled'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export type PaymentStatus =
  | 'Pending'
  | 'Due'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export type DocumentType =
  | 'Contract'
  | 'Brochure'
  | 'Floor Plan'
  | 'Payment Receipt'
  | 'Invoice'
  | 'Property Document'
  | 'Investor Statement'
  | 'Legal Document';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  title?: string;
  active: boolean;
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  developer: string;
  location: string;
  city: string;
  country: string;
  projectType: string;
  status: ProjectStatus;
  startingPrice: number;
  currency: string;
  completionDate: string;
  description: string;
  highlights: string[];
  amenities: string[];
  heroImage: string;
  gallery: string[];
  brochureUrl?: string;
  masterplanUrl?: string;
  totalUnits: number;
  floorsCount: number;
  coordinates: { lat: number; lng: number };
}

export interface Unit {
  id: string;
  projectId: string;
  projectName: string;
  buildingName: string;
  unitNumber: string;
  floor: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  view: string;
  price: number;
  currency: string;
  status: UnitStatus;
  paymentPlanSummary?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  reservedByClientId?: string;
  reservedByClientName?: string;
  reservedAt?: string;
  lockExpiry?: string;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  budget: number;
  preferredProjectId?: string;
  preferredProjectName?: string;
  preferredUnitId?: string;
  preferredUnitNumber?: string;
  propertyType?: string;
  bedrooms?: number;
  timeline: string;
  source: LeadSource;
  assignedAgentId?: string;
  assignedAgentName?: string;
  leadScore: number;
  stage: LeadStage;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  type: 'STAGE_CHANGE' | 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'OFFER' | 'ASSIGNMENT';
  title: string;
  description: string;
  timestamp: string;
}

export interface ClientProfile {
  id: string;
  userId?: string;
  leadId?: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNo?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  budget: number;
  interestedProjects: string[];
  viewedUnits: string[];
  createdAt: string;
}

export interface FollowUpTask {
  id: string;
  leadId?: string;
  clientId?: string;
  targetName: string;
  assignedAgentId: string;
  assignedAgentName: string;
  taskType: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  agentId: string;
  agentName: string;
  projectId: string;
  projectName: string;
  unitId?: string;
  unitNumber?: string;
  date: string;
  time: string;
  location: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Investor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  taxOrPassportId: string;
  totalInvested: number;
  portfolioValue: number;
  totalUnitsCount: number;
  kycStatus: 'Verified' | 'Pending' | 'Review Required';
  managerId: string;
  managerName: string;
  createdAt: string;
}

export interface InvestmentRecord {
  id: string;
  investorId: string;
  investorName: string;
  projectId: string;
  projectName: string;
  unitId: string;
  unitNumber: string;
  purchasePrice: number;
  currentValuation: number;
  currency: string;
  purchaseDate: string;
  amountPaid: number;
  amountOutstanding: number;
  status: 'Active' | 'Completed' | 'Transferred';
}

export interface Installment {
  id: string;
  investmentId: string;
  unitNumber: string;
  milestoneName: string;
  percentage: number;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  referenceInvoiceNo?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  investmentId?: string;
  recipientName: string;
  recipientEmail: string;
  unitNumber: string;
  projectName: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  referenceNoBank?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  ownerName: string;
  relatedProjectId?: string;
  relatedProjectName?: string;
  relatedUnitNumber?: string;
  relatedClientOrInvestorId?: string;
  fileSize: string;
  status: 'Draft' | 'Approved' | 'Signed' | 'Archived';
  accessRoles: UserRole[];
  downloadUrl: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string;
  propertyContext?: string;
  unitContext?: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  roleTarget?: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'lead' | 'reservation' | 'payment' | 'viewing' | 'document' | 'system';
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  reason?: string;
  timestamp: string;
}

export interface IntegrationStatus {
  serviceName: string;
  category: string;
  status: 'Connected' | 'Integration Required' | 'Configured (Sandbox)';
  description: string;
  requiredKeys: string[];
  docsUrl: string;
  isSimulatedMock: boolean;
}

export type CrmActivityCategory = 'LEAD' | 'APPOINTMENT' | 'RESERVATION' | 'COMMUNICATION' | 'SYSTEM';

export interface CrmActivityItem {
  id: string;
  category: CrmActivityCategory;
  eventType:
    | 'LEAD_STAGE_CHANGED'
    | 'LEAD_CREATED'
    | 'LEAD_ASSIGNED'
    | 'APPOINTMENT_BOOKED'
    | 'APPOINTMENT_STATUS_CHANGED'
    | 'UNIT_RESERVED'
    | 'UNIT_RELEASED'
    | 'COMMUNICATION_LOGGED';
  title: string;
  description: string;
  actorName: string;
  actorRole?: string;
  clientName?: string;
  projectName?: string;
  unitNumber?: string;
  stageFrom?: string;
  stageTo?: string;
  statusFrom?: string;
  statusTo?: string;
  timestamp: string;
  metadata?: {
    leadId?: string;
    appointmentId?: string;
    unitId?: string;
    price?: number;
    budget?: number;
    leadScore?: number;
    appointmentType?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    location?: string;
    source?: string;
    [key: string]: any;
  };
}
