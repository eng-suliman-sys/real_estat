import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Project,
  Unit,
  Lead,
  LeadActivity,
  ClientProfile,
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
  UnitStatus,
  LeadStage,
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'octa_db.json');

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  units: Unit[];
  leads: Lead[];
  leadActivities: LeadActivity[];
  clients: ClientProfile[];
  followUps: FollowUpTask[];
  appointments: Appointment[];
  investors: Investor[];
  investments: InvestmentRecord[];
  installments: Installment[];
  invoices: Invoice[];
  documents: DocumentItem[];
  messages: ChatMessage[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  integrations: IntegrationStatus[];
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_OCTA_SALT_2026').digest('hex');
}

let dbInstance: DatabaseSchema | null = null;

function getInitialSeedData(): DatabaseSchema {
  const defaultPass = hashPassword('OctaLuxury2026!');

  const users: User[] = [
    {
      id: 'usr_fawaz',
      name: 'Fawaz Sous',
      email: 'fawaz@octaproperties.com',
      passwordHash: defaultPass,
      role: 'MANAGEMENT',
      title: 'Founder & CEO',
      phone: '+971 4 456 7890',
      active: true,
      permissions: ['*'],
      createdAt: '2026-01-01T08:00:00Z',
      lastLoginAt: '2026-09-23T11:45:00Z',
    },
    {
      id: 'usr_admin',
      name: 'Alexander Vance',
      email: 'admin@octaproperties.com',
      passwordHash: defaultPass,
      role: 'ADMIN',
      title: 'Chief Operating Officer & VP Technology',
      phone: '+971 4 456 7891',
      active: true,
      permissions: ['*'],
      createdAt: '2026-01-02T09:00:00Z',
      lastLoginAt: '2026-09-23T12:10:00Z',
    },
    {
      id: 'usr_salesmgr',
      name: 'Soraya Al-Hashemi',
      email: 'sales.manager@octaproperties.com',
      passwordHash: defaultPass,
      role: 'SALES_MANAGER',
      title: 'Senior Vice President — Global Sales',
      phone: '+971 4 456 7892',
      active: true,
      permissions: ['leads.view', 'leads.assign', 'leads.edit', 'properties.view', 'offers.view', 'offers.approve', 'appointments.manage'],
      createdAt: '2026-01-15T10:00:00Z',
      lastLoginAt: '2026-09-23T12:50:00Z',
    },
    {
      id: 'usr_agent_karim',
      name: 'Karim Hassan',
      email: 'karim.hassan@octaproperties.com',
      passwordHash: defaultPass,
      role: 'SALES_AGENT',
      title: 'Prime Residential Private Client Advisor',
      phone: '+971 50 234 5678',
      active: true,
      permissions: ['leads.view', 'leads.edit', 'properties.view', 'units.reserve', 'appointments.create', 'appointments.view'],
      createdAt: '2026-02-01T11:00:00Z',
      lastLoginAt: '2026-09-23T13:00:00Z',
    },
    {
      id: 'usr_agent_nadia',
      name: 'Nadia Al-Mansoori',
      email: 'nadia.almansoori@octaproperties.com',
      passwordHash: defaultPass,
      role: 'SALES_AGENT',
      title: 'Luxury Portfolio Director — Waterfront Estates',
      phone: '+971 55 987 6543',
      active: true,
      permissions: ['leads.view', 'leads.edit', 'properties.view', 'units.reserve', 'appointments.create', 'appointments.view'],
      createdAt: '2026-02-10T11:00:00Z',
      lastLoginAt: '2026-09-23T10:30:00Z',
    },
    {
      id: 'usr_investor_sheikh',
      name: 'Tariq Al-Sabah',
      email: 'investor.sheikh@octaproperties.com',
      passwordHash: defaultPass,
      role: 'INVESTOR',
      title: 'Institutional Principal Investor',
      phone: '+965 99 123 456',
      active: true,
      permissions: ['investor.portal', 'documents.view', 'payments.view'],
      createdAt: '2026-03-01T08:00:00Z',
      lastLoginAt: '2026-09-22T19:20:00Z',
    },
    {
      id: 'usr_client_elena',
      name: 'Elena Rostova',
      email: 'client.elena@octaproperties.com',
      passwordHash: defaultPass,
      role: 'CLIENT',
      title: 'Private Buyer & Resident',
      phone: '+44 7700 900123',
      active: true,
      permissions: ['client.portal', 'properties.view', 'appointments.create'],
      createdAt: '2026-03-10T14:00:00Z',
      lastLoginAt: '2026-09-23T09:15:00Z',
    },
    {
      id: 'usr_finance',
      name: 'Marcus Sterling',
      email: 'finance@octaproperties.com',
      passwordHash: defaultPass,
      role: 'ACCOUNTANT',
      title: 'Chief Financial Officer & Escrow Controller',
      phone: '+971 4 456 7895',
      active: true,
      permissions: ['payments.view', 'payments.create', 'payments.edit', 'invoices.manage', 'reports.finance'],
      createdAt: '2026-01-20T08:00:00Z',
      lastLoginAt: '2026-09-23T08:45:00Z',
    },
    {
      id: 'usr_docmgr',
      name: 'Claire Beauchamp',
      email: 'compliance@octaproperties.com',
      passwordHash: defaultPass,
      role: 'DOCUMENT_MANAGER',
      title: 'Head of Legal & Title Conveyancing',
      phone: '+971 4 456 7896',
      active: true,
      permissions: ['documents.view', 'documents.upload', 'documents.approve', 'contracts.manage'],
      createdAt: '2026-01-22T08:00:00Z',
      lastLoginAt: '2026-09-23T11:00:00Z',
    }
  ];

  const projects: Project[] = [
    {
      id: 'prj_luminar',
      slug: 'octa-luminar-residences',
      name: 'OCTA Luminar Sky Residences',
      developer: 'OCTA Properties L.L.C.',
      location: 'Downtown Dubai, Opera District',
      city: 'Dubai',
      country: 'United Arab Emirates',
      projectType: 'High-Rise Architectural Landmark',
      status: 'Under Construction',
      startingPrice: 3450000,
      currency: 'AED',
      completionDate: 'Q4 2027',
      description: 'Rising 48 storeys above the Downtown skyline, OCTA Luminar Sky Residences is an avant-garde architectural masterpiece featuring panoramic Burj Khalifa views, private plunge pools on cantilevered sky terraces, and bespoke interiors curated in bronze and Italian travertine.',
      highlights: [
        'Direct Burj Khalifa & Dubai Fountain panoramic views',
        'Private sky terraces with infinity edge plunge pools',
        'Helipad & dedicated Rolls-Royce chauffeur fleet',
        'Private art collector vault & wine cellarage',
        'Private Michelin-star dining club on the 42nd floor'
      ],
      amenities: [
        'Infinity Sky Pool & Sun Loungers',
        'Equinox-grade Thermal Wellness Spa',
        'Private Screening Cinema & Golf Simulator',
        'Dedicated 24/7 White-Glove Butler Concierge',
        'Executive Boardrooms & Private Cigar Lounge'
      ],
      heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
      ],
      brochureUrl: '/docs/OCTA_Luminar_Architectural_Brochure.pdf',
      masterplanUrl: '/docs/OCTA_Luminar_Masterplan.pdf',
      totalUnits: 120,
      floorsCount: 48,
      coordinates: { lat: 25.1972, lng: 55.2744 },
    },
    {
      id: 'prj_elysium',
      slug: 'octa-elysium-private-island',
      name: 'OCTA Elysium Private Island Mansions',
      developer: 'OCTA Properties L.L.C.',
      location: 'Palm Jumeirah Frond G, Dubai',
      city: 'Dubai',
      country: 'United Arab Emirates',
      projectType: 'Ultra-Luxury Beachfront Mansions',
      status: 'Ready',
      startingPrice: 24500000,
      currency: 'AED',
      completionDate: 'Immediate Handover',
      description: 'An ultra-exclusive collection of 16 custom-sculpted beachfront mansions on the most coveted tip of Palm Jumeirah. Offering private 80-meter private sand beaches, personal yacht berths, and subterranean entertainment pavilions.',
      highlights: [
        'Private 80-meter white sand beach frontage',
        'Private mega-yacht mooring berth (up to 45 meters)',
        'Subterranean 8-vehicle showroom garage',
        'Custom Minotti & B&B Italia turnkey furnishing',
        '24/7 Armed perimeter & maritime security'
      ],
      amenities: [
        'Private Beachfront Swimming Pool',
        'Hydrotherapy Spa & Cryo Chambers',
        'Rooftop Stargazing Observatory Deck',
        'Smart Automated Home Automation by Crestron',
        'Subterranean 12-Seat Cinema & Wine Cellar'
      ],
      heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ],
      brochureUrl: '/docs/OCTA_Elysium_Private_Estate.pdf',
      masterplanUrl: '/docs/OCTA_Elysium_Island_Masterplan.pdf',
      totalUnits: 16,
      floorsCount: 4,
      coordinates: { lat: 25.1124, lng: 55.139 },
    },
    {
      id: 'prj_horizon',
      slug: 'the-horizon-tower-difc',
      name: 'The Horizon Tower DIFC',
      developer: 'OCTA Properties L.L.C.',
      location: 'Gate Precinct 8, DIFC, Dubai',
      city: 'Dubai',
      country: 'United Arab Emirates',
      projectType: 'Commercial & Executive Residences',
      status: 'Launching',
      startingPrice: 2850000,
      currency: 'AED',
      completionDate: 'Q2 2028',
      description: 'The premier corporate address and luxury pied-à-terre residences at the financial core of Dubai. Engineered for global family offices, executives, and international fund principals with direct pedestrian link to Gate Avenue.',
      highlights: [
        'Zero-distance connectivity to Gate Avenue & DIFC Metro',
        'Gold LEED certified biophilic architecture',
        'High-speed fiber connectivity & private trading suites',
        'Dual residential and commercial zoning flex titles'
      ],
      amenities: [
        'Private Business Club & Video Studio',
        'Sky Gym with Personal Trainers',
        'Valet Parking with 200 EV Fast Chargers',
        'Concierge Dining Reservation Priority'
      ],
      heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
      gallery: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80'
      ],
      brochureUrl: '/docs/OCTA_Horizon_DIFC_Investment.pdf',
      masterplanUrl: '/docs/OCTA_Horizon_Floorplates.pdf',
      totalUnits: 80,
      floorsCount: 32,
      coordinates: { lat: 25.2048, lng: 55.2708 },
    }
  ];

  const units: Unit[] = [
    {
      id: 'unt_lum_1201',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      buildingName: 'Tower A',
      unitNumber: '1201',
      floor: 12,
      type: '2BR Sky Suite',
      bedrooms: 2,
      bathrooms: 3,
      areaSqFt: 1845,
      view: 'Burj Khalifa & Fountain Vista',
      price: 4250000,
      currency: 'AED',
      status: 'Available',
      paymentPlanSummary: '20% Down / 50% During Construction / 30% on Handover',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      notes: 'High floor corner residence with private terrace jacuzzi.',
    },
    {
      id: 'unt_lum_1202',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      buildingName: 'Tower A',
      unitNumber: '1202',
      floor: 12,
      type: '1BR Executive',
      bedrooms: 1,
      bathrooms: 2,
      areaSqFt: 1120,
      view: 'Downtown Canal & Park View',
      price: 2950000,
      currency: 'AED',
      status: 'Reserved',
      paymentPlanSummary: '20% Down / 50% During Construction / 30% on Handover',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      reservedByClientId: 'usr_client_elena',
      reservedByClientName: 'Elena Rostova',
      reservedAt: '2026-09-23T08:30:00Z',
      lockExpiry: '2026-09-26T08:30:00Z',
      notes: 'Client submitted holding deposit cheque via Escrow.',
    },
    {
      id: 'unt_lum_1203',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      buildingName: 'Tower A',
      unitNumber: '1203',
      floor: 12,
      type: '3BR Grand Residence',
      bedrooms: 3,
      bathrooms: 4,
      areaSqFt: 2950,
      view: 'Full Panoramic Burj Khalifa View',
      price: 7800000,
      currency: 'AED',
      status: 'Available',
      paymentPlanSummary: '20% Down / 50% During Construction / 30% on Handover',
      assignedAgentId: 'usr_agent_nadia',
      assignedAgentName: 'Nadia Al-Mansoori',
      notes: 'Triple aspect floor plan with show and back prep kitchens.',
    },
    {
      id: 'unt_lum_1204',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      buildingName: 'Tower A',
      unitNumber: '1204',
      floor: 12,
      type: '2BR Sky Suite',
      bedrooms: 2,
      bathrooms: 3,
      areaSqFt: 1910,
      view: 'Downtown Opera Sunset View',
      price: 4400000,
      currency: 'AED',
      status: 'Sold',
      paymentPlanSummary: '100% Paid Upfront',
      assignedAgentId: 'usr_agent_nadia',
      assignedAgentName: 'Nadia Al-Mansoori',
      notes: 'Sold to institutional family office from Geneva.',
    },
    {
      id: 'unt_lum_2401',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      buildingName: 'Tower A',
      unitNumber: '2401',
      floor: 24,
      type: '4BR Sky Villa Duplex',
      bedrooms: 4,
      bathrooms: 5,
      areaSqFt: 4680,
      view: '360° Skyline & Arabian Gulf Panorama',
      price: 14200000,
      currency: 'AED',
      status: 'Hold',
      paymentPlanSummary: 'Custom 60/40 Escrow Plan',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      notes: 'Held for VIP delegation viewing on Friday.',
    },
    {
      id: 'unt_lum_4801',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      buildingName: 'Tower A',
      unitNumber: '4801',
      floor: 48,
      type: 'Full Floor Royal Sky Penthouse',
      bedrooms: 5,
      bathrooms: 7,
      areaSqFt: 9800,
      view: 'Private 360° Unobstructed Dubai Skyline',
      price: 48000000,
      currency: 'AED',
      status: 'Under Contract',
      paymentPlanSummary: 'Custom Private Banking Schedule',
      assignedAgentId: 'usr_salesmgr',
      assignedAgentName: 'Soraya Al-Hashemi',
      notes: 'Contract documents in conveyancing review with Dubai Land Department.',
    },
    {
      id: 'unt_ely_01',
      projectId: 'prj_elysium',
      projectName: 'OCTA Elysium Private Island Mansions',
      buildingName: 'Villa Enclave I',
      unitNumber: 'Mansion 01',
      floor: 3,
      type: '6BR Beachfront Signature Mansion',
      bedrooms: 6,
      bathrooms: 8,
      areaSqFt: 14200,
      view: 'Private Beach & Open Arabian Gulf',
      price: 38500000,
      currency: 'AED',
      status: 'Sold',
      paymentPlanSummary: 'Handover Completed',
      assignedAgentId: 'usr_salesmgr',
      assignedAgentName: 'Soraya Al-Hashemi',
      reservedByClientId: 'usr_investor_sheikh',
      reservedByClientName: 'Tariq Al-Sabah',
      notes: 'Purchased by Tariq Al-Sabah portfolio.',
    },
    {
      id: 'unt_ely_02',
      projectId: 'prj_elysium',
      projectName: 'OCTA Elysium Private Island Mansions',
      buildingName: 'Villa Enclave I',
      unitNumber: 'Mansion 02',
      floor: 3,
      type: '6BR Beachfront Signature Mansion',
      bedrooms: 6,
      bathrooms: 8,
      areaSqFt: 15100,
      view: 'Private Beach & Palm Lagoon Skyline',
      price: 41000000,
      currency: 'AED',
      status: 'Available',
      paymentPlanSummary: 'Immediate Title Deed Handover on Escrow Release',
      assignedAgentId: 'usr_agent_nadia',
      assignedAgentName: 'Nadia Al-Mansoori',
      notes: 'Fully furnished turnkey mansion with Poliform Italian millwork.',
    },
    {
      id: 'unt_ely_03',
      projectId: 'prj_elysium',
      projectName: 'OCTA Elysium Private Island Mansions',
      buildingName: 'Villa Enclave II',
      unitNumber: 'Mansion 03',
      floor: 3,
      type: '7BR Royal Palace Estate',
      bedrooms: 7,
      bathrooms: 10,
      areaSqFt: 18600,
      view: 'Private Beach, Marina Berths & Gulf Horizon',
      price: 58000000,
      currency: 'AED',
      status: 'Available',
      paymentPlanSummary: 'Negotiable Structure via Private Banker',
      assignedAgentId: 'usr_salesmgr',
      assignedAgentName: 'Soraya Al-Hashemi',
      notes: 'Features a private 12-meter cinema, spa sanctuary, and bowling alley.',
    },
    {
      id: 'unt_hor_0801',
      projectId: 'prj_horizon',
      projectName: 'The Horizon Tower DIFC',
      buildingName: 'North Tower',
      unitNumber: '0801',
      floor: 8,
      type: '1BR Financial Executive Suite',
      bedrooms: 1,
      bathrooms: 2,
      areaSqFt: 980,
      view: 'DIFC Gate Avenue',
      price: 2850000,
      currency: 'AED',
      status: 'Available',
      paymentPlanSummary: '10% Booking / 40% Construction / 50% Handover',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      notes: 'High demand high-yield rental unit, estimated net 8.4% ROI.',
    },
    {
      id: 'unt_hor_1402',
      projectId: 'prj_horizon',
      projectName: 'The Horizon Tower DIFC',
      buildingName: 'North Tower',
      unitNumber: '1402',
      floor: 14,
      type: '2BR Corner Executive',
      bedrooms: 2,
      bathrooms: 2,
      areaSqFt: 1620,
      view: 'Financial Centre Boulevard',
      price: 4100000,
      currency: 'AED',
      status: 'Blocked',
      paymentPlanSummary: 'Commercial Institutional Block',
      assignedAgentId: 'usr_salesmgr',
      assignedAgentName: 'Soraya Al-Hashemi',
      notes: 'Temporarily blocked for corporate sovereign fund package inquiry.',
    }
  ];

  const leads: Lead[] = [
    {
      id: 'led_101',
      name: 'Julian Sterling',
      email: 'j.sterling@sterlingcapital.co.uk',
      phone: '+44 7911 123456',
      country: 'United Kingdom',
      city: 'London',
      budget: 8500000,
      preferredProjectId: 'prj_luminar',
      preferredProjectName: 'OCTA Luminar Sky Residences',
      preferredUnitId: 'unt_lum_1203',
      preferredUnitNumber: '1203',
      propertyType: '3BR Grand Residence',
      bedrooms: 3,
      timeline: 'Within 30 Days',
      source: 'Website',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      leadScore: 88,
      stage: 'OFFER',
      notes: 'Managing Director of UK equity fund. Visiting Dubai next week for final contract inspection.',
      createdAt: '2026-09-18T10:15:00Z',
      updatedAt: '2026-09-23T11:20:00Z',
    },
    {
      id: 'led_102',
      name: 'H.E. Amira Al-Kuwari',
      email: 'amira.alkuwari@kuwarigroup.qa',
      phone: '+974 55 223 344',
      country: 'Qatar',
      city: 'Doha',
      budget: 45000000,
      preferredProjectId: 'prj_elysium',
      preferredProjectName: 'OCTA Elysium Private Island Mansions',
      preferredUnitId: 'unt_ely_02',
      preferredUnitNumber: 'Mansion 02',
      propertyType: '6BR Beachfront Signature Mansion',
      bedrooms: 6,
      timeline: 'Immediate',
      source: 'Referral',
      assignedAgentId: 'usr_agent_nadia',
      assignedAgentName: 'Nadia Al-Mansoori',
      leadScore: 96,
      stage: 'NEGOTIATION',
      notes: 'Family office seeking turnkey beachfront mansion on Palm Jumeirah. Private yacht berthing required.',
      createdAt: '2026-09-15T14:30:00Z',
      updatedAt: '2026-09-23T09:40:00Z',
    },
    {
      id: 'led_103',
      name: 'David Chen',
      email: 'd.chen@apextechnologies.sg',
      phone: '+65 9123 4567',
      country: 'Singapore',
      city: 'Singapore',
      budget: 4500000,
      preferredProjectId: 'prj_horizon',
      preferredProjectName: 'The Horizon Tower DIFC',
      preferredUnitId: 'unt_hor_0801',
      preferredUnitNumber: '0801',
      propertyType: '1BR Financial Executive Suite',
      bedrooms: 1,
      timeline: '1-3 Months',
      source: 'Property Portal',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      leadScore: 74,
      stage: 'VIEWING',
      notes: 'Tech entrepreneur relocating Asia HQ to Dubai DIFC. Scheduled virtual walkthrough.',
      createdAt: '2026-09-20T08:00:00Z',
      updatedAt: '2026-09-22T16:00:00Z',
    },
    {
      id: 'led_104',
      name: 'Countess Beatrix Von Linden',
      email: 'beatrix@vonlinden.at',
      phone: '+43 664 1234567',
      country: 'Austria',
      city: 'Vienna',
      budget: 15000000,
      preferredProjectId: 'prj_luminar',
      preferredProjectName: 'OCTA Luminar Sky Residences',
      preferredUnitId: 'unt_lum_2401',
      preferredUnitNumber: '2401',
      propertyType: '4BR Sky Villa Duplex',
      bedrooms: 4,
      timeline: 'Within 60 Days',
      source: 'Campaign',
      assignedAgentId: 'usr_salesmgr',
      assignedAgentName: 'Soraya Al-Hashemi',
      leadScore: 82,
      stage: 'QUALIFIED',
      notes: 'Inheritance portfolio reallocation. Interested in high floor duplex with Burj views.',
      createdAt: '2026-09-21T11:45:00Z',
      updatedAt: '2026-09-23T10:15:00Z',
    },
    {
      id: 'led_105',
      name: 'Rashid Al-Maktoum Trading Rep',
      email: 'procurement@ramholdings.ae',
      phone: '+971 50 111 2233',
      country: 'UAE',
      city: 'Dubai',
      budget: 35000000,
      preferredProjectId: 'prj_luminar',
      preferredProjectName: 'OCTA Luminar Sky Residences',
      preferredUnitId: 'unt_lum_4801',
      preferredUnitNumber: '4801',
      propertyType: 'Royal Sky Penthouse',
      bedrooms: 5,
      timeline: 'Immediate',
      source: 'Walk-in',
      assignedAgentId: 'usr_salesmgr',
      assignedAgentName: 'Soraya Al-Hashemi',
      leadScore: 94,
      stage: 'CONTRACT',
      notes: 'Conveyancing underway with legal team. Escrow payment scheduled.',
      createdAt: '2026-09-10T12:00:00Z',
      updatedAt: '2026-09-23T12:30:00Z',
    }
  ];

  const leadActivities: LeadActivity[] = [
    {
      id: 'act_01',
      leadId: 'led_101',
      userId: 'usr_agent_karim',
      userName: 'Karim Hassan',
      type: 'CALL',
      title: 'Introductory Telephone Conference',
      description: 'Discussed unit 1203 floor plan, payment milestones, and expected handover date in Q4 2027.',
      timestamp: '2026-09-19T11:00:00Z',
    },
    {
      id: 'act_02',
      leadId: 'led_101',
      userId: 'usr_agent_karim',
      userName: 'Karim Hassan',
      type: 'OFFER',
      title: 'Submitted Formal Purchase Offer',
      description: 'Client tendered offer of AED 7,650,000 against list price of AED 7,800,000 with 30% upfront.',
      timestamp: '2026-09-23T11:20:00Z',
    },
    {
      id: 'act_03',
      leadId: 'led_102',
      userId: 'usr_agent_nadia',
      userName: 'Nadia Al-Mansoori',
      type: 'MEETING',
      title: 'Private Yacht Tour & Mansion Inspection',
      description: 'Conducted private 2-hour waterside inspection of Palm Jumeirah Mansion 02. Client was delighted by the 80m private beach.',
      timestamp: '2026-09-22T15:30:00Z',
    },
    {
      id: 'act_04',
      leadId: 'led_103',
      userId: 'usr_agent_karim',
      userName: 'Karim Hassan',
      type: 'STAGE_CHANGE',
      title: 'Stage moved to VIEWING',
      description: 'Moved pipeline status to VIEWING following confirmation of virtual tour.',
      timestamp: '2026-09-22T16:00:00Z',
    }
  ];

  const clients: ClientProfile[] = [
    {
      id: 'cli_elena',
      userId: 'usr_client_elena',
      name: 'Elena Rostova',
      email: 'client.elena@octaproperties.com',
      phone: '+44 7700 900123',
      nationality: 'British',
      passportNo: 'GBR84920194',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      budget: 3500000,
      interestedProjects: ['prj_luminar'],
      viewedUnits: ['unt_lum_1201', 'unt_lum_1202'],
      createdAt: '2026-03-10T14:00:00Z',
    }
  ];

  const followUps: FollowUpTask[] = [
    {
      id: 'tsk_01',
      leadId: 'led_101',
      targetName: 'Julian Sterling',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      taskType: 'Follow up on offer',
      dueDate: '2026-09-24T10:00:00Z',
      completed: false,
      priority: 'High',
      notes: 'Present executive committee decision regarding counter-offer of AED 7,725,000.',
    },
    {
      id: 'tsk_02',
      leadId: 'led_102',
      targetName: 'H.E. Amira Al-Kuwari',
      assignedAgentId: 'usr_agent_nadia',
      assignedAgentName: 'Nadia Al-Mansoori',
      taskType: 'Schedule viewing',
      dueDate: '2026-09-24T14:00:00Z',
      completed: false,
      priority: 'High',
      notes: 'Coordinate helicopter transfer for family office advisors to Palm Jumeirah.',
    },
    {
      id: 'tsk_03',
      leadId: 'led_103',
      targetName: 'David Chen',
      assignedAgentId: 'usr_agent_karim',
      assignedAgentName: 'Karim Hassan',
      taskType: 'Send project brochure',
      dueDate: '2026-09-23T17:00:00Z',
      completed: true,
      completedAt: '2026-09-23T12:00:00Z',
      priority: 'Medium',
      notes: 'Transmitted high-res DIFC rental projection analysis.',
    }
  ];

  const appointments: Appointment[] = [
    {
      id: 'app_201',
      clientId: 'cli_elena',
      clientName: 'Elena Rostova',
      clientEmail: 'client.elena@octaproperties.com',
      clientPhone: '+44 7700 900123',
      agentId: 'usr_agent_karim',
      agentName: 'Karim Hassan',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      unitId: 'unt_lum_1202',
      unitNumber: '1202',
      date: '2026-09-25',
      time: '11:00',
      location: 'OCTA Downtown Sales Gallery & Experience Center',
      type: 'Contract Meeting',
      status: 'Confirmed',
      notes: 'Final signing of reservation form and passport verification.',
      createdAt: '2026-09-22T14:00:00Z',
    },
    {
      id: 'app_202',
      clientName: 'David Chen',
      clientEmail: 'd.chen@apextechnologies.sg',
      clientPhone: '+65 9123 4567',
      agentId: 'usr_agent_karim',
      agentName: 'Karim Hassan',
      projectId: 'prj_horizon',
      projectName: 'The Horizon Tower DIFC',
      unitId: 'unt_hor_0801',
      unitNumber: '0801',
      date: '2026-09-26',
      time: '14:30',
      location: 'Virtual Immersive Video Conference (Secure Room)',
      type: 'Virtual Tour',
      status: 'Confirmed',
      notes: 'Live 3D floorplate walk-through and DIFC commercial lease analysis.',
      createdAt: '2026-09-23T08:30:00Z',
    }
  ];

  const investors: Investor[] = [
    {
      id: 'inv_sheikh',
      userId: 'usr_investor_sheikh',
      fullName: 'Tariq Al-Sabah',
      email: 'investor.sheikh@octaproperties.com',
      phone: '+965 99 123 456',
      nationality: 'Kuwaiti',
      taxOrPassportId: 'KWT-99881122',
      totalInvested: 38500000,
      portfolioValue: 44200000,
      totalUnitsCount: 1,
      kycStatus: 'Verified',
      managerId: 'usr_salesmgr',
      managerName: 'Soraya Al-Hashemi',
      createdAt: '2026-03-01T08:00:00Z',
    }
  ];

  const investments: InvestmentRecord[] = [
    {
      id: 'inv_rec_01',
      investorId: 'inv_sheikh',
      investorName: 'Tariq Al-Sabah',
      projectId: 'prj_elysium',
      projectName: 'OCTA Elysium Private Island Mansions',
      unitId: 'unt_ely_01',
      unitNumber: 'Mansion 01',
      purchasePrice: 38500000,
      currentValuation: 44200000,
      currency: 'AED',
      purchaseDate: '2026-03-01',
      amountPaid: 38500000,
      amountOutstanding: 0,
      status: 'Active',
    }
  ];

  const installments: Installment[] = [
    {
      id: 'ins_01',
      investmentId: 'inv_rec_01',
      unitNumber: 'Mansion 01',
      milestoneName: 'Reservation Deposit (10%)',
      percentage: 10,
      amount: 3850000,
      currency: 'AED',
      dueDate: '2026-03-01',
      paidDate: '2026-03-01',
      status: 'Paid',
      paymentMethod: 'Escrow Wire Transfer',
      referenceInvoiceNo: 'INV-OCTA-2026-0089',
    },
    {
      id: 'ins_02',
      investmentId: 'inv_rec_01',
      unitNumber: 'Mansion 01',
      milestoneName: 'Title Deed Handover Completion (90%)',
      percentage: 90,
      amount: 34650000,
      currency: 'AED',
      dueDate: '2026-03-15',
      paidDate: '2026-03-14',
      status: 'Paid',
      paymentMethod: 'Escrow Wire Transfer',
      referenceInvoiceNo: 'INV-OCTA-2026-0104',
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'inv_01',
      invoiceNo: 'INV-OCTA-2026-0089',
      investmentId: 'inv_rec_01',
      recipientName: 'Tariq Al-Sabah',
      recipientEmail: 'investor.sheikh@octaproperties.com',
      unitNumber: 'Mansion 01',
      projectName: 'OCTA Elysium Private Island Mansions',
      amount: 3850000,
      currency: 'AED',
      dueDate: '2026-03-01',
      paidDate: '2026-03-01',
      paymentMethod: 'Escrow Wire Transfer',
      referenceNoBank: 'DXB-ESC-7729104',
      status: 'Paid',
      createdAt: '2026-02-28T09:00:00Z',
    },
    {
      id: 'inv_02',
      invoiceNo: 'INV-OCTA-2026-0104',
      investmentId: 'inv_rec_01',
      recipientName: 'Tariq Al-Sabah',
      recipientEmail: 'investor.sheikh@octaproperties.com',
      unitNumber: 'Mansion 01',
      projectName: 'OCTA Elysium Private Island Mansions',
      amount: 34650000,
      currency: 'AED',
      dueDate: '2026-03-15',
      paidDate: '2026-03-14',
      paymentMethod: 'Escrow Wire Transfer',
      referenceNoBank: 'DXB-ESC-7740281',
      status: 'Paid',
      createdAt: '2026-03-10T11:00:00Z',
    },
    {
      id: 'inv_03',
      invoiceNo: 'INV-OCTA-2026-0182',
      recipientName: 'Elena Rostova',
      recipientEmail: 'client.elena@octaproperties.com',
      unitNumber: '1202',
      projectName: 'OCTA Luminar Sky Residences',
      amount: 590000,
      currency: 'AED',
      dueDate: '2026-09-28',
      status: 'Due',
      paymentMethod: 'Pending Escrow Deposit',
      createdAt: '2026-09-23T08:35:00Z',
    }
  ];

  const documents: DocumentItem[] = [
    {
      id: 'doc_101',
      title: 'OCTA Luminar — Official Architectural Specification & Finishes',
      type: 'Brochure',
      ownerName: 'Alexander Vance',
      relatedProjectId: 'prj_luminar',
      relatedProjectName: 'OCTA Luminar Sky Residences',
      fileSize: '14.8 MB',
      status: 'Approved',
      accessRoles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT', 'INVESTOR', 'CLIENT'],
      downloadUrl: '/docs/OCTA_Luminar_Architectural_Finishes.pdf',
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'doc_102',
      title: 'Sale & Purchase Agreement (SPA) — Mansion 01 Palm Jumeirah',
      type: 'Contract',
      ownerName: 'Claire Beauchamp',
      relatedProjectId: 'prj_elysium',
      relatedProjectName: 'OCTA Elysium Private Island Mansions',
      relatedUnitNumber: 'Mansion 01',
      relatedClientOrInvestorId: 'inv_sheikh',
      fileSize: '4.2 MB',
      status: 'Signed',
      accessRoles: ['ADMIN', 'MANAGEMENT', 'INVESTOR', 'DOCUMENT_MANAGER'],
      downloadUrl: '/docs/SPA_Mansion01_Tariq_AlSabah_Signed.pdf',
      createdAt: '2026-03-14T10:00:00Z',
    },
    {
      id: 'doc_103',
      title: 'DLD Title Deed Certificate — Mansion 01',
      type: 'Legal Document',
      ownerName: 'Claire Beauchamp',
      relatedProjectId: 'prj_elysium',
      relatedProjectName: 'OCTA Elysium Private Island Mansions',
      relatedUnitNumber: 'Mansion 01',
      relatedClientOrInvestorId: 'inv_sheikh',
      fileSize: '2.1 MB',
      status: 'Approved',
      accessRoles: ['ADMIN', 'MANAGEMENT', 'INVESTOR', 'DOCUMENT_MANAGER'],
      downloadUrl: '/docs/DLD_Title_Deed_Mansion01.pdf',
      createdAt: '2026-03-16T12:00:00Z',
    },
    {
      id: 'doc_104',
      title: 'Unit 1202 Reservation Agreement — Elena Rostova',
      type: 'Contract',
      ownerName: 'Karim Hassan',
      relatedProjectId: 'prj_luminar',
      relatedProjectName: 'OCTA Luminar Sky Residences',
      relatedUnitNumber: '1202',
      relatedClientOrInvestorId: 'cli_elena',
      fileSize: '1.8 MB',
      status: 'Draft',
      accessRoles: ['ADMIN', 'MANAGEMENT', 'SALES_AGENT', 'CLIENT'],
      downloadUrl: '/docs/Reservation_1202_Draft.pdf',
      createdAt: '2026-09-23T08:35:00Z',
    }
  ];

  const messages: ChatMessage[] = [
    {
      id: 'msg_01',
      conversationId: 'conv_elena_karim',
      senderId: 'usr_client_elena',
      senderName: 'Elena Rostova',
      senderRole: 'CLIENT',
      recipientId: 'usr_agent_karim',
      propertyContext: 'OCTA Luminar Sky Residences',
      unitContext: 'Unit 1202',
      text: 'Good morning Karim, I have reviewed the terrace layout for 1202. Can you confirm if the private jacuzzi comes pre-installed by the developer?',
      read: true,
      createdAt: '2026-09-23T08:45:00Z',
    },
    {
      id: 'msg_02',
      conversationId: 'conv_elena_karim',
      senderId: 'usr_agent_karim',
      senderName: 'Karim Hassan',
      senderRole: 'SALES_AGENT',
      recipientId: 'usr_client_elena',
      propertyContext: 'OCTA Luminar Sky Residences',
      unitContext: 'Unit 1202',
      text: 'Good morning Elena! Yes, absolutely. All corner suites on Floor 12 include the bespoke Italian thermo-jacuzzi pre-fitted and covered by our 5-year structural warranty.',
      read: true,
      createdAt: '2026-09-23T08:50:00Z',
    },
    {
      id: 'msg_03',
      conversationId: 'conv_investor_soraya',
      senderId: 'usr_investor_sheikh',
      senderName: 'Tariq Al-Sabah',
      senderRole: 'INVESTOR',
      recipientId: 'usr_salesmgr',
      propertyContext: 'OCTA Elysium Private Island Mansions',
      unitContext: 'Mansion 01',
      text: 'Soraya, the landscaping on the private beach looks immaculate. Please advise when the Q3 valuation report will be ready for our family office audit.',
      read: true,
      createdAt: '2026-09-22T19:30:00Z',
    },
    {
      id: 'msg_04',
      conversationId: 'conv_investor_soraya',
      senderId: 'usr_salesmgr',
      senderName: 'Soraya Al-Hashemi',
      senderRole: 'SALES_MANAGER',
      recipientId: 'usr_investor_sheikh',
      propertyContext: 'OCTA Elysium Private Island Mansions',
      unitContext: 'Mansion 01',
      text: 'Your Excellency, the Q3 Knight Frank independent valuation has just been countersigned and is now uploaded to your private Document Vault. It reflects a current asset valuation of AED 44.2M.',
      read: true,
      createdAt: '2026-09-22T19:40:00Z',
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_01',
      roleTarget: 'ALL',
      title: 'Unit 1202 Reserved',
      message: 'Unit 1202 in OCTA Luminar Sky Residences has been locked and reserved for Elena Rostova.',
      type: 'reservation',
      read: false,
      timestamp: '2026-09-23T08:30:00Z',
    },
    {
      id: 'notif_02',
      userId: 'usr_agent_karim',
      title: 'New Formal Offer Received',
      message: 'Julian Sterling submitted an offer of AED 7,650,000 for Unit 1203.',
      type: 'lead',
      read: false,
      timestamp: '2026-09-23T11:20:00Z',
    },
    {
      id: 'notif_03',
      roleTarget: 'ALL',
      title: 'Payment Confirmed',
      message: 'Escrow settlement of AED 34,650,000 recorded for Palm Jumeirah Mansion 01.',
      type: 'payment',
      read: true,
      timestamp: '2026-09-14T11:00:00Z',
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_01',
      userId: 'usr_agent_karim',
      userName: 'Karim Hassan',
      userRole: 'SALES_AGENT',
      action: 'UNIT_RESERVED',
      entity: 'Unit',
      entityId: 'unt_lum_1202',
      oldValue: 'Available',
      newValue: 'Reserved',
      reason: 'Holding deposit submitted by Elena Rostova',
      timestamp: '2026-09-23T08:30:00Z',
    },
    {
      id: 'aud_02',
      userId: 'usr_salesmgr',
      userName: 'Soraya Al-Hashemi',
      userRole: 'SALES_MANAGER',
      action: 'LEAD_REASSIGNED',
      entity: 'Lead',
      entityId: 'led_101',
      oldValue: 'Unassigned',
      newValue: 'Karim Hassan',
      reason: 'Lead matched with Prime Residential Advisor',
      timestamp: '2026-09-18T10:30:00Z',
    },
    {
      id: 'aud_03',
      userId: 'usr_finance',
      userName: 'Marcus Sterling',
      userRole: 'ACCOUNTANT',
      action: 'PAYMENT_RECORDED',
      entity: 'Invoice',
      entityId: 'inv_02',
      oldValue: 'Pending',
      newValue: 'Paid (AED 34,650,000)',
      reason: 'Central Bank Escrow Confirmation No DXB-ESC-7740281',
      timestamp: '2026-03-14T11:00:00Z',
    }
  ];

  const integrations: IntegrationStatus[] = [
    {
      serviceName: 'WhatsApp Cloud API (Meta)',
      category: 'Messaging & Lead Capture',
      status: 'Integration Required',
      description: 'Official Meta Business WhatsApp API webhook for automated brochure delivery and real-time client chat.',
      requiredKeys: ['META_PHONE_NUMBER_ID', 'META_WHATSAPP_TOKEN', 'META_BUSINESS_ACCOUNT_ID'],
      docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
      isSimulatedMock: false,
    },
    {
      serviceName: 'SendGrid / Corporate SMTP Relay',
      category: 'Email Automation',
      status: 'Integration Required',
      description: 'Enterprise transactional email delivery for contracts, reservation receipts, and daily agent task digests.',
      requiredKeys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS_KEY'],
      docsUrl: 'https://sendgrid.com/docs/api-reference',
      isSimulatedMock: false,
    },
    {
      serviceName: 'Dubai Escrow & Central Bank Gateway',
      category: 'Payments & Settlement',
      status: 'Integration Required',
      description: 'Real-time DLD Escrow account verification and SWIFT MT103 automated reconciliation.',
      requiredKeys: ['DLD_ESCROW_MERCHANT_ID', 'CENTRAL_BANK_API_KEY', 'ESCROW_ACCOUNT_IBAN'],
      docsUrl: 'https://dubailand.gov.ae',
      isSimulatedMock: false,
    },
    {
      serviceName: 'Property Finder & Bayut XML Feed',
      category: 'Property Syndication',
      status: 'Integration Required',
      description: 'Automated 2-way synchronization of unit availability, pricing, and high-res media to UAE portals.',
      requiredKeys: ['PROPERTY_FINDER_API_TOKEN', 'BAYUT_AGENT_UID'],
      docsUrl: 'https://hub.propertyfinder.ae',
      isSimulatedMock: false,
    }
  ];

  return {
    users,
    projects,
    units,
    leads,
    leadActivities,
    clients,
    followUps,
    appointments,
    investors,
    investments,
    installments,
    invoices,
    documents,
    messages,
    notifications,
    auditLogs,
    integrations,
  };
}

