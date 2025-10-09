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
      .select('id, clinic_id, is_published')
      .eq('id', templateId)
      .single();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user is clinic admin
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', template.clinic_id)
      .eq('status', 'active')
      .single();

    if (!clinicMember || clinicMember.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!template.is_published) {
      return NextResponse.json({ error: 'Template is not published' }, { status: 400 });
    }

    // Unpublish the template
    const { error } = await supabase
      .from('form_templates')
      .update({ 
        is_published: false,
        published_at: null,
        published_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error unpublishing template:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
