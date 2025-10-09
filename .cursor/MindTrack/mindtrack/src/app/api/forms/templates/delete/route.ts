import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Verify user has access to the template
    const { data: template } = await supabase
      .from('form_templates')
      .select('id, clinic_id, created_by')
      .eq('id', templateId)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user is clinic admin or template creator
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

    const canDelete = clinicMember.role === 'admin' || template.created_by === user.id;
    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if template has submissions
    const { data: submissions } = await supabase
      .from('form_submissions')
      .select('id')
      .eq('form_template_id', templateId)
      .limit(1);

    if (submissions && submissions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete template with existing submissions. Archive instead.' 
      }, { status: 400 });
    }

    // Delete the template
    const { error } = await supabase
      .from('form_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error deleting template:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
