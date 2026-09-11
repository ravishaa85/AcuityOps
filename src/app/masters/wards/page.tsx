'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, X, Check } from '@/components/Icons';
import { Ward } from '@/types';

export default function WardMasterPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    floor: '7th Floor',
    bedCapacity: 20,
    departmentType: 'General' as Ward['departmentType'],
    targetUtilization: 85,
    isActive: true
  });

  const loadWards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      if (data.success) setWards(data.data);
    } catch (e) {
      console.error('Failed to load wards', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  const openAddModal = () => {
    setEditingWard(null);
    setFormData({
      code: '',
      name: '',
      floor: '4th Floor',
      bedCapacity: 20,
      departmentType: 'General',
      targetUtilization: 85,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ward: Ward) => {
    setEditingWard(ward);
    setFormData({
      code: ward.code,
      name: ward.name,
      floor: ward.floor,
      bedCapacity: ward.bedCapacity,
      departmentType: ward.departmentType,
      targetUtilization: ward.targetUtilization,
      isActive: ward.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWard) {
        const res = await fetch('/api/wards', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingWard.id, ...formData })
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          loadWards();
        } else {
          alert('Failed to update: ' + data.error);
        }
      } else {
        const res = await fetch('/api/wards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          loadWards();
        } else {
          alert('Failed to create: ' + data.error);
        }
      }
    } catch (err: any) {
      alert('Error submitting ward: ' + err.message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete Ward ${code}?`)) return;
    try {
      const res = await fetch(`/api/wards?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadWards();
      }
    } catch (e) {
      console.error('Failed to delete ward', e);
    }
  };

  const filteredWards = wards.filter(w =>
    w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.departmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Building2 size={26} color="#8b5cf6" />
            <span>Ward Master</span>
          </div>
          <p className="page-subtitle">
            Configure hospital care wards, bed capacities, clinical departments, and target utilization rates
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} />
          <span>Add New Ward</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search ward code or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', width: '280px' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Total Wards: <strong style={{ color: '#0f172a' }}>{wards.length}</strong>
          </div>
        </div>

        <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ward Code</th>
                <th>Ward Name</th>
                <th>Location / Floor</th>
                <th>Department Type</th>
                <th>Bed Capacity</th>
                <th>Target Utilization</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading hospital wards...
                  </td>
                </tr>
              ) : filteredWards.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No wards found.
                  </td>
                </tr>
              ) : (
                filteredWards.map(ward => (
                  <tr key={ward.id}>
                    <td>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#6d28d9',
                        background: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}>
                        {ward.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{ward.name}</td>
                    <td style={{ color: '#475569' }}>{ward.floor}</td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #e2e8f0'
                      }}>
                        {ward.departmentType}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1e293b' }}>
                      {ward.bedCapacity} Beds
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                      {ward.targetUtilization}%
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: ward.isActive ? '#ecfdf5' : '#fef2f2',
                        border: ward.isActive ? '1px solid #a7f3d0' : '1px solid #fecaca',
                        color: ward.isActive ? '#047857' : '#dc2626'
                      }}>
                        {ward.isActive ? 'Operational' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(ward)}
                          style={{ padding: '6px', color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px' }}
                          title="Edit Ward"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(ward.id, ward.code)}
                          style={{ padding: '6px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}
                          title="Delete Ward"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Ward Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {editingWard ? 'Edit Hospital Ward' : 'Add New Ward to Master'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ward Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B7, C5E"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ward Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Orthopedic & Trauma Care"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Floor / Wing</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={e => setFormData({ ...formData, floor: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Department Type</label>
                  <select
                    value={formData.departmentType}
                    onChange={e => setFormData({ ...formData, departmentType: e.target.value as any })}
                    style={{ width: '100%' }}
                  >
                    <option value="General">General Medical / Surgical</option>
                    <option value="Step-down">Step-down / High Dependency</option>
                    <option value="ICU">Intensive Care Unit (ICU)</option>
                    <option value="Surgical">Post-Op Surgical</option>
                    <option value="Pediatric">Pediatric / Neonatal</option>
                    <option value="Emergency">Emergency Care</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bed Capacity</label>
                  <input
                    type="number"
                    value={formData.bedCapacity}
                    onChange={e => setFormData({ ...formData, bedCapacity: parseInt(e.target.value) || 20 })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Target Utilization (%)</label>
                  <input
                    type="number"
                    value={formData.targetUtilization}
                    onChange={e => setFormData({ ...formData, targetUtilization: parseInt(e.target.value) || 85 })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingWard ? 'Save Changes' : 'Create Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
