'use client';

import React, { useState, useEffect } from 'react';
import { UserSquare2, Plus, Search, Edit2, Trash2, X, Filter } from '@/components/Icons';
import { Patient, Ward } from '@/types';

export default function PatientMasterPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    uhid: '',
    admissionNumber: '',
    age: 45,
    gender: 'Male' as Patient['gender'],
    roomBed: '',
    doctorName: 'Dr. K. Rajagopal',
    wardId: '',
    diagnosis: '',
    currentAcuityScore: 1,
    currentAcuityCategory: 1 as 1 | 2 | 3 | 4
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsRes, wardsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/wards')
      ]);
      const patientsJson = await patientsRes.json();
      const wardsJson = await wardsRes.json();

      if (patientsJson.success) setPatients(patientsJson.data);
      if (wardsJson.success) {
        setWards(wardsJson.data);
        if (wardsJson.data.length > 0 && !formData.wardId) {
          setFormData(prev => ({ ...prev, wardId: wardsJson.data[0].id }));
        }
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

  const openAddModal = () => {
    setEditingPatient(null);
    const rndNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      uhid: `SIMS-2024-${rndNum}`,
      admissionNumber: `IP-${rndNum}`,
      age: 50,
      gender: 'Male',
      roomBed: '7801',
      doctorName: 'Dr. K. Rajagopal',
      wardId: wards[0]?.id || '',
      diagnosis: '',
      currentAcuityScore: 2,
      currentAcuityCategory: 2
    });
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      uhid: patient.uhid,
      admissionNumber: patient.admissionNumber,
      age: patient.age,
      gender: patient.gender,
      roomBed: patient.roomBed,
      doctorName: patient.doctorName,
      wardId: patient.wardId,
      diagnosis: patient.diagnosis,
      currentAcuityScore: patient.currentAcuityScore,
      currentAcuityCategory: patient.currentAcuityCategory
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        const res = await fetch('/api/patients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPatient.id, ...formData })
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          loadData();
        } else {
          alert('Failed to update: ' + data.error);
        }
      } else {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          loadData();
        } else {
          alert('Failed to admit patient: ' + data.error);
        }
      }
    } catch (err: any) {
      alert('Error submitting: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to discharge/remove patient ${name}?`)) return;
    try {
      const res = await fetch(`/api/patients?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadData();
    } catch (e) {
      console.error('Failed to discharge patient', e);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roomBed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWard = selectedWard === 'all' || p.wardId === selectedWard;
    return matchesSearch && matchesWard;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <UserSquare2 size={26} color="#8b5cf6" />
            <span>Patient Registry Master</span>
          </div>
          <p className="page-subtitle">
            Hospital inpatient admissions, clinical diagnoses, room assignments, and current acuity classifications
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} />
          <span>Admit New Patient</span>
        </button>
      </div>

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
              placeholder="Search UHID, patient name, doctor, bed..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', width: '300px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Filter Ward:</span>
            <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} style={{ fontSize: '12px' }}>
              <option value="all">All Wards</option>
              {wards.map(w => (
                <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>UHID</th>
                <th>Admission No</th>
                <th>Ward & Bed</th>
                <th>Attending Doctor</th>
                <th>Diagnosis</th>
                <th>Acuity Tier</th>
                <th>Current Staff</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading patient registry...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No patients found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => {
                  const acuityClass = `badge-acuity-${patient.currentAcuityCategory}`;

                  return (
                    <tr key={patient.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{patient.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {patient.age}y • {patient.gender}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>
                        {patient.uhid}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b' }}>
                        {patient.admissionNumber}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#6d28d9' }}>{patient.wardCode || 'B7'}</span>
                        <span style={{ color: '#64748b', marginLeft: '6px' }}>Bed {patient.roomBed}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#1e293b' }}>
                        {patient.doctorName}
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569', maxWidth: '220px' }}>
                        {patient.diagnosis}
                      </td>
                      <td>
                        <span className={acuityClass}>
                          Level {patient.currentAcuityCategory} ({patient.currentAcuityScore})
                        </span>
                      </td>
                      <td>
                        {patient.currentShiftStaff ? (
                          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                            {patient.currentShiftStaff.nurseName}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(patient)}
                            style={{ padding: '6px', color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px' }}
                            title="Edit Patient"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id, patient.name)}
                            style={{ padding: '6px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}
                            title="Discharge Patient"
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

      {/* Admit / Edit Patient Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                {editingPatient ? 'Edit Patient Admission' : 'Admit Inpatient'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>UHID *</label>
                  <input
                    type="text"
                    required
                    value={formData.uhid}
                    onChange={e => setFormData({ ...formData, uhid: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Admission No</label>
                  <input
                    type="text"
                    value={formData.admissionNumber}
                    onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    style={{ width: '100%' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ward *</label>
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
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Room / Bed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7804-A"
                    value={formData.roomBed}
                    onChange={e => setFormData({ ...formData, roomBed: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Attending Doctor *</label>
                <input
                  type="text"
                  required
                  value={formData.doctorName}
                  onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Clinical Diagnosis</label>
                <textarea
                  rows={2}
                  value={formData.diagnosis}
                  onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Initial Acuity Score</label>
                  <input
                    type="number"
                    value={formData.currentAcuityScore}
                    onChange={e => {
                      const score = parseInt(e.target.value) || 1;
                      let cat: 1 | 2 | 3 | 4 = 1;
                      if (score >= 15) cat = 4;
                      else if (score >= 10) cat = 3;
                      else if (score >= 5) cat = 2;
                      setFormData({ ...formData, currentAcuityScore: score, currentAcuityCategory: cat });
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Acuity Category</label>
                  <select
                    value={formData.currentAcuityCategory}
                    onChange={e => setFormData({ ...formData, currentAcuityCategory: parseInt(e.target.value) as any })}
                    style={{ width: '100%' }}
                  >
                    <option value={1}>Acuity 1 (Low)</option>
                    <option value={2}>Acuity 2 (Moderate)</option>
                    <option value={3}>Acuity 3 (High)</option>
                    <option value={4}>Acuity 4 (Critical)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPatient ? 'Save Changes' : 'Admit Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
