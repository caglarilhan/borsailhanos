import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import type { AnalyticsData, ReportConfig } from '@/types/analytics';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    const clinicId = clinicMember.clinic_id;

    // Calculate date range
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    // Get metrics
    const metrics = await getMetrics(supabase, clinicId, start, end);
    
    // Get chart data
    const charts = await getChartData(supabase, clinicId, start, end, period);

    const analyticsData: AnalyticsData = {
      period: period as any,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      metrics,
      charts
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getMetrics(supabase: any, clinicId: string, start: Date, end: Date) {
  // Get total clients
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  // Get appointments in date range
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0]);

  const totalAppointments = appointments?.length || 0;
  const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
  const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
  const noShowRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

  // Get revenue
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('status', 'paid')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  // Get new clients in period
  const { count: newClientsThisPeriod } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  // Get active clients (have appointments in period)
  const activeClients = new Set(
    appointments?.map(a => a.client_id) || []
  ).size;

  return {
    totalClients: totalClients || 0,
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowRate: Math.round(noShowRate * 100) / 100,
    totalRevenue,
    averageSessionDuration: 50, // Default 50 minutes
    clientRetentionRate: totalClients > 0 ? (activeClients / totalClients) * 100 : 0,
    newClientsThisPeriod: newClientsThisPeriod || 0,
    activeClientsThisPeriod: activeClients
  };
}

async function getChartData(supabase: any, clinicId: string, start: Date, end: Date, period: string) {
  const charts = [];

  // Revenue chart
  const revenueChart = await getRevenueChart(supabase, clinicId, start, end, period);
  if (revenueChart) charts.push(revenueChart);

  // Appointments chart
  const appointmentsChart = await getAppointmentsChart(supabase, clinicId, start, end, period);
  if (appointmentsChart) charts.push(appointmentsChart);

  // Client status chart
  const clientStatusChart = await getClientStatusChart(supabase, clinicId);
  if (clientStatusChart) charts.push(clientStatusChart);

  return charts;
}

async function getRevenueChart(supabase: any, clinicId: string, start: Date, end: Date, period: string) {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('status', 'paid')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (!invoices?.length) return null;

  // Group by period
  const revenueByPeriod: Record<string, number> = {};
  invoices.forEach(invoice => {
    const date = new Date(invoice.created_at);
    let key: string;
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'yearly':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    revenueByPeriod[key] = (revenueByPeriod[key] || 0) + (invoice.amount || 0);
  });

  const data = Object.entries(revenueByPeriod).map(([label, value]) => ({
    label,
    value,
    color: '#10B981'
  }));

  return {
    type: 'bar' as const,
    title: 'Revenue Trend',
    data,
    options: {
      showLegend: true,
      showGrid: true,
      animate: true
    }
  };
}

async function getAppointmentsChart(supabase: any, clinicId: string, start: Date, end: Date, period: string) {
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0]);

  if (!appointments?.length) return null;

  // Group by status
  const statusCounts: Record<string, number> = {};
  appointments.forEach(apt => {
    const status = apt.status || 'scheduled';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const data = Object.entries(statusCounts).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    color: getStatusColor(label)
  }));

  return {
    type: 'pie' as const,
    title: 'Appointment Status',
    data,
    options: {
      showLegend: true,
      animate: true
    }
  };
}

async function getClientStatusChart(supabase: any, clinicId: string) {
  const { data: clients } = await supabase
    .from('clients')
    .select('status')
    .eq('clinic_id', clinicId);

  if (!clients?.length) return null;

  const statusCounts: Record<string, number> = {};
  clients.forEach(client => {
    const status = client.status || 'active';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const data = Object.entries(statusCounts).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    color: label === 'active' ? '#10B981' : '#6B7280'
  }));

  return {
    type: 'bar' as const,
    title: 'Client Status',
    data,
    options: {
      showLegend: true,
      showGrid: true,
      animate: true
    }
  };
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#10B981';
    case 'scheduled': return '#3B82F6';
    case 'cancelled': return '#EF4444';
    case 'no-show': return '#F59E0B';
    default: return '#6B7280';
  }
}
