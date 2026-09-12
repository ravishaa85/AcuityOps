'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, Save, CheckCircle, RefreshCw, AlertTriangle, ShieldCheck } from '@/components/Icons';
import { AcuityFormTemplate, AcuityFormField, AcuityFormFieldOption } from '@/types';
import { simsPatientAcuityTemplate, SIMS_ACUITY_SCALE } from '@/lib/acuity-tool';

export default function AcuityFormsPage() {
  const [template, setTemplate] = useState<AcuityFormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      setLoading(true);
      try {
        const res = await fetch('/api/acuity-forms');
        const data = await res.json();
        if (data.success && data.data.active) {
          setTemplate(data.data.active);
        } else {
          setTemplate(simsPatientAcuityTemplate);
        }
      } catch (e) {
        console.error('Failed to load acuity form template', e);
        setTemplate(simsPatientAcuityTemplate);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, []);

  const handleResetToSIMSStandard = () => {
    if (confirm('Are you sure you want to restore the SIMS Hospital PDF Standard Acuity Form (18 Parameters)?')) {
      setTemplate({
        ...simsPatientAcuityTemplate,
        version: (template?.version || 1) + 1
      });
    }
  };

  const handleAddField = () => {
    if (!template) return;
    const newField: AcuityFormField = {
      id: `field-${Date.now()}`,
      title: 'New Clinical Acuity Assessment Field',
      category: 'Basic Activities',
      options: [
        { id: `opt-${Date.now()}-0`, label: 'None / Normal', score: 0 },
        { id: `opt-${Date.now()}-1`, label: 'Acuity 1 description', score: 1 },
        { id: `opt-${Date.now()}-2`, label: 'Acuity 2 description', score: 2 },
        { id: `opt-${Date.now()}-3`, label: 'Acuity 3 description', score: 3 }
      ]
    };
    setTemplate({
      ...template,
      fields: [...template.fields, newField]
    });
  };

  const handleRemoveField = (fieldId: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.filter(f => f.id !== fieldId)
    });
  };

  const handleUpdateFieldTitle = (fieldId: string, title: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.map(f => f.id === fieldId ? { ...f, title } : f)
    });
  };

  const handleUpdateFieldCategory = (fieldId: string, category: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.map(f => f.id === fieldId ? { ...f, category } : f)
    });
  };

  const handleAddOption = (fieldId: string) => {
    if (!template) return;
    const newOption: AcuityFormFieldOption = {
      id: `opt-${Date.now()}`,
      label: 'New Assessment Option',
      score: 1
    };
    setTemplate({
      ...template,
      fields: template.fields.map(f => {
        if (f.id === fieldId) {
          return { ...f, options: [...f.options, newOption] };
        }
        return f;
      })
    });
  };

  const handleRemoveOption = (fieldId: string, optionId: string) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.map(f => {
        if (f.id === fieldId) {
          return { ...f, options: f.options.filter(o => o.id !== optionId) };
        }
        return f;
      })
    });
  };

  const handleUpdateOption = (fieldId: string, optionId: string, label: string, score: number) => {
    if (!template) return;
    setTemplate({
      ...template,
      fields: template.fields.map(f => {
        if (f.id === fieldId) {
          return {
            ...f,
            options: f.options.map(o => o.id === optionId ? { ...o, label, score } : o)
          };
        }
        return f;
      })
    });
  };

  const handleSaveTemplate = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const res = await fetch('/api/acuity-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          version: template.version + 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setTemplate(data.data);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert('Failed to save template: ' + data.error);
      }
    } catch (e: any) {
      alert('Error saving template: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Sliders size={26} color="#8b5cf6" />
            <span>Customizable Acuity Forms Builder</span>
          </div>
          <p className="page-subtitle">
            SIMS Hospital Patient Acuity Tool Description & Staffing Allocation Framework (18 Parameters)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {savedSuccess && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
              <CheckCircle size={16} /> Version saved successfully!
            </span>
          )}

          <button
            onClick={handleResetToSIMSStandard}
            className="btn-secondary"
            style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Reset form fields to the official SIMS PDF standard"
          >
            <RefreshCw size={15} />
            <span>Restore PDF Standard</span>
          </button>

          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '10px 20px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Form Template'}</span>
          </button>
        </div>
      </div>

      {loading || !template ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading acuity form template...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1080px', margin: '0 auto' }}>
          {/* SIMS Hospital PDF Standard Reference Card (Page 2 of PDF) */}
          <div className="card" style={{
            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
            border: '1px solid #cbd5e1',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Hospital Standard Specification
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  Interpretation of Acuity Score & Nurse-to-Patient (N:P) Ratio
                </h3>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#ede9fe',
                color: '#6d28d9'
              }}>
                Page 2 Interpretation Matrix
              </span>
            </div>

            {/* Interpretation Table from Page 2 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              marginBottom: '16px'
            }}>
              {/* Acuity 1 */}
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>Acuity 1</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>
                  Score 1 - 12
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#047857',
                  marginTop: '6px',
                  padding: '2px 8px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  N:P Ratio 1 : 6
                </div>
              </div>

              {/* Acuity 2 */}
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>Acuity II</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', marginTop: '2px' }}>
                  Score 13 - 24
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#b45309',
                  marginTop: '6px',
                  padding: '2px 8px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  N:P Ratio 1 : 5
                </div>
              </div>

              {/* Acuity 3 */}
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c' }}>Acuity III</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', marginTop: '2px' }}>
                  Score 25 - 48
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#b91c1c',
                  marginTop: '6px',
                  padding: '2px 8px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  N:P Ratio 1 : 4
                </div>
              </div>
            </div>

            {/* Staffing Allocation Policy Note (Exact PDF Text) */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldCheck size={20} color="#7c3aed" />
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a' }}>Staffing Allocation Policy: </strong>
                &ldquo;Novice and Limited level staff shall get patients with acuity score 1 &amp; 2 and Patient with acuity score of 3 shall be given to competent / proficient or expert categories of staff.&rdquo;
              </div>
            </div>
          </div>

          {/* Form Builder Container */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            {/* Top Form Version Bar */}
            <div style={{
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {template.title}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Total {template.fields.length} active clinical parameters across 6 standard categories
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Version:</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: '#6d28d9',
                  border: '1px solid #e2e8f0'
                }}>
                  v{template.version}
                </span>
              </div>
            </div>

            {/* Form Fields List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  Clinical Assessment Parameters:
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Showing {template.fields.length} parameters
                </span>
              </div>

              {template.fields.map((field, idx) => (
                <div
                  key={field.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {/* Parameter Header: Number, Title, and Category */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Parameter #{idx + 1} Title:
                      </label>
                      <input
                        type="text"
                        value={field.title}
                        onChange={e => handleUpdateFieldTitle(field.id, e.target.value)}
                        style={{ width: '100%', fontWeight: 700, fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        Category:
                      </label>
                      <input
                        type="text"
                        value={field.category || ''}
                        onChange={e => handleUpdateFieldCategory(field.id, e.target.value)}
                        placeholder="e.g. Basic Activities"
                        style={{ width: '100%', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Scoring Tiers (Acuity 1, Acuity 2, Acuity 3):
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {field.options.map((option) => (
                        <div
                          key={option.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 3fr) 110px 40px',
                            gap: '8px',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <input
                              type="text"
                              value={option.label}
                              onChange={e => handleUpdateOption(field.id, option.id, e.target.value, option.score)}
                              style={{ width: '100%', fontSize: '12px' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                value={option.score}
                                onChange={e => handleUpdateOption(field.id, option.id, option.label, parseInt(e.target.value) || 0)}
                                style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '11px', color: '#64748b' }}>pts</span>
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(field.id, option.id)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Delete Option"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Option & Remove Parameter Button Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleAddOption(field.id)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#2563eb',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={13} /> Add Option
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={13} /> Remove Parameter
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Parameter Button */}
              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="btn-primary"
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} /> Add Clinical Parameter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
