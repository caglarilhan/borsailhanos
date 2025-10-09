import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const { data: documents, error } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error in patient documents API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `patient-documents/${id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('patient-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(filePath);

    // Save document record
    const { data: document, error: docError } = await supabase
      .from('patient_documents')
      .insert({
        patient_id: id,
        name: file.name,
        type: type || 'other',
        file_url: urlData.publicUrl,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending'
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document record:', docError);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error in patient document upload API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
