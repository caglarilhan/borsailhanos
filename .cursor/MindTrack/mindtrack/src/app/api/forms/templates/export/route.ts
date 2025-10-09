import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template_id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get the template
    const { data: template } = await supabase
      .from('form_templates')
      .select(`
        *,
        clinics(name)
      `)
      .eq('id', templateId)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Verify user has access to the template
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', template.clinic_id)
      .eq('status', 'active')
      .single();

    if (!clinicMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare export data
    const exportData = {
      name: template.name,
      description: template.description,
      schema: template.schema,
      version: template.version,
      clinic: template.clinics?.name,
      exported_at: new Date().toISOString(),
      exported_by: user.id
    };

    // Return as JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${template.name}.json"`
      }
    });
  } catch (e: any) {
    console.error('Error exporting template:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
