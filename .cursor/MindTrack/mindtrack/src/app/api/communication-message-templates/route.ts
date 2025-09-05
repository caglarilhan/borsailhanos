import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve communication message templates
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const templateCategory = searchParams.get('template_category');
    const templateType = searchParams.get('template_type');
    const templateLanguage = searchParams.get('template_language');
    const templateStatus = searchParams.get('template_status');
    const approvalStatus = searchParams.get('approval_status');

    let query = supabase
      .from('communication_message_templates')
      .select(`
        *,
        creator:users!created_by (
          id,
          first_name,
          last_name
        ),
        approver:users!approved_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (templateCategory) {
      query = query.eq('template_category', templateCategory);
    }
    if (templateType) {
      query = query.eq('template_type', templateType);
    }
    if (templateLanguage) {
      query = query.eq('template_language', templateLanguage);
    }
    if (templateStatus) {
      query = query.eq('template_status', templateStatus);
    }
    if (approvalStatus) {
      query = query.eq('approval_status', approvalStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch communication message templates' }, { status: 500 });
  }
}

// POST - Create new communication message template
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      template_name,
      template_category,
      template_subcategory,
      template_type,
      template_language,
      subject_line,
      message_content,
      message_content_html,
      message_content_sms,
      message_content_audio,
      personalization_fields,
      required_fields,
      optional_fields,
      template_variables,
      template_status,
      approval_status,
      approval_notes,
      created_by,
      approved_by,
      approval_date
    } = body;

    // Validate required fields
    if (!template_name || !template_category || !template_type || !message_content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('communication_message_templates')
      .insert({
        template_name,
        template_category,
        template_subcategory,
        template_type,
        template_language: template_language || 'en',
        subject_line,
        message_content,
        message_content_html,
        message_content_sms,
        message_content_audio,
        personalization_fields,
        required_fields,
        optional_fields,
        template_variables,
        template_status: template_status || 'active',
        approval_status: approval_status || 'pending',
        approval_notes,
        created_by,
        approved_by,
        approval_date
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create communication message template' }, { status: 500 });
  }
}

// PUT - Update communication message template
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('communication_message_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update communication message template' }, { status: 500 });
  }
}

// DELETE - Delete communication message template
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('communication_message_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Communication message template deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete communication message template' }, { status: 500 });
  }
}
