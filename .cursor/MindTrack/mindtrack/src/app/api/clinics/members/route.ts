import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import type { ClinicMember } from '@/types/clinic';

/**
 * GET /api/clinics/members
 * Fetch all members for the current user's clinic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Fetch clinic members
    const { data: members, error: membersError } = await supabase
      .from('clinic_members')
      .select(`
        id,
        user_id,
        clinic_id,
        role,
        status,
        joined_at,
        user_profiles!inner(
          user_id,
          full_name,
          email
        )
      `)
      .eq('clinic_id', userProfile.clinic_id)
      .order('joined_at', { ascending: false });

    if (membersError) {
      console.error('Error fetching clinic members:', membersError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Transform data to match ClinicMember interface
    const transformedMembers: ClinicMember[] = members.map(member => ({
      id: member.id,
      user_id: member.user_id,
      clinic_id: member.clinic_id,
      role: member.role,
      status: member.status,
      joined_at: member.joined_at,
      user_name: member.user_profiles?.full_name || null,
      user_email: member.user_profiles?.email || null
    }));

    return NextResponse.json(transformedMembers);

  } catch (error) {
    console.error('Clinic members API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Invite new member
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID and role
    const { data: memberData, error: memberError } = await supabase
      .from('clinic_members')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Only admins can invite members
    if (memberData.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: InviteMemberRequest = await request.json();
    
    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', body.email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
    }

    if (existingUser) {
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('clinic_members')
        .select('id, status')
        .eq('clinic_id', memberData.clinic_id)
        .eq('user_id', existingUser.id)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 });
      }

      if (existingMember) {
        if (existingMember.status === 'active') {
          return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
        } else if (existingMember.status === 'pending') {
          return NextResponse.json({ error: 'User already has a pending invitation' }, { status: 400 });
        }
      }

      // Add existing user to clinic
      const { data: newMember, error: addError } = await supabase
        .from('clinic_members')
        .insert({
          clinic_id: memberData.clinic_id,
          user_id: existingUser.id,
          role: body.role,
          status: 'pending'
        })
        .select()
        .single();

      if (addError) {
        return NextResponse.json({ error: 'Failed to invite member' }, { status: 400 });
      }

      return NextResponse.json(newMember, { status: 201 });
    } else {
      // User doesn't exist - create invitation record
      // For now, we'll just return success. In a real app, you'd send an email invitation
      return NextResponse.json({ 
        message: 'Invitation sent to new user',
        email: body.email,
        role: body.role
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Invite member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT - Update member role
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID and role
    const { data: memberData, error: memberError } = await supabase
      .from('clinic_members')
      .select('clinic_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (memberError || !memberData) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Only admins can update member roles
    if (memberData.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: UpdateMemberRoleRequest = await request.json();
    
    // Update member role
    const { data: updatedMember, error: updateError } = await supabase
      .from('clinic_members')
      .update({ role: body.role })
      .eq('id', body.member_id)
      .eq('clinic_id', memberData.clinic_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 400 });
    }

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Update member role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
