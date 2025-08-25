import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import { generateAINote, enhanceNoteWithAI } from '@/lib/ai-assistant';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'generate':
        const aiNote = await generateAINote(data);
        return NextResponse.json(aiNote);

      case 'transcribe':
        // For audio transcription, we'll need to handle file upload differently
        // This is a placeholder - in production you'd handle multipart form data
        return NextResponse.json({ error: 'Audio transcription not implemented yet' }, { status: 501 });

      case 'enhance':
        const enhancedNote = await enhanceNoteWithAI(data.note, data.clientContext);
        return NextResponse.json({ enhancedNote });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Notes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'AI Notes API endpoint' });
}
