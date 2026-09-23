import React, { useState, useEffect } from 'react';
import { Invoice, PaymentStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Download,
  Building,
  ShieldAlert,
  X,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { currentUser, role, hasPermission, refreshTrigger } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Record Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Escrow Wire Transfer');
  const [bankRef, setBankRef] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // New Invoice Modal
  const [newInvoiceModal, setNewInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    recipientName: '',
    recipientEmail: '',
    unitNumber: '1201',
    projectName: 'OCTA Luminar Sky Residences',
    amount: '850000',
    dueDate: '2026-10-15',
    paymentMethod: 'Escrow Wire Transfer',
  });

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const list = await api.getInvoices();
      setInvoices(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [refreshTrigger]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const res = await api.recordPayment(selectedInvoice.id, paymentMethod, bankRef);
    if (res.success) {
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedInvoice(null);
        setBankRef('');
        loadInvoices();
      }, 1000);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-octa-user-id': currentUser?.id || 'usr_fawaz',
      },
      body: JSON.stringify(invoiceForm),
    });
    if (res.ok) {
      setNewInvoiceModal(false);
      setInvoiceForm({
        recipientName: '',
        recipientEmail: '',
        unitNumber: '1201',
        projectName: 'OCTA Luminar Sky Residences',
        amount: '850000',
        dueDate: '2026-10-15',
        paymentMethod: 'Escrow Wire Transfer',
      });
      loadInvoices();
    }
  };

  // Compute metrics
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0);
  const totalDue = invoices.filter((i) => i.status === 'Due' || i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0);

  const filtered = invoices.filter((i) => {
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.invoiceNo.toLowerCase().includes(q) ||
        i.recipientName.toLowerCase().includes(q) ||
        i.unitNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              OCTA Financial Ledger
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">· DLD ESCROW & SWIFT COMPLIANT</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
            Installments & Invoices
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Escrow account settlements, SWIFT MT103 receipts, and milestone payment verifications.
          </p>
        </div>

        {hasPermission('payments.create') && (
          <button
            onClick={() => setNewInvoiceModal(true)}
            className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] text-xs font-semibold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#0F151C] border border-emerald-500/30 p-5 rounded-lg">
          <div className="text-[10px] text-emerald-400 uppercase font-mono">Realized Escrow Settlements</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            AED {totalPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">Cleared Central Bank Escrow</div>
        </div>

        <div className="bg-[#0F151C] border border-amber-500/30 p-5 rounded-lg">
          <div className="text-[10px] text-amber-400 uppercase font-mono">Pending & Due Receivables</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            AED {totalDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">Milestones nearing settlement</div>
        </div>

        <div className="bg-[#0F151C] border border-[#1E293B] p-5 rounded-lg">
          <div className="text-[10px] text-[#64748B] uppercase font-mono">Total Processed Invoices</div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#E2E8F0] mt-1">
            {invoices.length} Invoices
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">Immutable financial ledger</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111720] border border-[#1E293B] p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Paid', 'Due', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
                statusFilter === st ? 'bg-[#D4AF37] text-[#0B0F12] font-bold' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search invoice #, recipient, unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B] text-xs">Loading ledger records...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#111720] border border-[#1E293B] rounded-lg">
          <p className="font-cinzel text-lg text-[#94A3B8]">No payments recorded.</p>
          <p className="text-xs text-[#64748B] mt-1">No invoices match your selected filter.</p>
        </div>
      ) : (
        <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#090D11] border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Project & Unit</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount (AED)</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A232E] text-[#CBD5E1]">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#151D26] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#F3F4F6]">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#E2E8F0]">
                      {inv.recipientName}
                    </td>
                    <td className="py-3 px-4">
                      {inv.projectName} · Unit {inv.unitNumber}
                    </td>
                    <td className="py-3 px-4 font-mono">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">
                      AED {inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">
                      {inv.paymentMethod || 'Escrow Wire'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          inv.status === 'Paid'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                            : 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.status !== 'Paid' && hasPermission('payments.edit') ? (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1 bg-[#D4AF37] text-[#0B0F12] font-semibold rounded hover:brightness-110 cursor-pointer"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400">
                          {inv.referenceNoBank ? `Ref: ${inv.referenceNoBank}` : 'Settled'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-md w-full p-6 text-xs relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold mb-1">
              Record Escrow Settlement
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Invoice <span className="text-[#D4AF37] font-mono">{selectedInvoice.invoiceNo}</span> · Amount: <span className="text-[#F3F4F6] font-mono font-bold">AED {selectedInvoice.amount.toLocaleString()}</span>
            </p>

            {paymentSuccess && (
              <div className="p-3 mb-4 bg-emerald-950/40 border border-emerald-500/50 rounded text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Payment recorded successfully in Escrow ledger.</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-[#94A3B8] mb-1">Settlement Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Escrow Wire Transfer">Escrow Wire Transfer</option>
                  <option value="Central Bank SWIFT MT103">Central Bank SWIFT MT103</option>
                  <option value="Bank Certified Cheque">Bank Certified Cheque</option>
                  <option value="Direct Escrow Deposit">Direct Escrow Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Central Bank / Bank Wire Reference # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DXB-ESC-9948201 or SWIFT MT103 Ref"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                >
                  Confirm & Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE INVOICE MODAL */}
      {newInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-md w-full p-6 text-xs relative">
            <button
              onClick={() => setNewInvoiceModal(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold mb-1">
              Generate Installment Invoice
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Issues official escrow payment request to buyer or investor.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={invoiceForm.recipientName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, recipientName: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Recipient Email *</label>
                <input
                  type="email"
                  required
                  placeholder="elena@domain.com"
                  value={invoiceForm.recipientEmail}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, recipientEmail: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Unit Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.unitNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, unitNumber: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Amount (AED) *</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewInvoiceModal(false)}
                  className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#D4AF37] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
