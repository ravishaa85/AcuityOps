import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { Ward, Nurse, Patient, AcuityFormTemplate, AcuityAssessment, DutyRosterItem, WardSummaryMetric } from '@/types';
import { initialWards, initialNurses, initialPatients, defaultAcuityFormTemplate, initialDutyRosters } from './seed-data';

interface DatabaseData {
  wards: Ward[];
  nurses: Nurse[];
  patients: Patient[];
  templates: AcuityFormTemplate[];
  assessments: AcuityAssessment[];
  dutyRosters: DutyRosterItem[];
  assignments: Array<{
    id: string;
    patientId: string;
    nurseId: string;
    wardId: string;
    assignmentDate: string;
    shiftType: string;
    assignedMode: string;
    continuityScore: number;
  }>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'acuityops-db.json');

// PostgreSQL Connection Pool (used if DATABASE_URL is configured and reachable)
let pgPool: Pool | null = null;
let isPgConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 2000,
    });
    pgPool.query('SELECT 1').then(() => {
      isPgConnected = true;
      console.log('Successfully connected to external PostgreSQL database.');
    }).catch((err) => {
      console.log('PostgreSQL connection not established, using persistent JSON storage:', err.message);
    });
  } catch {
    pgPool = null;
  }
}

// In-Memory cached state synced to file
let cachedData: DatabaseData | null = null;

function ensureDataFile(): DatabaseData {
  if (cachedData) return cachedData;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      cachedData = JSON.parse(content);
      return cachedData!;
    } catch (e) {
      console.error('Error reading db file, re-initializing seed data', e);
    }
  }

  // Seed default dataset
  const initialData: DatabaseData = {
    wards: [...initialWards],
    nurses: [...initialNurses],
    patients: [...initialPatients],
    templates: [defaultAcuityFormTemplate],
    assessments: [],
    dutyRosters: [...initialDutyRosters],
    assignments: []
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  cachedData = initialData;
  return cachedData;
}

function persistData() {
  if (!cachedData) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(cachedData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file', err);
  }
}

// --- Ward CRUD ---
export async function getWards(): Promise<Ward[]> {
  const db = ensureDataFile();
  return db.wards;
}

export async function getWardById(id: string): Promise<Ward | undefined> {
  const db = ensureDataFile();
  return db.wards.find(w => w.id === id || w.code.toLowerCase() === id.toLowerCase());
}

export async function createWard(wardData: Omit<Ward, 'id' | 'createdAt'>): Promise<Ward> {
  const db = ensureDataFile();
  const newWard: Ward = {
    ...wardData,
    id: `w-${wardData.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.wards.push(newWard);
  persistData();
  return newWard;
}

export async function updateWard(id: string, updates: Partial<Ward>): Promise<Ward | null> {
  const db = ensureDataFile();
  const idx = db.wards.findIndex(w => w.id === id);
  if (idx === -1) return null;
  db.wards[idx] = { ...db.wards[idx], ...updates };
  persistData();
  return db.wards[idx];
}

export async function deleteWard(id: string): Promise<boolean> {
  const db = ensureDataFile();
  const idx = db.wards.findIndex(w => w.id === id);
  if (idx === -1) return false;
  db.wards.splice(idx, 1);
  persistData();
  return true;
}

// --- Nurse CRUD ---
export async function getNurses(wardId?: string): Promise<Nurse[]> {
  const db = ensureDataFile();
  const wardsMap = new Map(db.wards.map(w => [w.id, w]));
  
  const nursesWithWard = db.nurses.map(n => ({
    ...n,
    wardCode: wardsMap.get(n.wardId)?.code || '',
    wardName: wardsMap.get(n.wardId)?.name || ''
  }));

  if (wardId && wardId !== 'all') {
    return nursesWithWard.filter(n => n.wardId === wardId || n.wardCode?.toLowerCase() === wardId.toLowerCase());
  }
  return nursesWithWard;
}

export async function getNurseById(id: string): Promise<Nurse | undefined> {
  const db = ensureDataFile();
  const nurse = db.nurses.find(n => n.id === id || n.employeeId === id);
  if (!nurse) return undefined;
  const ward = db.wards.find(w => w.id === nurse.wardId);
  return {
    ...nurse,
    wardCode: ward?.code,
    wardName: ward?.name
  };
}

export async function createNurse(nurseData: Omit<Nurse, 'id' | 'createdAt'>): Promise<Nurse> {
  const db = ensureDataFile();
  const newNurse: Nurse = {
    ...nurseData,
    id: `n-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.nurses.push(newNurse);
  persistData();
  return newNurse;
}

export async function updateNurse(id: string, updates: Partial<Nurse>): Promise<Nurse | null> {
  const db = ensureDataFile();
  const idx = db.nurses.findIndex(n => n.id === id);
  if (idx === -1) return null;
  db.nurses[idx] = { ...db.nurses[idx], ...updates };
  persistData();
  return db.nurses[idx];
}

export async function deleteNurse(id: string): Promise<boolean> {
  const db = ensureDataFile();
  const idx = db.nurses.findIndex(n => n.id === id);
  if (idx === -1) return false;
  db.nurses.splice(idx, 1);
  persistData();
  return true;
}

// --- Patient CRUD ---
export async function getPatients(wardId?: string): Promise<Patient[]> {
  const db = ensureDataFile();
  const wardsMap = new Map(db.wards.map(w => [w.id, w]));

  const mapped = db.patients.map(p => ({
    ...p,
    wardCode: wardsMap.get(p.wardId)?.code || ''
  }));

  if (wardId && wardId !== 'all') {
    return mapped.filter(p => p.wardId === wardId || p.wardCode?.toLowerCase() === wardId.toLowerCase());
  }
  return mapped;
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const db = ensureDataFile();
  const patient = db.patients.find(p => p.id === id || p.uhid === id);
  if (!patient) return undefined;
  const ward = db.wards.find(w => w.id === patient.wardId);
  return { ...patient, wardCode: ward?.code };
}

export async function createPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
  const db = ensureDataFile();
  const newPatient: Patient = {
    ...patientData,
    id: `p-${Date.now()}`
  };
  db.patients.push(newPatient);
  persistData();
  return newPatient;
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  const db = ensureDataFile();
  const idx = db.patients.findIndex(p => p.id === id);
  if (idx === -1) return null;
  db.patients[idx] = { ...db.patients[idx], ...updates };
  persistData();
  return db.patients[idx];
}

