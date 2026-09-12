import { Ward, Patient, HISSyncResult } from '@/types';
import { getWards, bulkUpsertWards, getPatients, bulkUpsertPatients, updateHisSyncMetadata } from './db';

const HIS_BEDWARD_URL = 'https://api.simshospitals.com/ERP_WEBSERVICES/InhouseWebservices.asmx/Proc_Bedwardwise';
const HIS_INPATIENT_URL = 'https://api.simshospitals.com/ERP_WEBSERVICES/InhouseWebservices.asmx/Proc_Inpatientdetails';

interface RawHisBed {
  bedname: string;
  wardname: string;
}

interface RawHisPatient {
  uhid: string;
  ipid: string;
  Admitdate: string;
  Patientname: string;
  Age: string;
  Gender: string;
  PrimaryDoctor: string;
  Diagnosis: string;
}

// Format clean code from ward name
function generateWardCode(wardName: string): string {
  const clean = wardName.trim().toUpperCase();
  if (clean === 'IVF') return 'IVF';
  if (clean === 'OPERATION THEATRE') return 'OT';
  if (clean === 'EMERGENCY') return 'EMRG';
  if (clean === 'POST OPERATIVE WARD') return 'POW';
  if (clean === 'HDU') return 'HDU';
  if (clean === 'NICU') return 'NICU';
  if (clean === 'BMT') return 'BMT';
  if (clean === 'T WARD') return 'T-WRD';
  if (clean.includes('SECOND FLOOR NEURO ICU')) return '2F-NICU';
  if (clean.includes('SECOND FLOOR TRANSPLANT ICU')) return '2F-TICU';
  if (clean.includes('SECOND FLOOR CTICU')) return '2F-CTICU';
  if (clean.includes('THIRD FLOOR MALE GENERAL WARD')) return '3F-MGW';
  if (clean.includes('THIRD FLOOR FEMALE') && clean.includes('GENERAL WARD')) return '3F-FGW';
  if (clean.includes('THIRD FLOOR') && clean.includes('MEDICAL ICU')) return '3F-MICU';
  if (clean.includes('THIRD FLOOR') && clean.includes('SURGICAL ICU')) return '3F-SICU';
  if (clean.includes('THIRD FLOOR') && (clean.includes('PEAD ICU') || clean.includes('PAED ICU'))) return '3F-PICU';
  if (clean.includes('THIRD FLOOR ICU')) return '3F-ICU';
  if (clean.includes('THIRD FLOOR ENDOSCOPY')) return '3F-ENDO';
  if (clean.includes('ONCOLOGY DAY CARE') || clean.includes('ONCOLOGY')) return '3F-ONC';
  if (clean.includes('FOURTH FLOOR A WING')) return '4F-A';
  if (clean.includes('FOURTH FLOOR B WING')) return '4F-B';
  if (clean.includes('FOURTH FLOOR C WING')) return '4F-C';
  if (clean.includes('FOURTH FLOOR D WING')) return '4F-D';
  if (clean.includes('FIFTH FLOOR A WING')) return '5F-A';
  if (clean.includes('FIFTH FLOOR B WING')) return '5F-B';
  if (clean.includes('FIFTH FLOOR D WING')) return '5F-D';
  if (clean.includes('DAY CARE') && clean.includes('GROUND')) return 'GF-DCU';
  if (clean.includes('A ANNEX A WING')) return 'ANX-A';
  if (clean.includes('A ANNEX B WING')) return 'ANX-B';
  if (clean.includes('SPECIAL ANNEX')) return 'SP-ANX';
  if (clean.includes('ATTENDANT ROOM')) return 'ATND';
  if (clean.includes('RAFFLES')) return 'RAFFLES';

  // Fallback: take initials or slug
  const words = clean.split(/\s+/).filter(w => !['WARD', 'FLOOR', 'WING'].includes(w));
  if (words.length > 1) {
    return words.map(w => w[0]).join('').slice(0, 6);
  }
  return clean.replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

// Determine Floor from ward name
function inferFloor(wardName: string): string {
  const upper = wardName.toUpperCase();
  if (upper.includes('GROUND') || upper.includes('EMERGENCY')) return 'Ground Floor';
  if (upper.includes('FIRST')) return '1st Floor';
  if (upper.includes('SECOND')) return '2nd Floor';
  if (upper.includes('THIRD')) return '3rd Floor';
  if (upper.includes('FOURTH')) return '4th Floor';
  if (upper.includes('FIFTH')) return '5th Floor';
  if (upper.includes('SIXTH')) return '6th Floor';
  if (upper.includes('SEVENTH')) return '7th Floor';
  if (upper.includes('EIGHTH')) return '8th Floor';
  if (upper.includes('OPERATION THEATRE')) return '3rd Floor';
  return 'Main Block';
}

// Determine department type
function inferDepartmentType(wardName: string): Ward['departmentType'] {
  const upper = wardName.toUpperCase();
  if (upper.includes('ICU') || upper.includes('CCU') || upper.includes('INTENSIVE')) return 'ICU';
  if (upper.includes('THEATRE') || upper.includes('POST OPERATIVE') || upper.includes('SURG')) return 'Surgical';
  if (upper.includes('EMERGENCY') || upper.includes('CASUALTY')) return 'Emergency';
  if (upper.includes('PEDIATRIC') || upper.includes('NICU') || upper.includes('PICU') || upper.includes('NEONAT')) return 'Pediatric';
  if (upper.includes('STEP-DOWN') || upper.includes('DEPENDENCY') || upper.includes('HDU')) return 'Step-down';
  return 'General';
}

// Parse Age string e.g. "29 Years" -> 29
function parseAge(ageStr: string): number {
  if (!ageStr) return 40;
  const match = ageStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 40;
}

// Parse Gender string
function parseGender(genderStr: string): 'Male' | 'Female' | 'Other' {
  const upper = (genderStr || '').trim().toUpperCase();
  if (upper === 'MALE' || upper === 'M') return 'Male';
  if (upper === 'FEMALE' || upper === 'F') return 'Female';
  return 'Other';
}

// Parse admit date "6/1/2026 7:29:19 AM" -> "2026-06-01"
function parseAdmitDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}
  return new Date().toISOString().split('T')[0];
}

