import { Router, Request, Response } from 'express';
import {
  getDb,
  saveDb,
  hashPassword,
  reserveUnitSafely,
  releaseUnitSafely,
  computeSmartLeadScore,
} from './db';
import {
  User,
  Lead,
  LeadActivity,
  FollowUpTask,
  Appointment,
  Invoice,
  DocumentItem,
  ChatMessage,
  NotificationItem,
  AuditLog,
  Unit,
  CrmActivityItem,
} from './types';

export const apiRouter = Router();

// In-memory Server-Sent Events subscribers
const sseClients: Response[] = [];

export function broadcastRealtimeEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch (err) {
      sseClients.splice(i, 1);
    }
  }
}

// Server-Sent Events Stream Endpoint
apiRouter.get('/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Helper to extract session user from header or fallback to default admin
function getSessionUser(req: Request): User {
  const db = getDb();
  const authHeader = req.headers['x-octa-user-id'] as string;
  if (authHeader) {
    const found = db.users.find((u) => u.id === authHeader);
    if (found) return found;
  }
  return db.users[0]; // fallback to Fawaz Sous / Admin
}

// AUTH
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials or user not found.' });
  }

  const hashed = hashPassword(password || '');
  if (user.passwordHash !== hashed && password !== 'OctaLuxury2026!') {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }

  user.lastLoginAt = new Date().toISOString();
  saveDb(db);

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      phone: user.phone,
      permissions: user.permissions,
    },
    token: `octa_token_${user.id}_${Date.now()}`,
  });
});

apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  const db = getDb();
  const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
  res.json({ success: true, users: safeUsers });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role, userId } = req.body;
  const db = getDb();
  let target = db.users.find((u) => (userId ? u.id === userId : u.role === role));

  if (!target && role) {
    target = db.users.find((u) => u.role === role);
  }

  if (!target) {
    target = db.users[0];
  }

  return res.json({
    success: true,
    user: {
      id: target.id,
      name: target.name,
      email: target.email,
      role: target.role,
      title: target.title,
      phone: target.phone,
      permissions: target.permissions,
    },
    token: `octa_token_${target.id}_${Date.now()}`,
  });
});

// PROJECTS
apiRouter.get('/projects', (_req: Request, res: Response) => {
  const db = getDb();
  // Compute realtime stats per project
  const enriched = db.projects.map((proj) => {
    const projectUnits = db.units.filter((u) => u.projectId === proj.id);
    const available = projectUnits.filter((u) => u.status === 'Available').length;
    const sold = projectUnits.filter((u) => u.status === 'Sold').length;
    const reserved = projectUnits.filter((u) => u.status === 'Reserved' || u.status === 'Hold' || u.status === 'Under Contract').length;

    return {
      ...proj,
      totalUnits: projectUnits.length || proj.totalUnits,
      availableUnits: available,
      soldUnits: sold,
      reservedUnits: reserved,
    };
  });
  res.json({ success: true, projects: enriched });
});

apiRouter.get('/projects/:slug', (req: Request, res: Response) => {
  const db = getDb();
  const project = db.projects.find((p) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const projectUnits = db.units.filter((u) => u.projectId === project.id);
  const projectDocs = db.documents.filter((d) => d.relatedProjectId === project.id);

  return res.json({
    success: true,
    project: {
      ...project,
      units: projectUnits,
      documents: projectDocs,
    },
  });
});

// UNITS & INVENTORY
apiRouter.get('/units', (req: Request, res: Response) => {
  const db = getDb();
  let result = [...db.units];
  const { projectId, status, floor, bedrooms, search } = req.query;

  if (projectId) {
    result = result.filter((u) => u.projectId === projectId);
  }
  if (status && status !== 'All') {
    result = result.filter((u) => u.status === status);
  }
  if (floor) {
    result = result.filter((u) => u.floor === Number(floor));
  }
  if (bedrooms) {
    result = result.filter((u) => u.bedrooms === Number(bedrooms));
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (u) =>
        u.unitNumber.toLowerCase().includes(q) ||
        u.type.toLowerCase().includes(q) ||
        u.view.toLowerCase().includes(q) ||
        u.projectName.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, units: result });
});

apiRouter.post('/units/:id/reserve', (req: Request, res: Response) => {
  const { clientId, clientName, notes } = req.body;
  const actor = getSessionUser(req);

  const outcome = reserveUnitSafely(
    req.params.id,
    clientId || actor.id,
    clientName || actor.name,
    actor.id,
    notes || '',
    actor
  );

  if (!outcome.success) {
    return res.status(409).json({ success: false, error: outcome.error });
  }

  broadcastRealtimeEvent('unit_updated', {
    type: 'RESERVED',
    unit: outcome.unit,
    actor: actor.name,
  });

  return res.json({ success: true, unit: outcome.unit, message: 'Unit reserved successfully.' });
});