export function getDb(): DatabaseSchema {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(data);
      return dbInstance!;
    } catch (e) {
      console.error('Failed to parse database file, re-seeding:', e);
    }
  }

  dbInstance = getInitialSeedData();
  saveDb(dbInstance);
  return dbInstance;
}

export function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    dbInstance = db;
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Transactional Unit Reservation with Concurrency Lock
export function reserveUnitSafely(
  unitId: string,
  clientId: string,
  clientName: string,
  agentId: string,
  notes: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; unit?: Unit; error?: string } {
  const db = getDb();
  const unit = db.units.find((u) => u.id === unitId);

  if (!unit) {
    return { success: false, error: 'Unit not found in inventory.' };
  }

  if (unit.status !== 'Available') {
    return {
      success: false,
      error: `Unit ${unit.unitNumber} is currently "${unit.status}" and cannot be reserved. Another agent or buyer has secured this unit.`,
    };
  }

  const oldStatus = unit.status;
  unit.status = 'Reserved';
  unit.reservedByClientId = clientId;
  unit.reservedByClientName = clientName;
  unit.assignedAgentId = agentId;
  unit.reservedAt = new Date().toISOString();
  // 72 hour reservation lock
  const lock = new Date();
  lock.setHours(lock.getHours() + 72);
  unit.lockExpiry = lock.toISOString();
  if (notes) unit.notes = notes;

  // Add Audit Log
  const audit: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'UNIT_RESERVED',
    entity: 'Unit',
    entityId: unit.id,
    oldValue: oldStatus,
    newValue: 'Reserved',
    reason: notes || `Reserved by ${actor.name} for ${clientName}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  // Add Notification
  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    roleTarget: 'ALL',
    title: `Unit ${unit.unitNumber} Reserved`,
    message: `${actor.name} reserved Unit ${unit.unitNumber} (${unit.projectName}) for ${clientName}.`,
    type: 'reservation',
    read: false,
    timestamp: new Date().toISOString(),
  };
  db.notifications.unshift(notif);

  saveDb(db);
  return { success: true, unit };
}

// Release Unit Reservation
export function releaseUnitSafely(
  unitId: string,
  reason: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; unit?: Unit; error?: string } {
  const db = getDb();
  const unit = db.units.find((u) => u.id === unitId);

  if (!unit) {
    return { success: false, error: 'Unit not found in inventory.' };
  }

  if (unit.status !== 'Reserved' && unit.status !== 'Hold') {
    return {
      success: false,
      error: `Unit ${unit.unitNumber} is currently "${unit.status}". Only Reserved or Hold units can be released.`,
    };
  }

  const oldStatus = unit.status;
  unit.status = 'Available';
  unit.reservedByClientId = undefined;
  unit.reservedByClientName = undefined;
  unit.reservedAt = undefined;
  unit.lockExpiry = undefined;

  // Audit Log
  const audit: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'UNIT_RELEASED',
    entity: 'Unit',
    entityId: unit.id,
    oldValue: oldStatus,
    newValue: 'Available',
    reason: reason || 'Reservation expired or released by authorized user.',
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  // Notification
  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    roleTarget: 'ALL',
    title: `Unit ${unit.unitNumber} Released`,
    message: `Unit ${unit.unitNumber} (${unit.projectName}) has been released and is now Available in inventory.`,
    type: 'reservation',
    read: false,
    timestamp: new Date().toISOString(),
  };
  db.notifications.unshift(notif);

  saveDb(db);
  return { success: true, unit };
}

// Calculate Smart Lead Score
export function computeSmartLeadScore(lead: Partial<Lead>): number {
  let score = 25; // Base qualification

  if (lead.budget) {
    if (lead.budget >= 20000000) score += 30;
    else if (lead.budget >= 10000000) score += 25;
    else if (lead.budget >= 4000000) score += 20;
    else if (lead.budget >= 2000000) score += 15;
    else score += 10;
  }

  if (lead.timeline === 'Immediate') score += 20;
  else if (lead.timeline === 'Within 30 Days') score += 15;
  else if (lead.timeline === 'Within 60 Days') score += 10;
  else score += 5;

  if (lead.preferredUnitId) score += 15;
  else if (lead.preferredProjectId) score += 10;

  if (lead.stage === 'NEGOTIATION' || lead.stage === 'OFFER') score += 10;
  if (lead.source === 'Referral' || lead.source === 'Walk-in') score += 5;

  return Math.min(score, 99);
}