// Initial clinical acuity scoring based on clinical diagnosis & doctor specialty
// Aligned to SIMS Patient Acuity Tool Scale:
// Acuity 1: 1-12 (N:P Ratio 1:6)
// Acuity 2: 13-24 (N:P Ratio 1:5)
// Acuity 3: 25-48 (N:P Ratio 1:4)
export function inferAcuityFromClinicalDetails(diagnosis: string, doctorName: string): { score: number; category: 1 | 2 | 3 | 4 } {
  const text = `${diagnosis} ${doctorName}`.toUpperCase();

  // Tier 3: High Acuity / Continuous monitoring / Critical interventions (25-48)
  if (
    text.includes('ICU') ||
    text.includes('VENTILAT') ||
    text.includes('CONTUSION') ||
    text.includes('SDH') ||
    text.includes('INFARCT') ||
    text.includes('LEUKEMIA') ||
    text.includes('MOTOR NEURON') ||
    text.includes('POLYTRAUMA') ||
    text.includes('HEMORRHAGE') ||
    text.includes('VENTRICULAR') ||
    text.includes('CARCINOMA') ||
    text.includes('SHOCK') ||
    text.includes('ARREST') ||
    text.includes('CHEMOTHERAPY') ||
    text.includes('CHEST TUBE') ||
    text.includes('TRACHEOSTOMY')
  ) {
    return { score: 30, category: 3 };
  }

  // Tier 2: Moderate Acuity / Frequent 2h monitoring / Moderate assistance (13-24)
  if (
    text.includes('SURGERY') ||
    text.includes('POST-OP') ||
    text.includes('FRACTURE') ||
    text.includes('MYELOMA') ||
    text.includes('TUMOR') ||
    text.includes('NEPHROTIC') ||
    text.includes('DIALYSIS') ||
    text.includes('SEPSIS') ||
    text.includes('PNEUMONIA') ||
    text.includes('CARDIAC') ||
    text.includes('NEURO') ||
    text.includes('R T A') ||
    text.includes('DIABETES') ||
    text.includes('HYPERTENSION') ||
    text.includes('FEVER') ||
    text.includes('ASTHMA') ||
    text.includes('INFECTION')
  ) {
    return { score: 18, category: 2 };
  }

  // Tier 1: Low Acuity / Minimal assistance / Routine monitoring (1-12)
  return { score: 6, category: 1 };
}

