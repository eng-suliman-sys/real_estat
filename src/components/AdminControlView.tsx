import React, { useState, useEffect } from 'react';
import { AuditLog, User, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Key,
  Users,
  Activity,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  Server,
  Settings,
} from 'lucide-react';

export const AdminControlView: React.FC = () => {
  const { currentUser, role, refreshTrigger } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'permissions' | 'settings'>('audit');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [logs, uList] = await Promise.all([api.getAuditLogs(), api.getUsers()]);
        setAuditLogs(logs);
        setUsers(uList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [refreshTrigger]);

  const permissionMatrix: { category: string; perms: { key: string; name: string; roles: UserRole[] }[] }[] = [
    {
      category: 'Properties & Inventory',
      perms: [
        { key: 'properties.view', name: 'View Inventory & Floorplans', roles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT', 'CLIENT', 'INVESTOR'] },
        { key: 'properties.create', name: 'Add New Units & Projects', roles: ['ADMIN', 'MANAGEMENT'] },
        { key: 'properties.edit', name: 'Change Pricing & Specifications', roles: ['ADMIN', 'MANAGEMENT'] },
        { key: 'units.reserve', name: 'Lock & Reserve Units (72hr)', roles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT'] },
      ],
    },
    {
      category: 'CRM & Private Clients',
      perms: [
        { key: 'leads.view', name: 'View Client Leads Pipeline', roles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT'] },
        { key: 'leads.assign', name: 'Reassign Leads to Advisors', roles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER'] },
        { key: 'leads.edit', name: 'Advance Pipeline Stages & Notes', roles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT'] },
        { key: 'appointments.manage', name: 'Manage Viewing Schedules', roles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT'] },
      ],
    },
    {
      category: 'Finance & Escrow',
      perms: [
        { key: 'payments.view', name: 'View Escrow & Invoices', roles: ['ADMIN', 'MANAGEMENT', 'ACCOUNTANT', 'INVESTOR'] },
        { key: 'payments.create', name: 'Generate Official Invoices', roles: ['ADMIN', 'MANAGEMENT', 'ACCOUNTANT'] },
        { key: 'payments.edit', name: 'Reconcile SWIFT Settlements', roles: ['ADMIN', 'MANAGEMENT', 'ACCOUNTANT'] },
      ],
    },
    {
      category: 'Document Governance',
      perms: [
        { key: 'documents.view', name: 'Access Vault Documents', roles: ['ADMIN', 'MANAGEMENT', 'DOCUMENT_MANAGER', 'SALES_MANAGER', 'INVESTOR'] },
        { key: 'documents.upload', name: 'Upload SPAs & Deeds', roles: ['ADMIN', 'MANAGEMENT', 'DOCUMENT_MANAGER'] },
        { key: 'documents.approve', name: 'Sign & Authorize Agreements', roles: ['ADMIN', 'MANAGEMENT', 'DOCUMENT_MANAGER'] },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> OCTA Command & Control Center
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">· IMMUTABLE AUDIT LOGGING</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
          System Governance & Audit Trails
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Complete operational oversight: granular RBAC permission matrix, user credentials, and cryptographic activity logs.
        </p>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'audit'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#16202C]/40'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'users'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#16202C]/40'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          Staff & User Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'permissions'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#16202C]/40'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          Granular RBAC Matrix
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 border-b-2 font-medium cursor-pointer transition-colors ${
            activeTab === 'settings'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-[#16202C]/40'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          Server & Database Health
        </button>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg overflow-hidden text-xs">
          <div className="p-4 border-b border-[#1E293B] bg-[#090D11] flex items-center justify-between">
            <span className="font-semibold text-[#E2E8F0] flex items-center gap-2">
              <History className="w-4 h-4 text-[#D4AF37]" />
              Cryptographic Audit Stream
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">All changes recorded with actor ID & timestamp</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0B0F12] border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Authorized Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">State Transition</th>
                  <th className="py-3 px-4">Audit Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A232E] text-[#CBD5E1]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#151D26] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#94A3B8]">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F3F4F6]">{log.userName}</div>
                      <div className="text-[10px] text-[#64748B] font-mono">{log.userRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-[#D4AF37] border border-[#2A3749]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#E2E8F0]">
                      {log.entity} #{log.entityId}
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <span className="text-rose-400 line-through mr-1">{log.oldValue}</span>
                      <span className="text-emerald-400 font-semibold">→ {log.newValue}</span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] italic max-w-xs truncate">
                      "{log.reason || 'Operational action'}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & STAFF DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#090D11] border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Corporate Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A232E] text-[#CBD5E1]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#151D26] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#F3F4F6]">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-[#94A3B8]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/10">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1]">{u.title || 'Staff'}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#64748B]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GRANULAR RBAC MATRIX */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 text-xs">
          {permissionMatrix.map((cat) => (
            <div key={cat.category} className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-5">
              <h3 className="font-cinzel text-base font-bold text-[#F3F4F6] mb-3 text-[#D4AF37]">
                {cat.category}
              </h3>
              <div className="space-y-3">
                {cat.perms.map((p) => (
                  <div
                    key={p.key}
                    className="p-3 bg-[#090D11] border border-[#1A232E] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono text-[#E2E8F0] font-semibold">{p.key}</span>
                      <span className="text-[#64748B] mx-2">·</span>
                      <span className="text-[#94A3B8]">{p.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {p.roles.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-[#CBD5E1]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH */}
      {activeTab === 'settings' && (
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6 space-y-4 text-xs">
          <h3 className="font-cinzel text-lg font-bold text-[#F3F4F6] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#D4AF37]" /> Core Infrastructure Health
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#090D11] border border-emerald-500/30 rounded">
              <div className="text-[10px] uppercase font-mono text-emerald-400">Database Engine</div>
              <div className="font-mono text-base font-bold text-[#F3F4F6] mt-1">
                Persistent JSON ACID Store
              </div>
              <div className="text-[#94A3B8] text-[11px] mt-1">Atomic writes with rollback safety</div>
            </div>

            <div className="p-4 bg-[#090D11] border border-emerald-500/30 rounded">
              <div className="text-[10px] uppercase font-mono text-emerald-400">Real-Time Event Stream</div>
              <div className="font-mono text-base font-bold text-[#F3F4F6] mt-1">
                Server-Sent Events (SSE)
              </div>
              <div className="text-[#94A3B8] text-[11px] mt-1">Sub-second inventory sync</div>
            </div>

            <div className="p-4 bg-[#090D11] border border-emerald-500/30 rounded">
              <div className="text-[10px] uppercase font-mono text-emerald-400">Security Architecture</div>
              <div className="font-mono text-base font-bold text-[#F3F4F6] mt-1">
                Role-Based Access Control
              </div>
              <div className="text-[#94A3B8] text-[11px] mt-1">Server-enforced permissions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