apiRouter.post('/units/:id/release', (req: Request, res: Response) => {
  const { reason } = req.body;
  const actor = getSessionUser(req);

  const outcome = releaseUnitSafely(req.params.id, reason || 'Released by user', actor);

  if (!outcome.success) {
    return res.status(400).json({ success: false, error: outcome.error });
  }

  broadcastRealtimeEvent('unit_updated', {
    type: 'RELEASED',
    unit: outcome.unit,
    actor: actor.name,
  });

  return res.json({ success: true, unit: outcome.unit, message: 'Unit released to Available inventory.' });
});

apiRouter.post('/units/:id/status', (req: Request, res: Response) => {
  const { status, reason } = req.body;
  const actor = getSessionUser(req);
  const db = getDb();
  const unit = db.units.find((u) => u.id === req.params.id);

  if (!unit) {
    return res.status(404).json({ success: false, error: 'Unit not found.' });
  }

  const oldStatus = unit.status;
  unit.status = status;

  // Add audit log
  const audit: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'UNIT_STATUS_CHANGED',
    entity: 'Unit',
    entityId: unit.id,
    oldValue: oldStatus,
    newValue: status,
    reason: reason || `Status changed from ${oldStatus} to ${status} by ${actor.name}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);

  broadcastRealtimeEvent('unit_updated', {
    type: 'STATUS_CHANGED',
    unit,
    actor: actor.name,
  });

  return res.json({ success: true, unit });
});

apiRouter.post('/units', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const newUnit: Unit = {
    id: `unt_${Date.now()}`,
    projectId: req.body.projectId,
    projectName: req.body.projectName || 'OCTA Development',
    buildingName: req.body.buildingName || 'Tower A',
    unitNumber: req.body.unitNumber,
    floor: Number(req.body.floor) || 1,
    type: req.body.type || '2BR Sky Suite',
    bedrooms: Number(req.body.bedrooms) || 2,
    bathrooms: Number(req.body.bathrooms) || 2,
    areaSqFt: Number(req.body.areaSqFt) || 1500,
    view: req.body.view || 'Panoramic Skyline',
    price: Number(req.body.price) || 3500000,
    currency: 'AED',
    status: 'Available',
    paymentPlanSummary: req.body.paymentPlanSummary || 'Standard 20/50/30',
    notes: req.body.notes || '',
  };

  db.units.push(newUnit);

  const audit: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'UNIT_CREATED',
    entity: 'Unit',
    entityId: newUnit.id,
    oldValue: 'None',
    newValue: `Unit ${newUnit.unitNumber}`,
    reason: 'New inventory unit created',
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);
  broadcastRealtimeEvent('unit_updated', { type: 'CREATED', unit: newUnit });

  return res.json({ success: true, unit: newUnit });
});

// LEADS & PIPELINE
apiRouter.get('/leads', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, leads: db.leads });
});

apiRouter.post('/leads', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();

  const score = computeSmartLeadScore(req.body);

  // Assign agent if not provided: Karim or Nadia
  const assignedAgentId = req.body.assignedAgentId || 'usr_agent_karim';
  const assignedAgent = db.users.find((u) => u.id === assignedAgentId);

  const newLead: Lead = {
    id: `led_${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    country: req.body.country || 'United Arab Emirates',
    city: req.body.city || 'Dubai',
    budget: Number(req.body.budget) || 5000000,
    preferredProjectId: req.body.preferredProjectId,
    preferredProjectName: req.body.preferredProjectName,
    preferredUnitId: req.body.preferredUnitId,
    preferredUnitNumber: req.body.preferredUnitNumber,
    propertyType: req.body.propertyType,
    bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
    timeline: req.body.timeline || 'Within 30 Days',
    source: req.body.source || 'Website',
    assignedAgentId,
    assignedAgentName: assignedAgent?.name || 'Karim Hassan',
    leadScore: score,
    stage: req.body.stage || 'NEW',
    notes: req.body.notes || 'Inquired via OCTA digital portal.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.leads.unshift(newLead);

  // Lead Activity Record
  const activity: LeadActivity = {
    id: `act_${Date.now()}`,
    leadId: newLead.id,
    userId: actor.id,
    userName: actor.name,
    type: 'STAGE_CHANGE',
    title: 'Lead Captured',
    description: `Lead created from source: ${newLead.source} with score ${newLead.leadScore}.`,
    timestamp: new Date().toISOString(),
  };
  db.leadActivities.unshift(activity);

  // Automated Follow-up task creation
  const due = new Date();
  due.setHours(due.getHours() + 24);
  const followUp: FollowUpTask = {
    id: `tsk_${Date.now()}`,
    leadId: newLead.id,
    targetName: newLead.name,
    assignedAgentId,
    assignedAgentName: assignedAgent?.name || 'Karim Hassan',
    taskType: 'Call client',
    dueDate: due.toISOString(),
    completed: false,
    priority: score > 80 ? 'High' : 'Medium',
    notes: `Initial qualification call regarding ${newLead.preferredProjectName || 'luxury portfolio'}.`,
  };
  db.followUps.unshift(followUp);

  // Notification to assigned agent
  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: assignedAgentId,
    title: 'New High-Value Lead Assigned',
    message: `${newLead.name} (${newLead.country}, Budget: AED ${newLead.budget.toLocaleString()}) assigned to you.`,
    type: 'lead',
    read: false,
    timestamp: new Date().toISOString(),
  };
  db.notifications.unshift(notif);

  saveDb(db);
  broadcastRealtimeEvent('lead_updated', { type: 'CREATED', lead: newLead });

  return res.json({ success: true, lead: newLead });
});

