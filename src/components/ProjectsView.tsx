import React, { useState, useEffect } from 'react';
import { Project, Unit } from '../types';
import { api } from '../services/api';
import {
  Building,
  MapPin,
  Calendar,
  Layers,
  Download,
  CheckCircle,
  Clock,
  ArrowRight,
  Compass,
  FileText,
  X,
} from 'lucide-react';

interface ProjectsViewProps {
  onSelectProjectUnits?: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProjectUnits }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pList, uList] = await Promise.all([api.getProjects(), api.getUnits()]);
        setProjects(pList);
        setUnits(uList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-xs text-[#64748B]">Loading flagship architectural developments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            OCTA Signature Portfolio
          </span>
          <span className="text-[11px] font-mono text-[#64748B]">· ARCHITECTURAL MASTERWORKS</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
          Flagship Developments & Masterplans
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Ultra-luxury residential towers, private beachfront estates, and prime commercial towers across Dubai.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const projUnits = units.filter((u) => u.projectId === proj.id);
          const availableUnits = projUnits.filter((u) => u.status === 'Available').length;
          const startingPrice = projUnits.length > 0 ? Math.min(...projUnits.map((u) => u.price)) : 0;

          return (
            <div
              key={proj.id}
              className="bg-[#0F151C] border border-[#1E293B] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all text-xs group"
            >
              <div>
                {/* Hero Project Image */}
                <div className="relative h-56 overflow-hidden bg-[#090D11]">
                  <img
                    src={proj.heroImage}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F151C] via-transparent to-black/40" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#0B0F12]/80 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                      {proj.status}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#E2E8F0] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {proj.location}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h2 className="font-cinzel text-lg font-bold text-[#F3F4F6] group-hover:text-[#D4AF37] transition-colors">
                    {proj.name}
                  </h2>
                  <p className="text-[#94A3B8] text-[11px] line-clamp-2">{proj.description}</p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#090D11] border border-[#1A232E] rounded text-[11px]">
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Completion</span>
                      <span className="font-mono text-[#E2E8F0]">{proj.completionDate}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Available</span>
                      <span className="font-mono text-emerald-400 font-bold">{availableUnits} Units</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Starting From</span>
                      <span className="font-mono text-[#D4AF37] font-semibold">
                        AED {(startingPrice / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase">Total Storeys</span>
                      <span className="font-mono text-[#E2E8F0]">48 Floors</span>
                    </div>
                  </div>

                  {/* Highlights tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.highlights?.slice(0, 3).map((hl, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#16202C] text-[#CBD5E1] border border-[#243142]"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-[#1E293B] flex items-center justify-between mt-4">
                <button
                  onClick={() => setSelectedProject(proj)}
                  className="text-xs text-[#94A3B8] hover:text-[#D4AF37] font-medium flex items-center gap-1 cursor-pointer"
                >
                  Architectural Dossier →
                </button>
                <button
                  onClick={() => onSelectProjectUnits && onSelectProjectUnits(proj.id)}
                  className="px-3 py-1.5 rounded bg-[#D4AF37] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer text-xs"
                >
                  View Inventory
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROJECT DETAILS DOSSIER MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-2xl w-full p-6 text-xs relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37]">
              Architectural Masterplan Dossier
            </span>
            <h2 className="font-cinzel text-2xl text-[#F3F4F6] font-bold mt-1">
              {selectedProject.name}
            </h2>
            <p className="text-[#94A3B8] mt-1">{selectedProject.location} · {selectedProject.completionDate}</p>

            <div className="my-4 rounded-lg overflow-hidden h-64 bg-black">
              <img
                src={selectedProject.heroImage}
                alt={selectedProject.name}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-[#CBD5E1] text-xs leading-relaxed">{selectedProject.description}</p>

            <div className="my-4">
              <h3 className="font-cinzel text-sm font-bold text-[#D4AF37] mb-2">
                Curated Amenities & Engineering Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedProject.highlights?.map((h, idx) => (
                  <div key={idx} className="p-2.5 bg-[#090D11] border border-[#1E293B] rounded flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span className="text-[#E2E8F0]">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1E293B]">
              <button
                onClick={() => {
                  alert(`Downloading VIP Brochure for ${selectedProject.name}`);
                }}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#2A3749] text-[#E2E8F0] rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Brochure (PDF)
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  if (onSelectProjectUnits) onSelectProjectUnits(selectedProject.id);
                }}
                className="px-4 py-2 bg-[#D4AF37] text-[#0B0F12] font-semibold rounded hover:brightness-110 cursor-pointer"
              >
                Inspect Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
