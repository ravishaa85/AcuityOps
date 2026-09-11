import { NextRequest, NextResponse } from 'next/server';
import { getHospitalSummaryMetrics, setDutyRoster, getNurses, getWards } from '@/lib/db';
import { generateStaffOptimizationAnalysis } from '@/lib/ai-rebalancing';

export async function GET() {
  try {
    const metrics = await getHospitalSummaryMetrics();
    const analysis = generateStaffOptimizationAnalysis(metrics);
    return NextResponse.json({
      success: true,
      data: {
        metrics,
        analysis
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Apply rebalancing moves to the duty roster
export async function POST(req: NextRequest) {
  try {
    const metrics = await getHospitalSummaryMetrics();
    const analysis = generateStaffOptimizationAnalysis(metrics);
    const nurses = await getNurses();
    const wards = await getWards();

    const appliedMoves: string[] = [];

    for (const rec of analysis.recommendations) {
      const donorWard = wards.find(w => w.code === rec.donorWardCode);
      const targetWard = wards.find(w => w.code === rec.targetWardCode);

      if (donorWard && targetWard) {
        // Find a donor nurse matching the competency
        const candidate = nurses.find(n => n.wardId === donorWard.id && n.competency === rec.competency && n.status === 'Active');
        if (candidate) {
          // Temporarily transfer assignment for today
          await setDutyRoster(candidate.id, targetWard.id, '2024-10-10', 'Morning');
          appliedMoves.push(`Transferred ${candidate.name} (${candidate.competency}) from ${rec.donorWardCode} to ${rec.targetWardCode}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Rebalancing recommendations successfully applied to today\'s duty roster.',
        appliedMoves
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
