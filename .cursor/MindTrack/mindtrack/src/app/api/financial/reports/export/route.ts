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
    const format = searchParams.get('format') || 'pdf';
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

    // Fetch the same data as the main reports endpoint
    const reportsRes = await fetch(`${request.nextUrl.origin}/api/financial/reports?period=${period}&range=${range}`, {
      headers: {
        'Authorization': `Bearer ${user.id}`, // Simplified auth for internal call
      }
    });

    if (!reportsRes.ok) {
      throw new Error('Failed to fetch report data');
    }

    const { data: reportData } = await reportsRes.json();

    if (format === 'pdf') {
      // Generate PDF using a simple HTML-to-PDF approach
      const htmlContent = generatePDFHTML(reportData, period, range);
      
      // For now, return HTML content that can be printed to PDF
      // In production, you'd use a library like Puppeteer or jsPDF
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="financial-report-${period}-${new Date().toISOString().split('T')[0]}.html"`
        }
      });
    } else if (format === 'excel') {
      // Generate CSV/Excel content
      const csvContent = generateCSVContent(reportData, period, range);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-report-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (e: any) {
    console.error('Error exporting financial reports:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function generatePDFHTML(data: any, period: string, range: string): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Financial Report - ${period}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #666; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #333; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Financial Report</h1>
        <p>Period: ${period} | Range: Last ${range} days | Generated: ${currentDate}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total A/R</h3>
            <div class="value">$${data.summary.totalAR.toLocaleString()}</div>
        </div>
        <div class="summary-card">
            <h3>Collection Rate</h3>
            <div class="value">${data.summary.collectionRate.toFixed(1)}%</div>
        </div>
        <div class="summary-card">
            <h3>No-Show Rate</h3>
            <div class="value">${data.summary.noShowRate.toFixed(1)}%</div>
        </div>
        <div class="summary-card">
            <h3>Avg Days in A/R</h3>
            <div class="value">${data.summary.avgDaysInAR}</div>
        </div>
    </div>

    <div class="section">
        <h2>Accounts Receivable Aging</h2>
        <table>
            <thead>
                <tr>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${data.aRAging.map((item: any) => `
                    <tr>
                        <td>${item.period}</td>
                        <td>$${item.amount.toLocaleString()}</td>
                        <td>${item.count}</td>
                        <td>${item.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Claims Processing Funnel</h2>
        <table>
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Count</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${data.claimFunnel.map((item: any) => `
                    <tr>
                        <td>${item.stage}</td>
                        <td>${item.count}</td>
                        <td>$${item.amount.toLocaleString()}</td>
                        <td>${item.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>No-Show Heatmap Summary</h2>
        <table>
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Hour</th>
                    <th>No-Show Rate</th>
                    <th>Total Appointments</th>
                </tr>
            </thead>
            <tbody>
                ${data.noShowHeatmap.filter((item: any) => item.totalAppointments > 0).map((item: any) => `
                    <tr>
                        <td>${item.day}</td>
                        <td>${item.hour}:00</td>
                        <td>${item.noShowRate.toFixed(1)}%</td>
                        <td>${item.totalAppointments}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `;
}

function generateCSVContent(data: any, period: string, range: string): string {
  const currentDate = new Date().toLocaleDateString();
  
  let csv = `Financial Report - ${period} - Last ${range} days - Generated: ${currentDate}\n\n`;
  
  // Summary
  csv += `Summary\n`;
  csv += `Total A/R,$${data.summary.totalAR.toLocaleString()}\n`;
  csv += `Collection Rate,${data.summary.collectionRate.toFixed(1)}%\n`;
  csv += `No-Show Rate,${data.summary.noShowRate.toFixed(1)}%\n`;
  csv += `Avg Days in A/R,${data.summary.avgDaysInAR}\n`;
  csv += `Total Claims,${data.summary.totalClaims}\n`;
  csv += `Paid Claims,${data.summary.paidClaims}\n`;
  csv += `Denied Claims,${data.summary.deniedClaims}\n\n`;
  
  // A/R Aging
  csv += `A/R Aging\n`;
  csv += `Period,Amount,Count,Percentage\n`;
  data.aRAging.forEach((item: any) => {
    csv += `${item.period},$${item.amount.toLocaleString()},${item.count},${item.percentage.toFixed(1)}%\n`;
  });
  csv += `\n`;
  
  // Claim Funnel
  csv += `Claims Processing Funnel\n`;
  csv += `Stage,Count,Amount,Percentage\n`;
  data.claimFunnel.forEach((item: any) => {
    csv += `${item.stage},${item.count},$${item.amount.toLocaleString()},${item.percentage.toFixed(1)}%\n`;
  });
  csv += `\n`;
  
  // No-Show Heatmap (filtered)
  csv += `No-Show Heatmap\n`;
  csv += `Day,Hour,No-Show Rate,Total Appointments\n`;
  data.noShowHeatmap.filter((item: any) => item.totalAppointments > 0).forEach((item: any) => {
    csv += `${item.day},${item.hour}:00,${item.noShowRate.toFixed(1)}%,${item.totalAppointments}\n`;
  });
  
  return csv;
}
