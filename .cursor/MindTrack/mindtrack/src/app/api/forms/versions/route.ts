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
    const formTemplateId = searchParams.get('form_template_id');

    if (!formTemplateId) {
      return NextResponse.json({ error: 'Form template ID is required' }, { status: 400 });
    }

    // Verify user has access to the template
    const { data: template } = await supabase
      .from('form_templates')
      .select('id, clinic_id')
      .eq('id', formTemplateId)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

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

    // Get versions
    const { data: versions, error } = await supabase
      .from('form_template_versions')
      .select(`
        *,
        user_profiles!form_template_versions_published_by_fkey(name)
      `)
      .eq('form_template_id', formTemplateId)
      .order('version', { ascending: false });

    if (error) throw error;

    // Transform the data
    const transformedVersions = versions?.map(version => ({
      id: version.id,
      formTemplateId: version.form_template_id,
      version: version.version,
      schema: version.schema,
      isPublished: version.is_published,
      publishedAt: version.published_at,
      publishedBy: version.user_profiles?.name || 'Unknown',
      changeLog: version.change_log,
      createdAt: version.created_at
    })) || [];

    return NextResponse.json({ success: true, versions: transformedVersions });
  } catch (e: any) {
    console.error('Error fetching versions:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { formTemplateId, schema, changeLog } = await request.json();

    if (!formTemplateId || !schema || !changeLog) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to the template
    const { data: template } = await supabase
      .from('form_templates')
      .select('id, clinic_id, version')
      .eq('id', formTemplateId)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

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

    // Create new version
    const newVersion = template.version + 1;
    const { data: version, error } = await supabase
      .from('form_template_versions')
      .insert({
        form_template_id: formTemplateId,
        version: newVersion,
        schema,
        is_published: false,
        change_log: changeLog,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Update template version
    await supabase
      .from('form_templates')
      .update({ 
        version: newVersion,
        schema,
        updated_at: new Date().toISOString()
      })
      .eq('id', formTemplateId);

    return NextResponse.json({ success: true, version });
  } catch (e: any) {
    console.error('Error creating version:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
