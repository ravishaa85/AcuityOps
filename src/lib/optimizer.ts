import { Patient, Nurse, CompetencyLevel } from '@/types';

// Hospital Standard SIMS Acuity Tool Staffing Rules:
// "Novice and Limited level staff shall get patients with acuity score 1 & 2 and
// Patient with acuity score of 3 shall be given to competent / proficient or expert categories of staff."
const competencyRank: Record<CompetencyLevel, number> = {
  'Expert': 5,
  'Proficient': 4,
  'Competent': 3,
  'Advanced Beginner': 2,
  'Novice': 1
};

const minCompetencyForAcuity: Record<number, number> = {
  4: 3, // Legacy fallback: Competent, Proficient, Expert (rank >= 3)
  3: 3, // Acuity 3 (Score 25-48): strictly Competent, Proficient, Expert (rank >= 3)
  2: 1, // Acuity 2 (Score 13-24): Novice & Limited level staff eligible (rank >= 1)
  1: 1  // Acuity 1 (Score 1-12): Novice & Limited level staff eligible (rank >= 1)
};

export interface OptimizationResultItem {
  patientId: string;
  patientName: string;
  roomBed: string;
  acuityScore: number;
  acuityCategory: 1 | 2 | 3 | 4;
  assignedNurseId: string;
  assignedNurseName: string;
  nurseCompetency: CompetencyLevel;
  continuityOfCareMatched: boolean;
  isFallback: boolean;
  notes: string;
}

export interface OptimizationSummary {
  totalPatientsAssigned: number;
  unassignedCount: number;
  assignments: OptimizationResultItem[];
  nurseWorkloads: Array<{
    nurseId: string;
    nurseName: string;
    competency: CompetencyLevel;
    assignedPatientsCount: number;
    totalAssignedAcuity: number;
    maxCapacity: number;
    utilizationPercent: number;
  }>;
}

