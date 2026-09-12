'use client';

import React, { useState, useEffect } from 'react';
import { UserSquare2, Search, X, Filter, RefreshCw, Database, Activity } from '@/components/Icons';


import { Patient, Ward, HISSyncResult } from '@/types';

export default function PatientMasterPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [loading, setLoading] = useState(true);
  const [syncingHis, setSyncingHis] = useState(false);
  const [syncResult, setSyncResult] = useState<HISSyncResult | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsRes, wardsRes, statusRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/wards'),
        fetch('/api/his/sync')
      ]);
      const patientsJson = await patientsRes.json();
      const wardsJson = await wardsRes.json();
      const statusJson = await statusRes.json();

      if (patientsJson.success) setPatients(patientsJson.data);
      if (wardsJson.success) setWards(wardsJson.data);
      if (statusJson.success && statusJson.data?.lastSyncedAt) {
        setLastSyncedAt(statusJson.data.lastSyncedAt);
      }
    } catch (e) {
      console.error('Failed to load patient master', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncHis = async () => {
    setSyncingHis(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/his/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncWards: true, syncPatients: true })
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data.data);
        setLastSyncedAt(data.data.syncedAt);
        await loadData();
      } else {
        alert('HIS Sync Failed: ' + data.error);
      }
    } catch (err: any) {
      alert('Error connecting to HIS Web Service: ' + err.message);
    } finally {
      setSyncingHis(false);
    }
  };



  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      (p.admissionNumber && p.admissionNumber.toLowerCase().includes(q)) ||
      p.doctorName.toLowerCase().includes(q) ||
      p.roomBed.toLowerCase().includes(q) ||
      (p.diagnosis && p.diagnosis.toLowerCase().includes(q));

    const matchesWard = selectedWard === 'all' || p.wardId === selectedWard;
    return matchesSearch && matchesWard;
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hisPatientsCount = patients.filter(p => p.source === 'HIS').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">
            <UserSquare2 size={26} color="#7c3aed" />
            <span>Patient Registry & HIS Inpatient Directory</span>
          </div>
          <p className="page-subtitle">
            Synchronized with SIMS Hospital Information System (HIS) live inpatient web services • Clinical acuity tracking & bed management
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              HIS Web Service Connected
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Active Inpatients: <strong style={{ color: '#0f172a' }}>{patients.length}</strong>
              {hisPatientsCount > 0 && ` (${hisPatientsCount} synced from HIS)`}
            </span>
            {lastSyncedAt && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Last synced: {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(lastSyncedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSyncHis}
            disabled={syncingHis}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              fontWeight: 600,
              background: syncingHis ? '#f1f5f9' : '#ffffff',
              borderColor: '#7c3aed',
              color: '#7c3aed'
            }}
            title="Sync all active inpatients from SIMS Hospital HIS API"
          >
            <RefreshCw
              size={16}
              style={{
                animation: syncingHis ? 'spin 1s linear infinite' : 'none'
              }}
            />
            <span>{syncingHis ? 'Syncing with HIS...' : 'Sync with HIS'}</span>
          </button>
        </div>
      </div>


      {/* Sync Notification Banner */}
      {syncResult && (
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
          border: '1px solid #ddd6fe',
          borderRadius: '10px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#7c3aed',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4c1d95' }}>
                HIS Inpatient Data Synchronized Successfully
              </div>
              <div style={{ fontSize: '12px', color: '#6d28d9' }}>
                Fetched {syncResult.patients.totalFetched} active inpatients ({syncResult.patients.newAdmitted} new admitted, {syncResult.patients.updated} updated) across {syncResult.wards.totalFetched} hospital wards.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSyncResult(null)}
            style={{ color: '#7c3aed', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Search & Filter Toolbar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Patient Name, UHID, IP No, Bed, Doctor, Diagnosis..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '36px', width: '380px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Filter Ward:</span>
              <select
                value={selectedWard}
                onChange={e => {
                  setSelectedWard(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ fontSize: '12px', maxWidth: '240px' }}
              >
                <option value="all">All Wards ({wards.length})</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                ))}
              </select>
            </div>

            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing <strong>{filteredPatients.length}</strong> patients
            </span>
          </div>
        </div>

        {/* Patients Table */}
        <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Patient Name</th>
                <th style={{ width: '10%' }}>UHID</th>
                <th style={{ width: '10%' }}>IP No</th>
                <th style={{ width: '16%' }}>Ward & Bed</th>
                <th style={{ width: '18%' }}>Attending Doctor</th>
                <th style={{ width: '14%' }}>Diagnosis</th>
                <th style={{ width: '10%' }}>Acuity Tier</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px', display: 'block', color: '#7c3aed' }} />
                    Loading patient directory from database & HIS...
                  </td>
                </tr>
              ) : paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    No patients found matching your search or filter.
                  </td>
                </tr>
              ) : (

                paginatedPatients.map(patient => {
                  const acuityClass = `badge-acuity-${patient.currentAcuityCategory}`;

                  return (
                    <tr key={patient.id}>
                      {/* Patient Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
                          {patient.source === 'HIS' && (
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              HIS
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {patient.age}y • {patient.gender} • Admitted: {patient.admissionDate}
                        </div>
                      </td>

                      {/* UHID */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                        {patient.uhid}
                      </td>

                      {/* IP No */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#7c3aed' }}>
                        {patient.admissionNumber || '-'}
                      </td>

                      {/* Ward & Bed */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '11px'
                          }}>
                            {patient.wardCode || 'WARD'}
                          </span>
                          <span style={{ color: '#0f172a', fontSize: '12px' }}>{patient.roomBed || '-'}</span>
                        </div>
                        {patient.wardName && (
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {patient.wardName}
                          </div>
                        )}
                      </td>

                      {/* Attending Doctor */}
                      <td style={{ fontSize: '12px', color: '#1e293b', fontWeight: 500 }}>
                        {patient.doctorName}
                      </td>

                      {/* Clinical Diagnosis */}
                      <td style={{ fontSize: '12px', color: '#475569', lineHeight: 1.3 }}>
                        <span title={patient.diagnosis}>
                          {patient.diagnosis || 'Clinical evaluation in progress'}
                        </span>
                      </td>

                      {/* Acuity Tier */}
                      <td>
                        <span className={acuityClass}>
                          Level {patient.currentAcuityCategory} ({patient.currentAcuityScore})
                        </span>
                        {patient.currentShiftStaff && (
                          <div style={{ fontSize: '10px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                            Nurse: {patient.currentShiftStaff.nurseName.split(' ')[0]}
                          </div>
                        )}
                      </td>
                    </tr>

                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} inpatients
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              Previous
            </button>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', margin: '0 8px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

