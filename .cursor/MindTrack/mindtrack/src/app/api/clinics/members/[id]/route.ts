import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

/**
 * DELETE /api/clinics/members/[id]
 * Remove a member from the clinic
 */
export async function DELETE(
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

    // Get user's clinic ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Verify the member exists and belongs to the same clinic
    const { data: existingMember, error: memberError } = await supabase
      .from('clinic_members')
      .select('id, user_id, clinic_id, role, status')
      .eq('id', memberId)
      .eq('clinic_id', userProfile.clinic_id)
      .single();

    if (memberError || !existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if user is trying to remove themselves
    if (existingMember.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from the clinic' }, { status: 400 });
    }

    // Check if user has permission to remove members
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

    // Only admins can remove members
    if (currentUserMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
    }

    // Prevent removing the last admin
    if (existingMember.role === 'admin') {
      const { data: adminCount, error: countError } = await supabase
        .from('clinic_members')
        .select('id', { count: 'exact' })
        .eq('clinic_id', userProfile.clinic_id)
        .eq('role', 'admin')
        .eq('status', 'active');

      if (countError) {
        console.error('Error counting admins:', countError);
        return NextResponse.json({ error: 'Failed to verify admin count' }, { status: 500 });
      }

      if (adminCount && adminCount.length <= 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the last admin. At least one admin must remain.' 
        }, { status: 400 });
      }
    }

    // Check if member has any active appointments or other dependencies
    const { data: activeAppointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', existingMember.user_id)
      .eq('status', 'scheduled')
      .limit(1);

    if (appointmentError) {
      console.error('Error checking appointments:', appointmentError);
      return NextResponse.json({ error: 'Failed to check member dependencies' }, { status: 500 });
    }

    if (activeAppointments && activeAppointments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot remove member with active appointments. Please reassign or cancel appointments first.' 
      }, { status: 400 });
    }

    // Check for other dependencies (notes, assessments, etc.)
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id')
      .eq('therapist_id', existingMember.user_id)
      .limit(1);

    if (notesError) {
      console.error('Error checking notes:', notesError);
      return NextResponse.json({ error: 'Failed to check member dependencies' }, { status: 500 });
    }

    if (notes && notes.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot remove member with existing notes. Please reassign notes first.' 
      }, { status: 400 });
    }

    // Remove the member from the clinic
    const { error: deleteError } = await supabase
      .from('clinic_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error removing clinic member:', deleteError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    // Log the removal for audit purposes
    console.log(`User ${user.id} removed member ${memberId} (${existingMember.user_id}) from clinic`);

    // If the removed user was only a member of this clinic, consider deactivating their account
    // This is optional and depends on your business logic
    const { data: otherClinics, error: clinicCheckError } = await supabase
      .from('clinic_members')
      .select('clinic_id')
      .eq('user_id', existingMember.user_id)
      .neq('clinic_id', userProfile.clinic_id);

    if (clinicCheckError) {
      console.error('Error checking other clinics:', clinicCheckError);
    } else if (!otherClinics || otherClinics.length === 0) {
      // User is not a member of any other clinic
      // You might want to deactivate their account or send them a notification
      console.log(`User ${existingMember.user_id} is no longer a member of any clinic`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
