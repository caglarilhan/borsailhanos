/**
 * Permission Management API - Role-based permission CRUD operations
 * 
 * Bu API ne işe yarar:
 * - Permission'ları fetch etme
 * - Role-based permission updates
 * - Custom permission set management
 * - Permission validation ve security
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

// Permission interface'leri - Bu type'lar permission data structure'ını tanımlar
interface Permission {
  id: string;
  role: string;           // Hangi role (admin, therapist, assistant)
  resource: string;       // Hangi kaynak (clients, appointments, notes, etc.)
  action: string;         // Hangi işlem (create, read, update, delete, manage)
  granted: boolean;       // Permission verildi mi?
  description: string;    // Permission açıklaması
  created_at: string;     // Oluşturulma tarihi
}

interface UpdatePermissionsRequest {
  role: string;
  permissions: Omit<Permission, 'id' | 'created_at'>[];
}

/**
 * GET /api/clinics/permissions
 * Fetch all permissions for the current user's clinic
 * Bu endpoint ne işe yarar:
 * - Clinic'teki tüm permission'ları getirir
 * - Role-based grouping yapar
 * - Security validation yapar
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Get current user - Mevcut kullanıcıyı al
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID - Kullanıcının clinic ID'sini al
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Check if user has permission to view permissions - Permission görme yetkisi kontrol et
    const { data: currentUserMember, error: memberError } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', userProfile.clinic_id)
      .eq('status', 'active')
      .single();

    if (memberError || !currentUserMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only admins can view permissions - Sadece admin'ler permission'ları görebilir
    if (currentUserMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can view permissions' }, { status: 403 });
    }

    // Fetch all permissions - Tüm permission'ları getir
    const { data: permissions, error: permissionsError } = await supabase
      .from('member_permissions')
      .select('*')
      .order('role', { ascending: true })
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }

    // Group permissions by role - Permission'ları role'a göre grupla
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.role]) {
        acc[permission.role] = [];
      }
      acc[permission.role].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return NextResponse.json({
      success: true,
      permissions: groupedPermissions,
      totalPermissions: permissions.length,
      roles: Object.keys(groupedPermissions)
    });

  } catch (error) {
    console.error('Permissions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/clinics/permissions
 * Update permissions for a specific role
 * Bu endpoint ne işe yarar:
 * - Role permission'larını günceller
 * - Security validation yapar
 * - Audit logging yapar
 * - Permission consistency kontrol eder
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Get current user - Mevcut kullanıcıyı al
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body - Request body'yi al
    const { role, permissions }: UpdatePermissionsRequest = await request.json();
    
    if (!role || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Validate role - Role'u validate et
    if (!['admin', 'therapist', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get user's clinic ID - Kullanıcının clinic ID'sini al
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Check if user has permission to update permissions - Permission güncelleme yetkisi kontrol et
    const { data: currentUserMember, error: memberError } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', userProfile.clinic_id)
      .eq('status', 'active')
      .single();

    if (memberError || !currentUserMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only admins can update permissions - Sadece admin'ler permission'ları güncelleyebilir
    if (currentUserMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update permissions' }, { status: 403 });
    }

    // Prevent updating admin permissions if it would remove all admin access - Admin access'i tamamen kaldırmayı engelle
    if (role === 'admin') {
      const adminPermissions = permissions.filter(p => p.granted);
      const criticalPermissions = ['clinic', 'manage'];
      const hasCriticalAccess = criticalPermissions.some(perm => 
        adminPermissions.some(p => p.resource === 'clinic' && p.action === 'manage')
      );

      if (!hasCriticalAccess) {
        return NextResponse.json({ 
          error: 'Admin role must maintain clinic management access' 
        }, { status: 400 });
      }
    }

    // Validate permissions structure - Permission structure'ını validate et
    const validResources = ['clients', 'appointments', 'notes', 'billing', 'clinic', 'assessments'];
    const validActions = ['create', 'read', 'update', 'delete', 'manage'];

    for (const permission of permissions) {
      if (!validResources.includes(permission.resource)) {
        return NextResponse.json({ 
          error: `Invalid resource: ${permission.resource}` 
        }, { status: 400 });
      }
      if (!validActions.includes(permission.action)) {
        return NextResponse.json({ 
          error: `Invalid action: ${permission.action}` 
        }, { status: 400 });
      }
    }

    // Begin transaction - Transaction başlat
    const { data: existingPermissions, error: fetchError } = await supabase
      .from('member_permissions')
      .select('*')
      .eq('role', role);

    if (fetchError) {
      console.error('Error fetching existing permissions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch existing permissions' }, { status: 500 });
    }

    // Update permissions - Permission'ları güncelle
    const updates = [];
    const inserts = [];

    for (const permission of permissions) {
      const existing = existingPermissions.find(ep => 
        ep.resource === permission.resource && ep.action === permission.action
      );

      if (existing) {
        // Update existing permission - Mevcut permission'ı güncelle
        updates.push(
          supabase
            .from('member_permissions')
            .update({ 
              granted: permission.granted,
              description: permission.description
            })
            .eq('id', existing.id)
        );
      } else {
        // Insert new permission - Yeni permission ekle
        inserts.push(
          supabase
            .from('member_permissions')
            .insert({
              role: permission.role,
              resource: permission.resource,
              action: permission.action,
              granted: permission.granted,
              description: permission.description
            })
        );
      }
    }

    // Execute updates - Update'leri çalıştır
    if (updates.length > 0) {
      const updateResults = await Promise.all(updates);
      for (const result of updateResults) {
        if (result.error) {
          console.error('Error updating permission:', result.error);
          return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
        }
      }
    }

    // Execute inserts - Insert'leri çalıştır
    if (inserts.length > 0) {
      const insertResults = await Promise.all(inserts);
      for (const result of insertResults) {
        if (result.error) {
          console.error('Error inserting permission:', result.error);
          return NextResponse.json({ error: 'Failed to insert permissions' }, { status: 500 });
        }
      }
    }

    // Log the permission update - Permission güncellemesini logla
    console.log(`User ${user.id} updated permissions for role: ${role}`);

    // Fetch updated permissions - Güncellenmiş permission'ları getir
    const { data: updatedPermissions, error: finalFetchError } = await supabase
      .from('member_permissions')
      .select('*')
      .eq('role', role)
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (finalFetchError) {
      console.error('Error fetching updated permissions:', finalFetchError);
      return NextResponse.json({ error: 'Failed to fetch updated permissions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Permissions updated successfully',
      role,
      permissions: updatedPermissions,
      updatedCount: updates.length,
      insertedCount: inserts.length
    });

  } catch (error) {
    console.error('Update permissions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/clinics/permissions
 * Create custom permission set
 * Bu endpoint ne işe yarar:
 * - Custom permission set oluşturur
 * - Permission validation yapar
 * - Security checks yapar
 * - Audit logging yapar
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Get current user - Mevcut kullanıcıyı al
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body - Request body'yi al
    const { name, description, permissions } = await request.json();
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
    }

    // Get user's clinic ID - Kullanıcının clinic ID'sini al
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !userProfile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Check if user has permission to create custom permission sets - Custom permission set oluşturma yetkisi kontrol et
    const { data: currentUserMember, error: memberError } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', userProfile.clinic_id)
      .eq('status', 'active')
      .single();

    if (memberError || !currentUserMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only admins can create custom permission sets - Sadece admin'ler custom permission set oluşturabilir
    if (currentUserMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create custom permission sets' }, { status: 403 });
    }

    // Validate permissions - Permission'ları validate et
    const validResources = ['clients', 'appointments', 'notes', 'billing', 'clinic', 'assessments'];
    const validActions = ['create', 'read', 'update', 'delete', 'manage'];

    for (const permission of permissions) {
      if (!validResources.includes(permission.resource)) {
        return NextResponse.json({ 
          error: `Invalid resource: ${permission.resource}` 
        }, { status: 400 });
      }
      if (!validActions.includes(permission.action)) {
        return NextResponse.json({ 
          error: `Invalid action: ${permission.action}` 
        }, { status: 400 });
      }
    }

    // Create custom permission set - Custom permission set oluştur
    const { data: customSet, error: createError } = await supabase
      .from('custom_permission_sets')
      .insert({
        name: name.trim(),
        description: description?.trim() || '',
        permissions: permissions,
        created_by: user.id,
        clinic_id: userProfile.clinic_id
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating custom permission set:', createError);
      return NextResponse.json({ error: 'Failed to create custom permission set' }, { status: 500 });
    }

    // Log the creation - Oluşturmayı logla
    console.log(`User ${user.id} created custom permission set: ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Custom permission set created successfully',
      customSet
    });

  } catch (error) {
    console.error('Create custom permission set API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
