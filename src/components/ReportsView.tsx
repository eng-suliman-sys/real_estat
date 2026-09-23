import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Target,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { refreshTrigger } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getReportsOverview();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [refreshTrigger]);

  if (loading || !data) {
    return <div className="py-24 text-center text-xs text-[#64748B]">Calculating executive business metrics...</div>;
  }

  const {
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
  } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            OCTA Executive Intelligence
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">· REAL DATABASE AGGREGATIONS</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
          Performance & Revenue Analytics
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Zero simulated metrics. All financial figures and conversion ratios are computed directly from verified records.
        </p>
      </div>

      {/* Top 4 Key Financial & Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase font-mono">Total Portfolio Gross Value</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#D4AF37] mt-1">
            AED {(totalPortfolioValue / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2">Across all active projects</div>
        </div>

        <div className="bg-[#0F151C] border border-emerald-500/30 p-5 rounded-lg">
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Realized Escrow Inflow</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            AED {(realizedRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2">Cleared settlements</div>
        </div>

        <div className="bg-[#0F151C] border border-amber-500/30 p-5 rounded-lg">
          <div className="text-[10px] text-amber-400 uppercase font-mono">Due Receivables</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            AED {(outstandingInvoices / 1000).toFixed(0)}K
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2">Nearing milestone due dates</div>
        </div>

        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase font-mono">Pipeline Conversion</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#E2E8F0] mt-1">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-cyan-400 mt-2">{leadsTotal} Total Inquiries</div>
        </div>
      </div>

      {/* Inventory Breakdown & Lead Sources Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Inventory Status Breakdown */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
          <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#D4AF37]" /> Inventory Realtime Allocation
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[#CBD5E1] mb-1">
                <span>Available for Booking</span>
                <span className="font-mono font-bold text-emerald-400">
                  {availableUnits} Units ({totalUnits > 0 ? ((availableUnits / totalUnits) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] mb-1">
                <span>Under 72-Hour Lock / Reserved</span>
                <span className="font-mono font-bold text-amber-400">
                  {reservedUnits} Units ({totalUnits > 0 ? ((reservedUnits / totalUnits) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${totalUnits > 0 ? (reservedUnits / totalUnits) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#CBD5E1] mb-1">
                <span>Sold / SPA Countersigned</span>
                <span className="font-mono font-bold text-[#64748B]">
                  {soldUnits} Units ({totalUnits > 0 ? ((soldUnits / totalUnits) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#64748B]"
                  style={{ width: `${totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
          <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#D4AF37]" /> Acquisition Channels Distribution
          </h2>

          <div className="space-y-2.5">
            {Object.entries(sourcesMap || {}).map(([src, count]) => {
              const pct = leadsTotal > 0 ? (((count as number) / leadsTotal) * 100).toFixed(0) : 0;
              return (
                <div key={src} className="flex items-center justify-between p-2 bg-[#090D11] border border-[#1E293B] rounded">
                  <span className="text-[#E2E8F0] font-medium">{src}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#D4AF37] font-bold">{count as number} Leads</span>
                    <span className="font-mono text-[#64748B] text-[10px]">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advisor Performance Leaderboard */}
      <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6 text-xs">
        <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#D4AF37]" /> Private Client Advisor Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#090D11] border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4">Advisor Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Leads</th>
                <th className="py-3 px-4">VIP Viewings Hosted</th>
                <th className="py-3 px-4">Reservations & Deals</th>
                <th className="py-3 px-4">Follow-ups Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A232E] text-[#CBD5E1]">
              {agentPerformance.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-[#151D26] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#F3F4F6]">{agent.name}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{agent.role}</td>
                  <td className="py-3 px-4 font-mono">{agent.assignedLeadsCount}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{agent.viewingsCount}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">
                    {agent.dealsSecuredCount}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    {agent.followUpsCompleted} completed
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
