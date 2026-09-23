import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Unit, Lead, Appointment } from '../types';
import { RecentActivitiesFeed } from './RecentActivitiesFeed';
import {
  TrendingUp,
  Building,
  Users,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

interface ExecutiveOverviewProps {
  onNavigate: (tab: string) => void;
  onOpenLeadModal: () => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  onNavigate,
  onOpenLeadModal,
}) => {
  const { currentUser, role, refreshTrigger } = useAuth();
  const [data, setData] = useState<any>(null);
  const [recentUnits, setRecentUnits] = useState<Unit[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [upcomingApps, setUpcomingApps] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [overview, uList, lList, aList] = await Promise.all([
          api.getReportsOverview(),
          api.getUnits(),
          api.getLeads(),
          api.getAppointments(),
        ]);
        setData(overview);
        setRecentUnits(uList.slice(0, 4));
        setRecentLeads(lList.slice(0, 4));
        setUpcomingApps(aList.filter((a) => a.status === 'Confirmed').slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshTrigger]);

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-xs text-[#64748B]">
        Initializing executive intelligence feed...
      </div>
    );
  }

  const { totalUnits, availableUnits, reservedUnits, soldUnits, realizedRevenue, totalPortfolioValue } = data;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#0D141C] via-[#121B24] to-[#0A0E13] border border-[#243345] p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              OCTA Properties L.L.C. · Dubai, UAE
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">
              Operating as <span className="text-[#E2E8F0] font-semibold">{currentUser?.name}</span> ({role})
            </span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-4xl text-[#F3F4F6] font-bold tracking-tight">
            Prime Real Estate CRM & Investor Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 leading-relaxed">
            Enterprise orchestration for high-value off-plan developments, dynamic 3D inventory reservations with concurrency locks, institutional client pipeline, and encrypted investor wealth portals.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('inventory')}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold rounded text-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20"
            >
              <Building className="w-4 h-4" />
              Open Live Inventory
            </button>
            <button
              onClick={onOpenLeadModal}
              className="px-4 py-2 bg-[#1A2533] hover:bg-[#253549] text-[#E2E8F0] font-medium rounded text-xs border border-[#2A3749] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              Capture VIP Lead
            </button>
            <button
              onClick={() => onNavigate('investor')}
              className="px-4 py-2 bg-[#0B0F12] hover:bg-[#16202C] text-[#C5A880] font-medium rounded text-xs border border-[#D4AF37]/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Investor Wealth Vault
            </button>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#D4AF37]/10 to-transparent pointer-events-none" />
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-[#0F151C] border border-[#1E293B] hover:border-[#D4AF37]/50 p-5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-[#64748B] uppercase font-mono">Portfolio Value</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#D4AF37] mt-1">
            AED {(totalPortfolioValue / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
            <span>{totalUnits} Units Tracked</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('finance')}
          className="bg-[#0F151C] border border-emerald-500/20 hover:border-emerald-500/50 p-5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Escrow Inflow Realized</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            AED {(realizedRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
            <span>Central Bank Escrow Clear</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('inventory')}
          className="bg-[#0F151C] border border-amber-500/20 hover:border-amber-500/50 p-5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-amber-400 uppercase font-mono">Inventory Under Lock</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {reservedUnits} Units
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
            <span>72-hr Reservation Safe</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('leads')}
          className="bg-[#0F151C] border border-[#1E293B] hover:border-[#D4AF37]/50 p-5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="text-[10px] text-[#64748B] uppercase font-mono">Active Inquiries</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#E2E8F0] mt-1">
            {recentLeads.length}+ VIP Leads
          </div>
          <div className="text-[11px] text-cyan-400 mt-2 flex items-center gap-1">
            <span>Client 360 Tracking</span>
            <ArrowRight className="w-3 h-3 text-[#64748B]" />
          </div>
        </div>
      </div>

      {/* Split Section: Featured Units & Upcoming VIP Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Prime Units Spotlight */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#D4AF37]" /> Prime Units Live Status
            </h2>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-[#D4AF37] hover:underline font-mono text-[11px]"
            >
              All Inventory →
            </button>
          </div>

          <div className="space-y-3">
            {recentUnits.map((u) => (
              <div
                key={u.id}
                onClick={() => onNavigate('inventory')}
                className="p-3 bg-[#090D11] border border-[#1E293B] rounded flex items-center justify-between hover:border-[#2A3749] transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-mono font-bold text-[#F3F4F6]">
                    Unit {u.unitNumber} · {u.type}
                  </div>
                  <div className="text-[10px] text-[#94A3B8]">{u.projectName} · {u.view}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-[#D4AF37]">
                    AED {u.price.toLocaleString()}
                  </div>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-xs text-[9px] font-mono border ${
                      u.status === 'Available'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                        : 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmed VIP Inspections */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" /> Upcoming VIP Viewings
            </h2>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-[#D4AF37] hover:underline font-mono text-[11px]"
            >
              Full Calendar →
            </button>
          </div>

          <div className="space-y-3">
            {upcomingApps.length === 0 ? (
              <div className="text-[#64748B] py-8 text-center">No viewings scheduled today.</div>
            ) : (
              upcomingApps.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onNavigate('appointments')}
                  className="p-3 bg-[#090D11] border border-[#1E293B] rounded flex items-center justify-between hover:border-[#2A3749] transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-[#F3F4F6]">{a.clientName}</div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {a.projectName} {a.unitNumber ? `(Unit ${a.unitNumber})` : ''} · {a.type}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-[#E2E8F0]">
                      {a.date} at {a.time}
                    </div>
                    <div className="text-[10px] text-[#D4AF37] font-mono">Advisor: {a.agentName}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Central Executive CRM Activities Feed */}
      <RecentActivitiesFeed
        onNavigate={onNavigate}
        onOpenLeadModal={onOpenLeadModal}
      />
    </div>
  );
};
