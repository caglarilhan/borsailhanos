"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  FileText,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ARAgingData {
  period: string;
  amount: number;
  percentage: number;
  count: number;
}

interface ClaimFunnelData {
  stage: string;
  count: number;
  amount: number;
  percentage: number;
}

interface NoShowHeatmapData {
  day: string;
  hour: number;
  noShowRate: number;
  totalAppointments: number;
}

interface FinancialReportData {
  aRAging: ARAgingData[];
  claimFunnel: ClaimFunnelData[];
  noShowHeatmap: NoShowHeatmapData[];
  summary: {
    totalAR: number;
    avgDaysInAR: number;
    collectionRate: number;
    noShowRate: number;
    totalClaims: number;
    paidClaims: number;
    deniedClaims: number;
  };
}

export default function FinancialReports() {
  const { toast } = useToast();
  const [data, setData] = React.useState<FinancialReportData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [period, setPeriod] = React.useState('monthly');
  const [dateRange, setDateRange] = React.useState('30');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/financial/reports?period=${period}&range=${dateRange}`);
      if (!res.ok) throw new Error('Failed to fetch financial reports');
      const result = await res.json();
      setData(result.data);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load reports: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [period, dateRange, toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const res = await fetch(`/api/financial/reports/export?format=${format}&period=${period}&range=${dateRange}`);
      if (!res.ok) throw new Error('Failed to export report');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${period}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `Report exported successfully!`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to export: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading financial reports...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No financial data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-gray-600">Comprehensive financial analytics and reporting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total A/R</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.totalAR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg {data.summary.avgDaysInAR} days in A/R
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.collectionRate > 95 ? 'Excellent' : data.summary.collectionRate > 90 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.noShowRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.noShowRate < 10 ? 'Good' : data.summary.noShowRate < 20 ? 'Average' : 'High'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.paidClaims}/{data.summary.totalClaims}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.deniedClaims} denied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="ar-aging" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ar-aging">A/R Aging</TabsTrigger>
          <TabsTrigger value="claim-funnel">Claim Funnel</TabsTrigger>
          <TabsTrigger value="no-show-heatmap">No-Show Heatmap</TabsTrigger>
        </TabsList>

        {/* A/R Aging Report */}
        <TabsContent value="ar-aging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.aRAging}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`, 
                        name === 'amount' ? 'Amount' : 'Count'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                    <Bar dataKey="count" fill="#82ca9d" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.aRAging.map((item, index) => (
                  <div key={item.period} className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-semibold">{item.period}</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${item.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.count} accounts ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claim Funnel Report */}
        <TabsContent value="claim-funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Processing Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.claimFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'count' ? value : `$${value.toLocaleString()}`, 
                        name === 'count' ? 'Count' : 'Amount'
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Count"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stackId="2" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Amount"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {data.claimFunnel.map((item, index) => (
                  <div key={item.stage} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {item.stage}
                      </Badge>
                      <span className="font-medium">{item.count} claims</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${item.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* No-Show Heatmap */}
        <TabsContent value="no-show-heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>No-Show Rate Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-sm font-medium">
                  <div></div>
                  <div className="text-center">Mon</div>
                  <div className="text-center">Tue</div>
                  <div className="text-center">Wed</div>
                  <div className="text-center">Thu</div>
                  <div className="text-center">Fri</div>
                  <div className="text-center">Sat</div>
                </div>
                
                {Array.from({ length: 12 }, (_, hour) => (
                  <div key={hour} className="grid grid-cols-7 gap-2">
                    <div className="text-sm font-medium text-right pr-2">
                      {hour + 8}:00
                    </div>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                      const dataPoint = data.noShowHeatmap.find(
                        d => d.day === day && d.hour === hour + 8
                      );
                      const rate = dataPoint?.noShowRate || 0;
                      const intensity = Math.min(rate / 30, 1); // Normalize to 0-1
                      const color = `rgba(255, 0, 0, ${intensity})`;
                      
                      return (
                        <div
                          key={day}
                          className="h-8 border rounded flex items-center justify-center text-xs"
                          style={{ backgroundColor: color }}
                        >
                          {rate > 0 && `${rate.toFixed(0)}%`}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border"></div>
                  <span>0%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-300 border"></div>
                  <span>15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 border"></div>
                  <span>30%+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
