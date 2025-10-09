import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, newName } = await request.json();

    if (!templateId || !newName) {
      return NextResponse.json({ error: 'Template ID and new name are required' }, { status: 400 });
    }

    // Get the original template
    const { data: originalTemplate } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!originalTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Verify user has access to the template
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', originalTemplate.clinic_id)
      .eq('status', 'active')
      .single();

    if (!clinicMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create the duplicate template
    const { data: newTemplate, error } = await supabase
      .from('form_templates')
      .insert({
        clinic_id: originalTemplate.clinic_id,
        name: newName,
        description: originalTemplate.description,
        schema: originalTemplate.schema,
        version: 1,
        is_published: false,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (e: any) {
    console.error('Error duplicating template:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
