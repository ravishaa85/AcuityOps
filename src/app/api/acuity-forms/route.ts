import { NextRequest, NextResponse } from 'next/server';
import { getAcuityTemplates, getActiveAcuityTemplate, saveAcuityTemplate } from '@/lib/db';

export async function GET() {
  try {
    const templates = await getAcuityTemplates();
    const active = await getActiveAcuityTemplate();
    return NextResponse.json({ success: true, data: { templates, active } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.fields) {
      return NextResponse.json({ success: false, error: 'Title and fields are required' }, { status: 400 });
    }
    const template = await saveAcuityTemplate({
      id: body.id || `tmpl-v${Date.now()}`,
      version: body.version || 1,
      title: body.title,
      fields: body.fields,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString()
    });
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
