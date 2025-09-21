import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// GET - Retrieve patient education materials
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const materialType = searchParams.get('material_type');
    const materialCategory = searchParams.get('material_category');
    const materialLanguage = searchParams.get('material_language');
    const targetAudience = searchParams.get('target_audience');
    const difficultyLevel = searchParams.get('difficulty_level');
    const approvalStatus = searchParams.get('approval_status');
    const materialStatus = searchParams.get('material_status');

    let query = supabase
      .from('patient_education_materials')
      .select(`
        *,
        creator:users!created_by (
          id,
          first_name,
          last_name
        ),
        reviewer:users!reviewed_by (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (materialType) {
      query = query.eq('material_type', materialType);
    }
    if (materialCategory) {
      query = query.eq('material_category', materialCategory);
    }
    if (materialLanguage) {
      query = query.eq('material_language', materialLanguage);
    }
    if (targetAudience) {
      query = query.eq('target_audience', targetAudience);
    }
    if (difficultyLevel) {
      query = query.eq('difficulty_level', difficultyLevel);
    }
    if (approvalStatus) {
      query = query.eq('approval_status', approvalStatus);
    }
    if (materialStatus) {
      query = query.eq('material_status', materialStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient education materials' }, { status: 500 });
  }
}

// POST - Create new patient education material
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const {
      material_title,
      material_type,
      material_category,
      material_subcategory,
      material_description,
      material_content,
      material_url,
      material_file_path,
      material_file_size,
      material_duration,
      material_language,
      material_version,
      material_status,
      accessibility_features,
      target_audience,
      difficulty_level,
      reading_level,
      estimated_completion_time,
      learning_objectives,
      key_points,
      prerequisites,
      related_materials,
      tags,
      keywords,
      created_by,
      reviewed_by,
      review_date,
      approval_status,
      approval_notes
    } = body;

    // Validate required fields
    if (!material_title || !material_type || !material_category || !material_description || !target_audience || !difficulty_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_education_materials')
      .insert({
        material_title,
        material_type,
        material_category,
        material_subcategory,
        material_description,
        material_content,
        material_url,
        material_file_path,
        material_file_size,
        material_duration,
        material_language: material_language || 'en',
        material_version: material_version || '1.0',
        material_status: material_status || 'active',
        accessibility_features,
        target_audience,
        difficulty_level,
        reading_level,
        estimated_completion_time,
        learning_objectives,
        key_points,
        prerequisites,
        related_materials,
        tags,
        keywords,
        created_by,
        reviewed_by,
        review_date,
        approval_status: approval_status || 'pending',
        approval_notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create patient education material' }, { status: 500 });
  }
}

// PUT - Update patient education material
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patient_education_materials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient education material' }, { status: 500 });
  }
}

// DELETE - Delete patient education material
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('patient_education_materials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Patient education material deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient education material' }, { status: 500 });
  }
}