// Fetch Wards and Beds from HIS API
export async function fetchHisWardsAndBeds(): Promise<Ward[]> {
  const res = await fetch(HIS_BEDWARD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Bedwardwise from HIS: HTTP ${res.status}`);
  }

  const rawBeds: RawHisBed[] = await res.json();
  const wardMap = new Map<string, string[]>();

  // Group beds by ward
  for (const item of rawBeds) {
    const wardName = (item.wardname || '').trim();
    const bedName = (item.bedname || '').trim();
    if (!wardName) continue;

    if (!wardMap.has(wardName)) {
      wardMap.set(wardName, []);
    }
    if (bedName) {
      wardMap.get(wardName)!.push(bedName);
    }
  }

  const wards: Ward[] = [];
  const nowStr = new Date().toISOString();

  for (const [wardName, beds] of Array.from(wardMap.entries())) {
    const code = generateWardCode(wardName);
    const id = `his-w-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const departmentType = inferDepartmentType(wardName);
    const floor = inferFloor(wardName);

    wards.push({
      id,
      code,
      name: wardName,
      floor,
      bedCapacity: beds.length || 10,
      beds: beds.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      departmentType,
      targetUtilization: departmentType === 'ICU' ? 80 : 85,
      isActive: true,
      source: 'HIS',
      lastSyncedAt: nowStr,
      createdAt: nowStr.split('T')[0]
    });
  }

  return wards;
}

