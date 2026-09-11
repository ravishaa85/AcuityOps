'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Users,
  Sparkles,
  ClipboardList,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  ChevronDown
} from '@/components/Icons';
import { Patient, Ward, Nurse, CompetencyLevel } from '@/types';
import AcuityScoringModal from '@/components/AcuityScoringModal';
import AutoAssignModal from '@/components/AutoAssignModal';

export default function WardDashboardPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('w-b7');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedPatientForAcuity, setSelectedPatientForAcuity] = useState<Patient | null>(null);
  const [selectedPatientForStaff, setSelectedPatientForStaff] = useState<Patient | null>(null);
  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);

  // Load wards list
  useEffect(() => {
    async function loadWards() {
      try {
        const res = await fetch('/api/wards');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setWards(data.data);
        }
      } catch (e) {
        console.error('Failed to load wards', e);
      }
    }
    loadWards();
  }, []);

  // Load patients and nurses for selected ward
  const loadWardData = async (wardId: string) => {
    setLoading(true);
    try {
      const [patientsRes, nursesRes] = await Promise.all([
        fetch(`/api/patients?wardId=${wardId}`),
        fetch(`/api/nurses?wardId=${wardId}`)
      ]);
      const patientsData = await patientsRes.json();
      const nursesData = await nursesRes.json();

      if (patientsData.success) setPatients(patientsData.data);
      if (nursesData.success) setNurses(nursesData.data);
    } catch (e) {
      console.error('Failed to load ward patients', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWardId) {
      loadWardData(selectedWardId);
    }
  }, [selectedWardId]);

  const activeWard = wards.find(w => w.id === selectedWardId) || wards[0];

  // Calculate Slide 6 KPI metrics
  const patientCount = patients.length;
  const acuity1Count = patients.filter(p => p.currentAcuityCategory === 1).length;
  const acuity2Count = patients.filter(p => p.currentAcuityCategory === 2).length;
  const acuity3Count = patients.filter(p => p.currentAcuityCategory === 3).length;
  const acuity4Count = patients.filter(p => p.currentAcuityCategory === 4).length;
  const totalAcuityScore = patients.reduce((sum, p) => sum + (p.currentAcuityScore || 1), 0);

  // Calculate Side Panel: Current Shift Staff Acuity Totals (Slide 6 exact)
  const staffAcuityTotals: Record<string, { nurse: Nurse; totalScore: number; patientCount: number }> = {};

  nurses.forEach(n => {
    staffAcuityTotals[n.id] = { nurse: n, totalScore: 0, patientCount: 0 };
  });

  patients.forEach(p => {
    if (p.currentShiftStaff && staffAcuityTotals[p.currentShiftStaff.nurseId]) {
      staffAcuityTotals[p.currentShiftStaff.nurseId].totalScore += (p.currentAcuityScore || 1);
      staffAcuityTotals[p.currentShiftStaff.nurseId].patientCount += 1;
    }
  });

  const staffAcuityList = Object.values(staffAcuityTotals);

  // Handle manual staff assignment
  const handleAssignStaff = async (nurseId: string) => {
    if (!selectedPatientForStaff) return;
    try {
      const res = await fetch('/api/patients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPatientForStaff.id,
          nurseId,
          shift: 'current'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPatientForStaff(null);
        loadWardData(selectedWardId);
      }
    } catch (e) {
      console.error('Staff assignment failed', e);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <HeartPulse size={26} color="#ec4899" />
            <span>Ward Patient Acuity Dashboard</span>
          </div>
          <p className="page-subtitle">
            Patients color coded by clinical acuity score • Staff competency levels & workload balance mapped in real-time
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Ward Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Ward:</span>
            <select
              value={selectedWardId}
              onChange={e => setSelectedWardId(e.target.value)}
              style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600, minWidth: '180px' }}
            >
              {wards.map(w => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Assign Staff Button (Slide 7 Trigger) */}
          <button
            onClick={() => setIsAutoAssignOpen(true)}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            <Sparkles size={16} />
            <span>Auto-Assign Staff</span>
          </button>
        </div>
      </div>

      {/* Slide 6 Top KPI Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {/* Patient Count (Purple) */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          borderRadius: '12px',
          padding: '16px 14px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Patient Count</div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {patientCount}
          </div>
        </div>

        {/* Acuity 1 Count (Green) */}
        <div style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
          borderRadius: '12px',
          padding: '16px 14px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Acuity 1 Count</div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {acuity1Count}
          </div>
        </div>

        {/* Acuity 2 Count (Blue) */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          borderRadius: '12px',
          padding: '16px 14px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Acuity 2 Count</div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {acuity2Count}
          </div>
        </div>

        {/* Acuity 3 Count (Orange) */}
        <div style={{
          background: 'linear-gradient(135deg, #d97706, #b45309)',
          borderRadius: '12px',
          padding: '16px 14px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Acuity 3 Count</div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {acuity3Count}
          </div>
        </div>

        {/* Acuity 4 Count (Red) */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          borderRadius: '12px',
          padding: '16px 14px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Acuity 4 Count</div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {acuity4Count}
          </div>
        </div>

        {/* Tot. Acuity Score (Teal) */}
        <div style={{
          background: 'linear-gradient(135deg, #0d9488, #0f766e)',
          borderRadius: '12px',
          padding: '16px 14px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Tot. Acuity Score</div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {totalAcuityScore}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Main Patient Table (left 72%) + Current Shift Staff Acuity Totals (right 28%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(320px, 1fr)', gap: '20px' }}>
        {/* Left Side: Ward Patient Acuity Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff'
          }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Ward {activeWard?.code} Patient Roster
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                • {activeWard?.name} ({activeWard?.floor})
              </span>
            </div>
          </div>

          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>UHID</th>
                  <th>Admission Number</th>
                  <th>Room</th>
                  <th>Doctor</th>
                  <th>Acuity Score</th>
                  <th>Last Acuity Update</th>
                  <th>Current Shift Staff</th>
                  <th>Next Shift Staff</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      Loading patient acuity status...
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No patients currently admitted to {activeWard?.code}.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => {
                    const acuityClass = `badge-acuity-${patient.currentAcuityCategory}`;

                    return (
                      <tr key={patient.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {patient.age}y • {patient.gender}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                          {patient.uhid}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b' }}>
                          {patient.admissionNumber}
                        </td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {patient.roomBed}
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>
                          {patient.doctorName}
                        </td>
                        <td>
                          <span className={acuityClass} style={{ fontWeight: 700, fontSize: '12px' }}>
                            {patient.currentAcuityScore}
                          </span>
                        </td>
                        <td style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {patient.lastAcuityUpdate || '11:46 AM, 10-10-2024'}
                        </td>
                        <td>
                          {patient.currentShiftStaff ? (
                            <div>
                              <div style={{ color: '#6d28d9', fontWeight: 600, fontSize: '12px' }}>
                                {patient.currentShiftStaff.nurseName}
                              </div>
                              <span className={`competency-${patient.currentShiftStaff.competency.toLowerCase().replace(' ', '-')}`}>
                                ({patient.currentShiftStaff.competency})
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#ef4444', fontSize: '11px', fontStyle: 'italic' }}>
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td>
                          {patient.nextShiftStaff ? (
                            <div>
                              <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '12px' }}>
                                {patient.nextShiftStaff.nurseName}
                              </div>
                              <span className={`competency-${patient.nextShiftStaff.competency.toLowerCase().replace(' ', '-')}`}>
                                ({patient.nextShiftStaff.competency})
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                              Not assigned
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                            {/* Acuity Assessment Action */}
                            <button
                              onClick={() => setSelectedPatientForAcuity(patient)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#fdf2f8',
                                color: '#db2777',
                                border: '1px solid #fbcfe8',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            >
                              <ClipboardList size={12} />
                              Acuity
                            </button>

                            {/* Staff Assign Action */}
                            <button
                              onClick={() => setSelectedPatientForStaff(patient)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#f5f3ff',
                                color: '#7c3aed',
                                border: '1px solid #ddd6fe',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            >
                              <UserCheck size={12} />
                              Staff
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Current Shift Staff Acuity Totals (Slide 6 exact) */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Current Shift Staff Acuity Totals
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Workload distribution across assigned nurses
            </p>
          </div>

          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Competency</th>
                  <th style={{ textAlign: 'right' }}>Total Acuity Score</th>
                </tr>
              </thead>
              <tbody>
                {staffAcuityList.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No staff assigned to current shift.
                    </td>
                  </tr>
                ) : (
                  staffAcuityList.map(({ nurse, totalScore, patientCount }) => {
                    const isOverloaded = totalScore > nurse.maxAcuityCapacity;

                    return (
                      <tr key={nurse.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                            {nurse.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {patientCount} assigned patients • Cap: {nurse.maxAcuityCapacity}
                          </div>
                        </td>
                        <td>
                          <span className={`competency-${nurse.competency.toLowerCase().replace(' ', '-')}`}>
                            {nurse.competency}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: isOverloaded ? '#dc2626' : totalScore > 0 ? '#059669' : '#94a3b8'
                          }}>
                            {totalScore}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Acuity Scoring Modal (Slide 5) */}
      {selectedPatientForAcuity && (
        <AcuityScoringModal
          patient={selectedPatientForAcuity}
          isOpen={!!selectedPatientForAcuity}
          onClose={() => setSelectedPatientForAcuity(null)}
          onSuccess={() => loadWardData(selectedWardId)}
        />
      )}

      {/* Auto Assign Modal (Slide 7) */}
      <AutoAssignModal
        wardId={selectedWardId}
        wardName={activeWard?.name || ''}
        isOpen={isAutoAssignOpen}
        onClose={() => setIsAutoAssignOpen(false)}
        onSuccess={() => loadWardData(selectedWardId)}
      />

      {/* Quick Manual Staff Assign Modal */}
      {selectedPatientForStaff && (
        <div className="modal-overlay" onClick={() => setSelectedPatientForStaff(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Assign Staff to {selectedPatientForStaff.name}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Patient Acuity: Level {selectedPatientForStaff.currentAcuityCategory} (Score {selectedPatientForStaff.currentAcuityScore})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {nurses.map(nurse => (
                <div
                  key={nurse.id}
                  onClick={() => handleAssignStaff(nurse.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.background = '#f5f3ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{nurse.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Cap: {nurse.maxAcuityCapacity} pts</div>
                  </div>
                  <span className={`competency-${nurse.competency.toLowerCase().replace(' ', '-')}`}>
                    {nurse.competency}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedPatientForStaff(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
