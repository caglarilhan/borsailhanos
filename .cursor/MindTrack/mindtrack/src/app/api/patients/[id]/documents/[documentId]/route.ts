import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, documentId } = params;

    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('id', documentId)
      .eq('patient_id', id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('patient-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('patient_documents')
      .delete()
      .eq('id', documentId)
      .eq('patient_id', id);

    if (deleteError) {
      console.error('Error deleting document record:', deleteError);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in document deletion API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
