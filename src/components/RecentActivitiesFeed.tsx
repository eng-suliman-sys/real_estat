import React, { useState, useEffect, useMemo } from 'react';
import { CrmActivityItem, CrmActivityCategory, LeadStage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  Building,
  Lock,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  Flame,
  Zap,
} from 'lucide-react';

interface RecentActivitiesFeedProps {
  onNavigate?: (tab: string, params?: any) => void;
  onOpenLeadModal?: () => void;
  maxItems?: number;
  compact?: boolean;
}

export const RecentActivitiesFeed: React.FC<RecentActivitiesFeedProps> = ({
  onNavigate,
  onOpenLeadModal,
  maxItems = 15,
  compact = false,
}) => {
  const { isRealtimeConnected, refreshTrigger } = useAuth();
  const [activities, setActivities] = useState<CrmActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<CrmActivityItem | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const fetchActivities = async (manual = false) => {
    try {
      if (manual) setIsRefreshing(true);
      const list = await api.getCrmActivities();
      setActivities(list);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to fetch CRM activities:', err);
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  const handleManualRefresh = () => {
    fetchActivities(true);
  };

  const handleSimulateEvent = async (type: 'LEAD_STAGE' | 'APPOINTMENT') => {
    try {
      setSimulating(true);
      if (type === 'APPOINTMENT') {
        await api.simulateCrmActivity({
          eventType: 'APPOINTMENT_BOOKED',
          clientName: 'Lord Alistair Campbell',
          appointmentType: 'Private Yacht Tour & Inspection',
        });
      } else {
        const stages: LeadStage[] = ['OFFER', 'NEGOTIATION', 'RESERVATION', 'CONTRACT'];
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        await api.simulateCrmActivity({
          eventType: 'LEAD_STAGE_CHANGED',
          clientName: 'Julian Sterling',
          stage: randomStage,
        });
      }
      setShowSimulateModal(false);
      await fetchActivities();
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (activeCategory === 'LEAD' && act.category !== 'LEAD') return false;
      if (activeCategory === 'APPOINTMENT' && act.category !== 'APPOINTMENT') return false;
      if (activeCategory === 'RESERVATION' && act.category !== 'RESERVATION') return false;
      if (activeCategory === 'COMMUNICATION' && act.category !== 'COMMUNICATION') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = act.clientName?.toLowerCase().includes(q);
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesProject = act.projectName?.toLowerCase().includes(q);
        const matchesActor = act.actorName.toLowerCase().includes(q);
        const matchesUnit = act.unitNumber?.toLowerCase().includes(q);

        if (!matchesClient && !matchesTitle && !matchesDesc && !matchesProject && !matchesActor && !matchesUnit) {
          return false;
        }
      }

      return true;
    });
  }, [activities, activeCategory, searchQuery]);

  const displayedActivities = filteredActivities.slice(0, maxItems);

  // Time formatting helper
  const formatTimeAgo = (isoString: string) => {
    try {
      const now = new Date();
      const date = new Date(isoString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 45) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 172800) return 'Yesterday';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recently';
    }
  };

  // Badge & icon helpers
  const getEventBadge = (act: CrmActivityItem) => {
    switch (act.eventType) {
      case 'LEAD_STAGE_CHANGED':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />,
          bgColor: 'bg-cyan-950/30 border-cyan-800/40 text-cyan-300',
          label: 'Stage Update',
        };
      case 'LEAD_CREATED':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />,
          bgColor: 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]',
          label: 'New Lead',
        };
      case 'LEAD_ASSIGNED':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-purple-400" />,
          bgColor: 'bg-purple-950/30 border-purple-800/40 text-purple-300',
          label: 'Advisor Assigned',
        };
      case 'APPOINTMENT_BOOKED':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" />,
          bgColor: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300',
          label: 'Viewing Booked',
        };
      case 'APPOINTMENT_STATUS_CHANGED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          bgColor: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300',
          label: 'Viewing Update',
        };
      case 'UNIT_RESERVED':
        return {
          icon: <Lock className="w-3.5 h-3.5 text-amber-400" />,
          bgColor: 'bg-amber-950/30 border-amber-800/40 text-amber-300',
          label: 'Unit Locked',
        };
      case 'UNIT_RELEASED':
        return {
          icon: <Building className="w-3.5 h-3.5 text-slate-400" />,
          bgColor: 'bg-slate-900 border-slate-700 text-slate-300',
          label: 'Unit Available',
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-slate-400" />,
          bgColor: 'bg-slate-900 border-slate-700 text-slate-300',
          label: 'Activity',
        };
    }
  };

  const stageBadgeColor = (stage?: string) => {
    switch (stage) {
      case 'NEW':
        return 'text-blue-400 border-blue-500/30 bg-blue-950/20';
      case 'VIEWING':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
      case 'OFFER':
      case 'NEGOTIATION':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'RESERVATION':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'CONTRACT':
      case 'CLOSED':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      default:
        return 'text-slate-400 border-slate-600/30 bg-slate-900/30';
    }
  };

  return (
    <div className="bg-[#0F151C] border border-[#1E293B] rounded-xl overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="p-5 border-b border-[#1E293B] bg-gradient-to-r from-[#121A23] to-[#0D141C]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#F3F4F6] tracking-tight">
                  Recent CRM Activities Feed
                </h2>
                {/* Live SSE Pulse Badge */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span className="font-semibold">
                    {isRealtimeConnected ? 'LIVE SSE' : 'STREAM ACTIVE'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Real-time chronological events across lead status transitions, client viewings, and unit locks
              </p>
            </div>
          </div>

          {/* Quick Actions & Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-2.5 py-1.5 bg-[#1A2533] hover:bg-[#253549] text-xs text-[#E2E8F0] rounded border border-[#2D3F54] flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Test real-time event propagation"
            >
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Simulate Event</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1.5 bg-[#16202C] hover:bg-[#1E2C3D] text-[#94A3B8] hover:text-[#E2E8F0] rounded border border-[#2A3749] cursor-pointer transition-colors disabled:opacity-50"
              title={`Refreshed at ${lastRefreshedAt.toLocaleTimeString()}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-4 pt-4 border-t border-[#1E293B]/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Activities', count: activities.length },
              {
                id: 'LEAD',
                label: 'Lead Status Changes',
                count: activities.filter((a) => a.category === 'LEAD').length,
              },
              {
                id: 'APPOINTMENT',
                label: 'Appointments & Viewings',
                count: activities.filter((a) => a.category === 'APPOINTMENT').length,
              },
              {
                id: 'RESERVATION',
                label: 'Unit Locks',
                count: activities.filter((a) => a.category === 'RESERVATION').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#16202C] border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    activeCategory === tab.id
                      ? 'bg-[#D4AF37]/25 text-[#D4AF37]'
                      : 'bg-[#1E293B] text-[#64748B]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client, project, or advisor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#090D11] border border-[#1E293B] focus:border-[#D4AF37]/50 focus:outline-hidden rounded text-xs text-[#E2E8F0] placeholder-[#64748B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#CBD5E1]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feed List Items */}
      <div className="divide-y divide-[#1A2533]">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#64748B] flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
            <span>Loading live CRM activities...</span>
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B]">
            <Activity className="w-8 h-8 text-[#2A3749] mx-auto mb-2" />
            <div className="text-sm font-semibold text-[#94A3B8]">No matching activities found</div>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No CRM events matching "${searchQuery}". Clear your search query to see recent updates.`
                : 'No CRM events logged yet in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1 bg-[#1A2533] text-[#E2E8F0] rounded text-xs hover:bg-[#253549] transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          displayedActivities.map((act) => {
            const badge = getEventBadge(act);
            return (
              <div
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className="p-4 sm:p-5 hover:bg-[#121B24]/60 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                {/* Left: Icon, Main Info & Description */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${badge.bgColor}`}
                  >
                    {badge.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[#F3F4F6] group-hover:text-[#D4AF37] transition-colors">
                        {act.title}
                      </span>

                      {/* Event Type Badge */}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.bgColor}`}
                      >
                        {badge.label}
                      </span>

                      {/* Pipeline Stage Movement Transition */}
                      {act.stageTo && (
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          {act.stageFrom && (
                            <>
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[9px] ${stageBadgeColor(
                                  act.stageFrom
                                )}`}
                              >
                                {act.stageFrom}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#64748B]" />
                            </>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded border font-semibold text-[10px] ${stageBadgeColor(
                              act.stageTo
                            )}`}
                          >
                            {act.stageTo}
                          </span>
                        </div>
                      )}

                      {/* Appointment Type Badge */}
                      {act.metadata?.appointmentType && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/30 border border-blue-800/40 text-blue-300">
                          {act.metadata.appointmentType}
                        </span>
                      )}

                      {/* Lead Score Indicator */}
                      {act.metadata?.leadScore && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#D4AF37]" />
                          Score: {act.metadata.leadScore}
                        </span>
                      )}
                    </div>

                    {/* Descriptive Text */}
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Metadata Context: Client, Project, Advisor */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px] text-[#64748B]">
                      {act.clientName && (
                        <span className="flex items-center gap-1 text-[#CBD5E1]">
                          <span className="text-[#64748B]">Client:</span>
                          <span className="font-medium text-[#E2E8F0]">{act.clientName}</span>
                        </span>
                      )}

                      {act.projectName && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#64748B]" />
                          <span className="text-[#94A3B8]">{act.projectName}</span>
                          {act.unitNumber && (
                            <span className="text-[#D4AF37] font-mono font-medium">
                              (Unit {act.unitNumber})
                            </span>
                          )}
                        </span>
                      )}

                      {act.actorName && (
                        <span className="flex items-center gap-1 text-[#64748B]">
                          <span>By:</span>
                          <span className="text-[#94A3B8] font-medium">{act.actorName}</span>
                          {act.actorRole && (
                            <span className="text-[10px] text-[#64748B]">({act.actorRole})</span>
                          )}
                        </span>
                      )}

                      {act.metadata?.appointmentDate && (
                        <span className="flex items-center gap-1 text-emerald-400/90 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {act.metadata.appointmentDate} at {act.metadata.appointmentTime}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Action Trigger */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]">
                  <div
                    className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]"
                    title={new Date(act.timestamp).toLocaleString()}
                  >
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>{formatTimeAgo(act.timestamp)}</span>
                  </div>

                  {/* Navigation CTA button */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {act.category === 'LEAD' && onNavigate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('leads');
                        }}
                        className="px-2 py-1 bg-[#1A2533] hover:bg-[#253549] text-[11px] text-[#D4AF37] rounded border border-[#2D3F54] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Pipeline <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    {act.category === 'APPOINTMENT' && onNavigate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('appointments');
                        }}
                        className="px-2 py-1 bg-[#1A2533] hover:bg-[#253549] text-[11px] text-emerald-400 rounded border border-[#2D3F54] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Calendar <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    {act.category === 'RESERVATION' && onNavigate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('inventory');
                        }}
                        className="px-2 py-1 bg-[#1A2533] hover:bg-[#253549] text-[11px] text-amber-400 rounded border border-[#2D3F54] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Inventory <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    <span className="text-[10px] text-[#64748B] hover:text-[#CBD5E1] p-1">
                      Details
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Feed Footer */}
      <div className="p-4 bg-[#0A0E13] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <span>Showing {displayedActivities.length} of {filteredActivities.length} recent CRM updates</span>
          <span>·</span>
          <span>Auto-synchronized via SSE</span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenLeadModal && (
            <button
              onClick={onOpenLeadModal}
              className="text-[#D4AF37] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              Capture New Lead →
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('leads')}
              className="text-[#94A3B8] hover:text-[#F3F4F6] font-medium flex items-center gap-1 cursor-pointer"
            >
              Open Full Pipeline →
            </button>
          )}
        </div>
      </div>

      {/* Detailed Activity Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E293B] bg-gradient-to-r from-[#16202C] to-[#0F151C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    getEventBadge(selectedActivity).bgColor
                  }`}
                >
                  {getEventBadge(selectedActivity).icon}
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-sm text-[#F3F4F6]">
                    CRM Event Audit Details
                  </h3>
                  <div className="text-[10px] font-mono text-[#64748B]">
                    Event ID: {selectedActivity.id}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-[#64748B] hover:text-[#CBD5E1] p-1 rounded hover:bg-[#1E293B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <div className="text-[10px] uppercase font-mono text-[#64748B] mb-1">Event Title</div>
                <div className="text-sm font-semibold text-[#F3F4F6]">
                  {selectedActivity.title}
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 bg-[#090D11] p-3 rounded border border-[#1E293B]">
                  {selectedActivity.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#090D11] p-3 rounded border border-[#1E293B]">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Client / Target</div>
                  <div className="text-xs font-semibold text-[#E2E8F0] mt-1">
                    {selectedActivity.clientName || 'Private Client'}
                  </div>
                </div>

                <div className="bg-[#090D11] p-3 rounded border border-[#1E293B]">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Logged By (Actor)</div>
                  <div className="text-xs font-semibold text-[#E2E8F0] mt-1">
                    {selectedActivity.actorName}
                  </div>
                  {selectedActivity.actorRole && (
                    <div className="text-[10px] text-[#64748B]">{selectedActivity.actorRole}</div>
                  )}
                </div>

                {selectedActivity.projectName && (
                  <div className="bg-[#090D11] p-3 rounded border border-[#1E293B]">
                    <div className="text-[10px] text-[#64748B] uppercase font-mono">Associated Project</div>
                    <div className="text-xs font-semibold text-[#D4AF37] mt-1">
                      {selectedActivity.projectName}
                    </div>
                    {selectedActivity.unitNumber && (
                      <div className="text-[10px] text-[#94A3B8]">Unit {selectedActivity.unitNumber}</div>
                    )}
                  </div>
                )}

                <div className="bg-[#090D11] p-3 rounded border border-[#1E293B]">
                  <div className="text-[10px] text-[#64748B] uppercase font-mono">Exact Timestamp</div>
                  <div className="text-xs font-mono text-[#CBD5E1] mt-1">
                    {new Date(selectedActivity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Specific metadata breakdown */}
              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div className="border-t border-[#1E293B] pt-3">
                  <div className="text-[10px] uppercase font-mono text-[#64748B] mb-2">
                    Metadata Parameters
                  </div>
                  <div className="bg-[#090D11] p-3 rounded border border-[#1E293B] space-y-1.5 font-mono text-[11px]">
                    {selectedActivity.metadata.budget && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Client Budget:</span>
                        <span className="text-[#D4AF37]">
                          AED {selectedActivity.metadata.budget.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedActivity.metadata.leadScore && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Lead Score:</span>
                        <span className="text-emerald-400">
                          {selectedActivity.metadata.leadScore} / 100
                        </span>
                      </div>
                    )}
                    {selectedActivity.metadata.source && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Acquisition Source:</span>
                        <span className="text-[#CBD5E1]">{selectedActivity.metadata.source}</span>
                      </div>
                    )}
                    {selectedActivity.metadata.location && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Location:</span>
                        <span className="text-[#CBD5E1]">{selectedActivity.metadata.location}</span>
                      </div>
                    )}
                    {selectedActivity.metadata.appointmentDate && (
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Scheduled Date & Time:</span>
                        <span className="text-emerald-400">
                          {selectedActivity.metadata.appointmentDate} at {selectedActivity.metadata.appointmentTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#0A0E13] border-t border-[#1E293B] flex items-center justify-between">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-[#1A2533] hover:bg-[#253549] text-[#E2E8F0] rounded text-xs cursor-pointer transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedActivity.category === 'LEAD' && onNavigate && (
                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      onNavigate('leads');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold rounded text-xs cursor-pointer hover:brightness-110 shadow-xs"
                  >
                    Open Lead in Pipeline
                  </button>
                )}

                {selectedActivity.category === 'APPOINTMENT' && onNavigate && (
                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      onNavigate('appointments');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs cursor-pointer shadow-xs"
                  >
                    Open Calendar Schedule
                  </button>
                )}

                {selectedActivity.category === 'RESERVATION' && onNavigate && (
                  <button
                    onClick={() => {
                      setSelectedActivity(null);
                      onNavigate('inventory');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded text-xs cursor-pointer shadow-xs"
                  >
                    View Locked Unit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal for Live Event Testing */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cinzel font-bold text-sm text-[#F3F4F6]">
                  Trigger Real-time CRM Event
                </h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-[#64748B] hover:text-[#CBD5E1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-[#94A3B8]">
                Instantly trigger a CRM event into the live system. It will execute on the backend, emit an SSE broadcast, and update this feed in real-time.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  disabled={simulating}
                  onClick={() => handleSimulateEvent('LEAD_STAGE')}
                  className="w-full p-3 bg-[#16202C] hover:bg-[#1E2C3D] border border-[#2A3749] rounded flex items-center justify-between text-left cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-[#E2E8F0] group-hover:text-[#D4AF37]">
                      Advance Lead Pipeline Stage
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Simulates Julian Sterling advancing to OFFER or RESERVATION
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  disabled={simulating}
                  onClick={() => handleSimulateEvent('APPOINTMENT')}
                  className="w-full p-3 bg-[#16202C] hover:bg-[#1E2C3D] border border-[#2A3749] rounded flex items-center justify-between text-left cursor-pointer transition-colors group"
                >
                  <div>
                    <div className="font-semibold text-[#E2E8F0] group-hover:text-emerald-400">
                      Book VIP Property Viewing
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      Schedules a yacht tour & penthouse inspection for Lord Campbell
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0A0E13] border-t border-[#1E293B] text-right">
              <button
                onClick={() => setShowSimulateModal(false)}
                className="px-3 py-1.5 bg-[#1A2533] text-[#CBD5E1] rounded text-xs hover:bg-[#253549] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
