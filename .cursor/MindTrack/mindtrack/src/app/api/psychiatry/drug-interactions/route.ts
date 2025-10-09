import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { medications } = body;

    if (!medications || !Array.isArray(medications)) {
      return NextResponse.json({ error: 'Medications array is required' }, { status: 400 });
    }

    // Check for drug interactions in the database
    const { data: interactions, error } = await supabase
      .from('drug_interactions')
      .select('*')
      .or(medications.map(med => 
        `medication1.in.(${medications.join(',')}),medication2.in.(${medications.join(',')})`
      ).join(','));

    if (error) {
      console.error('Error checking drug interactions:', error);
      return NextResponse.json({ error: 'Failed to check drug interactions' }, { status: 500 });
    }

    // Filter interactions to only include those between the provided medications
    const relevantInteractions = interactions?.filter(interaction => 
      medications.includes(interaction.medication1) && medications.includes(interaction.medication2)
    ) || [];

    return NextResponse.json({ interactions: relevantInteractions });
  } catch (error) {
    console.error('Error in drug interactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