export function runCombinatorialStaffAssignment(
  patients: Patient[],
  availableNurses: Nurse[],
  options: {
    overrideExisting?: boolean;
    pastTwoDaysHistory?: Record<string, string>; // patientId -> recentNurseId
  } = {}
): OptimizationSummary {
  const { overrideExisting = false, pastTwoDaysHistory = {} } = options;

  // Filter patients that need assignment
  const targetPatients = overrideExisting
    ? [...patients]
    : patients.filter(p => !p.currentShiftStaff);

  // Sort patients: Highest acuity first (Acuity 4 -> 3 -> 2 -> 1)
  // Harder/higher acuity constraints should be satisfied first
  targetPatients.sort((a, b) => (b.currentAcuityCategory || b.currentAcuityScore) - (a.currentAcuityCategory || a.currentAcuityScore));

  // Initialize nurse workloads tracking
  const nurseWorkloadMap = new Map<string, {
    nurse: Nurse;
    totalAcuity: number;
    patients: Patient[];
  }>();

  for (const nurse of availableNurses) {
    nurseWorkloadMap.set(nurse.id, {
      nurse,
      totalAcuity: 0,
      patients: []
    });
  }

  // Pre-load workloads for already assigned patients if not overriding
  if (!overrideExisting) {
    for (const patient of patients) {
      if (patient.currentShiftStaff && nurseWorkloadMap.has(patient.currentShiftStaff.nurseId)) {
        const item = nurseWorkloadMap.get(patient.currentShiftStaff.nurseId)!;
        item.totalAcuity += patient.currentAcuityScore || 1;
        item.patients.push(patient);
      }
    }
  }

  const assignments: OptimizationResultItem[] = [];

  for (const patient of targetPatients) {
    const requiredMinRank = minCompetencyForAcuity[patient.currentAcuityCategory] || 2;
    const recentNurseId = pastTwoDaysHistory[patient.id];

    // Find candidates meeting the competency constraint
    let candidates = availableNurses.filter(n => competencyRank[n.competency] >= requiredMinRank);
    let isFallback = false;

    // Fallback: If no candidate meets the strict requirement, relax to all available staff
    if (candidates.length === 0) {
      candidates = [...availableNurses];
      isFallback = true;
    }

    if (candidates.length === 0) {
      // No staff available at all
      continue;
    }

    // Apply Slide 7 multi-tier optimization rules:
    // Rule 1: Continuity of care: prioritize nurse who cared for this patient in past 2 days
    const continuityCandidate = recentNurseId
      ? candidates.find(c => c.id === recentNurseId)
      : undefined;

    let selectedNurse: Nurse;
    let continuityMatched = false;

    if (continuityCandidate) {
      const load = nurseWorkloadMap.get(continuityCandidate.id)!;
      // Only keep continuity if nurse is not drastically over their max capacity
      if (load.totalAcuity + patient.currentAcuityScore <= continuityCandidate.maxAcuityCapacity + 4) {
        selectedNurse = continuityCandidate;
        continuityMatched = true;
      } else {
        selectedNurse = pickBestBalancedNurse(candidates, nurseWorkloadMap);
      }
    } else {
      // Rule 2 & 3: Workload balancing (lower current total acuity) + Tie breaking (higher competency)
      selectedNurse = pickBestBalancedNurse(candidates, nurseWorkloadMap);
    }

    // Record assignment
    const nurseLoad = nurseWorkloadMap.get(selectedNurse.id)!;
    nurseLoad.totalAcuity += patient.currentAcuityScore || 1;
    nurseLoad.patients.push(patient);

    assignments.push({
      patientId: patient.id,
      patientName: patient.name,
      roomBed: patient.roomBed,
      acuityScore: patient.currentAcuityScore,
      acuityCategory: patient.currentAcuityCategory,
      assignedNurseId: selectedNurse.id,
      assignedNurseName: selectedNurse.name,
      nurseCompetency: selectedNurse.competency,
      continuityOfCareMatched: continuityMatched,
      isFallback,
      notes: continuityMatched
        ? 'Assigned based on Continuity of Care (Past 2 days assignment history)'
        : isFallback
          ? 'Assigned via Fallback (High acuity care with supervisor oversight)'
          : 'Assigned via Constraint Optimization (Competency & Balanced Acuity Workload)'
    });
  }

  // Compile nurse workload stats
  const nurseWorkloads = availableNurses.map(nurse => {
    const load = nurseWorkloadMap.get(nurse.id);
    const totalAssignedAcuity = load ? load.totalAcuity : 0;
    const assignedPatientsCount = load ? load.patients.length : 0;
    const maxCapacity = nurse.maxAcuityCapacity || 10;
    const utilizationPercent = Math.round((totalAssignedAcuity / maxCapacity) * 100);

    return {
      nurseId: nurse.id,
      nurseName: nurse.name,
      competency: nurse.competency,
      assignedPatientsCount,
      totalAssignedAcuity,
      maxCapacity,
      utilizationPercent
    };
  });

  return {
    totalPatientsAssigned: assignments.length,
    unassignedCount: targetPatients.length - assignments.length,
    assignments,
    nurseWorkloads
  };
}

function pickBestBalancedNurse(
  candidates: Nurse[],
  nurseWorkloadMap: Map<string, { totalAcuity: number; nurse: Nurse; patients: Patient[] }>
): Nurse {
  return candidates.slice().sort((a, b) => {
    const loadA = nurseWorkloadMap.get(a.id)?.totalAcuity || 0;
    const loadB = nurseWorkloadMap.get(b.id)?.totalAcuity || 0;

    // Rule 2: Lowest current total acuity preferred
    if (loadA !== loadB) {
      return loadA - loadB;
    }

    // Rule 3: Tie breaking: higher competency level preferred
    return competencyRank[b.competency] - competencyRank[a.competency];
  })[0];
}
