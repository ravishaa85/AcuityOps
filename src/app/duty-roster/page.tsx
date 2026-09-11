'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Calendar, Users, Move, ArrowRight, Check, Sparkles } from '@/components/Icons';
import { DutyRosterItem, Nurse, Ward } from '@/types';

const SHIFT_COLUMNS: Array<{ id: DutyRosterItem['shiftType']; label: string; color: string }> = [
  { id: 'Morning', label: 'Morning', color: '#059669' },
  { id: 'Evening', label: 'Evening', color: '#2563eb' },
  { id: 'Night', label: 'Night', color: '#7c3aed' },
  { id: 'Week-off', label: 'Week-off', color: '#4b5563' },
  { id: 'Leave', label: 'Leave', color: '#dc2626' },
  { id: 'Unassigned', label: 'Unassigned', color: '#6b7280' }
];

export default function DutyRosterPage() {
  const [assignmentDate, setAssignmentDate] = useState('2024-10-10');
  const [rosters, setRosters] = useState<DutyRosterItem[]>([]);
  const [allNurses, setAllNurses] = useState<Nurse[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardFilter, setSelectedWardFilter] = useState('all');
  const [draggedNurseId, setDraggedNurseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRosterData = async () => {
    setLoading(true);
    try {
      const [rosterRes, nurseRes, wardRes] = await Promise.all([
        fetch(`/api/duty-roster?date=${assignmentDate}`),
        fetch('/api/nurses'),
        fetch('/api/wards')
      ]);
      const rosterData = await rosterRes.json();
      const nurseData = await nurseRes.json();
      const wardData = await wardRes.json();

      if (nurseData.success) setAllNurses(nurseData.data);
      if (wardData.success) setWards(wardData.data);

      if (rosterData.success) {
        setRosters(rosterData.data);
      }
    } catch (e) {
      console.error('Failed to load duty roster', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRosterData();
  }, [assignmentDate]);

  // Combine nurses with their duty roster record
  // If nurse has no roster entry for date, treat as 'Unassigned'
  const nurseShiftMap = new Map<string, DutyRosterItem['shiftType']>();
  rosters.forEach(r => nurseShiftMap.set(r.nurseId, r.shiftType));

  const filteredNurses = selectedWardFilter === 'all'
    ? allNurses
    : allNurses.filter(n => n.wardId === selectedWardFilter);

  // Group nurses by shift
  const columnNurses: Record<DutyRosterItem['shiftType'], Nurse[]> = {
    'Morning': [],
    'Evening': [],
    'Night': [],
    'Week-off': [],
    'Leave': [],
    'Unassigned': []
  };

  filteredNurses.forEach(nurse => {
    const shift = nurseShiftMap.get(nurse.id) || 'Unassigned';
    if (columnNurses[shift]) {
      columnNurses[shift].push(nurse);
    } else {
      columnNurses['Unassigned'].push(nurse);
    }
  });

  // Handle Drag & Drop move
  const handleDragStart = (e: React.DragEvent, nurseId: string) => {
    setDraggedNurseId(nurseId);
    e.dataTransfer.setData('text/plain', nurseId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetShift: DutyRosterItem['shiftType']) => {
    e.preventDefault();
    const nurseId = draggedNurseId || e.dataTransfer.getData('text/plain');
    if (!nurseId) return;

    await moveNurseToShift(nurseId, targetShift);
    setDraggedNurseId(null);
  };

  const moveNurseToShift = async (nurseId: string, shiftType: DutyRosterItem['shiftType']) => {
    const nurse = allNurses.find(n => n.id === nurseId);
    if (!nurse) return;

    // Optimistic UI update
    setRosters(prev => {
      const idx = prev.findIndex(r => r.nurseId === nurseId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], shiftType };
        return updated;
      } else {
        return [...prev, {
          id: `dr-temp-${Date.now()}`,
          nurseId,
          wardId: nurse.wardId,
          assignmentDate,
          shiftType,
          nurse
        }];
      }
    });

    try {
      await fetch('/api/duty-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurseId,
          wardId: nurse.wardId,
          date: assignmentDate,
          shiftType
        })
      });
    } catch (err) {
      console.error('Error updating duty roster', err);
      loadRosterData();
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <CalendarCheck size={26} color="#3b82f6" />
            <span>Duty Assignment Roster</span>
          </div>
          <p className="page-subtitle">
            Interactive drag and drop interface for duty assignment across hospital shifts
          </p>
        </div>

        {/* Date & Ward Filter Bar (Slide 4 exact layout) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Assignment Date:</span>
            <input
              type="date"
              value={assignmentDate}
              onChange={e => setAssignmentDate(e.target.value)}
              style={{ fontWeight: 600, fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Filter Ward:</span>
            <select
              value={selectedWardFilter}
              onChange={e => setSelectedWardFilter(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="all">All Wards</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Instructions Tip */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '10px 16px',
        fontSize: '12px',
        color: '#1d4ed8',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Move size={16} />
        <span>
          <strong>Drag and drop</strong> nurse cards between Morning, Evening, Night, Week-off, Leave, or Unassigned columns. Headcounts and competency balances update instantly.
        </span>
      </div>

      {/* Slide 4 Six-Column Drag & Drop Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        minHeight: '520px'
      }}>
        {SHIFT_COLUMNS.map((col) => {
          const nursesInCol = columnNurses[col.id] || [];
          const totalCapacity = nursesInCol.reduce((sum, n) => sum + (n.maxAcuityCapacity || 10), 0);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `4px solid ${col.color}`,
                borderTopLeftRadius: '14px',
                borderTopRightRadius: '14px'
              }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{col.label}</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {col.id !== 'Week-off' && col.id !== 'Leave' && col.id !== 'Unassigned'
                      ? `Cap: ${totalCapacity} pts`
                      : 'Non-active'}
                  </span>
                </div>

                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {nursesInCol.length}
                </span>
              </div>

              {/* Nurses Cards List */}
              <div style={{
                padding: '12px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto',
                maxHeight: '600px'
              }}>
                {nursesInCol.length === 0 ? (
                  <div style={{
                    padding: '30px 10px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}>
                    No staff assigned
                  </div>
                ) : (
                  nursesInCol.map((nurse) => {
                    const compClass = `competency-${nurse.competency.toLowerCase().replace(' ', '-')}`;

                    return (
                      <div
                        key={nurse.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, nurse.id)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'grab',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#7c3aed';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {nurse.name}
                          </span>
                          <span className={compClass} style={{ fontSize: '10px', padding: '1px 6px' }}>
                            ({nurse.competency})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                          <span>Ward: <strong style={{ color: '#0f172a' }}>{nurse.wardCode || 'B7'}</strong></span>
                          <span>Cap: <strong style={{ color: '#7c3aed' }}>{nurse.maxAcuityCapacity}</strong></span>
                        </div>

                        {/* Quick Move Dropdown on Click for Accessibility */}
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                          <select
                            value={col.id}
                            onChange={(e) => moveNurseToShift(nurse.id, e.target.value as any)}
                            style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#334155'
                            }}
                          >
                            {SHIFT_COLUMNS.map(c => (
                              <option key={c.id} value={c.id}>Move to {c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
