import { NextRequest, NextResponse } from 'next/server';
import { getPatients, getNurses, getDutyRosters, assignNurseToPatient } from '@/lib/db';
import { runCombinatorialStaffAssignment } from '@/lib/optimizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      wardId,
      shiftType = 'Evening',
      date = '2024-10-10',
      overrideExisting = false
    } = body;

    if (!wardId) {
      return NextResponse.json({ success: false, error: 'Ward ID is required' }, { status: 400 });
    }

    // 1. Get patients for ward
    const patients = await getPatients(wardId);

    // 2. Get active nurses assigned to this shift and ward
    const allRosters = await getDutyRosters(date, wardId);
    const assignedRosters = allRosters.filter(r => r.shiftType === shiftType);

    let candidateNurses = assignedRosters.map(r => r.nurse).filter(Boolean);

    // If duty roster hasn't allocated any nurses yet for this ward/shift, take the ward's active nurses
    if (candidateNurses.length === 0) {
      const wardNurses = await getNurses(wardId);
      candidateNurses = wardNurses.filter(n => n.status === 'Active');
    }

    if (candidateNurses.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active staff members are available for this ward and shift.'
      }, { status: 400 });
    }

    // 3. Run combinatorial optimization algorithm
    const result = runCombinatorialStaffAssignment(
      patients,
      candidateNurses as any[],
      {
        overrideExisting,
        pastTwoDaysHistory: {
          'p-1': 'n-101',
          'p-2': 'n-101',
          'p-4': 'n-102'
        }
      }
    );

    // 4. Persist assignments into patient records
    for (const item of result.assignments) {
      await assignNurseToPatient(item.patientId, item.assignedNurseId, shiftType === 'Morning' ? 'current' : 'next');
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
