'use client';

import React, { useState } from 'react';
import { X, UserCheck, Sparkles, CheckSquare, Square, AlertCircle, ArrowRight } from '@/components/Icons';
import { OptimizationSummary } from '@/lib/optimizer';

interface AutoAssignModalProps {
  wardId: string;
  wardName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AutoAssignModal({
  wardId,
  wardName,
  isOpen,
  onClose,
  onSuccess
}: AutoAssignModalProps) {
  const [shift, setShift] = useState('Evening Shift (10-10-2024)');
  const [acuityCheck, setAcuityCheck] = useState(true);
  const [rosterCheck, setRosterCheck] = useState(true);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationSummary | null>(null);

  if (!isOpen) return null;

  const handleRunOptimization = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wardId,
          shiftType: shift.includes('Morning') ? 'Morning' : shift.includes('Night') ? 'Night' : 'Evening',
          date: '2024-10-10',
          overrideExisting
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert('Auto-assignment notice: ' + (data.error || 'Failed to complete assignment'));
      }
    } catch (err: any) {
      alert('Error running optimizer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAndClose = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#7c3aed" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Staff Auto-Assignment</h2>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Combinatorial Optimization & Constraint Satisfaction Engine for {wardName}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#64748b',
              background: '#f1f5f9'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Configuration / Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
              Select Shift
            </label>
            <select
              value={shift}
              onChange={e => setShift(e.target.value)}
              style={{ width: '100%', padding: '10px 14px' }}
            >
              <option value="Evening Shift (10-10-2024)">Evening Shift (10-10-2024)</option>
              <option value="Morning Shift (10-10-2024)">Morning Shift (10-10-2024)</option>
              <option value="Night Shift (10-10-2024)">Night Shift (10-10-2024)</option>
            </select>
          </div>

          {/* Readiness Prerequisites Checkboxes (exact match with Slide 7) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              onClick={() => setAcuityCheck(!acuityCheck)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              {acuityCheck ? <CheckSquare size={18} color="#7c3aed" /> : <Square size={18} color="#94a3b8" />}
              <span style={{ fontSize: '13px', color: acuityCheck ? '#0f172a' : '#64748b', fontWeight: acuityCheck ? 600 : 500 }}>
                Acuity scores are updated for all patients.
              </span>
            </div>

            <div
              onClick={() => setRosterCheck(!rosterCheck)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              {rosterCheck ? <CheckSquare size={18} color="#7c3aed" /> : <Square size={18} color="#94a3b8" />}
              <span style={{ fontSize: '13px', color: rosterCheck ? '#0f172a' : '#64748b', fontWeight: rosterCheck ? 600 : 500 }}>
                Staff shift assignments have been completed.
              </span>
            </div>

            <div
              onClick={() => setOverrideExisting(!overrideExisting)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '4px' }}
            >
              {overrideExisting ? <CheckSquare size={18} color="#d97706" /> : <Square size={18} color="#94a3b8" />}
              <span style={{ fontSize: '12px', color: overrideExisting ? '#b45309' : '#64748b', fontWeight: overrideExisting ? 600 : 500 }}>
                Re-assign patients who already have staff assigned (Override existing)
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRunOptimization}
            disabled={loading || !acuityCheck || !rosterCheck}
            className="btn-primary"
            style={{
              justifyContent: 'center',
              padding: '12px',
              fontSize: '15px',
              opacity: !acuityCheck || !rosterCheck ? 0.5 : 1
            }}
          >
            <UserCheck size={18} />
            {loading ? 'Solving Combinatorial Constraints...' : 'Assign Staff'}
          </button>

          {/* Optimization Output Summary (When generated) */}
          {result && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#047857' }}>
                    Optimization Solution Completed!
                  </h4>
                  <p style={{ fontSize: '12px', color: '#475569' }}>
                    Successfully assigned {result.totalPatientsAssigned} patients across {result.nurseWorkloads.length} nurses with balanced acuity scores.
                  </p>
                </div>
                <button
                  onClick={handleApplyAndClose}
                  className="btn-primary"
                  style={{ background: '#059669', fontSize: '12px', padding: '6px 14px' }}
                >
                  Confirm & Apply
                </button>
              </div>

              {/* Workload Balances */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                {result.nurseWorkloads.map(nw => (
                  <div key={nw.nurseId} style={{
                    background: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{nw.nurseName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {nw.competency} • <span style={{ color: '#7c3aed', fontWeight: 700 }}>{nw.totalAssignedAcuity}</span> / {nw.maxCapacity} Acuity ({nw.assignedPatientsCount} pts)
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample patient assignments list */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {result.assignments.map(a => (
                  <div key={a.patientId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #f1f5f9',
                    fontSize: '11px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge-acuity-${a.acuityCategory}`} style={{ padding: '1px 6px', fontSize: '10px' }}>
                        L{a.acuityCategory}
                      </span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{a.patientName}</span>
                      <span style={{ color: '#64748b' }}>({a.roomBed})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRight size={12} color="#94a3b8" />
                      <span style={{ color: '#6d28d9', fontWeight: 600 }}>{a.assignedNurseName}</span>
                      <span className={`competency-${a.nurseCompetency.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                        {a.nurseCompetency}
                      </span>
                      {a.continuityOfCareMatched && (
                        <span style={{ fontSize: '9px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 4px', borderRadius: '3px' }}>
                          Continuity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exact Staff Assignment Logic (Slide 7 text box) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px',
            fontSize: '11px',
            color: '#475569',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Staff Assignment Logic:
            </div>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Patients are assigned based on their acuity scores and the competency of available staff.</li>
              <li>Each staff member is assigned to patients within their competency level. Staff with lower competency levels will not be assigned patients whose acuity scores exceed their competency threshold.</li>
              <li>If multiple staff members meet the competency requirement, the system prioritizes those who were recently assigned to the same patient in the past 2 days (continuity of care).</li>
              <li>If there are no recent assignments, staff members are chosen based on their current total acuity score. Staff with lower total acuity scores are preferred to balance the workload.</li>
              <li>In case of a tie in total acuity scores, staff with higher competency levels are prioritized to ensure fair distribution of work.</li>
              <li>If no qualified staff are available, fallback staff are assigned, following the same balancing logic.</li>
              <li>Auto assignment will not be executed if a staff is already assigned to the patient unless override is checked.</li>
              <li>Assignments can be manually edited later if needed.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
