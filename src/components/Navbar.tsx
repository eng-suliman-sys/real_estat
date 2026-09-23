import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, NotificationItem } from '../types';
import { api } from '../services/api';
import {
  Building2,
  Bell,
  Shield,
  UserCheck,
  Radio,
  ChevronDown,
  LogOut,
  Check,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  onOpenLeadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onTabChange, onOpenLeadModal }) => {
  const switchTab = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const { currentUser, role, switchRole, isRealtimeConnected, refreshTrigger } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const list = await api.getNotifications();
        setNotifications(list);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
    loadNotifs();
  }, [refreshTrigger]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const rolesList: { role: UserRole; title: string; name: string }[] = [
    { role: 'MANAGEMENT', title: 'Founder & CEO', name: 'Fawaz Sous' },
    { role: 'ADMIN', title: 'VP Technology & Operations', name: 'Alexander Vance' },
    { role: 'SALES_MANAGER', title: 'SVP Global Sales', name: 'Soraya Al-Hashemi' },
    { role: 'SALES_AGENT', title: 'Prime Client Advisor', name: 'Karim Hassan' },
    { role: 'INVESTOR', title: 'Principal Investor', name: 'Tariq Al-Sabah' },
    { role: 'CLIENT', title: 'Private Resident Buyer', name: 'Elena Rostova' },
    { role: 'ACCOUNTANT', title: 'CFO & Escrow Controller', name: 'Marcus Sterling' },
    { role: 'DOCUMENT_MANAGER', title: 'Head of Legal Conveyancing', name: 'Claire Beauchamp' },
  ];

  const navItems = [
    { id: 'overview', label: 'Executive Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'inventory', label: 'Live Inventory' },
    { id: 'leads', label: 'CRM Pipeline' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'investor', label: 'Investor Portal' },
    { id: 'finance', label: 'Finance & Escrow' },
    { id: 'documents', label: 'Document Vault' },
    { id: 'communication', label: 'Communications' },
    { id: 'reports', label: 'Analytics' },
    { id: 'admin', label: 'Admin Control' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F12]/95 backdrop-blur-md border-b border-[#1E293B]">
      {/* Top Luxury Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => switchTab('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#D4AF37] via-[#C5A880] to-[#8C7355] flex items-center justify-center p-0.5 shadow-lg shadow-[#D4AF37]/10">
              <div className="w-full h-full bg-[#0B0F12] flex items-center justify-center">
                <span className="font-cinzel text-lg font-bold text-[#E5C378] tracking-widest">O</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base tracking-[0.2em] text-[#F3F4F6] font-semibold">
                  OCTA PROPERTIES
                </span>
                <span className="text-[10px] tracking-wider text-[#C5A880] uppercase font-medium">
                  L.L.C.
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] tracking-wide font-sans">
                Real Estate CRM & Investor Portal · Founder & CEO Fawaz Sous
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Real-time status, Quick Action, Role Selector, Notifications */}
        <div className="flex items-center gap-3">
          {/* Realtime Live Pulse */}
          <div
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#121820] border border-[#1E293B] text-xs"
            title={isRealtimeConnected ? 'Live Real-Time SSE Synchronized' : 'Connecting to Realtime Stream...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-mono text-[#94A3B8]">
              {isRealtimeConnected ? 'LIVE SYNC' : 'SYNCING'}
            </span>
          </div>

          {/* Quick Lead Capture CTA */}
          <button
            onClick={onOpenLeadModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide uppercase text-[#0B0F12] bg-gradient-to-r from-[#D4AF37] to-[#C5A880] hover:brightness-110 rounded transition-all shadow-sm cursor-pointer"
          >
            + Inquire / Lead
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#121820] hover:bg-[#1A232E] border border-[#2A3749] text-xs transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#1E293B] flex items-center justify-center text-[#C5A880]">
                <Shield className="w-3 h-3" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                  Role: {currentUser?.role}
                </div>
                <div className="text-[11px] text-[#E2E8F0] font-medium leading-none truncate max-w-[130px]">
                  {currentUser?.name}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0F151C] border border-[#2A3749] rounded-md shadow-2xl z-50 py-1 text-xs">
                <div className="px-3 py-2 border-b border-[#1E293B] bg-[#090D11]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A880]">
                    Enterprise Role Switcher
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    Simulate permissions across the entire OCTA hierarchy.
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {rolesList.map((r) => {
                    const isCurrent = currentUser?.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#1A232E] transition-colors ${
                          isCurrent ? 'bg-[#1E293B]/60 text-[#C5A880]' : 'text-[#CBD5E1]'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-[12px]">{r.name}</div>
                          <div className="text-[10px] text-[#64748B]">
                            {r.role} · {r.title}
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-[#C5A880]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded bg-[#121820] hover:bg-[#1A232E] border border-[#2A3749] text-[#94A3B8] hover:text-[#F3F4F6] relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B0F12] text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F151C] border border-[#2A3749] rounded-md shadow-2xl z-50 text-xs">
                <div className="p-3 border-b border-[#1E293B] flex items-center justify-between bg-[#090D11]">
                  <span className="font-semibold text-[#E2E8F0] tracking-wide">
                    Real-time Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#C5A880] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#1A232E]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#64748B]">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 transition-colors ${
                          n.read ? 'bg-transparent text-[#94A3B8]' : 'bg-[#141C24] text-[#E2E8F0]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-[12px]">{n.title}</span>
                          <span className="text-[10px] text-[#64748B]">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <nav className="border-t border-[#16202C] bg-[#0E1318]/90 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 py-1 text-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`px-3 py-2 whitespace-nowrap transition-colors border-b-2 font-medium cursor-pointer ${
                  isActive
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#16202C]/60'
                    : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:border-[#334155]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
