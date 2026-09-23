import React, { useState, useEffect } from 'react';
import { Investor, InvestmentRecord, Installment, DocumentItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  Building,
  FileCheck,
  CreditCard,
  Download,
  Lock,
  ExternalLink,
  DollarSign,
  User,
  CheckCircle2,
} from 'lucide-react';

export const InvestorPortalView: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [data, setData] = useState<{
    investor: Investor;
    investments: InvestmentRecord[];
    installments: Installment[];
    documents: DocumentItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        // Load investor portfolio
        const res = await api.getInvestorPortfolio(currentUser?.id || 'inv_sheikh');
        setData(res);
      } catch (e) {
        console.error('Error loading investor portfolio:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [currentUser]);

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-xs text-[#64748B]">
        Decrypting secure investor vault records...
      </div>
    );
  }

  const { investor, investments, installments, documents } = data;
  const totalValuation = investments.reduce((acc, i) => acc + i.currentValuation, 0);
  const totalInvested = investments.reduce((acc, i) => acc + i.amountPaid, 0);
  const capitalGain = totalValuation - totalInvested;
  const gainPercentage = totalInvested > 0 ? ((capitalGain / totalInvested) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header & Vault Security Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> OCTA Private Wealth Vault
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">· END-TO-END ENCRYPTED</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
            Investor Portfolio & Asset Governance
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Institutional portfolio reporting for <span className="text-[#F3F4F6] font-semibold">{investor.fullName}</span> ({investor.taxOrPassportId}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#111720] border border-emerald-500/30 px-3 py-1.5 rounded flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-[#64748B] uppercase">KYC / AML Status</div>
              <div className="font-mono text-emerald-400 font-semibold">{investor.kycStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
            Total Asset Portfolio Value
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#D4AF37] mt-1">
            AED {totalValuation.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +{gainPercentage}% Capital Appreciation
          </div>
        </div>

        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
            Realized Invested Capital
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#F3F4F6] mt-1">
            AED {totalInvested.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2">
            100% Escrow Settled & Cleared
          </div>
        </div>

        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
            Secured Prime Assets
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#E2E8F0] mt-1">
            {investments.length} Luxury Unit
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-2">
            Palm Jumeirah Signature Enclave
          </div>
        </div>

        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">
            Assigned Portfolio Director
          </div>
          <div className="font-sans text-base font-bold text-[#F3F4F6] mt-1 truncate">
            {investor.managerName}
          </div>
          <div className="text-[11px] text-[#C5A880] mt-2">
            Senior Vice President — Global Sales
          </div>
        </div>
      </div>

      {/* Property Investments Detail */}
      <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
        <h2 className="font-cinzel text-lg font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#D4AF37]" /> Active Property Holdings
        </h2>

        <div className="space-y-4">
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="bg-[#090D11] border border-[#1E293B] rounded-lg p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-[#F3F4F6]">
                    {inv.unitNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                    Title Deed Issued
                  </span>
                </div>
                <div className="text-sm text-[#E2E8F0] font-medium mt-1">{inv.projectName}</div>
                <div className="text-[#94A3B8] text-[11px] mt-0.5">
                  Acquisition Date: {new Date(inv.purchaseDate).toLocaleDateString()} · Escrow Clearance Complete
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase">Purchase Price</div>
                  <div className="font-mono text-sm font-bold text-[#E2E8F0]">
                    AED {inv.purchasePrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase">Current Valuation (Knight Frank)</div>
                  <div className="font-mono text-sm font-bold text-[#D4AF37]">
                    AED {inv.currentValuation.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase">Outstanding Balance</div>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    AED {inv.amountOutstanding.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Milestones & Private Document Vault Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Payment Milestones Schedule */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
          <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#D4AF37]" /> Payment Plan Milestones
          </h2>

          <div className="space-y-3">
            {installments.map((ins) => (
              <div
                key={ins.id}
                className="p-3 bg-[#090D11] border border-[#1E293B] rounded flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-[#E2E8F0]">{ins.milestoneName}</div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                    Invoice Ref: {ins.referenceInvoiceNo} · {ins.paymentMethod}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#D4AF37]">
                    AED {ins.amount.toLocaleString()}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-mono text-emerald-400">
                    ✓ Paid on {ins.paidDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secure Document Vault */}
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-6">
          <h2 className="font-cinzel text-base font-bold text-[#F3F4F6] mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#D4AF37]" /> Private Document Vault
          </h2>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-[#64748B] py-6 text-center">No investor documents.</div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-[#090D11] border border-[#1E293B] rounded flex items-center justify-between hover:border-[#2A3749] transition-colors"
                >
                  <div className="truncate pr-3">
                    <div className="font-medium text-[#E2E8F0] truncate">{doc.title}</div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                      {doc.type} · {doc.fileSize} · Status: {doc.status}
                    </div>
                  </div>
                  <a
                    href={doc.downloadUrl}
                    download
                    onClick={(e) => {
                      // Prevent broken URL, simulated download toast
                      e.preventDefault();
                      alert(`Initiating secure download of: ${doc.title}`);
                    }}
                    className="px-3 py-1.5 rounded bg-[#16202C] hover:bg-[#D4AF37] hover:text-[#0B0F12] text-[#C5A880] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
