import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient communication preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const preferredLanguage = searchParams.get('preferred_language');
    const preferredMethod = searchParams.get('preferred_method');

    let query = supabase
      .from('patient_communication_preferences')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    if (preferredLanguage) {
      query = query.eq('preferred_language', preferredLanguage);
    }
    if (preferredMethod) {
      query = query.eq('preferred_communication_method', preferredMethod);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient communication preferences' }, { status: 500 });
  }
}

// POST - Create or update patient communication preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      patient_id,
      preferred_language,
      preferred_communication_method,
      preferred_contact_time,
      preferred_contact_days,
      emergency_contact_method,
      emergency_contact_number,
      appointment_reminders,
      appointment_reminder_method,
      appointment_reminder_timing,
      medication_reminders,
      medication_reminder_method,
      medication_reminder_timing,
      lab_result_notifications,
      lab_result_method,
      prescription_ready_notifications,
      prescription_ready_method,
      billing_notifications,
      billing_notification_method,
      marketing_communications,
      marketing_communication_method,
      accessibility_needs,
      communication_barriers,
      special_instructions,
      opt_out_date,
      opt_out_reason
    } = body;

    // Validate required fields
    if (!patient_id || !preferred_language || !preferred_communication_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if preferences already exist for this patient
    const { data: existingPreferences } = await supabase
      .from('patient_communication_preferences')
      .select('id')
      .eq('patient_id', patient_id)
      .single();

    let data, error;

    if (existingPreferences) {
      // Update existing preferences
      const { data: updatedData, error: updateError } = await supabase
        .from('patient_communication_preferences')
        .update({
          preferred_language,
          preferred_communication_method,
          preferred_contact_time,
          preferred_contact_days,
          emergency_contact_method,
          emergency_contact_number,
          appointment_reminders: appointment_reminders !== undefined ? appointment_reminders : true,
          appointment_reminder_method,
          appointment_reminder_timing: appointment_reminder_timing || 24,
          medication_reminders: medication_reminders !== undefined ? medication_reminders : true,
          medication_reminder_method,
          medication_reminder_timing: medication_reminder_timing || 1,
          lab_result_notifications: lab_result_notifications !== undefined ? lab_result_notifications : true,
          lab_result_method,
          prescription_ready_notifications: prescription_ready_notifications !== undefined ? prescription_ready_notifications : true,
          prescription_ready_method,
          billing_notifications: billing_notifications !== undefined ? billing_notifications : true,
          billing_notification_method,
          marketing_communications: marketing_communications !== undefined ? marketing_communications : false,
          marketing_communication_method,
          accessibility_needs,
          communication_barriers,
          special_instructions,
          opt_out_date,
          opt_out_reason
        })
        .eq('id', existingPreferences.id)
        .select()
        .single();

      data = updatedData;
      error = updateError;
    } else {
      // Create new preferences
      const { data: newData, error: insertError } = await supabase
        .from('patient_communication_preferences')
        .insert({
          patient_id,
          preferred_language,
          preferred_communication_method,
          preferred_contact_time,
          preferred_contact_days,
          emergency_contact_method,
          emergency_contact_number,
          appointment_reminders: appointment_reminders !== undefined ? appointment_reminders : true,
          appointment_reminder_method,
          appointment_reminder_timing: appointment_reminder_timing || 24,
          medication_reminders: medication_reminders !== undefined ? medication_reminders : true,
          medication_reminder_method,
          medication_reminder_timing: medication_reminder_timing || 1,
          lab_result_notifications: lab_result_notifications !== undefined ? lab_result_notifications : true,
          lab_result_method,
          prescription_ready_notifications: prescription_ready_notifications !== undefined ? prescription_ready_notifications : true,
          prescription_ready_method,
          billing_notifications: billing_notifications !== undefined ? billing_notifications : true,
          billing_notification_method,
          marketing_communications: marketing_communications !== undefined ? marketing_communications : false,
          marketing_communication_method,
          accessibility_needs,
          communication_barriers,
          special_instructions,
          opt_out_date,
          opt_out_reason
        })
        .select()
        .single();

      data = newData;
      error = insertError;
    }

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create/update patient communication preferences' }, { status: 500 });
  }
}

// PUT - Update patient communication preferences
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Preferences ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_communication_preferences')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient communication preferences' }, { status: 500 });
  }
}

// DELETE - Delete patient communication preferences
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Preferences ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_communication_preferences')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient communication preferences deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient communication preferences' }, { status: 500 });
  }
}




