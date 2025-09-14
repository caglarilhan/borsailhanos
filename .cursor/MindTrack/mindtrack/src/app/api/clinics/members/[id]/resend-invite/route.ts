import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { sendInvitationEmail } from '@/lib/email';

/**
 * POST /api/clinics/members/[id]/resend-invite
 * Resend invitation to a pending member
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberId = id;

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

    // Verify the member exists and belongs to the same clinic
    const { data: existingMember, error: memberError } = await supabase
      .from('clinic_members')
      .select(`
        id, 
        user_id, 
        clinic_id, 
        role, 
        status,
        invited_at,
        user_profiles!inner(
          email,
          full_name
        )
      `)
      .eq('id', memberId)
      .eq('clinic_id', userProfile.clinic_id)
      .single();

    if (memberError || !existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if member is in pending status
    if (existingMember.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Can only resend invitations to pending members' 
      }, { status: 400 });
    }

    // Check if user has permission to resend invitations
    const { data: currentUserMember, error: currentMemberError } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', userProfile.clinic_id)
      .eq('status', 'active')
      .single();

    if (currentMemberError || !currentUserMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only admins and therapists can resend invitations
    if (!['admin', 'therapist'].includes(currentUserMember.role)) {
      return NextResponse.json({ 
        error: 'Only admins and therapists can resend invitations' 
      }, { status: 403 });
    }

    // Check if enough time has passed since last invitation (rate limiting)
    const lastInviteTime = new Date(existingMember.invited_at);
    const now = new Date();
    const timeSinceLastInvite = now.getTime() - lastInviteTime.getTime();
    const minTimeBetweenInvites = 5 * 60 * 1000; // 5 minutes

    if (timeSinceLastInvite < minTimeBetweenInvites) {
      const remainingTime = Math.ceil((minTimeBetweenInvites - timeSinceLastInvite) / 1000 / 60);
      return NextResponse.json({ 
        error: `Please wait ${remainingTime} minutes before resending the invitation` 
      }, { status: 429 });
    }

    // Update the invitation timestamp
    const { error: updateError } = await supabase
      .from('clinic_members')
      .update({ 
        invited_at: now.toISOString(),
        invited_by: user.id
      })
      .eq('id', memberId);

    if (updateError) {
      console.error('Error updating invitation timestamp:', updateError);
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
    }

    // Send invitation email
    const memberEmail = existingMember.user_profiles?.email;
    const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/invitation?token=${existingMember.id}&email=${encodeURIComponent(memberEmail)}`;
    
    const emailResult = await sendInvitationEmail({
      email: memberEmail,
      clinicName: clinic.name,
      inviterName: userProfile.full_name || 'Clinic Administrator',
      role: existingMember.role,
      invitationLink
    });

    if (!emailResult.success) {
      console.error('Failed to resend invitation email:', emailResult.error);
      // Don't fail the request, just log the error
    }

    // Log the resend for audit purposes
    console.log(`User ${user.id} resent invitation to member ${memberId} (${existingMember.user_id})`);

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation resent successfully',
      member: {
        id: existingMember.id,
        user_id: existingMember.user_id,
        clinic_id: existingMember.clinic_id,
        role: existingMember.role,
        status: existingMember.status,
        invited_at: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Resend invite API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
