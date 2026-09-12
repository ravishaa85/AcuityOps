import { NextRequest, NextResponse } from 'next/server';
import { getAcuityAssessments, createAcuityAssessment } from '@/lib/db';
import { interpretAcuityScore } from '@/lib/acuity-tool';

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

    // Determine category and N:P ratio per SIMS Patient Acuity Tool:
    // 1-12 -> Acuity 1 (1:6)
    // 13-24 -> Acuity II (1:5)
    // 25-48 -> Acuity III (1:4)
    const tierInfo = interpretAcuityScore(body.score);
    const category = tierInfo.tier;

    const assessment = await createAcuityAssessment({
      patientId: body.patientId,
      wardId: body.wardId,
      evaluatedBy: body.evaluatedBy || 'Staff Nurse (SIMS Clinical Assessor)',
      shiftDate: body.shiftDate || new Date().toISOString().split('T')[0],
      shiftType: body.shiftType || 'Morning',
      score: body.score,
      category,
      npRatio: tierInfo.npRatio,
      responses: body.responses || {},
      notes: body.notes || ''
    });

    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
