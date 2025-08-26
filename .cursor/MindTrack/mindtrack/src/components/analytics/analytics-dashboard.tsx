"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { AnalyticsData, Metrics } from "@/types/analytics";

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  loading?: boolean;
  onPeriodChange: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function AnalyticsDashboard({ 
  data, 
  loading = false, 
  onPeriodChange, 
  onDateRangeChange 
}: AnalyticsDashboardProps) {
  const t = useTranslations("analytics");
  const [selectedPeriod, setSelectedPeriod] = React.useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  React.useEffect(() => {
    if (data) {
      setStartDate(data.startDate.split('T')[0]);
      setEndDate(data.endDate.split('T')[0]);
    }
  }, [data]);

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setSelectedPeriod(period);
    onPeriodChange(period);
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {t("title")}
        </h2>
        
        {/* Period Selector */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex rounded-lg border border-gray-300">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${period === 'daily' ? 'rounded-l-lg' : ''} ${
                  period === 'yearly' ? 'rounded-r-lg' : ''
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Custom Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-500 self-center">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleDateRangeChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={t("totalClients")}
          value={data.metrics.totalClients}
          change={data.metrics.newClientsThisPeriod}
          changeLabel="new this period"
          color="blue"
        />
        <MetricCard
          title={t("totalAppointments")}
          value={data.metrics.totalAppointments}
          change={data.metrics.completedAppointments}
          changeLabel="completed"
          color="green"
        />
        <MetricCard
          title={t("totalRevenue")}
          value={`$${data.metrics.totalRevenue.toLocaleString()}`}
          change={data.metrics.completedAppointments}
          changeLabel="sessions"
          color="purple"
        />
        <MetricCard
          title={t("noShowRate")}
          value={`${data.metrics.noShowRate}%`}
          change={data.metrics.totalAppointments - data.metrics.cancelledAppointments}
          changeLabel="attended"
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.charts.map((chart, index) => (
          <ChartCard key={index} chart={chart} />
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("clientRetention")}
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.metrics.clientRetentionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            {data.metrics.activeClientsThisPeriod} active clients
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("averageSessionDuration")}
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {data.metrics.averageSessionDuration} min
          </p>
          <p className="text-sm text-gray-600">
            Standard session length
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("completionRate")}
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {data.metrics.totalAppointments > 0 
              ? ((data.metrics.completedAppointments / data.metrics.totalAppointments) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm text-gray-600">
            Sessions completed
          </p>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  color: 'blue' | 'green' | 'purple' | 'red';
}

function MetricCard({ title, value, change, changeLabel, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-sm text-gray-600 mt-2">
        {change} {changeLabel}
      </p>
    </div>
  );
}

interface ChartCardProps {
  chart: any;
}

function ChartCard({ chart }: ChartCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
      
      {chart.type === 'pie' && (
        <div className="flex flex-wrap gap-4">
          {chart.data.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">
                {item.label}: {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {chart.type === 'bar' && (
        <div className="space-y-2">
          {chart.data.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-20">{item.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className="h-4 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${(item.value / Math.max(...chart.data.map((d: any) => d.value))) * 100}%`
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