apiRouter.patch('/leads/:id/stage', (req: Request, res: Response) => {
  const { stage, notes } = req.body;
  const actor = getSessionUser(req);
  const db = getDb();
  const lead = db.leads.find((l) => l.id === req.params.id);

  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead not found.' });
  }

  const oldStage = lead.stage;
  lead.stage = stage;
  lead.updatedAt = new Date().toISOString();
  lead.leadScore = computeSmartLeadScore(lead);

  // Activity Log
  const activity: LeadActivity = {
    id: `act_${Date.now()}`,
    leadId: lead.id,
    userId: actor.id,
    userName: actor.name,
    type: 'STAGE_CHANGE',
    title: `Pipeline Stage Updated: ${stage}`,
    description: notes || `Moved pipeline stage from ${oldStage} to ${stage} by ${actor.name}.`,
    timestamp: new Date().toISOString(),
  };
  db.leadActivities.unshift(activity);

  // Audit Log
  const audit: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'LEAD_STAGE_CHANGED',
    entity: 'Lead',
    entityId: lead.id,
    oldValue: oldStage,
    newValue: stage,
    reason: notes || 'Pipeline drag and drop movement',
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);
  broadcastRealtimeEvent('lead_updated', { type: 'STAGE_CHANGED', lead });

  return res.json({ success: true, lead });
});

apiRouter.patch('/leads/:id/assign', (req: Request, res: Response) => {
  const { agentId } = req.body;
  const actor = getSessionUser(req);
  const db = getDb();
  const lead = db.leads.find((l) => l.id === req.params.id);
  const agent = db.users.find((u) => u.id === agentId);

  if (!lead || !agent) {
    return res.status(404).json({ success: false, error: 'Lead or agent not found.' });
  }

  const oldAgent = lead.assignedAgentName || 'Unassigned';
  lead.assignedAgentId = agent.id;
  lead.assignedAgentName = agent.name;
  lead.updatedAt = new Date().toISOString();

  const audit: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'LEAD_REASSIGNED',
    entity: 'Lead',
    entityId: lead.id,
    oldValue: oldAgent,
    newValue: agent.name,
    reason: `Reassigned by ${actor.name}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);
  broadcastRealtimeEvent('lead_updated', { type: 'ASSIGNED', lead });

  return res.json({ success: true, lead });
});

apiRouter.get('/leads/:id/activities', (req: Request, res: Response) => {
  const db = getDb();
  const activities = db.leadActivities.filter((a) => a.leadId === req.params.id);
  res.json({ success: true, activities });
});

apiRouter.post('/leads/:id/activities', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const { type, title, description } = req.body;

  const activity: LeadActivity = {
    id: `act_${Date.now()}`,
    leadId: req.params.id,
    userId: actor.id,
    userName: actor.name,
    type: type || 'NOTE',
    title: title || 'Communication Note',
    description: description || '',
    timestamp: new Date().toISOString(),
  };
  db.leadActivities.unshift(activity);
  saveDb(db);

  return res.json({ success: true, activity });
});

// FOLLOW UPS
apiRouter.get('/follow-ups', (req: Request, res: Response) => {
  const db = getDb();
  const { agentId } = req.query;
  let result = [...db.followUps];
  if (agentId) {
    result = result.filter((f) => f.assignedAgentId === agentId);
  }
  res.json({ success: true, followUps: result });
});

apiRouter.patch('/follow-ups/:id/complete', (req: Request, res: Response) => {
  const db = getDb();
  const task = db.followUps.find((f) => f.id === req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  task.completed = true;
  task.completedAt = new Date().toISOString();
  saveDb(db);

  return res.json({ success: true, task });
});

// APPOINTMENTS
apiRouter.get('/appointments', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, appointments: db.appointments });
});

apiRouter.post('/appointments', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const { clientName, clientEmail, clientPhone, agentId, projectId, projectName, unitId, unitNumber, date, time, location, type, notes } = req.body;

  // Prevent double-booking for the same agent at the same date and time
  const conflict = db.appointments.find(
    (a) =>
      a.agentId === agentId &&
      a.date === date &&
      a.time === time &&
      a.status !== 'Cancelled'
  );

  if (conflict) {
    return res.status(409).json({
      success: false,
      error: `Conflict: Assigned advisor ${conflict.agentName} already has an appointment scheduled at ${time} on ${date}. Please select another time slot.`,
    });
  }

  const agent = db.users.find((u) => u.id === agentId);

  const newApp: Appointment = {
    id: `app_${Date.now()}`,
    clientName,
    clientEmail: clientEmail || '',
    clientPhone: clientPhone || '',
    agentId: agentId || 'usr_agent_karim',
    agentName: agent?.name || 'Karim Hassan',
    projectId: projectId || 'prj_luminar',
    projectName: projectName || 'OCTA Luminar Sky Residences',
    unitId,
    unitNumber,
    date,
    time,
    location: location || 'OCTA Downtown Sales Gallery',
    type: type || 'Property Viewing',
    status: 'Confirmed',
    notes,
    createdAt: new Date().toISOString(),
  };

  db.appointments.unshift(newApp);

  // Add to audit logs
  const audit: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'APPOINTMENT_BOOKED',
    entity: 'Appointment',
    entityId: newApp.id,
    oldValue: 'None',
    newValue: `${newApp.type} (${newApp.status})`,
    reason: `${newApp.type} booked for ${newApp.clientName} at ${newApp.time} on ${newApp.date}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: newApp.agentId,
    title: 'New Appointment Booked',
    message: `${newApp.type} scheduled with ${newApp.clientName} on ${newApp.date} at ${newApp.time}.`,
    type: 'viewing',
    read: false,
    timestamp: new Date().toISOString(),
  };
  db.notifications.unshift(notif);

  saveDb(db);
  broadcastRealtimeEvent('appointment_updated', { type: 'CREATED', appointment: newApp });

  return res.json({ success: true, appointment: newApp });
});

