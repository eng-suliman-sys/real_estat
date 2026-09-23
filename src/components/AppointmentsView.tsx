import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentType, AppointmentStatus, User, Project } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Building,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { currentUser, role, refreshTrigger } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New appointment form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    agentId: 'usr_agent_karim',
    projectId: 'prj_luminar',
    projectName: 'OCTA Luminar Sky Residences',
    unitNumber: '1203',
    date: '2026-09-28',
    time: '14:00',
    location: 'OCTA Downtown Sales Gallery & Experience Center',
    type: 'Property Viewing' as AppointmentType,
    notes: 'Private architectural model inspection and floor plate briefing.',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [appList, usersList, projList] = await Promise.all([
        api.getAppointments(),
        api.getUsers(),
        api.getProjects(),
      ]);
      setAppointments(appList);
      setAgents(usersList.filter((u) => u.role === 'SALES_AGENT' || u.role === 'SALES_MANAGER'));
      setProjects(projList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = await api.createAppointment(formData);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to book appointment.');
      return;
    }

    setBookModalOpen(false);
    loadData();
  };

  const handleStatusChange = async (appId: string, status: AppointmentStatus) => {
    await api.updateAppointmentStatus(appId, status);
    loadData();
  };

  const getStatusColor = (st: AppointmentStatus) => {
    switch (st) {
      case 'Confirmed':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'Completed':
        return 'text-[#64748B] border-[#334155] bg-[#16202C]/40';
      case 'Cancelled':
        return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
      case 'Requested':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      default:
        return 'text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              VIP Client Appointments & Viewings
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">· CONFLICT DETECTION ACTIVE</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
            Site Visits & Contract Meetings
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Schedule private penthouse inspections, virtual tours, and legal contract meetings without double-booking.
          </p>
        </div>

        <button
          onClick={() => setBookModalOpen(true)}
          className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] text-xs font-semibold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B] text-xs">Loading appointments calendar...</div>
      ) : appointments.length === 0 ? (
        <div className="py-20 text-center bg-[#111720] border border-[#1E293B] rounded-lg">
          <p className="font-cinzel text-lg text-[#94A3B8]">No appointments scheduled.</p>
          <p className="text-xs text-[#64748B] mt-1">Click Schedule Appointment to coordinate a VIP inspection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4AF37]/40 transition-colors text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#D4AF37] tracking-wider">
                    {app.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <h3 className="font-cinzel text-base font-bold text-[#F3F4F6] mt-2">
                  {app.clientName}
                </h3>
                <div className="text-[11px] text-[#94A3B8]">{app.clientEmail} · {app.clientPhone}</div>

                <div className="mt-3 space-y-1.5 p-2.5 bg-[#090D11] border border-[#1A232E] rounded text-[11px]">
                  <div className="flex items-center gap-2 text-[#CBD5E1]">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="font-mono">{app.date} at {app.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#CBD5E1]">
                    <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{app.projectName} {app.unitNumber ? `(Unit ${app.unitNumber})` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#CBD5E1]">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="truncate">{app.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#CBD5E1]">
                    <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Advisor: {app.agentName}</span>
                  </div>
                </div>

                {app.notes && (
                  <p className="mt-3 text-[11px] text-[#94A3B8] italic">
                    "{app.notes}"
                  </p>
                )}
              </div>

              {/* Status Actions */}
              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[10px] text-[#64748B] font-mono">
                  Booked: {new Date(app.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1.5">
                  {app.status !== 'Completed' && app.status !== 'Cancelled' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(app.id, 'Completed')}
                        className="px-2 py-1 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange(app.id, 'Cancelled')}
                        className="px-2 py-1 rounded bg-rose-950/50 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOK APPOINTMENT MODAL */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-lg w-full p-6 text-xs relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBookModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold mb-1">
              Schedule VIP Inspection
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Real-time schedule check prevents advisor double-booking across client sessions.
            </p>

            {errorMsg && (
              <div className="my-3 p-3 bg-rose-950/40 border border-rose-500/50 rounded text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Client Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian Sterling"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@domain.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+971 50 000 0000"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Assigned Advisor *</label>
                  <select
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Meeting Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Property Viewing">Property Viewing</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Sales Meeting">Sales Meeting</option>
                    <option value="Investor Meeting">Investor Meeting</option>
                    <option value="Virtual Tour">Virtual Tour</option>
                    <option value="Contract Meeting">Contract Meeting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Session Agenda & Briefing Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                >
                  Confirm & Send Invites
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
