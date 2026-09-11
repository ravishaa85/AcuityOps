export type CompetencyLevel = 'Novice' | 'Advanced Beginner' | 'Competent' | 'Proficient' | 'Expert';

export interface Ward {
  id: string;
  code: string;
  name: string;
  floor: string;
  bedCapacity: number;
  departmentType: 'General' | 'ICU' | 'Step-down' | 'Surgical' | 'Pediatric' | 'Emergency';
  targetUtilization: number;
  isActive: boolean;
  createdAt: string;
}

export interface Nurse {
  id: string;
  employeeId: string;
  name: string;
  competency: CompetencyLevel;
  wardId: string;
  wardCode?: string;
  wardName?: string;
  contactNumber: string;
  email: string;
  experienceYears: number;
  maxAcuityCapacity: number;
  status: 'Active' | 'On Leave';
  shiftPreference: 'Morning' | 'Evening' | 'Night' | 'Flexible';
  createdAt: string;
}

export interface Patient {
  id: string;
  uhid: string;
  admissionNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  roomBed: string;
  doctorName: string;
  wardId: string;
  wardCode?: string;
  admissionDate: string;
  diagnosis: string;
  currentAcuityScore: number;
  currentAcuityCategory: 1 | 2 | 3 | 4;
  lastAcuityUpdate: string;
  currentShiftStaff?: {
    nurseId: string;
    nurseName: string;
    competency: CompetencyLevel;
  } | null;
  nextShiftStaff?: {
    nurseId: string;
    nurseName: string;
    competency: CompetencyLevel;
  } | null;
}

export interface AcuityFormFieldOption {
  id: string;
  label: string;
  score: number;
}

export interface AcuityFormField {
  id: string;
  title: string;
  options: AcuityFormFieldOption[];
}

export interface AcuityFormTemplate {
  id: string;
  version: number;
  title: string;
  fields: AcuityFormField[];
  isActive: boolean;
  createdAt: string;
}

export interface AcuityAssessment {
  id: string;
  patientId: string;
  wardId: string;
  evaluatedBy: string;
  shiftDate: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  score: number;
  category: 1 | 2 | 3 | 4;
  responses: Record<string, string[]>; // fieldId -> optionIds
  notes?: string;
  createdAt: string;
}

export interface DutyRosterItem {
  id: string;
  nurseId: string;
  wardId: string;
  assignmentDate: string;
  shiftType: 'Morning' | 'Evening' | 'Night' | 'Week-off' | 'Leave' | 'Unassigned';
  nurse?: Nurse;
}

export interface WardSummaryMetric {
  wardId: string;
  wardCode: string;
  wardName: string;
  totalStaff: number;
  advancedBeginnerCount: number;
  competentCount: number;
  proficientCount: number;
  expertCount: number;
  totalPatients: number;
  totalAcuity: number;
  maxAcuityCapacity: number;
  capacityUtilization: number; // percentage
  statusAlert: 'critical' | 'warning' | 'normal' | 'low';
}

export interface StaffRebalanceRecommendation {
  id: string;
  targetWardCode: string;
  targetWardName: string;
  donorWardCode: string;
  donorWardName: string;
  nurseCount: number;
  competency: CompetencyLevel;
  capacityGain: number;
  reason: string;
}
