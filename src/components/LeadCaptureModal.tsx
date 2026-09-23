import React, { useState } from 'react';
import { api } from '../services/api';
import { LeadSource } from '../types';
import { X, CheckCircle, Sparkles } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');
  const [city, setCity] = useState('Dubai');
  const [budget, setBudget] = useState('7500000');
  const [preferredProjectName, setPreferredProjectName] = useState('OCTA Luminar Sky Residences');
  const [propertyType, setPropertyType] = useState('3BR Sky Penthouse');
  const [timeline, setTimeline] = useState('Immediate / Within 14 Days');
  const [source, setSource] = useState<LeadSource>('Website');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createLead({
      name,
      email,
      phone,
      country,
      city,
      budget: Number(budget),
      preferredProjectName,
      propertyType,
      timeline,
      source,
      notes,
    });

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F151C] border border-[#D4AF37]/40 rounded-lg max-w-lg w-full p-6 text-xs relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#D4AF37] mb-1 font-mono uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3.5 h-3.5" /> High-Priority Client Registration
        </div>
        <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold">
          Register VIP Buyer or Investor
        </h3>
        <p className="text-[#94A3B8] mt-1 mb-4">
          Captures client dossier, computes Smart Lead Score, and notifies the OCTA Private Office.
        </p>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-cinzel text-lg font-bold text-[#F3F4F6]">Lead Registered Successfully</h4>
            <p className="text-[#94A3B8] text-xs">
              Client profile saved to CRM database with automatic advisor assignment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[#94A3B8] mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+971 50 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Country / Nationality</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Investment Budget (AED) *</label>
                <input
                  type="number"
                  required
                  step="500000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Preferred Development</label>
                <select
                  value={preferredProjectName}
                  onChange={(e) => setPreferredProjectName(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="OCTA Luminar Sky Residences">OCTA Luminar Sky Residences</option>
                  <option value="OCTA Elysium Private Island Mansions">OCTA Elysium Mansions</option>
                  <option value="The Horizon Tower DIFC">The Horizon Tower DIFC</option>
                </select>
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Acquisition Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Immediate / Within 14 Days">Immediate / Within 14 Days</option>
                  <option value="Within 30 Days">Within 30 Days</option>
                  <option value="1-3 Months">1-3 Months</option>
                  <option value="Off-Plan Launch Speculation">Off-Plan Launch Speculation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Investment Notes & Special Requests</label>
              <textarea
                rows={2}
                placeholder="High floor preference, sea view, corporate holding entity..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer shadow-md shadow-[#D4AF37]/20"
              >
                Capture VIP Lead
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
