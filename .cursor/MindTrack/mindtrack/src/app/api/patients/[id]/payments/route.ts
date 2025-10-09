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

    const { data: payments, error } = await supabase
      .from('patient_payments')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error in patient payments API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
