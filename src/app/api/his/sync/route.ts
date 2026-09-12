import { NextResponse } from 'next/server';
import { syncHisData } from '@/lib/his-api';
import { getHisSyncMetadata, getWards, getPatients } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body = { syncWards: true, syncPatients: true };
    try {
      const parsed = await request.json();
      if (parsed && typeof parsed === 'object') {
        body = {
          syncWards: parsed.syncWards !== undefined ? Boolean(parsed.syncWards) : true,
          syncPatients: parsed.syncPatients !== undefined ? Boolean(parsed.syncPatients) : true
        };
      }
    } catch {
      // Empty or non-JSON body: default to full sync
    }

    const result = await syncHisData(body);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('HIS Sync Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to synchronize with HIS' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const meta = await getHisSyncMetadata();
    const [wards, patients] = await Promise.all([getWards(), getPatients()]);

    const hisWardsCount = wards.filter(w => w.source === 'HIS').length;
    const hisPatientsCount = patients.filter(p => p.source === 'HIS').length;

    return NextResponse.json({
      success: true,
      data: {
        isConnected: true,
        lastSyncedAt: meta?.lastSyncedAt || null,
        totalWards: wards.length,
        hisWardsCount,
        totalPatients: patients.length,
        hisPatientsCount,
        totalBeds: meta?.totalBeds || wards.reduce((acc, w) => acc + (w.bedCapacity || 0), 0),
        endpoints: {
          inpatient: 'https://api.simshospitals.com/ERP_WEBSERVICES/InhouseWebservices.asmx?op=Proc_Inpatientdetails',
          bedward: 'https://api.simshospitals.com/ERP_WEBSERVICES/InhouseWebservices.asmx?op=Proc_Bedwardwise'
        }
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