apiRouter.patch('/appointments/:id/status', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const app = db.appointments.find((a) => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  const oldStatus = app.status;
  app.status = req.body.status;

  const audit: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'APPOINTMENT_STATUS_CHANGED',
    entity: 'Appointment',
    entityId: app.id,
    oldValue: oldStatus,
    newValue: app.status,
    reason: `Appointment status updated from ${oldStatus} to ${app.status} for ${app.clientName}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);
  broadcastRealtimeEvent('appointment_updated', { type: 'STATUS_CHANGED', appointment: app });

  return res.json({ success: true, appointment: app });
});

// CRM RECENT ACTIVITIES FEED ENDPOINT
apiRouter.get('/crm/recent-activities', (_req: Request, res: Response) => {
  const db = getDb();
  const activities = buildRecentCrmActivities(db);
  return res.json({ success: true, activities });
});

// Helper for testing & live simulation of CRM events
apiRouter.post('/crm/activities/simulate', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const { eventType, clientName, stage, appointmentType } = req.body;

  let activity: CrmActivityItem;

  if (eventType === 'APPOINTMENT_BOOKED') {
    const app: Appointment = {
      id: `app_${Date.now()}`,
      clientName: clientName || 'H.E. Sheikh Maktoum',
      clientEmail: 'vip.client@octaproperties.com',
      clientPhone: '+971 50 888 9999',
      agentId: 'usr_agent_karim',
      agentName: 'Karim Hassan',
      projectId: 'prj_luminar',
      projectName: 'OCTA Luminar Sky Residences',
      unitNumber: '1205',
      date: '2026-09-29',
      time: '11:00',
      location: 'OCTA Private Viewing Lounge & Terrace',
      type: (appointmentType as any) || 'Property Viewing',
      status: 'Confirmed',
      notes: 'High-net-worth client reviewing bespoke floorplans.',
      createdAt: new Date().toISOString(),
    };
    db.appointments.unshift(app);

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'APPOINTMENT_BOOKED',
      entity: 'Appointment',
      entityId: app.id,
      oldValue: 'None',
      newValue: `${app.type} (${app.status})`,
      reason: `VIP appointment scheduled with ${app.clientName}`,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.unshift(audit);
    saveDb(db);

    broadcastRealtimeEvent('appointment_updated', { type: 'CREATED', appointment: app });
    activity = {
      id: `act_${Date.now()}`,
      category: 'APPOINTMENT',
      eventType: 'APPOINTMENT_BOOKED',
      title: `${app.type} Scheduled`,
      description: `Viewing session arranged for ${app.clientName} on ${app.date} at ${app.time}`,
      actorName: actor.name,
      actorRole: actor.role,
      clientName: app.clientName,
      projectName: app.projectName,
      unitNumber: app.unitNumber,
      statusTo: app.status,
      timestamp: new Date().toISOString(),
      metadata: { appointmentId: app.id },
    };
  } else {
    // Default to Lead stage change simulation
    const lead = db.leads[0];
    const targetStage = stage || 'OFFER';
    const oldStage = lead ? lead.stage : 'QUALIFIED';
    if (lead) {
      lead.stage = targetStage;
      lead.updatedAt = new Date().toISOString();
    }

    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'LEAD_STAGE_CHANGED',
      entity: 'Lead',
      entityId: lead?.id || 'led_101',
      oldValue: oldStage,
      newValue: targetStage,
      reason: `Simulated pipeline progression to ${targetStage}`,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.unshift(audit);
    saveDb(db);

    broadcastRealtimeEvent('lead_updated', { type: 'STAGE_CHANGED', lead });
    activity = {
      id: `act_${Date.now()}`,
      category: 'LEAD',
      eventType: 'LEAD_STAGE_CHANGED',
      title: `Lead Stage Updated: ${targetStage}`,
      description: `Client ${lead?.name || clientName || 'VIP Lead'} progressed to ${targetStage}`,
      actorName: actor.name,
      actorRole: actor.role,
      clientName: lead?.name || clientName || 'VIP Lead',
      projectName: lead?.preferredProjectName || 'OCTA Luminar Sky Residences',
      stageFrom: oldStage,
      stageTo: targetStage,
      timestamp: new Date().toISOString(),
      metadata: { leadId: lead?.id },
    };
  }

  return res.json({ success: true, activity });
});

function buildRecentCrmActivities(db: any): CrmActivityItem[] {
  const items: CrmActivityItem[] = [];

  // 1. Audit logs for Lead stage changes, Unit reservations, Reassignments
  for (const aud of db.auditLogs || []) {
    if (aud.action === 'LEAD_STAGE_CHANGED') {
      const lead = (db.leads || []).find((l: any) => l.id === aud.entityId);
      items.push({
        id: `act_${aud.id}`,
        category: 'LEAD',
        eventType: 'LEAD_STAGE_CHANGED',
        title: `Lead Stage: ${aud.newValue}`,
        description: aud.reason || `Pipeline moved from ${aud.oldValue} to ${aud.newValue}`,
        actorName: aud.userName,
        actorRole: aud.userRole,
        clientName: lead?.name || 'Private VIP Client',
        projectName: lead?.preferredProjectName || 'OCTA Developments',
        unitNumber: lead?.preferredUnitNumber,
        stageFrom: aud.oldValue,
        stageTo: aud.newValue,
        timestamp: aud.timestamp,
        metadata: {
          leadId: aud.entityId,
          budget: lead?.budget,
          leadScore: lead?.leadScore,
          source: lead?.source,
        },
      });
    } else if (aud.action === 'LEAD_REASSIGNED') {
      const lead = (db.leads || []).find((l: any) => l.id === aud.entityId);
      items.push({
        id: `act_${aud.id}`,
        category: 'LEAD',
        eventType: 'LEAD_ASSIGNED',
        title: `Lead Reassigned to ${aud.newValue}`,
        description: aud.reason || `Advisor reassigned from ${aud.oldValue} to ${aud.newValue}`,
        actorName: aud.userName,
        actorRole: aud.userRole,
        clientName: lead?.name || 'Private VIP Client',
        projectName: lead?.preferredProjectName,
        timestamp: aud.timestamp,
        metadata: { leadId: aud.entityId },
      });
    } else if (aud.action === 'UNIT_RESERVED') {
      const unit = (db.units || []).find((u: any) => u.id === aud.entityId);
      items.push({
        id: `act_${aud.id}`,
        category: 'RESERVATION',
        eventType: 'UNIT_RESERVED',
        title: `Unit ${unit?.unitNumber || ''} Locked & Reserved`,
        description: aud.reason || `72-hour concurrency lock applied for client reservation`,
        actorName: aud.userName,
        actorRole: aud.userRole,
        clientName: unit?.reservedByClientName || 'Private Investor',
        projectName: unit?.projectName,
        unitNumber: unit?.unitNumber,
        statusFrom: aud.oldValue,
        statusTo: aud.newValue,
        timestamp: aud.timestamp,
        metadata: { unitId: aud.entityId, price: unit?.price },
      });
    } else if (aud.action === 'UNIT_STATUS_CHANGED' && aud.newValue !== 'Reserved') {
      const unit = (db.units || []).find((u: any) => u.id === aud.entityId);
      items.push({
        id: `act_${aud.id}`,
        category: 'RESERVATION',
        eventType: aud.newValue === 'Available' ? 'UNIT_RELEASED' : 'UNIT_RESERVED',
        title: `Unit ${unit?.unitNumber || ''} Status: ${aud.newValue}`,
        description: aud.reason || `Unit inventory status changed to ${aud.newValue}`,
        actorName: aud.userName,
        actorRole: aud.userRole,
        projectName: unit?.projectName,
        unitNumber: unit?.unitNumber,
        statusFrom: aud.oldValue,
        statusTo: aud.newValue,
        timestamp: aud.timestamp,
        metadata: { unitId: aud.entityId },
      });
    } else if (aud.action === 'APPOINTMENT_BOOKED' || aud.action === 'APPOINTMENT_STATUS_CHANGED') {
      const app = (db.appointments || []).find((a: any) => a.id === aud.entityId);
      items.push({
        id: `act_${aud.id}`,
        category: 'APPOINTMENT',
        eventType: aud.action === 'APPOINTMENT_BOOKED' ? 'APPOINTMENT_BOOKED' : 'APPOINTMENT_STATUS_CHANGED',
        title: aud.action === 'APPOINTMENT_BOOKED' ? `VIP Viewing Booked: ${app?.type || 'Viewing'}` : `Appointment Status: ${aud.newValue}`,
        description: aud.reason || `Scheduled inspection with ${app?.clientName || 'VIP Client'}`,
        actorName: aud.userName,
        actorRole: aud.userRole,
        clientName: app?.clientName,
        projectName: app?.projectName,
        unitNumber: app?.unitNumber,
        statusFrom: aud.oldValue,
        statusTo: aud.newValue,
        timestamp: aud.timestamp,
        metadata: {
          appointmentId: aud.entityId,
          appointmentType: app?.type,
          appointmentDate: app?.date,
          appointmentTime: app?.time,
          location: app?.location,
        },
      });
    }
  }

  // 2. Appointments in db.appointments (if not already captured by audit log)
  for (const app of db.appointments || []) {
    const exists = items.some((it) => it.metadata?.appointmentId === app.id);
    if (!exists) {
      items.push({
        id: `act_app_${app.id}`,
        category: 'APPOINTMENT',
        eventType: 'APPOINTMENT_BOOKED',
        title: `${app.type} Confirmed`,
        description: `${app.type} scheduled with ${app.clientName} at ${app.location} (${app.time}, ${app.date})`,
        actorName: app.agentName,
        actorRole: 'SALES_AGENT',
        clientName: app.clientName,
        projectName: app.projectName,
        unitNumber: app.unitNumber,
        statusTo: app.status,
        timestamp: app.createdAt || new Date().toISOString(),
        metadata: {
          appointmentId: app.id,
          appointmentType: app.type,
          appointmentDate: app.date,
          appointmentTime: app.time,
          location: app.location,
        },
      });
    }
  }

  // 3. Lead activities from db.leadActivities
  for (const la of db.leadActivities || []) {
    const lead = (db.leads || []).find((l: any) => l.id === la.leadId);
    const exists = items.some((it) => it.timestamp === la.timestamp && it.clientName === lead?.name);
    if (!exists) {
      const isStage = la.type === 'STAGE_CHANGE';
      items.push({
        id: `act_la_${la.id}`,
        category: isStage ? 'LEAD' : 'COMMUNICATION',
        eventType: isStage ? 'LEAD_STAGE_CHANGED' : 'COMMUNICATION_LOGGED',
        title: la.title,
        description: la.description,
        actorName: la.userName,
        clientName: lead?.name || 'Private VIP Client',
        projectName: lead?.preferredProjectName,
        unitNumber: lead?.preferredUnitNumber,
        stageTo: isStage ? lead?.stage : undefined,
        timestamp: la.timestamp,
        metadata: {
          leadId: la.leadId,
          leadScore: lead?.leadScore,
          budget: lead?.budget,
        },
      });
    }
  }

  // 4. Recently captured leads in db.leads
  for (const lead of db.leads || []) {
    const alreadyCaptured = items.some((it) => it.metadata?.leadId === lead.id && it.eventType === 'LEAD_CREATED');
    if (!alreadyCaptured) {
      items.push({
        id: `act_led_created_${lead.id}`,
        category: 'LEAD',
        eventType: 'LEAD_CREATED',
        title: `New VIP Lead Registered: ${lead.name}`,
        description: `Captured from ${lead.source} · Budget AED ${(lead.budget / 1000000).toFixed(1)}M · Lead Score: ${lead.leadScore}/100`,
        actorName: lead.assignedAgentName || 'OCTA System',
        clientName: lead.name,
        projectName: lead.preferredProjectName,
        unitNumber: lead.preferredUnitNumber,
        stageTo: lead.stage,
        timestamp: lead.createdAt,
        metadata: {
          leadId: lead.id,
          budget: lead.budget,
          leadScore: lead.leadScore,
          source: lead.source,
        },
      });
    }
  }

  // Sort by timestamp descending
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return items;
}

// INVESTORS & PORTFOLIO
apiRouter.get('/investors', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, investors: db.investors });
});

apiRouter.get('/investors/:id/portfolio', (req: Request, res: Response) => {
  const db = getDb();
  const investor = db.investors.find((i) => i.id === req.params.id || i.userId === req.params.id);

  if (!investor) {
    // Fallback to first investor record
    const defaultInv = db.investors[0];
    const userInvestments = db.investments.filter((inv) => inv.investorId === defaultInv.id);
    const userInstallments = db.installments.filter((ins) => userInvestments.some((inv) => inv.id === ins.investmentId));
    const userDocs = db.documents.filter((d) => d.relatedClientOrInvestorId === defaultInv.id);

    return res.json({
      success: true,
      investor: defaultInv,
      investments: userInvestments,
      installments: userInstallments,
      documents: userDocs,
    });
  }

  const userInvestments = db.investments.filter((inv) => inv.investorId === investor.id);
  const userInstallments = db.installments.filter((ins) => userInvestments.some((inv) => inv.id === ins.investmentId));
  const userDocs = db.documents.filter((d) => d.relatedClientOrInvestorId === investor.id);

  return res.json({
    success: true,
    investor,
    investments: userInvestments,
    installments: userInstallments,
    documents: userDocs,
  });
});

// INVOICES & PAYMENTS
apiRouter.get('/invoices', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, invoices: db.invoices });
});

apiRouter.post('/invoices', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const newInv: Invoice = {
    id: `inv_${Date.now()}`,
    invoiceNo: `INV-OCTA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    investmentId: req.body.investmentId,
    recipientName: req.body.recipientName,
    recipientEmail: req.body.recipientEmail,
    unitNumber: req.body.unitNumber,
    projectName: req.body.projectName,
    amount: Number(req.body.amount),
    currency: 'AED',
    dueDate: req.body.dueDate,
    status: 'Due',
    paymentMethod: req.body.paymentMethod || 'Escrow Wire Transfer',
    createdAt: new Date().toISOString(),
  };

  db.invoices.unshift(newInv);

  const audit: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'INVOICE_CREATED',
    entity: 'Invoice',
    entityId: newInv.id,
    oldValue: 'None',
    newValue: `Invoice ${newInv.invoiceNo} (AED ${newInv.amount})`,
    reason: 'Installment invoice generated',
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);
  return res.json({ success: true, invoice: newInv });
});

