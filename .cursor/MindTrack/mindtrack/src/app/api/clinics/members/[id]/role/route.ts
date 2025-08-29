import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

/**
 * PUT /api/clinics/members/[id]/role
 * Update a member's role in the clinic
 */
export async function PUT(
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

    // Get request body
    const { role } = await request.json();
    
    if (!role || !['admin', 'therapist', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
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
      .select('id, user_id, clinic_id, role')
      .eq('id', memberId)
      .eq('clinic_id', userProfile.clinic_id)
      .single();

    if (memberError || !existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if user is trying to change their own role
    if (existingMember.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    // Check if user has permission to change roles
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

    // Only admins can change roles
    if (currentUserMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can change member roles' }, { status: 403 });
    }

    // Prevent changing the last admin's role
    if (existingMember.role === 'admin' && role !== 'admin') {
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

    // Update the member's role
    const { data: updatedMember, error: updateError } = await supabase
      .from('clinic_members')
      .update({ 
        role,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating member role:', updateError);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    // Log the role change for audit purposes
    console.log(`User ${user.id} changed member ${memberId} role from ${existingMember.role} to ${role}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Role updated successfully',
      member: updatedMember
    });

  } catch (error) {
    console.error('Update member role API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
