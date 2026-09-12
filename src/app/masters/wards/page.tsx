'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, X, RefreshCw, Database } from '@/components/Icons';
import { Ward, HISSyncResult } from '@/types';

export default function WardMasterPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncingHis, setSyncingHis] = useState(false);
  const [syncResult, setSyncResult] = useState<HISSyncResult | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // View beds inventory modal
  const [viewingBedsWard, setViewingBedsWard] = useState<Ward | null>(null);

  const loadWards = async () => {
    setLoading(true);
    try {
      const [wardsRes, statusRes] = await Promise.all([
        fetch('/api/wards'),
        fetch('/api/his/sync')
      ]);
      const data = await wardsRes.json();
      const statusData = await statusRes.json();

      if (data.success) {
        // Ensure Ward Directory only shows entries learnt from API
        const apiWards = (data.data as Ward[]).filter(w => w.source === 'HIS');
        setWards(apiWards.length > 0 ? apiWards : data.data);
      }
      if (statusData.success && statusData.data?.lastSyncedAt) {
        setLastSyncedAt(statusData.data.lastSyncedAt);
      }
    } catch (e) {
      console.error('Failed to load wards', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  const handleSyncHisWards = async () => {
    setSyncingHis(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/his/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncWards: true, syncPatients: false })
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(data.data);
        setLastSyncedAt(data.data.syncedAt);
        await loadWards();
      } else {
        alert('HIS Ward Sync Failed: ' + data.error);
      }
    } catch (err: any) {
      alert('Error connecting to HIS Bedwardwise API: ' + err.message);
    } finally {
      setSyncingHis(false);
    }
  };

  const filteredWards = wards.filter(w =>
    w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.departmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBeds = wards.reduce((sum, w) => sum + (w.beds?.length || w.bedCapacity || 0), 0);
  const hisWardsCount = wards.filter(w => w.source === 'HIS').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">
            <Building2 size={26} color="#7c3aed" />
            <span>Ward & Bed Inventory Master</span>
          </div>
          <p className="page-subtitle">
            Synchronized with SIMS Hospital HIS Bedwardwise API • Hospital wards, bed capacities, clinical departments, and utilization targets
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
              HIS Ward Master Live
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Total Wards: <strong style={{ color: '#0f172a' }}>{wards.length}</strong> • Total Hospital Beds: <strong style={{ color: '#0f172a' }}>{totalBeds}</strong>
              <span style={{ marginLeft: '6px', color: '#059669', fontWeight: 600 }}>• All {wards.length} wards live from SIMS HIS API</span>
            </span>
            {lastSyncedAt && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Last synced: {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(lastSyncedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSyncHisWards}
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
            title="Sync all hospital wards and bed inventories from SIMS HIS API"
          >
            <RefreshCw
              size={16}
              style={{
                animation: syncingHis ? 'spin 1s linear infinite' : 'none'
              }}
            />
            <span>{syncingHis ? 'Syncing Wards...' : 'Sync Wards & Beds from HIS'}</span>
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
                Ward Master Synchronized from HIS
              </div>
              <div style={{ fontSize: '12px', color: '#6d28d9' }}>
                Retrieved {syncResult.wards.totalFetched} wards with {syncResult.wards.totalBeds} beds inventory from Proc_Bedwardwise web service.
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
              placeholder="Search ward code, name, department..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', width: '320px' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Active Wards: <strong style={{ color: '#0f172a' }}>{filteredWards.length}</strong> of {wards.length}
          </div>
        </div>

        <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '14%' }}>Ward Code</th>
                <th style={{ width: '34%' }}>Ward Name</th>
                <th style={{ width: '14%' }}>Location / Floor</th>
                <th style={{ width: '14%' }}>Department Type</th>
                <th style={{ width: '14%' }}>Bed Capacity</th>
                <th style={{ width: '10%' }}>Utilization Target</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px', display: 'block', color: '#7c3aed' }} />
                    Loading hospital wards...
                  </td>
                </tr>
              ) : filteredWards.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No wards found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredWards.map(ward => {
                  const hasBedsList = ward.beds && ward.beds.length > 0;

                  return (
                    <tr key={ward.id}>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#6d28d9',
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {ward.code}
                          </span>
                          {ward.source === 'HIS' && (
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '1px 4px',
                              borderRadius: '4px'
                            }}>
                              HIS
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{ward.name}</div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '12px' }}>{ward.floor}</td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #e2e8f0'
                        }}>
                          {ward.departmentType}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1e293b' }}>
                            {ward.bedCapacity} Beds
                          </span>
                          {hasBedsList && (
                            <button
                              onClick={() => setViewingBedsWard(ward)}
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                background: '#f5f3ff',
                                color: '#7c3aed',
                                border: '1px solid #ddd6fe',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="Click to view bed inventory"
                            >
                              View Beds ({ward.beds!.length})
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                        {ward.targetUtilization}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bed Inventory Modal */}
      {viewingBedsWard && (
        <div className="modal-overlay" onClick={() => setViewingBedsWard(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  Bed Inventory: {viewingBedsWard.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  {viewingBedsWard.code} • {viewingBedsWard.floor} • Total {viewingBedsWard.beds?.length || viewingBedsWard.bedCapacity} Registered Beds from HIS
                </p>
              </div>
              <button onClick={() => setViewingBedsWard(null)} style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '8px',
              maxHeight: '360px',
              overflowY: 'auto',
              padding: '8px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              {(viewingBedsWard.beds || []).map((bed, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>Bed #{idx + 1}</div>
                  {bed}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setViewingBedsWard(null)} className="btn-primary" style={{ padding: '7px 18px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
