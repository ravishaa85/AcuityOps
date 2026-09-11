import { NextRequest, NextResponse } from 'next/server';
import { getAcuityAssessments, createAcuityAssessment } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') || undefined;
    const assessments = await getAcuityAssessments(patientId);
    return NextResponse.json({ success: true, data: assessments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.wardId || body.score === undefined) {
      return NextResponse.json({ success: false, error: 'Patient, ward, and score are required' }, { status: 400 });
    }

    // Determine category from score:
    // 0-4 -> 1, 5-9 -> 2, 10-14 -> 3, 15+ -> 4
    let category: 1 | 2 | 3 | 4 = 1;
    if (body.score >= 15) category = 4;
    else if (body.score >= 10) category = 3;
    else if (body.score >= 5) category = 2;
    else category = 1;

    const assessment = await createAcuityAssessment({
      patientId: body.patientId,
      wardId: body.wardId,
      evaluatedBy: body.evaluatedBy || 'Charge Nurse',
      shiftDate: body.shiftDate || new Date().toISOString().split('T')[0],
      shiftType: body.shiftType || 'Morning',
      score: body.score,
      category,
      responses: body.responses || {},
      notes: body.notes || ''
    });

    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
