import { NextRequest, NextResponse } from 'next/server';
import { getWards, createWard, updateWard, deleteWard } from '@/lib/db';

export async function GET() {
  try {
    const wards = await getWards();
    return NextResponse.json({ success: true, data: wards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.code || !body.name) {
      return NextResponse.json({ success: false, error: 'Code and Name are required' }, { status: 400 });
    }
    const newWard = await createWard(body);
    return NextResponse.json({ success: true, data: newWard }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Ward ID is required' }, { status: 400 });
    }
    const updated = await updateWard(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Ward not found' }, { status: 404 });
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
      return NextResponse.json({ success: false, error: 'Ward ID is required' }, { status: 400 });
    }
    const deleted = await deleteWard(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
