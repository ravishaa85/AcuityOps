import { NextRequest, NextResponse } from 'next/server';
import { getPatients, createPatient, updatePatient, deletePatient, assignNurseToPatient } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get('wardId') || undefined;
    const patients = await getPatients(wardId);
    return NextResponse.json({ success: true, data: patients });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.uhid || !body.roomBed || !body.wardId) {
      return NextResponse.json({ success: false, error: 'Name, UHID, Room/Bed, and Ward are required' }, { status: 400 });
    }
    const newPatient = await createPatient({
      ...body,
      admissionDate: body.admissionDate || new Date().toISOString().split('T')[0],
      currentAcuityScore: body.currentAcuityScore || 1,
      currentAcuityCategory: body.currentAcuityCategory || 1,
      lastAcuityUpdate: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('en-GB')}`
    });
    return NextResponse.json({ success: true, data: newPatient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nurseId, shift, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Patient ID is required' }, { status: 400 });
    }

    // Direct manual nurse assignment
    if (nurseId) {
      const assigned = await assignNurseToPatient(id, nurseId, shift || 'current');
      return NextResponse.json({ success: true, data: assigned });
    }

    const updated = await updatePatient(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Patient ID is required' }, { status: 400 });
    }
    const deleted = await deletePatient(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