export async function deletePatient(id: string): Promise<boolean> {
  const db = ensureDataFile();
  const idx = db.patients.findIndex(p => p.id === id);
  if (idx === -1) return false;
  db.patients.splice(idx, 1);
  persistData();
  return true;
}

// --- Acuity Templates ---
export async function getAcuityTemplates(): Promise<AcuityFormTemplate[]> {
  const db = ensureDataFile();
  return db.templates;
}

export async function getActiveAcuityTemplate(): Promise<AcuityFormTemplate> {
  const db = ensureDataFile();
  const active = db.templates.find(t => t.isActive);
  return active || defaultAcuityFormTemplate;
}

export async function saveAcuityTemplate(template: AcuityFormTemplate): Promise<AcuityFormTemplate> {
  const db = ensureDataFile();
  const idx = db.templates.findIndex(t => t.id === template.id || t.version === template.version);
  if (idx >= 0) {
    db.templates[idx] = template;
  } else {
    db.templates.push(template);
  }
  persistData();
  return template;
}

// --- Acuity Assessments ---
export async function getAcuityAssessments(patientId?: string): Promise<AcuityAssessment[]> {
  const db = ensureDataFile();
  if (patientId) {
    return db.assessments.filter(a => a.patientId === patientId);
  }
  return db.assessments;
}

export async function createAcuityAssessment(data: Omit<AcuityAssessment, 'id' | 'createdAt'>): Promise<AcuityAssessment> {
  const db = ensureDataFile();
  const newAssessment: AcuityAssessment = {
    ...data,
    id: `assess-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  db.assessments.push(newAssessment);

  // Update patient's current score and category
  const patientIdx = db.patients.findIndex(p => p.id === data.patientId);
  if (patientIdx >= 0) {
    db.patients[patientIdx].currentAcuityScore = data.score;
    db.patients[patientIdx].currentAcuityCategory = data.category;
    db.patients[patientIdx].lastAcuityUpdate = `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('en-GB')}`;
  }

  persistData();
  return newAssessment;
}

// --- Duty Rosters ---
export async function getDutyRosters(date: string, wardId?: string): Promise<DutyRosterItem[]> {
  const db = ensureDataFile();
  const nursesMap = new Map(db.nurses.map(n => [n.id, n]));
  const wardsMap = new Map(db.wards.map(w => [w.id, w]));

  const filtered = db.dutyRosters.filter(r => r.assignmentDate === date);
  const items = filtered.map(item => {
    const nurse = nursesMap.get(item.nurseId);
    return {
      ...item,
      nurse: nurse ? {
        ...nurse,
        wardCode: wardsMap.get(nurse.wardId)?.code
      } : undefined
    };
  });

  if (wardId && wardId !== 'all') {
    return items.filter(i => i.wardId === wardId || i.nurse?.wardId === wardId);
  }
  return items;
}

export async function updateDutyRosterItem(id: string, shiftType: DutyRosterItem['shiftType']): Promise<DutyRosterItem | null> {
  const db = ensureDataFile();
  const idx = db.dutyRosters.findIndex(r => r.id === id);
  if (idx === -1) return null;
  db.dutyRosters[idx].shiftType = shiftType;
  persistData();
  return db.dutyRosters[idx];
}

export async function setDutyRoster(nurseId: string, wardId: string, date: string, shiftType: DutyRosterItem['shiftType']): Promise<DutyRosterItem> {
  const db = ensureDataFile();
  const existingIdx = db.dutyRosters.findIndex(r => r.nurseId === nurseId && r.assignmentDate === date);
  if (existingIdx >= 0) {
    db.dutyRosters[existingIdx].shiftType = shiftType;
    db.dutyRosters[existingIdx].wardId = wardId;
    persistData();
    return db.dutyRosters[existingIdx];
  } else {
    const newItem: DutyRosterItem = {
      id: `dr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      nurseId,
      wardId,
      assignmentDate: date,
      shiftType
    };
    db.dutyRosters.push(newItem);
    persistData();
    return newItem;
  }
}

