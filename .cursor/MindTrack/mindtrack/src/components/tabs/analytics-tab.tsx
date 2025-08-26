"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";
import type { AnalyticsData } from "@/types/analytics";

export default function AnalyticsTab() {
  const t = useTranslations("analytics");
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async (period: string = 'monthly', startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/analytics?period=${period}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    fetchAnalytics(period);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    fetchAnalytics('custom', startDate, endDate);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("errorTitle")}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("title")}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("description")}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-0"
        >
          {loading ? t("loading") : t("refresh")}
        </button>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        data={analyticsData}
        loading={loading}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("quickActions")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
            <div className="text-blue-600 text-2xl mb-2">📊</div>
            <h4 className="font-medium text-gray-900 mb-1">
              {t("exportReport")}
            </h4>
            <p className="text-sm text-gray-600">
              {t("exportReportDesc")}
            </p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
            <div className="text-green-600 text-2xl mb-2">📈</div>
            <h4 className="font-medium text-gray-900 mb-1">
              {t("trendAnalysis")}
            </h4>
            <p className="text-sm text-gray-600">
              {t("trendAnalysisDesc")}
            </p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
            <div className="text-purple-600 text-2xl mb-2">🎯</div>
            <h4 className="font-medium text-gray-900 mb-1">
              {t("kpiDashboard")}
            </h4>
            <p className="text-sm text-gray-600">
              {t("kpiDashboardDesc")}
            </p>
          </button>
        </div>
      </div>

      {/* Insights */}
      {analyticsData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("insights")}
          </h3>
          
          <div className="space-y-4">
            {analyticsData.metrics.noShowRate > 20 && (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-600 text-xl">⚠️</div>
                <div>
                  <h4 className="font-medium text-yellow-800">
                    {t("highNoShowRate")}
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {t("highNoShowRateDesc", { rate: analyticsData.metrics.noShowRate })}
                  </p>
                </div>
              </div>
            )}
            
            {analyticsData.metrics.clientRetentionRate < 70 && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-xl">📉</div>
                <div>
                  <h4 className="font-medium text-red-800">
                    {t("lowRetentionRate")}
                  </h4>
                  <p className="text-sm text-red-700">
                    {t("lowRetentionRateDesc", { rate: analyticsData.metrics.clientRetentionRate })}
                  </p>
                </div>
              </div>
            )}
            
            {analyticsData.metrics.newClientsThisPeriod > 0 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 text-xl">🎉</div>
                <div>
                  <h4 className="font-medium text-green-800">
                    {t("newClientsGrowth")}
                  </h4>
                  <p className="text-sm text-green-700">
                    {t("newClientsGrowthDesc", { count: analyticsData.metrics.newClientsThisPeriod })}
                  </p>
                </div>
              </div>
            )}
            
            {analyticsData.metrics.totalRevenue > 0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-blue-600 text-xl">💰</div>
                <div>
                  <h4 className="font-medium text-blue-800">
                    {t("revenueSummary")}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {t("revenueSummaryDesc", { 
                      revenue: analyticsData.metrics.totalRevenue,
                      sessions: analyticsData.metrics.completedAppointments
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
