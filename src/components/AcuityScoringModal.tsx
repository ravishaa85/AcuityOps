'use client';

import React, { useState, useEffect } from 'react';
import { Patient, AcuityFormTemplate } from '@/types';
import { X, CheckCircle, AlertTriangle, ShieldCheck, HeartPulse } from '@/components/Icons';

interface AcuityScoringModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AcuityScoringModal({
  patient,
  isOpen,
  onClose,
  onSuccess
}: AcuityScoringModalProps) {
  const [template, setTemplate] = useState<AcuityFormTemplate | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/acuity-forms');
        const data = await res.json();
        if (data.success && data.data.active) {
          const tmpl: AcuityFormTemplate = data.data.active;
          setTemplate(tmpl);

          // Prepopulate previous selections based on patient's current acuity score
          const initialSelections: Record<string, string[]> = {};
          tmpl.fields.forEach(f => {
            if (f.id.includes('vitals')) {
              // Pre-select based on patient acuity
              if (patient.currentAcuityCategory >= 4) initialSelections[f.id] = [f.options[3]?.id || f.options[0].id];
              else if (patient.currentAcuityCategory === 3) initialSelections[f.id] = [f.options[2]?.id || f.options[0].id];
              else if (patient.currentAcuityCategory === 2) initialSelections[f.id] = [f.options[1]?.id || f.options[0].id];
              else initialSelections[f.id] = [f.options[0].id];
            } else if (f.id.includes('characteristics')) {
              if (patient.currentAcuityCategory >= 4) initialSelections[f.id] = [f.options[4]?.id || f.options[0].id];
              else if (patient.currentAcuityCategory === 3) initialSelections[f.id] = [f.options[2]?.id || f.options[0].id];
              else initialSelections[f.id] = [f.options[0]?.id || f.options[0].id];
            } else if (f.id.includes('mental')) {
              if (patient.currentAcuityCategory >= 4) initialSelections[f.id] = [f.options[2]?.id || f.options[0].id];
              else initialSelections[f.id] = [f.options[0]?.id || f.options[0].id];
            } else {
              initialSelections[f.id] = [f.options[0]?.id || ''];
            }
          });
          setSelectedOptions(initialSelections);
        }
      } catch (err) {
        console.error('Failed to load acuity form template', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, patient]);

  if (!isOpen) return null;

  // Calculate live total score
  let totalScore = 0;
  if (template) {
    template.fields.forEach(field => {
      const selectedOptionIds = selectedOptions[field.id] || [];
      selectedOptionIds.forEach(optId => {
        const opt = field.options.find(o => o.id === optId);
        if (opt) totalScore += opt.score;
      });
    });
  }

  // Derive Category: 1 (0-4), 2 (5-9), 3 (10-14), 4 (15+)
  let calculatedCategory: 1 | 2 | 3 | 4 = 1;
  let categoryColor = '#10b981';
  let categoryLabel = 'Acuity 1 (Low - Minimal Nursing Care)';

  if (totalScore >= 15) {
    calculatedCategory = 4;
    categoryColor = '#ef4444';
    categoryLabel = 'Acuity 4 (Critical / High Dependency - 1:1 or 1:2 Staffing)';
  } else if (totalScore >= 10) {
    calculatedCategory = 3;
    categoryColor = '#f59e0b';
    categoryLabel = 'Acuity 3 (High - Frequent Monitoring & Infusions)';
  } else if (totalScore >= 5) {
    calculatedCategory = 2;
    categoryColor = '#3b82f6';
    categoryLabel = 'Acuity 2 (Moderate - Periodic Assistance)';
  }

  const handleToggleOption = (fieldId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [fieldId]: [optionId] // single select per question for standard score calculation
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/acuity-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          wardId: patient.wardId,
          score: totalScore,
          category: calculatedCategory,
          responses: selectedOptions,
          notes,
          evaluatedBy: 'Staff Nurse (SIMS Clinical Assessor)',
          shiftType: 'Morning'
        })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to save assessment: ' + data.error);
      }
    } catch (err: any) {
      alert('Error saving assessment: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
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
              <HeartPulse size={20} color="#7c3aed" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Acuity Scoring Form</h2>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Effortless data capture • Previous acuity data prepopulated for quick review
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

        {/* Patient Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              UHID: <span style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{patient.uhid}</span> • Bed: <span style={{ color: '#0f172a' }}>{patient.roomBed}</span> • Dr: {patient.doctorName}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Previous Acuity:</span>
            <span className={`badge-acuity-${patient.currentAcuityCategory}`}>
              Score {patient.currentAcuityScore} (Level {patient.currentAcuityCategory})
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading acuity template...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {template?.fields.map((field) => {
              const selectedOptId = selectedOptions[field.id]?.[0];

              return (
                <div key={field.id} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    {field.title}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                    {field.options.map((option) => {
                      const isSelected = selectedOptId === option.id;

                      return (
                        <div
                          key={option.id}
                          onClick={() => handleToggleOption(field.id, option.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: isSelected ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                            background: isSelected ? '#f5f3ff' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              border: isSelected ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                              background: isSelected ? '#7c3aed' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isSelected && <CheckCircle size={12} color="#fff" />}
                            </div>
                            <span style={{ fontSize: '12px', color: isSelected ? '#6d28d9' : '#334155', fontWeight: isSelected ? 600 : 500 }}>
                              {option.label}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isSelected ? '#ede9fe' : '#f1f5f9',
                            color: isSelected ? '#6d28d9' : '#64748b'
                          }}>
                            +{option.score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Clinical Notes Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                Clinical Observations / Special Nursing Care Notes:
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Oxygen saturation fluctuating, IV dopamine infusion ongoing, fall precaution protocol active..."
                rows={2}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            {/* Real-time Calculation Summary Bar */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700 }}>
                  Computed Acuity Classification
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: categoryColor, marginTop: '2px' }}>
                  {categoryLabel}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Total Score: </span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {totalScore}
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  <ShieldCheck size={16} />
                  {saving ? 'Updating...' : 'Save & Update Acuity'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
