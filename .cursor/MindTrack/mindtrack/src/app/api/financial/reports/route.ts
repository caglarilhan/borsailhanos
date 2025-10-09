import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const range = searchParams.get('range') || '30';

    // Get user's clinic
    const { data: clinicMember } = await supabase
      .from('clinic_members')
      .select('clinic_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!clinicMember?.clinic_id) {
      return NextResponse.json({ error: 'No active clinic found' }, { status: 400 });
    }

    const clinicId = clinicMember.clinic_id as string;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(range));

    // Fetch A/R Aging data
    const { data: arData, error: arError } = await supabase
      .from('invoices')
      .select('amount, due_date, status, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (arError) throw arError;

    // Calculate A/R Aging
    const now = new Date();
    const aRAging = [
      { period: '0-30', amount: 0, percentage: 0, count: 0 },
      { period: '31-60', amount: 0, percentage: 0, count: 0 },
      { period: '61-90', amount: 0, percentage: 0, count: 0 },
      { period: '90+', amount: 0, percentage: 0, count: 0 }
    ];

    let totalAR = 0;
    arData?.forEach(invoice => {
      if (invoice.status !== 'paid') {
        const daysDiff = Math.floor((now.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
        const amount = invoice.amount || 0;
        totalAR += amount;

        if (daysDiff <= 30) {
          aRAging[0].amount += amount;
          aRAging[0].count += 1;
        } else if (daysDiff <= 60) {
          aRAging[1].amount += amount;
          aRAging[1].count += 1;
        } else if (daysDiff <= 90) {
          aRAging[2].amount += amount;
          aRAging[2].count += 1;
        } else {
          aRAging[3].amount += amount;
          aRAging[3].count += 1;
        }
      }
    });

    // Calculate percentages
    aRAging.forEach(item => {
      item.percentage = totalAR > 0 ? (item.amount / totalAR) * 100 : 0;
    });

    // Fetch Claims data
    const { data: claimsData, error: claimsError } = await supabase
      .from('insurance_claims')
      .select('amount, status, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (claimsError) throw claimsError;

    // Calculate Claim Funnel
    const claimFunnel = [
      { stage: 'Submitted', count: 0, amount: 0, percentage: 0 },
      { stage: 'Processing', count: 0, amount: 0, percentage: 0 },
      { stage: 'Paid', count: 0, amount: 0, percentage: 0 },
      { stage: 'Denied', count: 0, amount: 0, percentage: 0 }
    ];

    let totalClaims = 0;
    let totalAmount = 0;
    claimsData?.forEach(claim => {
      const amount = claim.amount || 0;
      totalAmount += amount;
      totalClaims += 1;

      switch (claim.status) {
        case 'submitted':
          claimFunnel[0].count += 1;
          claimFunnel[0].amount += amount;
          break;
        case 'processing':
          claimFunnel[1].count += 1;
          claimFunnel[1].amount += amount;
          break;
        case 'paid':
          claimFunnel[2].count += 1;
          claimFunnel[2].amount += amount;
          break;
        case 'denied':
          claimFunnel[3].count += 1;
          claimFunnel[3].amount += amount;
          break;
      }
    });

    // Calculate percentages
    claimFunnel.forEach(item => {
      item.percentage = totalClaims > 0 ? (item.count / totalClaims) * 100 : 0;
    });

    // Fetch No-Show data
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('date, time, status, created_at')
      .eq('clinic_id', clinicId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (appointmentsError) throw appointmentsError;

    // Calculate No-Show Heatmap
    const noShowHeatmap = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let hour = 8; hour < 20; hour++) {
      for (const day of days) {
        const dayAppointments = appointmentsData?.filter(apt => {
          const aptDate = new Date(apt.date);
          const aptHour = parseInt(apt.time.split(':')[0]);
          return aptDate.getDay() === days.indexOf(day) + 1 && aptHour === hour;
        }) || [];

        const totalAppointments = dayAppointments.length;
        const noShows = dayAppointments.filter(apt => apt.status === 'no_show').length;
        const noShowRate = totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0;

        noShowHeatmap.push({
          day,
          hour,
          noShowRate,
          totalAppointments
        });
      }
    }

    // Calculate summary metrics
    const paidInvoices = arData?.filter(inv => inv.status === 'paid') || [];
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const collectionRate = totalAR > 0 ? ((totalRevenue / (totalRevenue + totalAR)) * 100) : 100;

    const totalAppointments = appointmentsData?.length || 0;
    const totalNoShows = appointmentsData?.filter(apt => apt.status === 'no_show').length || 0;
    const noShowRate = totalAppointments > 0 ? (totalNoShows / totalAppointments) * 100 : 0;

    const avgDaysInAR = arData?.length > 0 ? 
      arData.reduce((sum, inv) => {
        if (inv.status !== 'paid') {
          const daysDiff = Math.floor((now.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
          return sum + daysDiff;
        }
        return sum;
      }, 0) / arData.filter(inv => inv.status !== 'paid').length : 0;

    const summary = {
      totalAR,
      avgDaysInAR: Math.round(avgDaysInAR),
      collectionRate,
      noShowRate,
      totalClaims,
      paidClaims: claimFunnel[2].count,
      deniedClaims: claimFunnel[3].count
    };

    return NextResponse.json({
      success: true,
      data: {
        aRAging,
        claimFunnel,
        noShowHeatmap,
        summary
      }
    });
  } catch (e: any) {
    console.error('Error fetching financial reports:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
