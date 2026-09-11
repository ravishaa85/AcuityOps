import { NextRequest, NextResponse } from 'next/server';
import { getDutyRosters, updateDutyRosterItem, setDutyRoster } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || '2024-10-10';
    const wardId = searchParams.get('wardId') || undefined;
    const items = await getDutyRosters(date, wardId);
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nurseId, wardId, date, shiftType } = body;
    if (!nurseId || !wardId || !shiftType) {
      return NextResponse.json({ success: false, error: 'nurseId, wardId, and shiftType are required' }, { status: 400 });
    }
    const item = await setDutyRoster(nurseId, wardId, date || '2024-10-10', shiftType);
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, shiftType } = body;
    if (!id || !shiftType) {
      return NextResponse.json({ success: false, error: 'id and shiftType are required' }, { status: 400 });
    }
    const updated = await updateDutyRosterItem(id, shiftType);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
