import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import type { CreateClinicRequest } from '@/types/clinic';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get user's clinic
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get clinic details
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', (
        await supabase
          .from('clinic_members')
          .select('clinic_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()
      ).data?.clinic_id)
      .single();

    if (clinicError) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('Clinic API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateClinicRequest = await request.json();
    
    // Create clinic with US healthcare defaults
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description,
        primary_color: body.primary_color || '#3B82F6',
        secondary_color: body.secondary_color || '#1F2937',
        website_url: body.website_url,
        phone: body.phone,
        email: body.email,
        address: body.address,
        timezone: body.timezone || 'UTC',
        currency: body.currency || 'USD',
        // US Healthcare System fields
        npi: body.npi,
        ein: body.ein,
        taxonomy_code: body.taxonomy_code,
        facility_npi: body.facility_npi,
        license_number: body.license_number,
        license_state: body.license_state,
        license_expiry: body.license_expiry,
        default_pos_code: body.default_pos_code || '02',
        default_telehealth_modifier: body.default_telehealth_modifier || '95',
        default_cpt_codes: body.default_cpt_codes || ['90834', '90837'],
        default_icd_codes: body.default_icd_codes || ['F32.9', 'F41.9'],
        hipaa_notice_consent: body.hipaa_notice_consent || false,
        tpo_consent: body.tpo_consent || false,
        telehealth_consent: body.telehealth_consent || false,
        sms_consent: body.sms_consent || false,
        email_consent: body.email_consent || false
      })
      .select()
      .single();

    if (clinicError) {
      return NextResponse.json({ error: 'Failed to create clinic' }, { status: 400 });
    }

    // Add user as admin
    const { error: memberError } = await supabase
      .from('clinic_members')
      .insert({
        clinic_id: clinic.id,
        user_id: user.id,
        role: 'admin',
        status: 'active'
      });

    if (memberError) {
      return NextResponse.json({ error: 'Failed to add user to clinic' }, { status: 400 });
    }

    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    console.error('Create clinic error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID
    const { data: memberData, error: memberError } = await supabase
      .from('clinic_members')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Only admins can update clinic settings
    if (memberData.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: Partial<CreateClinicRequest> = await request.json();
    
    // Update clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .update({
        name: body.name,
        description: body.description,
        primary_color: body.primary_color,
        secondary_color: body.secondary_color,
        website_url: body.website_url,
        phone: body.phone,
        email: body.email,
        address: body.address,
        timezone: body.timezone,
        currency: body.currency,
        // US Healthcare System fields
        npi: body.npi,
        ein: body.ein,
        taxonomy_code: body.taxonomy_code,
        facility_npi: body.facility_npi,
        license_number: body.license_number,
        license_state: body.license_state,
        license_expiry: body.license_expiry,
        default_pos_code: body.default_pos_code,
        default_telehealth_modifier: body.default_telehealth_modifier,
        default_cpt_codes: body.default_cpt_codes,
        default_icd_codes: body.default_icd_codes,
        hipaa_notice_consent: body.hipaa_notice_consent,
        tpo_consent: body.tpo_consent,
        telehealth_consent: body.telehealth_consent,
        sms_consent: body.sms_consent,
        email_consent: body.email_consent,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberData.clinic_id)
      .select()
      .single();

    if (clinicError) {
      return NextResponse.json({ error: 'Failed to update clinic' }, { status: 400 });
    }

    return NextResponse.json(clinic);
  } catch (error) {
    console.error('Update clinic error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