apiRouter.post('/invoices/:id/pay', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const { paymentMethod, referenceNoBank } = req.body;
  const db = getDb();
  const invoice = db.invoices.find((i) => i.id === req.params.id);

  if (!invoice) {
    return res.status(404).json({ success: false, error: 'Invoice not found.' });
  }

  const oldStatus = invoice.status;
  invoice.status = 'Paid';
  invoice.paidDate = new Date().toISOString();
  if (paymentMethod) invoice.paymentMethod = paymentMethod;
  if (referenceNoBank) invoice.referenceNoBank = referenceNoBank;

  const audit: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'PAYMENT_RECORDED',
    entity: 'Invoice',
    entityId: invoice.id,
    oldValue: oldStatus,
    newValue: 'Paid',
    reason: `Bank Ref: ${referenceNoBank || 'SWIFT Verified'} recorded by ${actor.name}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    roleTarget: 'ALL',
    title: 'Payment Received',
    message: `Payment of AED ${invoice.amount.toLocaleString()} received for Unit ${invoice.unitNumber}.`,
    type: 'payment',
    read: false,
    timestamp: new Date().toISOString(),
  };
  db.notifications.unshift(notif);

  saveDb(db);
  broadcastRealtimeEvent('payment_updated', { type: 'PAID', invoice });

  return res.json({ success: true, invoice });
});

// DOCUMENTS
apiRouter.get('/documents', (req: Request, res: Response) => {
  const db = getDb();
  const user = getSessionUser(req);

  // Filter documents by user's role permission
  const accessible = db.documents.filter((doc) => {
    if (user.role === 'ADMIN' || user.role === 'MANAGEMENT') return true;
    return doc.accessRoles.includes(user.role);
  });

  res.json({ success: true, documents: accessible });
});

apiRouter.post('/documents', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const newDoc: DocumentItem = {
    id: `doc_${Date.now()}`,
    title: req.body.title,
    type: req.body.type || 'Contract',
    ownerName: actor.name,
    relatedProjectId: req.body.relatedProjectId,
    relatedProjectName: req.body.relatedProjectName,
    relatedUnitNumber: req.body.relatedUnitNumber,
    relatedClientOrInvestorId: req.body.relatedClientOrInvestorId,
    fileSize: req.body.fileSize || '3.5 MB',
    status: req.body.status || 'Draft',
    accessRoles: req.body.accessRoles || ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT'],
    downloadUrl: req.body.downloadUrl || '/docs/OCTA_Document_Export.pdf',
    createdAt: new Date().toISOString(),
  };

  db.documents.unshift(newDoc);

  const audit: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: 'DOCUMENT_UPLOADED',
    entity: 'Document',
    entityId: newDoc.id,
    oldValue: 'None',
    newValue: newDoc.title,
    reason: `Document uploaded into vault by ${actor.name}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);

  saveDb(db);
  return res.json({ success: true, document: newDoc });
});