// Fetch active Inpatients from HIS API
export async function fetchHisInpatients(): Promise<RawHisPatient[]> {
  const res = await fetch(HIS_INPATIENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Inpatientdetails from HIS: HTTP ${res.status}`);
  }

  const rawPatients: RawHisPatient[] = await res.json();
  return rawPatients;
}

// Match patient to appropriate ward and bed
function matchWardAndBed(
  raw: RawHisPatient,
  wards: Ward[],
  wardBedAllocations: Map<string, Set<string>>
): { wardId: string; wardCode: string; wardName: string; roomBed: string } {
  const clinicalText = `${raw.PrimaryDoctor} ${raw.Diagnosis}`.toUpperCase();

  // Find best candidate ward
  let targetWard: Ward | undefined;

  if (clinicalText.includes('ICU') || clinicalText.includes('CRITICAL CARE')) {
    targetWard = wards.find(w => w.departmentType === 'ICU');
  } else if (clinicalText.includes('NEURO')) {
    targetWard = wards.find(w => w.name.toUpperCase().includes('NEURO') || w.code === '2F-NICU');
  } else if (clinicalText.includes('HAEMATOLOGY') || clinicalText.includes('ONCOLOGY')) {
    targetWard = wards.find(w => w.departmentType === 'Step-down' || w.name.toUpperCase().includes('TRANSPLANT') || w.code === '2F-TICU');
  } else if (clinicalText.includes('SURGERY') || clinicalText.includes('SURGICAL')) {
    targetWard = wards.find(w => w.departmentType === 'Surgical' || w.name.toUpperCase().includes('POST OPERATIVE'));
  } else if (clinicalText.includes('EMERGENCY')) {
    targetWard = wards.find(w => w.departmentType === 'Emergency');
  } else if (raw.Gender.toUpperCase() === 'FEMALE') {
    targetWard = wards.find(w => w.name.toUpperCase().includes('FEMALE')) || wards.find(w => w.code.includes('4F-A') || w.code.includes('4F-B'));
  } else {
    targetWard = wards.find(w => w.name.toUpperCase().includes('MALE')) || wards.find(w => w.code.includes('3F') || w.code.includes('4F'));
  }

  // Fallback to first available ward
  if (!targetWard) {
    targetWard = wards[0];
  }

  // Allocate bed from targetWard
  if (!wardBedAllocations.has(targetWard.id)) {
    wardBedAllocations.set(targetWard.id, new Set<string>());
  }
  const allocatedInWard = wardBedAllocations.get(targetWard.id)!;

  let allocatedBed = '';
  if (targetWard.beds && targetWard.beds.length > 0) {
    // Find first unallocated bed
    for (const b of targetWard.beds) {
      if (!allocatedInWard.has(b)) {
        allocatedBed = b;
        allocatedInWard.add(b);
        break;
      }
    }
  }

  // If all specific beds taken, generate sequential bed
  if (!allocatedBed) {
    const nextNum = allocatedInWard.size + 1;
    allocatedBed = `${targetWard.code}-${nextNum < 10 ? '0' + nextNum : nextNum}`;
    allocatedInWard.add(allocatedBed);
  }

  return {
    wardId: targetWard.id,
    wardCode: targetWard.code,
    wardName: targetWard.name,
    roomBed: allocatedBed
  };
}

// Master Synchronization Controller
export async function syncHisData(options: {
  syncWards?: boolean;
  syncPatients?: boolean;
} = { syncWards: true, syncPatients: true }): Promise<HISSyncResult> {
  const nowStr = new Date().toISOString();
  let wardsResult = { totalFetched: 0, newAdded: 0, updated: 0, totalBeds: 0 };
  let patientsResult = { totalFetched: 0, newAdmitted: 0, updated: 0, activeInpatients: 0 };

  // Step 1: Sync Wards & Beds if requested
  let currentWards: Ward[] = await getWards();
  if (options.syncWards) {
    try {
      const hisWards = await fetchHisWardsAndBeds();
      const upsertRes = await bulkUpsertWards(hisWards);
      currentWards = await getWards();

      const totalBeds = currentWards.reduce((sum, w) => sum + (w.beds?.length || w.bedCapacity || 0), 0);
      wardsResult = {
        totalFetched: hisWards.length,
        newAdded: upsertRes.newCount,
        updated: upsertRes.updatedCount,
        totalBeds
      };
    } catch (err: any) {
      console.error('Error syncing wards from HIS:', err);
      throw new Error(`Ward Sync Failed: ${err.message}`);
    }
  }

  // Step 2: Sync Inpatients if requested
  if (options.syncPatients) {
    try {
      const rawPatients = await fetchHisInpatients();
      const existingPatients = await getPatients();
      const existingPatientMap = new Map(existingPatients.map(p => [p.uhid, p]));

      // Track bed allocations to prevent duplicate bed assignments across active admissions
      const wardBedAllocations = new Map<string, Set<string>>();
      for (const ep of existingPatients) {
        if (!wardBedAllocations.has(ep.wardId)) {
          wardBedAllocations.set(ep.wardId, new Set<string>());
        }
        if (ep.roomBed) {
          wardBedAllocations.get(ep.wardId)!.add(ep.roomBed);
        }
      }

      const patientsToUpsert: Patient[] = [];

      for (const raw of rawPatients) {
        const uhid = (raw.uhid || '').trim();
        const ipid = (raw.ipid || '').trim();
        if (!uhid) continue;

        const existing = existingPatientMap.get(uhid);
        const name = (raw.Patientname || '').replace(/\s+/g, ' ').trim();
        const age = parseAge(raw.Age);
        const gender = parseGender(raw.Gender);
        const doctorName = (raw.PrimaryDoctor || '').trim();
        const diagnosis = (raw.Diagnosis || '').replace(/\r\n/g, ' ').trim();
        const admissionDate = parseAdmitDate(raw.Admitdate);
        const acuity = inferAcuityFromClinicalDetails(diagnosis, doctorName);

        // Retain current ward & bed if already mapped, otherwise dynamically allocate
        let wardId = existing?.wardId || '';
        let wardCode = existing?.wardCode || '';
        let wardName = existing?.wardName || '';
        let roomBed = existing?.roomBed || '';

        if (!wardId || !roomBed || !currentWards.some(w => w.id === wardId)) {
          const allocation = matchWardAndBed(raw, currentWards, wardBedAllocations);
          wardId = allocation.wardId;
          wardCode = allocation.wardCode;
          wardName = allocation.wardName;
          roomBed = allocation.roomBed;
        }

        patientsToUpsert.push({
          id: existing?.id || `p-his-${uhid}-${ipid || Date.now()}`,
          uhid,
          admissionNumber: ipid || existing?.admissionNumber || `IP-${uhid}`,
          name,
          age,
          gender,
          roomBed,
          doctorName,
          wardId,
          wardCode,
          wardName,
          admissionDate,
          diagnosis,
          currentAcuityScore: existing?.currentAcuityScore || acuity.score,
          currentAcuityCategory: existing?.currentAcuityCategory || acuity.category,
          lastAcuityUpdate: existing?.lastAcuityUpdate || `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('en-GB')}`,
          source: 'HIS',
          lastSyncedAt: nowStr,
          currentShiftStaff: existing?.currentShiftStaff || null,
          nextShiftStaff: existing?.nextShiftStaff || null
        });
      }

      const upsertRes = await bulkUpsertPatients(patientsToUpsert);
      patientsResult = {
        totalFetched: rawPatients.length,
        newAdmitted: upsertRes.newCount,
        updated: upsertRes.updatedCount,
        activeInpatients: upsertRes.total
      };
    } catch (err: any) {
      console.error('Error syncing patients from HIS:', err);
      throw new Error(`Patient Sync Failed: ${err.message}`);
    }
  }

  // Update HIS Sync metadata in database
  const totalBeds = currentWards.reduce((sum, w) => sum + (w.beds?.length || w.bedCapacity || 0), 0);
  await updateHisSyncMetadata({
    lastSyncedAt: nowStr,
    totalWards: currentWards.length,
    totalPatients: patientsResult.activeInpatients || (await getPatients()).length,
    totalBeds
  });

  return {
    wards: wardsResult,
    patients: patientsResult,
    syncedAt: nowStr,
    status: 'success',
    message: `Successfully synchronized ${patientsResult.totalFetched} inpatients and ${wardsResult.totalFetched} wards from SIMS HIS.`
  };
}
