import { NextRequest, NextResponse } from 'next/server';
import { getNurses, createNurse, updateNurse, deleteNurse } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get('wardId') || undefined;
    const nurses = await getNurses(wardId);
    return NextResponse.json({ success: true, data: nurses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.employeeId || !body.competency || !body.wardId) {
      return NextResponse.json({ success: false, error: 'Name, Employee ID, Competency, and Ward are required' }, { status: 400 });
    }
    const newNurse = await createNurse(body);
    return NextResponse.json({ success: true, data: newNurse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Nurse ID is required' }, { status: 400 });
    }
    const updated = await updateNurse(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Nurse not found' }, { status: 404 });
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
      return NextResponse.json({ success: false, error: 'Nurse ID is required' }, { status: 400 });
    }
    const deleted = await deleteNurse(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
