import React, { useState, useEffect } from 'react';
import { Unit, Project, UnitStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThreeDBuilding } from './ThreeDBuilding';
import {
  Building,
  CheckCircle,
  Clock,
  Lock,
  Filter,
  Search,
  Layers,
  Table,
  Grid,
  Box,
  ChevronRight,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  Shield,
  X,
} from 'lucide-react';

interface InventoryViewProps {
  onReserveClick?: (unit: Unit) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = () => {
  const { currentUser, role, hasPermission, refreshTrigger } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'table' | '3d' | 'grid'>('matrix');

  // Modals
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [clientNameInput, setClientNameInput] = useState('');
  const [reservationNotes, setReservationNotes] = useState('');
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<UnitStatus>('Available');
  const [statusReason, setStatusReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, pList] = await Promise.all([api.getUnits(), api.getProjects()]);
      setUnits(uList);
      setProjects(pList);
    } catch (e) {
      console.error('Error loading inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Compute live metrics
  const totalUnits = units.length;
  const availableUnits = units.filter((u) => u.status === 'Available').length;
  const reservedUnits = units.filter((u) => u.status === 'Reserved').length;
  const soldUnits = units.filter((u) => u.status === 'Sold').length;
  const holdUnits = units.filter((u) => u.status === 'Hold' || u.status === 'Blocked' || u.status === 'Under Contract').length;

  // Filtered units
  const filteredUnits = units.filter((u) => {
    if (selectedProjectId && u.projectId !== selectedProjectId) return false;
    if (selectedStatus !== 'All' && u.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        u.unitNumber.toLowerCase().includes(q) ||
        u.type.toLowerCase().includes(q) ||
        u.view.toLowerCase().includes(q) ||
        u.projectName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Group units by Floor for Matrix View
  const floorsMap = filteredUnits.reduce<Record<number, Unit[]>>((acc, unit) => {
    if (!acc[unit.floor]) acc[unit.floor] = [];
    acc[unit.floor].push(unit);
    return acc;
  }, {});

  const sortedFloors = Object.keys(floorsMap)
    .map(Number)
    .sort((a, b) => b - a); // Highest floor first

  // Status color helpers
  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
      case 'Reserved':
        return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      case 'Sold':
        return 'text-[#64748B] border-[#334155] bg-[#16202C]/40';
      case 'Hold':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
      case 'Under Contract':
        return 'text-purple-400 border-purple-500/30 bg-purple-950/20';
      case 'Blocked':
        return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
      default:
        return 'text-gray-400 border-gray-500/30';
    }
  };

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setReserveError(null);
    setReserveSuccess(null);

    const client = clientNameInput.trim() || currentUser?.name || 'Private Client';
    const res = await api.reserveUnit(selectedUnit.id, undefined, client, reservationNotes);

    if (!res.success) {
      setReserveError(res.error || 'Failed to reserve unit.');
      return;
    }

    setReserveSuccess(`Unit ${selectedUnit.unitNumber} reserved successfully for ${client}. 72-hour lock active.`);
    setTimeout(() => {
      setReserveModalOpen(false);
      setReserveSuccess(null);
      setSelectedUnit(res.unit || null);
      loadData();
    }, 1200);
  };

  const handleReleaseReservation = async (unit: Unit) => {
    const reason = window.prompt(`Confirm release of Unit ${unit.unitNumber} back to Available inventory:`, 'Client reservation window expired');
    if (reason === null) return;

    const res = await api.releaseUnit(unit.id, reason);
    if (!res.success) {
      alert(res.error || 'Failed to release unit.');
      return;
    }
    loadData();
    if (selectedUnit?.id === unit.id) {
      setSelectedUnit(res.unit || null);
    }
  };

  const handleStatusChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    const res = await api.updateUnitStatus(selectedUnit.id, targetStatus, statusReason);
    if (!res.success) {
      alert(res.error || 'Failed to change status');
      return;
    }
    setStatusChangeModalOpen(false);
    setSelectedUnit(res.unit || null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Real-time Live Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Live Property Inventory
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-[#64748B]">CONCURRENCY SAFEGUARD ACTIVE</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-[#F3F4F6] font-bold mt-1">
            Units & Architectural Matrix
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time multi-agent synchronized availability, floor allocations, and transaction-safe reservations.
          </p>
        </div>

        {/* Live Inventory Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-[#111720] border border-[#1E293B] p-2.5 rounded">
            <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Total Units</div>
            <div className="text-lg font-mono font-bold text-[#E2E8F0]">{totalUnits}</div>
          </div>
          <div className="bg-[#111720] border border-emerald-500/20 p-2.5 rounded">
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Available</div>
            <div className="text-lg font-mono font-bold text-emerald-400">{availableUnits}</div>
          </div>
          <div className="bg-[#111720] border border-amber-500/20 p-2.5 rounded">
            <div className="text-[10px] text-amber-400 uppercase tracking-wider">Reserved / Lock</div>
            <div className="text-lg font-mono font-bold text-amber-400">{reservedUnits}</div>
          </div>
          <div className="bg-[#111720] border border-[#334155] p-2.5 rounded">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Sold / Contract</div>
            <div className="text-lg font-mono font-bold text-[#94A3B8]">{soldUnits + holdUnits}</div>
          </div>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="bg-[#111720] border border-[#1E293B] p-3 rounded-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Project Selector & Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] rounded px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">All OCTA Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-[#0B0F12] border border-[#2A3749] p-0.5 rounded">
            {['All', 'Available', 'Reserved', 'Sold', 'Hold'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#D4AF37] text-[#0B0F12] font-semibold'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search unit #, type, view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F12] border border-[#2A3749] text-[#E2E8F0] pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#0B0F12] border border-[#2A3749] p-0.5 rounded self-start lg:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'matrix' ? 'bg-[#1E293B] text-[#D4AF37] font-medium' : 'text-[#94A3B8]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Floor Matrix
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d' ? 'bg-[#1E293B] text-[#D4AF37] font-medium' : 'text-[#94A3B8]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D Architectural
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'bg-[#1E293B] text-[#D4AF37] font-medium' : 'text-[#94A3B8]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Data Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#1E293B] text-[#D4AF37] font-medium' : 'text-[#94A3B8]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Cards Grid
          </button>
        </div>
      </div>

      {/* MAIN VIEW CONTENTS */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B] text-xs">Synchronizing database inventory...</div>
      ) : filteredUnits.length === 0 ? (
        <div className="py-20 text-center bg-[#111720] border border-[#1E293B] rounded-lg">
          <p className="font-cinzel text-lg text-[#94A3B8]">No properties available.</p>
          <p className="text-xs text-[#64748B] mt-1">Adjust filters or search parameters to view inventory.</p>
        </div>
      ) : (
        <>
          {/* 1. FLOOR MATRIX VIEW */}
          {viewMode === 'matrix' && (
            <div className="space-y-4">
              <div className="text-xs text-[#94A3B8] flex items-center justify-between">
                <span>Displaying units by floorplate level. Click any unit to inspect or reserve.</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Reserved
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
                    <span className="w-2 h-2 rounded-full bg-[#64748B]" /> Sold
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {sortedFloors.map((floor) => (
                  <div
                    key={floor}
                    className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-[#2A3749] transition-colors"
                  >
                    {/* Floor Label */}
                    <div className="w-28 shrink-0">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37]">
                        Level {floor}
                      </div>
                      <div className="text-xs text-[#94A3B8] font-sans">
                        {floor >= 40 ? 'Sky Penthouses' : floor >= 20 ? 'High Zone Suites' : 'Mid Zone Residences'}
                      </div>
                    </div>

                    {/* Unit Cards in Floor Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 w-full">
                      {floorsMap[floor].map((unit) => {
                        const isAvailable = unit.status === 'Available';
                        const isReserved = unit.status === 'Reserved';

                        return (
                          <div
                            key={unit.id}
                            onClick={() => setSelectedUnit(unit)}
                            className={`p-3 rounded border text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                              isAvailable
                                ? 'bg-[#121B24] border-emerald-500/40 hover:border-emerald-400'
                                : isReserved
                                ? 'bg-[#1C1814] border-amber-500/40 hover:border-amber-400'
                                : 'bg-[#111720] border-[#2A3749] hover:border-[#475569]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-sm text-[#F3F4F6]">
                                Unit {unit.unitNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border ${getStatusBadge(unit.status)}`}>
                                {unit.status}
                              </span>
                            </div>

                            <div className="text-[#94A3B8] text-[11px] mt-1.5 truncate">
                              {unit.type} · {unit.areaSqFt.toLocaleString()} sq.ft
                            </div>
                            <div className="text-[#64748B] text-[10px] truncate">{unit.view}</div>

                            <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                              <span className="font-mono font-semibold text-[#D4AF37]">
                                AED {unit.price.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-[#94A3B8] hover:text-[#F3F4F6]">
                                Inspect →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 3D ARCHITECTURAL VIEW */}
          {viewMode === '3d' && (
            <div className="space-y-4">
              <ThreeDBuilding units={units} onSelectUnit={(u) => setSelectedUnit(u)} />
              <div className="bg-[#111720] border border-[#1E293B] p-4 rounded-lg text-xs text-[#94A3B8] flex items-center justify-between">
                <span>
                  Rotate by dragging. Click a floor plate button below the 3D model to inspect specific units.
                </span>
                <span className="font-mono text-[#D4AF37]">Live Database Synchronization: Active</span>
              </div>
            </div>
          )}

          {/* 3. DENSE DATA TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-[#0F151C] border border-[#1E293B] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090D11] border-b border-[#1E293B] text-[#94A3B8] uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Unit #</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Floor</th>
                      <th className="py-3 px-4">Layout Type</th>
                      <th className="py-3 px-4">Area (Sq.Ft)</th>
                      <th className="py-3 px-4">View</th>
                      <th className="py-3 px-4">Price (AED)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A232E] text-[#CBD5E1]">
                    {filteredUnits.map((u) => (
                      <tr key={u.id} className="hover:bg-[#151D26] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#F3F4F6]">
                          {u.unitNumber}
                        </td>
                        <td className="py-3 px-4 truncate max-w-[150px]">{u.projectName}</td>
                        <td className="py-3 px-4 font-mono">L{u.floor}</td>
                        <td className="py-3 px-4">{u.type}</td>
                        <td className="py-3 px-4 font-mono">{u.areaSqFt.toLocaleString()}</td>
                        <td className="py-3 px-4 text-[#94A3B8] truncate max-w-[160px]">{u.view}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#D4AF37]">
                          AED {u.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border ${getStatusBadge(u.status)}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedUnit(u)}
                            className="px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#2A3749] text-[#E2E8F0] transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          {u.status === 'Available' && (
                            <button
                              onClick={() => {
                                setSelectedUnit(u);
                                setReserveModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-[#D4AF37] hover:brightness-110 text-[#0B0F12] font-semibold transition-colors cursor-pointer"
                            >
                              Reserve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. CARDS GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnits.map((u) => (
                <div
                  key={u.id}
                  className="bg-[#0F151C] border border-[#1E293B] rounded-lg p-5 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-base text-[#F3F4F6]">
                        Unit {u.unitNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border ${getStatusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#E2E8F0]">{u.type}</div>
                    <div className="text-[#94A3B8] text-[11px] mt-1">{u.projectName} · Floor {u.floor}</div>

                    <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-[#090D11] rounded border border-[#1A232E] text-[11px]">
                      <div>
                        <span className="text-[#64748B]">Area:</span>{' '}
                        <span className="font-mono text-[#E2E8F0]">{u.areaSqFt} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-[#64748B]">Beds/Baths:</span>{' '}
                        <span className="font-mono text-[#E2E8F0]">{u.bedrooms}B / {u.bathrooms}B</span>
                      </div>
                      <div className="col-span-2 truncate">
                        <span className="text-[#64748B]">View:</span>{' '}
                        <span className="text-[#CBD5E1]">{u.view}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#1E293B] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#64748B] uppercase">Price</div>
                      <div className="font-mono text-sm font-bold text-[#D4AF37]">
                        AED {u.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUnit(u)}
                        className="px-2.5 py-1.5 rounded bg-[#1E293B] hover:bg-[#2A3749] text-[#E2E8F0] cursor-pointer"
                      >
                        Inspect
                      </button>
                      {u.status === 'Available' && (
                        <button
                          onClick={() => {
                            setSelectedUnit(u);
                            setReserveModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer"
                        >
                          Reserve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* UNIT INSPECTION DRAWER / MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-xl w-full p-6 text-xs relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedUnit(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37]">
                Architectural Unit Dossier
              </span>
              <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono border ${getStatusBadge(selectedUnit.status)}`}>
                {selectedUnit.status}
              </span>
            </div>

            <h2 className="font-cinzel text-xl sm:text-2xl text-[#F3F4F6] font-bold mt-1">
              Unit {selectedUnit.unitNumber} · {selectedUnit.projectName}
            </h2>
            <p className="text-[#94A3B8] mt-0.5">{selectedUnit.type} — Floor {selectedUnit.floor}</p>

            {/* Price & Specs Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#090D11] border border-[#1E293B] p-3 rounded-lg my-4">
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Price (AED)</div>
                <div className="font-mono text-sm font-bold text-[#D4AF37]">
                  AED {selectedUnit.price.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Internal Area</div>
                <div className="font-mono text-sm text-[#E2E8F0]">
                  {selectedUnit.areaSqFt.toLocaleString()} sq.ft
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Bedrooms</div>
                <div className="font-mono text-sm text-[#E2E8F0]">{selectedUnit.bedrooms} Beds</div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] uppercase">Bathrooms</div>
                <div className="font-mono text-sm text-[#E2E8F0]">{selectedUnit.bathrooms} Baths</div>
              </div>
            </div>

            {/* Detail Attributes */}
            <div className="space-y-2 text-[#CBD5E1]">
              <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Panoramic View:</span>
                <span className="font-medium text-[#E2E8F0]">{selectedUnit.view}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Payment Plan Structure:</span>
                <span className="font-medium text-[#E2E8F0]">
                  {selectedUnit.paymentPlanSummary || 'Standard 20% Deposit / 50% During Construction / 30% Handover'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                <span className="text-[#64748B]">Assigned Advisor:</span>
                <span className="font-medium text-[#E2E8F0]">
                  {selectedUnit.assignedAgentName || 'OCTA Prime Portfolio Advisory'}
                </span>
              </div>
              {selectedUnit.reservedByClientName && (
                <div className="flex justify-between py-1.5 border-b border-[#1E293B]">
                  <span className="text-[#64748B]">Reserved For:</span>
                  <span className="font-medium text-amber-400">{selectedUnit.reservedByClientName}</span>
                </div>
              )}
              {selectedUnit.notes && (
                <div className="py-2">
                  <span className="text-[#64748B] block mb-1">Architectural Notes:</span>
                  <p className="p-2.5 bg-[#090D11] border border-[#1E293B] rounded text-[#94A3B8]">
                    {selectedUnit.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Admin Status Overrider */}
                {hasPermission('properties.edit') && (
                  <button
                    onClick={() => {
                      setTargetStatus(selectedUnit.status);
                      setStatusChangeModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded bg-[#1A232E] hover:bg-[#243142] text-[#CBD5E1] transition-colors cursor-pointer"
                  >
                    Change Status
                  </button>
                )}
                {selectedUnit.status === 'Reserved' && hasPermission('units.reserve') && (
                  <button
                    onClick={() => handleReleaseReservation(selectedUnit)}
                    className="px-3 py-1.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 cursor-pointer"
                  >
                    Release Reservation
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedUnit.status === 'Available' && (
                  <button
                    onClick={() => setReserveModalOpen(true)}
                    className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                  >
                    Lock & Reserve Unit
                  </button>
                )}
                <button
                  onClick={() => setSelectedUnit(null)}
                  className="px-3 py-2 rounded bg-[#16202C] hover:bg-[#1E293B] text-[#94A3B8] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION-SAFE RESERVE MODAL */}
      {reserveModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#D4AF37]/50 rounded-lg max-w-md w-full p-6 text-xs relative">
            <button
              onClick={() => setReserveModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#D4AF37] mb-1 font-mono uppercase tracking-wider text-[10px]">
              <Lock className="w-3.5 h-3.5" /> Concurrency Safe Reservation
            </div>
            <h3 className="font-cinzel text-xl text-[#F3F4F6] font-bold">
              Reserve Unit {selectedUnit.unitNumber}
            </h3>
            <p className="text-[#94A3B8] mt-1">
              Secures a 72-hour transactional lock in the central OCTA database. Prevents concurrent reservations.
            </p>

            {reserveError && (
              <div className="my-3 p-3 bg-rose-950/40 border border-rose-500/50 rounded text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{reserveError}</span>
              </div>
            )}

            {reserveSuccess && (
              <div className="my-3 p-3 bg-emerald-950/40 border border-emerald-500/50 rounded text-emerald-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{reserveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleReserveSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Buyer / Client Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian Sterling / Sheikh Tariq Al-Sabah"
                  value={clientNameInput}
                  onChange={(e) => setClientNameInput(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Reservation Reference / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Escrow deposit cheque received; passport copy attached."
                  value={reservationNotes}
                  onChange={(e) => setReservationNotes(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="p-3 bg-[#090D11] border border-[#1E293B] rounded text-[#64748B] text-[11px]">
                Reservation price: <span className="text-[#D4AF37] font-mono">AED {selectedUnit.price.toLocaleString()}</span>. A notification will be dispatched across all executive dashboards immediately.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReserveModalOpen(false)}
                  className="px-3 py-2 rounded bg-[#16202C] hover:bg-[#1E293B] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN STATUS CHANGE MODAL */}
      {statusChangeModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F151C] border border-[#2A3749] rounded-lg max-w-md w-full p-6 text-xs relative">
            <button
              onClick={() => setStatusChangeModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-lg text-[#F3F4F6] font-bold mb-1">
              Update Unit {selectedUnit.unitNumber} Status
            </h3>
            <p className="text-[#94A3B8] mb-4">
              Authorized operational override. Creates an immutable Audit Log entry.
            </p>

            <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">New Status *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as UnitStatus)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Hold">Hold</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Audit Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sold via Geneva family office roadshow"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full bg-[#090D11] border border-[#2A3749] text-[#E2E8F0] px-3 py-2 rounded focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusChangeModalOpen(false)}
                  className="px-3 py-2 rounded bg-[#16202C] text-[#94A3B8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#D4AF37] text-[#0B0F12] font-semibold hover:brightness-110 cursor-pointer"
                >
                  Save & Log Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