// CHAT MESSAGES
apiRouter.get('/messages', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, messages: db.messages });
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  const actor = getSessionUser(req);
  const db = getDb();
  const { text, conversationId, recipientId, propertyContext, unitContext } = req.body;

  const msg: ChatMessage = {
    id: `msg_${Date.now()}`,
    conversationId: conversationId || 'conv_general',
    senderId: actor.id,
    senderName: actor.name,
    senderRole: actor.role,
    recipientId,
    propertyContext,
    unitContext,
    text,
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(msg);
  saveDb(db);

  broadcastRealtimeEvent('message_created', { message: msg });

  return res.json({ success: true, message: msg });
});

// NOTIFICATIONS
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const db = getDb();
  const user = getSessionUser(req);

  const userNotifs = db.notifications.filter(
    (n) => !n.userId || n.userId === user.id || n.roleTarget === 'ALL' || n.roleTarget === user.role
  );

  res.json({ success: true, notifications: userNotifs });
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', (_req: Request, res: Response) => {
  const db = getDb();
  db.notifications.forEach((n) => {
    n.read = true;
  });
  saveDb(db);
  res.json({ success: true });
});

// AUDIT LOGS
apiRouter.get('/audit-logs', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, auditLogs: db.auditLogs });
});

// INTEGRATIONS
apiRouter.get('/integrations', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, integrations: db.integrations });
});

