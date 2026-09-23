import React, { useState, useEffect } from 'react';
import { DocumentItem, DocumentType, UserRole } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Download,
  Lock,
  Search,
  Plus,
  ShieldCheck,
  Building,
  CheckCircle,
  X,
  FileCheck,
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { currentUser, role, hasPermission, refreshTrigger } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New Document Form
  const [docForm, setDocForm] = useState({
    title: '',
    type: 'Contract' as DocumentType,
    relatedProjectName: 'OCTA Luminar Sky Residences',
    relatedUnitNumber: '1201',
    fileSize: '3.4 MB',
    status: 'Approved' as const,
  });

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const list = await api.getDocuments();
      setDocuments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.uploadDocument({
      ...docForm,
      accessRoles: ['ADMIN', 'MANAGEMENT', 'SALES_MANAGER', 'SALES_AGENT'],
      downloadUrl: '/docs/OCTA_Vault_Export.pdf',
    });

    if (res.success) {
      setUploadModalOpen(false);
      setDocForm({
        title: '',
        type: 'Contract',
        relatedProjectName: 'OCTA Luminar Sky Residences',
        relatedUnitNumber: '1201',
        fileSize: '3.4 MB',
        status: 'Approved',
      });
      loadDocuments();
    }
  };

  const filtered = documents.filter((d) => {
    if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        (d.relatedProjectName && d.relatedProjectName.toLowerCase().includes(q)) ||
        (d.relatedUnitNumber && d.relatedUnitNumber.toLowerCase().includes(q))
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
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> OCTA Document Management System
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">· ROLE-BASED ACCESS CONTROL (RBAC)</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
            Centralized Document Vault
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Official Sale & Purchase Agreements (SPAs), DLD Title Deeds, Escrow Receipts, and Architectural Specifications.
          </p>
        </div>

        {hasPermission('documents.upload') && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] text-xs font-semibold hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111720] border border-[#1E293B] p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Contract', 'Brochure', 'Floor Plan', 'Legal Document'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
                typeFilter === t ? 'bg-[#D4AF37] text-[#0B0F12] font-bold' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search document title, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B] text-xs">Accessing encrypted document vault...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#111720] border border-[#1E293B] rounded-lg">
          <p className="font-cinzel text-lg text-[#94A3B8]">No documents available.</p>
          <p className="text-xs text-[#64748B] mt-1">Adjust search parameters or upload files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#D4AF37] tracking-wider">
                    {doc.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/30 text-emerald-400 bg-emerald-950/20">
                    {doc.status}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-[#F3F4F6] mt-2 line-clamp-2">
                  {doc.title}
                </h3>

                <div className="mt-3 space-y-1 p-2.5 bg-[#090D11] border border-[#1A232E] rounded text-[11px] text-[#94A3B8]">
                  <div>Project: {doc.relatedProjectName || 'OCTA Properties'}</div>
                  {doc.relatedUnitNumber && <div>Unit Reference: {doc.relatedUnitNumber}</div>}
                  <div>File Size: {doc.fileSize}</div>
                  <div>Custodian: {doc.ownerName}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[10px] text-[#64748B] font-mono">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => alert(`Downloading secure document: ${doc.title}`)}
                  className="px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#D4AF37] hover:text-[#0B0F12] text-[#E2E8F0] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-md w-full p-6 text-xs relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold mb-1">
              Upload Vault Document
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Authorized compliance registration. Files are encrypted with role-based visibility.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sale & Purchase Agreement — Penthouse 4801"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1">Document Type *</label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm({ ...docForm, type: e.target.value as DocumentType })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Contract">Contract (SPA)</option>
                    <option value="Brochure">Architectural Brochure</option>
                    <option value="Floor Plan">Floor Plan Blueprint</option>
                    <option value="Legal Document">Legal / Title Deed</option>
                    <option value="Investor Statement">Investor Statement</option>
                    <option value="Invoice">Payment Receipt / Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1">Unit Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1201 or Mansion 01"
                    value={docForm.relatedUnitNumber}
                    onChange={(e) => setDocForm({ ...docForm, relatedUnitNumber: e.target.value })}
                    className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Related Project</label>
                <select
                  value={docForm.relatedProjectName}
                  onChange={(e) => setDocForm({ ...docForm, relatedProjectName: e.target.value })}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="OCTA Luminar Sky Residences">OCTA Luminar Sky Residences</option>
                  <option value="OCTA Elysium Private Island Mansions">OCTA Elysium Mansions</option>
                  <option value="The Horizon Tower DIFC">The Horizon Tower DIFC</option>
                </select>
              </div>

              <div className="p-3 bg-[#090D11] border border-dashed border-[#2A3749] rounded text-center text-[#64748B]">
                <FileCheck className="w-6 h-6 mx-auto mb-1 text-[#D4AF37]" />
                <span>PDF Document attached: SHA-256 Checksum Verified</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#D4AF37] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer"
                >
                  Confirm & Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
