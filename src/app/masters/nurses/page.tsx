'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Check, Filter } from '@/components/Icons';
import { Nurse, Ward, CompetencyLevel } from '@/types';

export default function NurseDirectoryPage() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedCompetency, setSelectedCompetency] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    competency: 'Competent' as CompetencyLevel,
    wardId: '',
    contactNumber: '',
    email: '',
    experienceYears: 2,
    maxAcuityCapacity: 10,
    status: 'Active' as 'Active' | 'On Leave',
    shiftPreference: 'Morning' as 'Morning' | 'Evening' | 'Night' | 'Flexible'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [nursesRes, wardsRes] = await Promise.all([
        fetch('/api/nurses'),
        fetch('/api/wards')
      ]);
      const nursesJson = await nursesRes.json();
      const wardsJson = await wardsRes.json();

      if (nursesJson.success) setNurses(nursesJson.data);
      if (wardsJson.success) {
        setWards(wardsJson.data);
        if (wardsJson.data.length > 0 && !formData.wardId) {
          setFormData(prev => ({ ...prev, wardId: wardsJson.data[0].id }));
        }
      }
    } catch (e) {
      console.error('Failed to load nurses directory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingNurse(null);
    setFormData({
      name: '',
      employeeId: `NUR-${Math.floor(1000 + Math.random() * 9000)}`,
      competency: 'Competent',
      wardId: wards[0]?.id || '',
      contactNumber: '+91 98471 00000',
      email: '',
      experienceYears: 3,
      maxAcuityCapacity: 10,
      status: 'Active',
      shiftPreference: 'Flexible'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setFormData({
      name: nurse.name,
      employeeId: nurse.employeeId,
      competency: nurse.competency,
      wardId: nurse.wardId,
      contactNumber: nurse.contactNumber,
      email: nurse.email,
      experienceYears: nurse.experienceYears,
      maxAcuityCapacity: nurse.maxAcuityCapacity,
      status: nurse.status,
      shiftPreference: nurse.shiftPreference
    });
    setIsModalOpen(true);
  };

  const handleCompetencyChange = (comp: CompetencyLevel) => {
    const caps: Record<CompetencyLevel, number> = {
      'Expert': 20,
      'Proficient': 15,
      'Competent': 10,
      'Advanced Beginner': 7,
      'Novice': 5
    };
    setFormData(prev => ({
      ...prev,
      competency: comp,
      maxAcuityCapacity: caps[comp]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNurse) {
        // Update
        const res = await fetch('/api/nurses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNurse.id, ...formData })
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          loadData();
        } else {
          alert('Failed to update: ' + data.error);
        }
      } else {
        // Create
        const res = await fetch('/api/nurses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          loadData();
        } else {
          alert('Failed to create: ' + data.error);
        }
      }
    } catch (err: any) {
      alert('Error submitting: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove nurse ${name}?`)) return;
    try {
      const res = await fetch(`/api/nurses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // Filtering
  const filteredNurses = nurses.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWard = selectedWard === 'all' || n.wardId === selectedWard;
    const matchesCompetency = selectedCompetency === 'all' || n.competency === selectedCompetency;
    return matchesSearch && matchesWard && matchesCompetency;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Users size={26} color="#8b5cf6" />
            <span>Nurse Directory Master</span>
          </div>
          <p className="page-subtitle">
            Manage hospital nursing staff directory, Benner clinical competency tiers, and maximum acuity capacities
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} />
          <span>Add New Nurse</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filters Toolbar */}
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
              placeholder="Search nurse name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', width: '280px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Ward:</span>
              <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} style={{ fontSize: '12px' }}>
                <option value="all">All Wards</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Competency:</span>
              <select value={selectedCompetency} onChange={e => setSelectedCompetency(e.target.value)} style={{ fontSize: '12px' }}>
                <option value="all">All Competencies</option>
                <option value="Novice">Novice</option>
                <option value="Advanced Beginner">Advanced Beginner</option>
                <option value="Competent">Competent</option>
                <option value="Proficient">Proficient</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nurses Table */}
        <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Competency Tier</th>
                <th>Assigned Ward</th>
                <th>Max Acuity Cap</th>
                <th>Contact Number</th>
                <th>Experience</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading nurse directory...
                  </td>
                </tr>
              ) : filteredNurses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No nurses found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredNurses.map(nurse => {
                  const compClass = `competency-${nurse.competency.toLowerCase().replace(' ', '-')}`;

                  return (
                    <tr key={nurse.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#6d28d9' }}>
                        {nurse.employeeId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{nurse.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Pref: {nurse.shiftPreference}</div>
                      </td>
                      <td>
                        <span className={compClass}>
                          {nurse.competency}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{nurse.wardCode || '3F-MGW'}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>{nurse.wardName}</span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#6d28d9',
                          background: '#f5f3ff',
                          border: '1px solid #ddd6fe',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {nurse.maxAcuityCapacity} pts
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{nurse.contactNumber || '—'}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#334155' }}>
                        {nurse.experienceYears} yrs
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: nurse.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                          border: nurse.status === 'Active' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          color: nurse.status === 'Active' ? '#047857' : '#dc2626'
                        }}>
                          {nurse.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(nurse)}
                            style={{ padding: '6px', color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px' }}
                            title="Edit Nurse"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(nurse.id, nurse.name)}
                            style={{ padding: '6px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}
                            title="Delete Nurse"
                          >
                            <Trash2 size={14} />
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

      {/* Add / Edit Nurse Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {editingNurse ? 'Edit Nurse Profile' : 'Add New Nurse to Directory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%' }}
                    placeholder="e.g. Sr. Ananya Nair"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Competency Level *</label>
                  <select
                    value={formData.competency}
                    onChange={e => handleCompetencyChange(e.target.value as CompetencyLevel)}
                    style={{ width: '100%' }}
                  >
                    <option value="Novice">Novice (Cap: 5)</option>
                    <option value="Advanced Beginner">Advanced Beginner (Cap: 7)</option>
                    <option value="Competent">Competent (Cap: 10)</option>
                    <option value="Proficient">Proficient (Cap: 15)</option>
                    <option value="Expert">Expert (Cap: 20)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Assigned Ward *</label>
                  <select
                    value={formData.wardId}
                    onChange={e => setFormData({ ...formData, wardId: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                  style={{ width: '100%' }}
                  placeholder="+91 98471 00000"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Exp (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Max Acuity Cap</label>
                  <input
                    type="number"
                    value={formData.maxAcuityCapacity}
                    onChange={e => setFormData({ ...formData, maxAcuityCapacity: parseInt(e.target.value) || 10 })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%' }}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNurse ? 'Save Changes' : 'Create Nurse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
