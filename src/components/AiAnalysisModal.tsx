'use client';

import React, { useState } from 'react';
import { X, Cpu, Check, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from '@/components/Icons';
import { RebalanceAnalysisResult } from '@/lib/ai-rebalancing';

interface AiAnalysisModalProps {
  analysis: RebalanceAnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AiAnalysisModal({
  analysis,
  isOpen,
  onClose,
  onSuccess
}: AiAnalysisModalProps) {
  const [applying, setApplying] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  if (!isOpen || !analysis) return null;

  const handleApplyRebalancing = async () => {
    setApplying(true);
    try {
      const res = await fetch('/api/ai-analysis', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAppliedMessage(data.data.message);
        onSuccess();
      } else {
        alert('Failed to apply rebalancing: ' + data.error);
      }
    } catch (err: any) {
      alert('Error applying rebalancing: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
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
              <Sparkles size={22} color="#7c3aed" />
              <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a' }}>
                AI-Powered Staff Optimization Analysis
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Cross-Ward Combinatorial Load Rebalancing & Capacity Optimization
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

        {/* Narrative Box from Slide 9 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #ddd6fe',
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ fontSize: '13px', color: '#1e293b', marginBottom: '14px', lineHeight: '1.5', fontWeight: 500 }}>
            To optimize the staffing distribution across wards and reduce capacity utilization to below 100%, the following staff movements are recommended:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Group recommendations by ward */}
            {['B4', 'C6E', 'B7', 'C5E', 'C5W'].map(wardCode => {
              const wardRecs = analysis.recommendations.filter(r => r.targetWardCode === wardCode);
              if (wardRecs.length === 0) return null;

              return (
                <div key={wardCode} style={{ paddingLeft: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>
                    • Ward {wardCode}:
                  </div>
                  <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {wardRecs.map(rec => (
                      <li key={rec.id} style={{ fontSize: '12px', color: '#334155' }}>
                        Move {rec.nurseCount} {rec.competency} from <span style={{ color: '#2563eb', fontWeight: 600 }}>{rec.donorWardCode}</span> to <span style={{ color: '#059669', fontWeight: 600 }}>{rec.targetWardCode}</span> to increase max acuity capacity by <span style={{ color: '#7c3aed', fontWeight: 700 }}>+{rec.capacityGain}</span>.
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', lineHeight: '1.5', fontStyle: 'italic' }}>
            These movements will help balance the staffing levels and ensure that each ward&apos;s acuity capacity meets or exceeds its total acuity level, thereby reducing the utilization percentage to below 100%.
          </p>
        </div>

        {/* Projected Simulation Table */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={16} color="#059669" />
            Projected Rebalancing Simulation (Before vs After Optimization)
          </div>

          <div className="data-table-container" style={{ maxHeight: '220px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ward</th>
                  <th>Total Acuity</th>
                  <th>Current Capacity</th>
                  <th>Current Utilization</th>
                  <th>Projected Capacity</th>
                  <th>Projected Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analysis.projectedMetrics.slice(0, 7).map(w => {
                  const isCritBefore = w.capacityUtilization > 100;
                  const isSafeAfter = w.projectedUtilization <= 100;

                  return (
                    <tr key={w.wardCode}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{w.wardCode}</td>
                      <td>{w.totalAcuity}</td>
                      <td>{w.maxAcuityCapacity}</td>
                      <td>
                        <span style={{
                          color: isCritBefore ? '#dc2626' : '#059669',
                          fontWeight: 700,
                          background: isCritBefore ? '#fef2f2' : 'transparent',
                          border: isCritBefore ? '1px solid #fecaca' : 'none',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {w.capacityUtilization}%
                        </span>
                      </td>
                      <td style={{ color: '#7c3aed', fontWeight: 600 }}>{w.projectedCapacity}</td>
                      <td>
                        <span style={{
                          color: isSafeAfter ? '#059669' : '#dc2626',
                          fontWeight: 700,
                          background: isSafeAfter ? '#ecfdf5' : '#fef2f2',
                          border: isSafeAfter ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {w.projectedUtilization}%
                        </span>
                      </td>
                      <td>
                        {isCritBefore && isSafeAfter ? (
                          <span style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            ✓ Optimized
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Balanced</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applied notification */}
        {appliedMessage && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#047857',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <Check size={16} />
            {appliedMessage}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button
            onClick={handleApplyRebalancing}
            disabled={applying}
            className="btn-primary"
          >
            <RefreshCw size={16} className={applying ? 'animate-spin' : ''} />
            {applying ? 'Applying Rebalance Moves...' : 'Execute Rebalancing in Duty Roster'}
          </button>
        </div>
      </div>
    </div>
  );
}
