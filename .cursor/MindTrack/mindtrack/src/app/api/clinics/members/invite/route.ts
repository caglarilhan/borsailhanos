import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { sendInvitationEmail } from '@/lib/email';

/**
 * POST /api/clinics/members/invite
 * Invite a new member to the clinic
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const { email, role } = await request.json();
    
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    if (!['admin', 'therapist', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get user's clinic ID and clinic info
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id, full_name')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Get clinic information
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('name')
      .eq('id', userProfile.clinic_id)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic information not found' }, { status: 404 });
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user_profiles')
      .select('user_id, clinic_id')
      .eq('email', email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userCheckError);
      return NextResponse.json({ error: 'Failed to check existing user' }, { status: 500 });
    }

    let targetUserId: string;
    let isNewUser = false;

    if (existingUser) {
      // User exists, check if already a member of this clinic
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('clinic_members')
        .select('id, status')
        .eq('user_id', existingUser.user_id)
        .eq('clinic_id', userProfile.clinic_id)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        console.error('Error checking existing member:', memberCheckError);
        return NextResponse.json({ error: 'Failed to check existing member' }, { status: 500 });
      }

      if (existingMember) {
        if (existingMember.status === 'active') {
          return NextResponse.json({ error: 'User is already an active member of this clinic' }, { status: 400 });
        } else if (existingMember.status === 'pending') {
          return NextResponse.json({ error: 'User already has a pending invitation' }, { status: 400 });
        }
      }

      targetUserId = existingUser.user_id;
    } else {
      // Create new user account
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        password: generateTemporaryPassword(),
        email_confirm: true,
        user_metadata: { 
          invited_by: user.id,
          clinic_id: userProfile.clinic_id,
          role: role
        }
      });

      if (createUserError) {
        console.error('Error creating new user:', createUserError);
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }

      targetUserId = newUser.user.id;
      isNewUser = true;

      // Create user profile
      const { error: profileCreateError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: targetUserId,
          email,
          clinic_id: userProfile.clinic_id,
          full_name: email.split('@')[0], // Temporary name
          is_active: false
        });

      if (profileCreateError) {
        console.error('Error creating user profile:', profileCreateError);
        // Clean up created user
        await supabase.auth.admin.deleteUser(targetUserId);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }
    }

    // Add user to clinic members
    const { data: member, error: memberError } = await supabase
      .from('clinic_members')
      .insert({
        user_id: targetUserId,
        clinic_id: userProfile.clinic_id,
        role,
        status: 'pending',
        invited_by: user.id,
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error adding clinic member:', memberError);
      return NextResponse.json({ error: 'Failed to add clinic member' }, { status: 500 });
    }

    // Send invitation email
    const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/invitation?token=${member.id}&email=${encodeURIComponent(email)}`;
    
    const emailResult = await sendInvitationEmail({
      email,
      clinicName: clinic.name,
      inviterName: userProfile.full_name || 'Clinic Administrator',
      role,
      invitationLink
    });

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      member: {
        id: member.id,
        user_id: targetUserId,
        clinic_id: userProfile.clinic_id,
        role,
        status: 'pending',
        joined_at: member.invited_at
      }
    });

  } catch (error) {
    console.error('Member invitation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Generate a temporary password for new users
 * Users will be prompted to change this on first login
 */
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
