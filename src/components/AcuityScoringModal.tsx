'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Patient, AcuityFormTemplate } from '@/types';
import { X, CheckCircle, AlertTriangle, ShieldCheck, HeartPulse, Sliders } from '@/components/Icons';
import { interpretAcuityScore, SIMS_ACUITY_SCALE, isStaffCompetentForAcuity, simsPatientAcuityTemplate } from '@/lib/acuity-tool';

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
  const [template, setTemplate] = useState<AcuityFormTemplate>(simsPatientAcuityTemplate);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
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
        const tmpl: AcuityFormTemplate = (data.success && data.data.active && data.data.active.fields?.length > 5)
          ? data.data.active
          : simsPatientAcuityTemplate;

        setTemplate(tmpl);

        // Prepopulate selections based on patient's current acuity score and category
        const initialSelections: Record<string, string[]> = {};
        const targetTier = patient.currentAcuityCategory || (patient.currentAcuityScore >= 25 ? 3 : patient.currentAcuityScore >= 13 ? 2 : 1);

        tmpl.fields.forEach(f => {
          // Choose an option that corresponds to the target score tier
          // options usually have [0: none, 1: Acuity 1, 2: Acuity 2, 3: Acuity 3]
          const optMatch = f.options.find(o => o.score === targetTier) || f.options[1] || f.options[0];
          if (optMatch) {
            initialSelections[f.id] = [optMatch.id];
          }
        });

        setSelectedOptions(initialSelections);
      } catch (err) {
        console.error('Failed to load acuity form template', err);
        setTemplate(simsPatientAcuityTemplate);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, patient]);

  // Calculate live total score from selected options
  const totalScore = useMemo(() => {
    let sum = 0;
    if (!template?.fields) return 0;
    template.fields.forEach(field => {
      const selectedOptionIds = selectedOptions[field.id] || [];
      selectedOptionIds.forEach(optId => {
        const opt = field.options.find(o => o.id === optId);
        if (opt) sum += opt.score;
      });
    });
    return sum;
  }, [template, selectedOptions]);

  // Derive Tier information from SIMS hospital scale (1-48)
  const tierInfo = useMemo(() => {
    return interpretAcuityScore(totalScore);
  }, [totalScore]);

  // Check nurse competency compliance if staff is already assigned
  const nurseCompliance = useMemo(() => {
    if (!patient.currentShiftStaff) return null;
    const isCompliant = isStaffCompetentForAcuity(patient.currentShiftStaff.competency, tierInfo.tier);
    return {
      isCompliant,
      nurseName: patient.currentShiftStaff.nurseName,
      competency: patient.currentShiftStaff.competency
    };
  }, [patient.currentShiftStaff, tierInfo.tier]);

  // Extract distinct categories from template
  const categories = useMemo(() => {
    const list: string[] = [];
    template?.fields.forEach(f => {
      const cat = f.category || 'General';
      if (!list.includes(cat)) list.push(cat);
    });
    return list;
  }, [template]);

  // Filtered fields based on activeCategory
  const displayedFields = useMemo(() => {
    if (!template?.fields) return [];
    if (activeCategory === 'ALL') return template.fields;
    return template.fields.filter(f => (f.category || 'General') === activeCategory);
  }, [template, activeCategory]);

  if (!isOpen) return null;

  const handleSelectOption = (fieldId: string, optionId: string) => {
    setSelectedOptions(prev => {
      const current = prev[fieldId] || [];
      if (current.includes(optionId)) {
        // Toggle off: deselect to 0
        return { ...prev, [fieldId]: [] };
      }
      return { ...prev, [fieldId]: [optionId] };
    });
  };

  const handleSetAllTier = (tier: 1 | 2 | 3) => {
    if (!template?.fields) return;
    const newSelections: Record<string, string[]> = {};
    template.fields.forEach(f => {
      const match = f.options.find(o => o.score === tier);
      if (match) newSelections[f.id] = [match.id];
    });
    setSelectedOptions(newSelections);
  };

  const handleClearAll = () => {
    setSelectedOptions({});
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
          category: tierInfo.tier,
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
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={22} color="#7c3aed" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                SIMS Patient Acuity Assessment Tool
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#ede9fe',
                color: '#6d28d9'
              }}>
                Hospital Standard (18 Parameters)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Standardized NABH COP-6 clinical workload assessment • Scoring range 1 to 48
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#64748b',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Patient Banner */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {patient.name}
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginLeft: '8px' }}>
                ({patient.age}y / {patient.gender})
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              UHID: <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{patient.uhid}</strong> • Bed: <strong style={{ color: '#0f172a' }}>{patient.roomBed}</strong> • Ward: <strong>{patient.wardCode || patient.wardName || 'Ward'}</strong> • Doctor: {patient.doctorName}
            </div>
            {patient.diagnosis && (
              <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '3px', fontWeight: 500 }}>
                Diagnosis: {patient.diagnosis}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Current Baseline
              </div>
              <span className={`badge-acuity-${patient.currentAcuityCategory || 1}`} style={{ marginTop: '2px' }}>
                Level {patient.currentAcuityCategory || 1} ({patient.currentAcuityScore || 0} pts)
              </span>
            </div>
          </div>
        </div>

        {/* Live Calculation & Staffing Policy Top Banner */}
        <div style={{
          background: tierInfo.bgLight,
          borderBottom: `2px solid ${tierInfo.borderColor}`,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Live Score */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                Total Acuity Score:
              </span>
              <span style={{
                fontSize: '26px',
                fontWeight: 900,
                color: tierInfo.color,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1
              }}>
                {totalScore}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>/ 48</span>
            </div>

            {/* Computed Tier */}
            <div style={{
              background: '#ffffff',
              border: `1px solid ${tierInfo.borderColor}`,
              padding: '4px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tier:</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: tierInfo.color }}>
                {tierInfo.tierRoman} ({tierInfo.tier === 1 ? '1 - 12' : tierInfo.tier === 2 ? '13 - 24' : '25 - 48'})
              </span>
            </div>

            {/* Nurse-to-Patient Ratio */}
            <div style={{
              background: '#ffffff',
              border: `1px solid ${tierInfo.borderColor}`,
              padding: '4px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>N:P Ratio:</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                {tierInfo.npRatio}
              </span>
            </div>
          </div>

          {/* Staffing Allocation Policy Requirement Badge */}
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: tierInfo.tier === 3 ? '#991b1b' : '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {tierInfo.tier === 3 ? <AlertTriangle size={16} color="#dc2626" /> : <CheckCircle size={16} color="#059669" />}
            <span>{tierInfo.staffingRequirement}</span>
          </div>
        </div>

        {/* Assigned Nurse Competency Compliance Check */}
        {nurseCompliance && (
          <div style={{
            padding: '8px 24px',
            background: nurseCompliance.isCompliant ? '#f0fdf4' : '#fef2f2',
            borderBottom: `1px solid ${nurseCompliance.isCompliant ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Assigned Staff:</strong>
              <span>{nurseCompliance.nurseName}</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {nurseCompliance.competency}
              </span>
            </div>

            <div>
              {nurseCompliance.isCompliant ? (
                <span style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} color="#15803d" /> Staffing Competency Compliant
                </span>
              ) : (
                <span style={{ color: '#b91c1c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={14} color="#b91c1c" />
                  Non-Compliant: Acuity 3 patients must be cared for by Competent, Proficient, or Expert staff
                </span>
              )}
            </div>
          </div>
        )}

        {/* Category Navigation Bar & Presets */}
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          overflowX: 'auto',
          gap: '12px'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
            <button
              onClick={() => setActiveCategory('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: activeCategory === 'ALL' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                background: activeCategory === 'ALL' ? '#ede9fe' : '#ffffff',
                color: activeCategory === 'ALL' ? '#6d28d9' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Categories ({template?.fields?.length || 0})
            </button>

            {categories.map(cat => {
              const count = template.fields.filter(f => (f.category || 'General') === cat).length;
              const isSelected = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: isSelected ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                    background: isSelected ? '#ede9fe' : '#ffffff',
                    color: isSelected ? '#6d28d9' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Quick Preset:</span>
            <button
              type="button"
              onClick={() => handleSetAllTier(1)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All Acuity 1
            </button>
            <button
              type="button"
              onClick={() => handleSetAllTier(2)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All Acuity 2
            </button>
            <button
              type="button"
              onClick={() => handleSetAllTier(3)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All Acuity 3
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Loading SIMS patient acuity parameters...
            </div>
          ) : (
            displayedFields.map((field, idx) => {
              const selectedOptId = selectedOptions[field.id]?.[0];
              const selectedOpt = field.options.find(o => o.id === selectedOptId);
              const activeScore = selectedOpt ? selectedOpt.score : 0;

              // Split options by score (1 = Acuity 1, 2 = Acuity 2, 3 = Acuity 3)
              const opt1 = field.options.find(o => o.score === 1);
              const opt2 = field.options.find(o => o.score === 2);
              const opt3 = field.options.find(o => o.score === 3);

              return (
                <div
                  key={field.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Parameter Title & Category Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#64748b',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        #{idx + 1}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {field.title}
                      </h4>
                      {field.category && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: '#f1f5f9',
                          color: '#475569'
                        }}>
                          {field.category}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Selected:</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: activeScore === 3 ? '#fee2e2' : activeScore === 2 ? '#fef3c7' : activeScore === 1 ? '#d1fae5' : '#f1f5f9',
                        color: activeScore === 3 ? '#b91c1c' : activeScore === 2 ? '#b45309' : activeScore === 1 ? '#047857' : '#64748b'
                      }}>
                        {activeScore > 0 ? `+${activeScore} pt (Acuity ${activeScore})` : '0 pt (None)'}
                      </span>
                    </div>
                  </div>

                  {/* 3-Column Acuity Grid (Matching the Hospital Standard PDF Table Columns) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    {/* Acuity 1 (Score 1) */}
                    {opt1 && (
                      <div
                        onClick={() => handleSelectOption(field.id, opt1.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedOptId === opt1.id ? '2px solid #059669' : '1px solid #e2e8f0',
                          background: selectedOptId === opt1.id ? '#ecfdf5' : '#fafafa',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: selectedOptId === opt1.id ? '#047857' : '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}>
                            Acuity 1
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: selectedOptId === opt1.id ? '#059669' : '#e2e8f0',
                            color: selectedOptId === opt1.id ? '#ffffff' : '#64748b'
                          }}>
                            1 pt
                          </span>
                        </div>
                        <p style={{
                          fontSize: '12px',
                          color: selectedOptId === opt1.id ? '#065f46' : '#334155',
                          fontWeight: selectedOptId === opt1.id ? 600 : 400,
                          lineHeight: 1.4,
                          margin: 0
                        }}>
                          {opt1.label}
                        </p>
                      </div>
                    )}

                    {/* Acuity 2 (Score 2) */}
                    {opt2 && (
                      <div
                        onClick={() => handleSelectOption(field.id, opt2.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedOptId === opt2.id ? '2px solid #d97706' : '1px solid #e2e8f0',
                          background: selectedOptId === opt2.id ? '#fffbeb' : '#fafafa',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: selectedOptId === opt2.id ? '#b45309' : '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}>
                            Acuity 2
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: selectedOptId === opt2.id ? '#d97706' : '#e2e8f0',
                            color: selectedOptId === opt2.id ? '#ffffff' : '#64748b'
                          }}>
                            2 pts
                          </span>
                        </div>
                        <p style={{
                          fontSize: '12px',
                          color: selectedOptId === opt2.id ? '#92400e' : '#334155',
                          fontWeight: selectedOptId === opt2.id ? 600 : 400,
                          lineHeight: 1.4,
                          margin: 0
                        }}>
                          {opt2.label}
                        </p>
                      </div>
                    )}

                    {/* Acuity 3 (Score 3) */}
                    {opt3 && (
                      <div
                        onClick={() => handleSelectOption(field.id, opt3.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedOptId === opt3.id ? '2px solid #dc2626' : '1px solid #e2e8f0',
                          background: selectedOptId === opt3.id ? '#fef2f2' : '#fafafa',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: selectedOptId === opt3.id ? '#b91c1c' : '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}>
                            Acuity 3
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: selectedOptId === opt3.id ? '#dc2626' : '#e2e8f0',
                            color: selectedOptId === opt3.id ? '#ffffff' : '#64748b'
                          }}>
                            3 pts
                          </span>
                        </div>
                        <p style={{
                          fontSize: '12px',
                          color: selectedOptId === opt3.id ? '#991b1b' : '#334155',
                          fontWeight: selectedOptId === opt3.id ? 600 : 400,
                          lineHeight: 1.4,
                          margin: 0
                        }}>
                          {opt3.label}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Clinical Observation Notes */}
          <div style={{ marginTop: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Clinical Observations / Shift Nursing Handover Notes:
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Q2h vitals monitoring initiated, K+ infusion protocol running, fall precaution guardrails placed..."
              rows={2}
              style={{
                width: '100%',
                resize: 'none',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                padding: '10px 12px',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Computed Total: <strong style={{ color: tierInfo.color, fontSize: '16px', fontFamily: 'var(--font-mono)' }}>{totalScore}</strong> pts
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '6px',
              background: tierInfo.bgLight,
              color: tierInfo.color,
              border: `1px solid ${tierInfo.borderColor}`
            }}>
              {tierInfo.tierRoman} • N:P {tierInfo.npRatio}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '9px 18px' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                padding: '9px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: tierInfo.tier === 3 ? '#dc2626' : '#7c3aed'
              }}
            >
              <ShieldCheck size={16} />
              <span>{saving ? 'Saving...' : `Save Acuity (${totalScore} pts / ${tierInfo.tierRoman})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
