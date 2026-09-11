'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, Save, CheckCircle, RefreshCw } from '@/components/Icons';
import { AcuityFormTemplate, AcuityFormField, AcuityFormFieldOption } from '@/types';

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
        }
      } catch (e) {
        console.error('Failed to load acuity form template', e);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, []);

  const handleAddField = () => {
    if (!template) return;
    const newField: AcuityFormField = {
      id: `field-${Date.now()}`,
      title: 'New Clinical Acuity Assessment Field',
      options: [
        { id: `opt-${Date.now()}-1`, label: 'Normal / Stable', score: 0 },
        { id: `opt-${Date.now()}-2`, label: 'Requires Assistance / Moderate Monitoring', score: 2 }
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
            Dynamic acuity scoring form builder • Customize clinical criteria, options, and score weightings per NABH COP-6
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {savedSuccess && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
              <CheckCircle size={16} /> Version saved!
            </span>
          )}
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
        /* Slide 3 Form Builder Container */
        <div className="card" style={{ maxWidth: '920px', margin: '0 auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          {/* Top Form Version Bar (Exact Slide 3 Match) */}
          <div style={{
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '20px',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Acuity Scoring Form Details:
            </h2>

            <div style={{ maxWidth: '240px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Form Version
              </label>
              <input
                type="text"
                readOnly
                value={template.version}
                style={{ width: '100%', fontWeight: 700, color: '#6d28d9', background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Form Fields List (Slide 3 Structure) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Form Fields:
            </div>

            {template.fields.map((field) => (
              <div
                key={field.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Field Title */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Field Title:
                  </label>
                  <input
                    type="text"
                    value={field.title}
                    onChange={e => handleUpdateFieldTitle(field.id, e.target.value)}
                    style={{ width: '100%', fontWeight: 600, fontSize: '14px' }}
                  />
                </div>

                {/* Options Table */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                    Options:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {field.options.map((option) => (
                      <div
                        key={option.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 3fr) 140px 42px',
                          gap: '10px',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Option Label:
                          </label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={e => handleUpdateOption(field.id, option.id, e.target.value, option.score)}
                            style={{ width: '100%', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                            Option Score:
                          </label>
                          <input
                            type="number"
                            value={option.score}
                            onChange={e => handleUpdateOption(field.id, option.id, option.label, parseInt(e.target.value) || 0)}
                            style={{ width: '100%', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                          />
                        </div>

                        <div style={{ paddingTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(field.id, option.id)}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete Option"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Option & Remove Field Button Row (Slide 3 exact) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => handleAddOption(field.id)}
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} /> Add Option
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveField(field.id)}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} /> Remove Field
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* + Add Form Field Button (Slide 3 exact) */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleAddField}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                }}
              >
                <Plus size={16} /> Add Form Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
