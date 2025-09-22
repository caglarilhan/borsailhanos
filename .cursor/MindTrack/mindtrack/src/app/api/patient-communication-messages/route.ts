import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient communication messages
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const templateId = searchParams.get('template_id');
    const messageType = searchParams.get('message_type');
    const messageCategory = searchParams.get('message_category');
    const deliveryStatus = searchParams.get('delivery_status');
    const priorityLevel = searchParams.get('priority_level');
    const daysBack = searchParams.get('days_back');

    let query = supabase
      .from('patient_communication_messages')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        communication_message_templates (
          id,
          template_name,
          template_category,
          template_type
        ),
        sender:users!sender_id (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (templateId) {
      query = query.eq('template_id', templateId);
    }
    if (messageType) {
      query = query.eq('message_type', messageType);
    }
    if (messageCategory) {
      query = query.eq('message_category', messageCategory);
    }
    if (deliveryStatus) {
      query = query.eq('delivery_status', deliveryStatus);
    }
    if (priorityLevel) {
      query = query.eq('priority_level', priorityLevel);
    }
    if (daysBack) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(daysBack));
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient communication messages' }, { status: 500 });
  }
}

// POST - Send patient communication message
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      template_id,
      message_type,
      message_category,
      message_subcategory,
      subject_line,
      message_content,
      message_content_html,
      recipient_email,
      recipient_phone,
      recipient_address,
      sender_id,
      scheduled_send_time,
      priority_level,
      confidentiality_level,
      response_required,
      retention_period
    } = body;

    // Validate required fields
    if (!patient_id || !message_type || !message_category || !message_content || !sender_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the database function to send communication
    const { data: sendResult, error: sendError } = await supabase.rpc(
      'send_patient_communication',
      {
        p_patient_id: patient_id,
        p_template_id: template_id,
        p_message_type: message_type,
        p_message_category: message_category,
        p_message_subcategory: message_subcategory,
        p_subject_line: subject_line,
        p_message_content: message_content,
        p_sender_id: sender_id,
        p_scheduled_send_time: scheduled_send_time,
        p_priority_level: priority_level || 'normal',
        p_confidentiality_level: confidentiality_level || 'standard'
      }
    );

    if (sendError) throw sendError;

    if (sendResult && sendResult.length > 0) {
      const result = sendResult[0];
      
      // Update the message with additional details
      const { data: updatedMessage, error: updateError } = await supabase
        .from('patient_communication_messages')
        .update({
          message_content_html,
          recipient_email,
          recipient_phone,
          recipient_address,
          response_required: response_required || false,
          retention_period: retention_period || 7,
          auto_delete_date: retention_period ? 
            new Date(Date.now() + retention_period * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', result.message_id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({
        message_id: result.message_id,
        delivery_status: result.delivery_status,
        scheduled_time: result.scheduled_time,
        message: updatedMessage
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Failed to send patient communication message' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send patient communication message' }, { status: 500 });
  }
}

// PUT - Update patient communication message
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_communication_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient communication message' }, { status: 500 });
  }
}

// DELETE - Delete patient communication message
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_communication_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient communication message deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient communication message' }, { status: 500 });
  }
}




