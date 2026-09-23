import React, { useState, useEffect } from 'react';
import { Lead, LeadStage, LeadSource, LeadActivity, User } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  Shield,
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
  FileText,
  Building,
} from 'lucide-react';

const PIPELINE_STAGES: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTY INTEREST',
  'VIEWING',
  'OFFER',
  'NEGOTIATION',
  'RESERVATION',
  'CONTRACT',
  'CLOSED',
  'LOST',
];

interface LeadsPipelineProps {
  onSelectLead?: (lead: Lead) => void;
}

export const LeadsPipeline: React.FC<LeadsPipelineProps> = () => {
  const { currentUser, role, refreshTrigger } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);
  const [activityNote, setActivityNote] = useState('');
  const [activityType, setActivityType] = useState('CALL');
  const [createLeadModalOpen, setCreateLeadModalOpen] = useState(false);
  const [agents, setAgents] = useState<User[]>([]);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    budget: '6500000',
    propertyType: '3BR Sky Suite',
    preferredProjectName: 'OCTA Luminar Sky Residences',
    timeline: 'Within 30 Days',
    source: 'Website' as LeadSource,
    notes: '',
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      const [leadsList, usersList] = await Promise.all([api.getLeads(), api.getUsers()]);
      setLeads(leadsList);
      setAgents(usersList.filter((u) => u.role === 'SALES_AGENT' || u.role === 'SALES_MANAGER'));
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [refreshTrigger]);

  const loadLeadDetails = async (lead: Lead) => {
    setSelectedLead(lead);
    try {
      const acts = await api.getLeadActivities(lead.id);
      setLeadActivities(acts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    try {
      const res = await api.updateLeadStage(leadId, newStage);
      if (res.success) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? res.lead : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead(res.lead);
          loadLeadDetails(res.lead);
        }
      }
    } catch (err) {
      console.error('Error changing stage:', err);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activityNote.trim()) return;

    try {
      const res = await api.addLeadActivity(selectedLead.id, {
        type: activityType,
        title: `${activityType} Logged`,
        description: activityNote.trim(),
      });
      if (res.success) {
        setLeadActivities((prev) => [res.activity, ...prev]);
        setActivityNote('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createLead({
        ...newLeadForm,
        budget: Number(newLeadForm.budget),
      });
      if (res.success) {
        setCreateLeadModalOpen(false);
        setNewLeadForm({
          name: '',
          email: '',
          phone: '',
          country: 'United Arab Emirates',
          city: 'Dubai',
          budget: '6500000',
          propertyType: '3BR Sky Suite',
          preferredProjectName: 'OCTA Luminar Sky Residences',
          timeline: 'Within 30 Days',
          source: 'Website',
          notes: '',
        });
        loadLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    if (agentFilter !== 'ALL' && l.assignedAgentId !== agentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    if (score >= 70) return 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10';
    return 'text-[#94A3B8] border-[#475569]/30 bg-[#1E293B]/20';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              OCTA Client Relationship Management
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">· LIVE CRM PIPELINE</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
            Institutional & Private Lead Pipeline
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Automated lead scoring, multi-tier stage progression, and persistent interaction logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateLeadModalOpen(true)}
            className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] text-xs font-semibold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="w-4 h-4" />
            Capture New Lead
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111720] border border-[#1E293B] p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Agent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">Advisor:</span>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] px-2.5 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="ALL">All Advisors ({agents.length})</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by client name, email, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <div className="text-[11px] text-[#94A3B8] font-mono self-end sm:self-auto">
          Active Leads: <span className="text-[#D4AF37] font-bold">{filteredLeads.length}</span>
        </div>
      </div>

      {/* HORIZONTAL KANBAN PIPELINE BOARD */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B] text-xs">Synchronizing pipeline records...</div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-3 min-w-[1700px]">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stage);
              const stageValue = stageLeads.reduce((acc, l) => acc + l.budget, 0);

              return (
                <div
                  key={stage}
                  className="w-72 shrink-0 bg-[#0C1117] border border-[#1E293B] rounded-lg flex flex-col max-h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#1E293B] bg-[#090D11] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#E2E8F0] text-[11px] tracking-wide">
                        {stage}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B]">
                        AED {(stageValue / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-[#1A232E] text-[#D4AF37] text-[10px] font-mono font-bold flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Column Cards List */}
                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[#475569] border border-dashed border-[#1E293B] rounded">
                        No leads in stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const currentStageIdx = PIPELINE_STAGES.indexOf(lead.stage);
                        const nextStage = PIPELINE_STAGES[currentStageIdx + 1];

                        return (
                          <div
                            key={lead.id}
                            onClick={() => loadLeadDetails(lead)}
                            className="bg-[#111720] border border-[#1E293B] hover:border-[#D4AF37]/50 rounded p-3 text-xs cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-[#F3F4F6] hover:text-[#D4AF37] truncate text-[12px]">
                                {lead.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${getScoreColor(
                                  lead.leadScore
                                )}`}
                              >
                                Score {lead.leadScore}
                              </span>
                            </div>

                            <div className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1">
                              <span>{lead.city}, {lead.country}</span>
                              <span>·</span>
                              <span className="text-[#D4AF37]">{lead.source}</span>
                            </div>

                            <div className="mt-2 text-[11px] font-mono text-[#E2E8F0]">
                              Budget: <span className="text-[#D4AF37] font-semibold">AED {lead.budget.toLocaleString()}</span>
                            </div>

                            <div className="text-[10px] text-[#64748B] mt-1 truncate">
                              Interest: {lead.preferredProjectName || lead.propertyType}
                            </div>

                            <div className="mt-2 pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px]">
                              <span className="text-[#64748B] truncate max-w-[110px]">
                                {lead.assignedAgentName || 'Advisor'}
                              </span>

                              {nextStage && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageChange(lead.id, nextStage);
                                  }}
                                  title={`Advance to ${nextStage}`}
                                  className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#D4AF37] hover:text-[#0B0F12] text-[#94A3B8] transition-colors flex items-center gap-1 cursor-pointer font-mono"
                                >
                                  Advance →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CLIENT 360 & LEAD PROFILE DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-2xl w-full p-6 text-xs relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37]">
                Client 360 Comprehensive Dossier
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getScoreColor(selectedLead.leadScore)}`}>
                Smart Score: {selectedLead.leadScore} / 100
              </span>
            </div>

            <h2 className="font-cinzel text-xl sm:text-2xl text-[#F3F4F6] font-bold mt-1">
              {selectedLead.name}
            </h2>
            <p className="text-[#94A3B8] mt-0.5">
              {selectedLead.city}, {selectedLead.country} · Inquired via {selectedLead.source}
            </p>

            {/* Quick Contact & Budget Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#090D11] border border-[#1E293B] p-3 rounded my-4">
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Budget Target</div>
                <div className="font-mono text-sm font-bold text-[#D4AF37]">
                  AED {selectedLead.budget.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Timeline</div>
                <div className="font-mono text-sm text-[#E2E8F0]">{selectedLead.timeline}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Current Stage</div>
                <div className="font-mono text-sm text-cyan-400">{selectedLead.stage}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Advisor</div>
                <div className="font-mono text-sm text-[#E2E8F0] truncate">
                  {selectedLead.assignedAgentName}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 p-3 bg-[#090D11] border border-[#1E293B] rounded text-[#CBD5E1]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> Email:
                </span>
                <span className="font-mono">{selectedLead.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> Phone:
                </span>
                <span className="font-mono">{selectedLead.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#D4AF37]" /> Target Property:
                </span>
                <span>{selectedLead.preferredProjectName} ({selectedLead.propertyType})</span>
              </div>
            </div>

            {/* Stage Quick Movement Selector */}
            <div className="my-4">
              <label className="block text-[10px] uppercase font-mono text-[#64748B] mb-1">
                Advance Stage:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PIPELINE_STAGES.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStageChange(selectedLead.id, st)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                      selectedLead.stage === st
                        ? 'bg-[#D4AF37] text-[#0B0F12] font-bold'
                        : 'bg-[#1E293B] text-[#94A3B8] hover:text-[#E2E8F0]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Activity Form */}
            <form onSubmit={handleAddActivity} className="my-4 p-3 bg-[#090D11] border border-[#1E293B] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#E2E8F0]">Log Communication / Note</span>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="bg-[#16202C] border border-[#2A3749] text-[#E2E8F0] px-2 py-0.5 rounded text-[11px]"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">In-Person Meeting</option>
                  <option value="OFFER">Offer Tender</option>
                  <option value="NOTE">Internal Note</option>
                </select>
              </div>
              <textarea
                rows={2}
                required
                placeholder="Log conversation details, client requirements, offer terms..."
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                className="w-full bg-[#121820] border border-[#2A3749] text-[#E2E8F0] p-2 rounded focus:outline-none focus:border-[#D4AF37] text-xs"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#D4AF37] text-[#0B0F12] font-semibold rounded hover:brightness-110 cursor-pointer"
                >
                  Log Entry
                </button>
              </div>
            </form>

            {/* Activity History Timeline */}
            <div>
              <h4 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Activity Timeline ({leadActivities.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leadActivities.length === 0 ? (
                  <div className="text-[#64748B] text-center py-4">No activities logged yet.</div>
                ) : (
                  leadActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 bg-[#090D11] border border-[#1A232E] rounded flex items-start justify-between gap-3 text-[11px]"
                    >
                      <div>
                        <div className="font-semibold text-[#E2E8F0]">{act.title}</div>
                        <p className="text-[#94A3B8] mt-0.5">{act.description}</p>
                        <div className="text-[10px] text-[#64748B] mt-1">Logged by {act.userName}</div>
                      </div>
                      <span className="text-[9px] font-mono text-[#64748B] shrink-0">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      {createLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-lg w-full p-6 text-xs relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCreateLeadModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold mb-1">
              Capture Real Estate Lead
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Registers buyer profile, calculates Smart Lead Score, and triggers automatic advisor follow-up task.
            </p>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Client Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Alistair Vance"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+971 50 000 0000"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Country of Residence</label>
                  <input
                    type="text"
                    value={newLeadForm.country}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, country: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Budget in AED *</label>
                  <input
                    type="number"
                    required
                    step="500000"
                    value={newLeadForm.budget}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Preferred Project</label>
                  <select
                    value={newLeadForm.preferredProjectName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, preferredProjectName: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="OCTA Luminar Sky Residences">OCTA Luminar Sky Residences</option>
                    <option value="OCTA Elysium Private Island Mansions">OCTA Elysium Mansions</option>
                    <option value="The Horizon Tower DIFC">The Horizon Tower DIFC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Inquiry Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as LeadSource })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Referral">Referral</option>
                    <option value="Property Portal">Property Portal</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Campaign">VIP Campaign</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Initial Client Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Notes on view preferences, layout, investment objective..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateLeadModalOpen(false)}
                  className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                >
                  Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