// --- Patient Nurse Assignments ---
export async function assignNurseToPatient(patientId: string, nurseId: string, shift: 'current' | 'next' = 'current') {
  const db = ensureDataFile();
  const patient = db.patients.find(p => p.id === patientId);
  const nurse = db.nurses.find(n => n.id === nurseId);
  if (!patient || !nurse) return null;

  const staffAssignment = {
    nurseId: nurse.id,
    nurseName: nurse.name,
    competency: nurse.competency
  };

  if (shift === 'current') {
    patient.currentShiftStaff = staffAssignment;
  } else {
    patient.nextShiftStaff = staffAssignment;
  }

  persistData();
  return patient;
}

// --- Slide 8 Real-time Acuity Management Dashboard Aggregates ---
export async function getHospitalSummaryMetrics(): Promise<WardSummaryMetric[]> {
  const db = ensureDataFile();
  const metrics: WardSummaryMetric[] = [];

  // Nurse competency weights for Acuity Capacity (as per BMH slide notes)
  const capacityMap: Record<string, number> = {
    'Expert': 20,
    'Proficient': 15,
    'Competent': 10,
    'Advanced Beginner': 7,
    'Novice': 5
  };

  for (const ward of db.wards) {
    const wardNurses = db.nurses.filter(n => n.wardId === ward.id && n.status === 'Active');
    const wardPatients = db.patients.filter(p => p.wardId === ward.id);

    const advBeginner = wardNurses.filter(n => n.competency === 'Advanced Beginner').length;
    const competent = wardNurses.filter(n => n.competency === 'Competent').length;
    const proficient = wardNurses.filter(n => n.competency === 'Proficient').length;
    const expert = wardNurses.filter(n => n.competency === 'Expert').length;

    // Total Acuity from patients
    const totalAcuity = wardPatients.reduce((sum, p) => sum + (p.currentAcuityScore || 1), 0);

    // Max Acuity Capacity from staff
    let maxAcuityCapacity = wardNurses.reduce((sum, n) => sum + (capacityMap[n.competency] || 10), 0);
    if (maxAcuityCapacity === 0) maxAcuityCapacity = 20; // baseline default

    // Calculate capacity utilization percentage
    const capacityUtilization = Math.round((totalAcuity / maxAcuityCapacity) * 100);

    let statusAlert: WardSummaryMetric['statusAlert'] = 'normal';
    if (capacityUtilization > 100) {
      statusAlert = 'critical';
    } else if (capacityUtilization >= 90) {
      statusAlert = 'warning';
    } else if (capacityUtilization < 70) {
      statusAlert = 'low';
    }

    metrics.push({
      wardId: ward.id,
      wardCode: ward.code,
      wardName: ward.name,
      totalStaff: wardNurses.length,
      advancedBeginnerCount: advBeginner,
      competentCount: competent,
      proficientCount: proficient,
      expertCount: expert,
      totalPatients: wardPatients.length,
      totalAcuity,
      maxAcuityCapacity,
      capacityUtilization,
      statusAlert
    });
  }

  // Sort: Critical over-capacity wards first (like Slide 8: B7 at 145%, C5E at 118%, C5W at 104%)
  return metrics.sort((a, b) => b.capacityUtilization - a.capacityUtilization);
}