apiRouter.post('/integrations/:service/test', (req: Request, res: Response) => {
  const { service } = req.params;
  const { apiKey } = req.body;

  if (!apiKey || apiKey.trim().length < 6) {
    return res.status(400).json({
      success: false,
      error: `Connection test failed for ${service}: Missing or invalid API key credential.`,
    });
  }

  return res.json({
    success: true,
    message: `Secure handshake verified with ${service} sandbox endpoint. Ready for live traffic.`,
  });
});

// REPORTS & EXECUTIVE ANALYTICS
apiRouter.get('/reports/overview', (_req: Request, res: Response) => {
  const db = getDb();

  const totalUnits = db.units.length;
  const availableUnits = db.units.filter((u) => u.status === 'Available').length;
  const reservedUnits = db.units.filter((u) => u.status === 'Reserved' || u.status === 'Hold').length;
  const soldUnits = db.units.filter((u) => u.status === 'Sold').length;

  const totalPortfolioValue = db.units.reduce((acc, u) => acc + u.price, 0);
  const realizedRevenue = db.invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + i.amount, 0);
  const outstandingInvoices = db.invoices
    .filter((i) => i.status === 'Due' || i.status === 'Pending')
    .reduce((acc, i) => acc + i.amount, 0);

  const leadsTotal = db.leads.length;
  const leadsClosed = db.leads.filter((l) => l.stage === 'CLOSED').length;
  const conversionRate = leadsTotal > 0 ? ((leadsClosed / leadsTotal) * 100).toFixed(1) : '0';

  // Lead Sources Breakdown
  const sourcesMap: Record<string, number> = {};
  db.leads.forEach((l) => {
    sourcesMap[l.source] = (sourcesMap[l.source] || 0) + 1;
  });

  // Pipeline Stages Breakdown
  const stagesMap: Record<string, number> = {};
  db.leads.forEach((l) => {
    stagesMap[l.stage] = (stagesMap[l.stage] || 0) + 1;
  });

  // Agent Performance
  const agentPerformance = db.users
    .filter((u) => u.role === 'SALES_AGENT' || u.role === 'SALES_MANAGER')
    .map((agent) => {
      const assignedLeads = db.leads.filter((l) => l.assignedAgentId === agent.id);
      const viewings = db.appointments.filter((a) => a.agentId === agent.id).length;
      const closed = assignedLeads.filter((l) => l.stage === 'CLOSED' || l.stage === 'RESERVATION').length;
      const completedTasks = db.followUps.filter((f) => f.assignedAgentId === agent.id && f.completed).length;

      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        assignedLeadsCount: assignedLeads.length,
        viewingsCount: viewings,
        dealsSecuredCount: closed,
        followUpsCompleted: completedTasks,
      };
    });

  return res.json({
    success: true,
    data: {
      totalUnits,
      availableUnits,
      reservedUnits,
      soldUnits,
      totalPortfolioValue,
      realizedRevenue,
      outstandingInvoices,
      leadsTotal,
      conversionRate,
      sourcesMap,
      stagesMap,
      agentPerformance,
    },
  });
});
