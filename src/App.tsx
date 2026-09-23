import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { InventoryView } from './components/InventoryView';
import { LeadsPipeline } from './components/LeadsPipeline';
import { AppointmentsView } from './components/AppointmentsView';
import { InvestorPortalView } from './components/InvestorPortalView';
import { FinanceView } from './components/FinanceView';
import { DocumentsView } from './components/DocumentsView';
import { CommunicationView } from './components/CommunicationView';
import { ReportsView } from './components/ReportsView';
import { ProjectsView } from './components/ProjectsView';
import { AdminControlView } from './components/AdminControlView';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import {
  Bell,
  Sparkles,
  Shield,
  Building,
  CheckCircle,
} from 'lucide-react';

function AppContent() {
  const { role, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Switch to investor tab automatically if switching into investor role
  useEffect(() => {
    if (role === 'INVESTOR') {
      setActiveTab('investor');
    }
  }, [role]);

  // Listen to custom window realtime events for luxury floating toast
  useEffect(() => {
    const handleRealtime = (e: any) => {
      const detail = e.detail;
      if (detail?.type === 'unit_updated') {
        setLiveToast(`Inventory update: Unit ${detail.data?.unitNumber} changed to ${detail.data?.status}`);
      } else if (detail?.type === 'lead_updated') {
        setLiveToast(`CRM pipeline update: ${detail.data?.name} advanced to ${detail.data?.stage}`);
      } else if (detail?.type === 'appointment_booked') {
        setLiveToast(`New appointment booked for ${detail.data?.clientName}`);
      }
      setTimeout(() => setLiveToast(null), 4000);
    };

    window.addEventListener('octa_realtime_event', handleRealtime);
    return () => window.removeEventListener('octa_realtime_event', handleRealtime);
  }, []);

  return (
    <div className="min-h-screen bg-[#070B0E] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0B0F12]">
      {/* Top Luxury Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab)}
        onTabChange={(tab: string) => setActiveTab(tab)}
        onOpenLeadModal={() => setLeadModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLeadModal={() => setLeadModalOpen(true)}
          />
        )}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'leads' && <LeadsPipeline />}
        {activeTab === 'appointments' && <AppointmentsView />}
        {activeTab === 'investor' && <InvestorPortalView />}
        {activeTab === 'finance' && <FinanceView />}
        {activeTab === 'documents' && <DocumentsView />}
        {activeTab === 'communication' && <CommunicationView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'projects' && (
          <ProjectsView onSelectProjectUnits={() => setActiveTab('inventory')} />
        )}
        {activeTab === 'admin' && <AdminControlView />}
      </main>

      {/* Global Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSuccess={() => {
          setLiveToast('Client successfully registered in OCTA CRM database.');
          setTimeout(() => setLiveToast(null), 3500);
        }}
      />

      {/* Real-time SSE Live Toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F151C]/95 backdrop-blur-md border border-[#D4AF37]/50 text-[#F3F4F6] px-4 py-3 rounded-lg shadow-xl shadow-black/50 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="font-mono text-[11px]">{liveToast}</span>
        </div>
      )}

      {/* Luxury Footer */}
      <footer className="border-t border-[#16202C] bg-[#05080A] py-6 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
              OCTA Properties L.L.C.
            </span>
            <span>·</span>
            <span>Dubai, United Arab Emirates</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> SSE Stream Synchronized
            </span>
            <span>·</span>
            <span>DLD / Escrow Compliant</span>
            <span>·</span>
            <span className="text-[#94A3B8]">v3.2 Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
