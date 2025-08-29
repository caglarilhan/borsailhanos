export interface AnalyticsData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  metrics: Metrics;
  charts: ChartData[];
}

export interface Metrics {
  totalClients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowRate: number;
  totalRevenue: number;
  averageSessionDuration: number;
  clientRetentionRate: number;
  newClientsThisPeriod: number;
  activeClientsThisPeriod: number;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: ChartPoint[];
  options?: ChartOptions;
}

export interface ChartPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartOptions {
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  height?: number;
  width?: number;
}

export interface ReportConfig {
  type: 'revenue' | 'appointments' | 'clients' | 'assessments' | 'custom';
  format: 'pdf' | 'csv' | 'json';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  filters?: ReportFilters;
}

export interface ReportFilters {
  clientIds?: string[];
  appointmentStatuses?: string[];
  assessmentTypes?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface RevenueReport {
  totalRevenue: number;
  revenueByClient: RevenueByClient[];
  revenueByMonth: RevenueByMonth[];
  averageSessionPrice: number;
  topClients: TopClient[];
}

export interface RevenueByClient {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  sessionCount: number;
  averagePrice: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  sessionCount: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  sessionCount: number;
  lastSession: string;
}

export interface AppointmentReport {
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  completionRate: number;
  noShowRate: number;
  appointmentsByDay: AppointmentByDay[];
  appointmentsByClient: AppointmentByClient[];
}

export interface AppointmentByDay {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface AppointmentByClient {
  clientId: string;
  clientName: string;
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  completionRate: number;
}

export interface ClientReport {
  totalClients: number;
  activeClients: number;
  newClientsThisPeriod: number;
  clientRetentionRate: number;
  clientsByStatus: ClientByStatus[];
  topClients: TopClient[];
}

export interface ClientByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface AssessmentReport {
  totalAssessments: number;
  assessmentsByType: AssessmentByType[];
  averageScores: AverageScore[];
  progressTrends: ProgressTrend[];
}

export interface AssessmentByType {
  type: string;
  count: number;
  averageScore: number;
  improvementRate: number;
}

export interface AverageScore {
  type: string;
  averageScore: number;
  maxScore: number;
  severity: string;
}

export interface ProgressTrend {
  clientId: string;
  clientName: string;
  assessmentType: string;
  trend: 'improving' | 'stable' | 'declining';
  firstScore: number;
  lastScore: number;
  improvement: number;
}
