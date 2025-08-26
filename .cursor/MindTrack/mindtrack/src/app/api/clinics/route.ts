import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import type { CreateClinicRequest } from '@/types/clinic';

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    
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
    const supabase = createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateClinicRequest = await request.json();
    
    // Create clinic
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
        currency: body.currency || 'USD'
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
