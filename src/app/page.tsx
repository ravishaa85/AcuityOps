'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Building2, AlertTriangle, Users, HeartPulse, ShieldCheck, ChevronRight, Activity, RefreshCw } from '@/components/Icons';

import { WardSummaryMetric } from '@/types';
import { RebalanceAnalysisResult } from '@/lib/ai-rebalancing';
import AiAnalysisModal from '@/components/AiAnalysisModal';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState<WardSummaryMetric[]>([]);
  const [analysis, setAnalysis] = useState<RebalanceAnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai-analysis');
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data.metrics);
        setAnalysis(json.data.analysis);
      }
    } catch (e) {
      console.error('Failed to load executive metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMetrics = metrics.filter(m =>
    m.wardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.wardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage) || 1;
  const displayedMetrics = filteredMetrics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Hospital-wide stats
  const totalStaff = metrics.reduce((sum, m) => sum + m.totalStaff, 0);
  const totalPatients = metrics.reduce((sum, m) => sum + m.totalPatients, 0);
  const totalAcuity = metrics.reduce((sum, m) => sum + m.totalAcuity, 0);
  const criticalWards = metrics.filter(m => m.capacityUtilization > 100);

  return (
    <div className="page-wrapper">
      {/* Top Banner / Title */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Activity size={26} color="#7c3aed" />
            <span>Real-time Acuity Management Dashboard</span>
          </div>
          <p className="page-subtitle">
            Hospital-wide nurse staffing distribution, acuity capacity tracking, and automated capacity utilization analysis
          </p>
        </div>

        {/* Action Buttons: Sync HIS & AI Powered Analysis */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await fetch('/api/his/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ syncWards: true, syncPatients: true })
                });
                await fetchData();
              } catch (e) {
                console.error(e);
              } finally {
                setLoading(false);
              }
            }}
            className="btn-secondary"
            style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Synchronize Inpatients and Wards from HIS"
          >
            <RefreshCw size={16} />
            <span>Sync HIS</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            <Sparkles size={18} />
            <span>AI Powered Analysis</span>
          </button>
        </div>
      </div>


      {/* KPI Overview Cards (Light Mode) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Hospital Wards</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{metrics.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Overloaded Wards (&gt;100%)</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: criticalWards.length > 0 ? '#dc2626' : '#059669', fontFamily: 'var(--font-mono)' }}>
              {criticalWards.length}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <HeartPulse size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Inpatients</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{totalPatients}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Nursing Staff</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{totalStaff}</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Table Filter Toolbar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Hospital Wards Acuity Matrix</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>({filteredMetrics.length} total entries)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search ward code or name..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '36px', width: '260px' }}
              />
            </div>
          </div>
        </div>

        {/* Ward Table */}
        <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ward</th>
                <th>Total Staff</th>
                <th>Advanced Beginner</th>
                <th>Competent</th>
                <th>Proficient</th>
                <th>Expert</th>
                <th>Total Patients</th>
                <th>Total Acuity</th>
                <th>Max Acuity Capacity</th>
                <th>Capacity Utilization (%)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading real-time hospital acuity data...
                  </td>
                </tr>
              ) : displayedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No wards found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                displayedMetrics.map((ward) => {
                  const isCritical = ward.capacityUtilization > 100;
                  const isWarning = ward.capacityUtilization >= 90 && ward.capacityUtilization <= 100;
                  const isLow = ward.capacityUtilization < 70;

                  return (
                    <tr
                      key={ward.wardId}
                      style={{
                        background: isCritical ? '#fff5f5' : 'transparent',
                        borderLeft: isCritical ? '3px solid #dc2626' : '3px solid transparent'
                      }}
                    >
                      <td>
                        <div>
                          <span style={{ fontWeight: 800, color: isCritical ? '#dc2626' : '#0f172a', fontSize: '14px' }}>
                            {ward.wardCode}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                            {ward.wardName}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{ward.totalStaff}</td>
                      <td>
                        <span style={{ color: ward.advancedBeginnerCount > 0 ? '#b45309' : '#94a3b8', fontWeight: 600 }}>
                          {ward.advancedBeginnerCount}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: ward.competentCount > 0 ? '#047857' : '#94a3b8', fontWeight: 600 }}>
                          {ward.competentCount}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: ward.proficientCount > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>
                          {ward.proficientCount}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: ward.expertCount > 0 ? '#7c3aed' : '#94a3b8', fontWeight: 600 }}>
                          {ward.expertCount}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{ward.totalPatients}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{ward.totalAcuity}</td>
                      <td style={{ fontWeight: 600, color: '#64748b', fontFamily: 'var(--font-mono)' }}>{ward.maxAcuityCapacity}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '13px',
                            fontFamily: 'var(--font-mono)',
                            color: isCritical ? '#b91c1c' : isWarning ? '#b45309' : isLow ? '#1d4ed8' : '#047857',
                            background: isCritical
                              ? '#fee2e2'
                              : isWarning
                                ? '#fef3c7'
                                : isLow
                                  ? '#eff6ff'
                                  : '#ecfdf5',
                            border: `1px solid ${
                              isCritical ? '#fca5a5' : isWarning ? '#fde68a' : isLow ? '#bfdbfe' : '#a7f3d0'
                            }`
                          }}>
                            {ward.capacityUtilization}%
                          </span>
                          {isCritical && (
                            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>
                              Over Capacity
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#f8fafc'
        }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {displayedMetrics.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredMetrics.length)} of {filteredMetrics.length} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: currentPage === page ? 'var(--primary-600)' : '#ffffff',
                  color: currentPage === page ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* AI Staff Optimization Modal */}
      <AiAnalysisModal
        analysis={analysis}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
}
