'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Download, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  RefreshCw,
  Target,
  Activity,
  Zap
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'cohort';
  config: any;
  position: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  refreshInterval?: number;
}

interface CustomMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CohortAnalysis {
  id: string;
  name: string;
  description: string;
  cohortType: 'retention' | 'revenue' | 'engagement';
  timeRange: string;
  metrics: string[];
  results: any;
  createdAt: string;
}

interface AdvancedAnalyticsProps {
  userId: string;
}

export default function AdvancedAnalytics({ userId }: AdvancedAnalyticsProps) {
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);
  const [cohortAnalyses, setCohortAnalyses] = useState<CohortAnalysis[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<CustomMetric | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'cohorts'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadDashboardWidgets();
    loadCustomMetrics();
    loadCohortAnalyses();
  }, [userId]);

  const loadDashboardWidgets = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard-widgets');
      if (response.ok) {
        const data = await response.json();
        setDashboardWidgets(data.widgets || []);
      }
    } catch (error) {
      console.error('Error loading dashboard widgets:', error);
    }
  };

  const loadCustomMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/custom-metrics');
      if (response.ok) {
        const data = await response.json();
        setCustomMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error('Error loading custom metrics:', error);
    }
  };

  const loadCohortAnalyses = async () => {
    try {
      const response = await fetch('/api/analytics/cohort-analyses');
      if (response.ok) {
        const data = await response.json();
        setCohortAnalyses(data.cohorts || []);
      }
    } catch (error) {
      console.error('Error loading cohort analyses:', error);
    }
  };

  const createDashboardWidget = async (widget: Omit<DashboardWidget, 'id'>) => {
    try {
      const response = await fetch('/api/analytics/dashboard-widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widget),
      });

      if (response.ok) {
        await loadDashboardWidgets();
        return true;
      }
    } catch (error) {
      console.error('Error creating dashboard widget:', error);
    }
    return false;
  };

  const updateDashboardWidget = async (id: string, updates: Partial<DashboardWidget>) => {
    try {
      const response = await fetch(`/api/analytics/dashboard-widgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadDashboardWidgets();
        return true;
      }
    } catch (error) {
      console.error('Error updating dashboard widget:', error);
    }
    return false;
  };

  const deleteDashboardWidget = async (id: string) => {
    try {
      const response = await fetch(`/api/analytics/dashboard-widgets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadDashboardWidgets();
        return true;
      }
    } catch (error) {
      console.error('Error deleting dashboard widget:', error);
    }
    return false;
  };

  const createCustomMetric = async (metric: Omit<CustomMetric, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/analytics/custom-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });

      if (response.ok) {
        await loadCustomMetrics();
        return true;
      }
    } catch (error) {
      console.error('Error creating custom metric:', error);
    }
    return false;
  };

  const updateCustomMetric = async (id: string, updates: Partial<CustomMetric>) => {
    try {
      const response = await fetch(`/api/analytics/custom-metrics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadCustomMetrics();
        return true;
      }
    } catch (error) {
      console.error('Error updating custom metric:', error);
    }
    return false;
  };

  const deleteCustomMetric = async (id: string) => {
    try {
      const response = await fetch(`/api/analytics/custom-metrics/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCustomMetrics();
        return true;
      }
    } catch (error) {
      console.error('Error deleting custom metric:', error);
    }
    return false;
  };

  const createCohortAnalysis = async (cohort: Omit<CohortAnalysis, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/analytics/cohort-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cohort),
      });

      if (response.ok) {
        await loadCohortAnalyses();
        return true;
      }
    } catch (error) {
      console.error('Error creating cohort analysis:', error);
    }
    return false;
  };

  const updateCohortAnalysis = async (id: string, updates: Partial<CohortAnalysis>) => {
    try {
      const response = await fetch(`/api/analytics/cohort-analyses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadCohortAnalyses();
        return true;
      }
    } catch (error) {
      console.error('Error updating cohort analysis:', error);
    }
    return false;
  };

  const deleteCohortAnalysis = async (id: string) => {
    try {
      const response = await fetch(`/api/analytics/cohort-analyses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCohortAnalyses();
        return true;
      }
    } catch (error) {
      console.error('Error deleting cohort analysis:', error);
    }
    return false;
  };

  const exportAnalytics = async (type: 'dashboard' | 'metrics' | 'cohorts') => {
    try {
      const response = await fetch(`/api/analytics/export?type=${type}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const renderDashboardWidget = (widget: DashboardWidget) => {
    const getWidgetIcon = (type: string) => {
      switch (type) {
        case 'chart': return <BarChart3 className="h-4 w-4" />;
        case 'metric': return <TrendingUp className="h-4 w-4" />;
        case 'table': return <Activity className="h-4 w-4" />;
        case 'cohort': return <Users className="h-4 w-4" />;
        default: return <Target className="h-4 w-4" />;
      }
    };

  return (
      <Card key={widget.id} className="h-full">
        <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
              {getWidgetIcon(widget.type)}
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              {widget.refreshInterval && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {widget.refreshInterval}s
          </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWidget(widget)}
              >
                <Settings className="h-3 w-3" />
              </Button>
        </div>
      </div>
          </CardHeader>
          <CardContent>
          <div className="h-32 flex items-center justify-center bg-muted rounded">
            <div className="text-center">
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">Widget Data</div>
            </div>
          </div>
          </CardContent>
        </Card>
    );
  };

  const renderCustomMetric = (metric: CustomMetric) => (
    <Card key={metric.id} className="mb-4">
        <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{metric.name}</CardTitle>
            <CardDescription>{metric.description}</CardDescription>
            </div>
          <div className="flex items-center space-x-2">
            <Badge variant={metric.isActive ? 'default' : 'secondary'}>
              {metric.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMetric(metric)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
                  <div>
            <Label className="text-sm font-medium">Formula</Label>
            <div className="p-2 bg-muted rounded text-sm font-mono">
              {metric.formula}
                  </div>
                    </div>
          <div className="flex items-center space-x-4">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <div className="text-sm text-muted-foreground">{metric.category}</div>
                    </div>
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {metric.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                    </Badge>
                ))}
                  </div>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>
  );

  const renderCohortAnalysis = (cohort: CohortAnalysis) => (
    <Card key={cohort.id} className="mb-4">
        <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{cohort.name}</CardTitle>
            <CardDescription>{cohort.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{cohort.cohortType}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCohort(cohort)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
                  <div>
              <Label className="text-sm font-medium">Time Range</Label>
              <div className="text-sm text-muted-foreground">{cohort.timeRange}</div>
                  </div>
            <div>
              <Label className="text-sm font-medium">Metrics</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {cohort.metrics.map((metric, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {metric}
                    </Badge>
                ))}
                  </div>
                </div>
          </div>
          <div className="h-24 flex items-center justify-center bg-muted rounded">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Cohort Analysis Results</div>
              <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
                  <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Dashboard widgets, custom metrics, and cohort analysis
          </p>
                    </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => exportAnalytics(activeTab)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
                  </div>
                  
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dashboard')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'metrics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('metrics')}
          className="flex-1"
        >
          <Target className="h-4 w-4 mr-2" />
          Custom Metrics
        </Button>
        <Button
          variant={activeTab === 'cohorts' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('cohorts')}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          Cohort Analysis
        </Button>
                  </div>
                  
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboard Widgets</h2>
            <Button onClick={() => setSelectedWidget({} as DashboardWidget)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
                  </div>

          {dashboardWidgets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Dashboard Widgets</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create custom dashboard widgets to visualize your data
                </p>
                <Button onClick={() => setSelectedWidget({} as DashboardWidget)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Widget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardWidgets.map(renderDashboardWidget)}
                </div>
          )}
              </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Custom Metrics</h2>
            <Button onClick={() => setSelectedMetric({} as CustomMetric)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Metric
            </Button>
          </div>

          {customMetrics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Custom Metrics</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create custom metrics to track specific KPIs
                </p>
                <Button onClick={() => setSelectedMetric({} as CustomMetric)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Metric
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {customMetrics.map(renderCustomMetric)}
              </div>
            )}
          </div>
      )}

      {activeTab === 'cohorts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Cohort Analysis</h2>
            <Button onClick={() => setSelectedCohort({} as CohortAnalysis)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Analysis
            </Button>
          </div>

          {cohortAnalyses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cohort Analyses</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create cohort analyses to understand user behavior patterns
                </p>
                <Button onClick={() => setSelectedCohort({} as CohortAnalysis)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Analysis
                </Button>
        </CardContent>
      </Card>
          ) : (
            <div className="space-y-4">
              {cohortAnalyses.map(renderCohortAnalysis)}
            </div>
          )}
        </div>
      )}

      {/* Widget Configuration Modal */}
      {selectedWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
              <CardTitle>
                {selectedWidget.id ? 'Edit Widget' : 'Create Widget'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                  <div>
                  <Label htmlFor="widget-title">Title</Label>
                  <Input
                    id="widget-title"
                    value={selectedWidget.title || ''}
                    onChange={(e) => setSelectedWidget({
                      ...selectedWidget,
                      title: e.target.value
                    })}
                    placeholder="Widget title"
                  />
                    </div>
                <div>
                  <Label htmlFor="widget-type">Type</Label>
                  <select
                    id="widget-type"
                    value={selectedWidget.type || 'chart'}
                    onChange={(e) => setSelectedWidget({
                      ...selectedWidget,
                      type: e.target.value as any
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="chart">Chart</option>
                    <option value="metric">Metric</option>
                    <option value="table">Table</option>
                    <option value="cohort">Cohort</option>
                  </select>
                  </div>
                <div>
                  <Label htmlFor="widget-config">Configuration (JSON)</Label>
                  <Textarea
                    id="widget-config"
                    value={JSON.stringify(selectedWidget.config || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setSelectedWidget({
                          ...selectedWidget,
                          config
                        });
                      } catch (error) {
                        // Invalid JSON, keep the text
                      }
                    }}
                    placeholder="Widget configuration"
                    rows={6}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWidget(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedWidget.id) {
                        await updateDashboardWidget(selectedWidget.id, selectedWidget);
                      } else {
                        await createDashboardWidget(selectedWidget);
                      }
                      setSelectedWidget(null);
                    }}
                  >
                    {selectedWidget.id ? 'Update' : 'Create'}
                  </Button>
                        </div>
                      </div>
            </CardContent>
          </Card>
                        </div>
                      )}

      {/* Custom Metric Configuration Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedMetric.id ? 'Edit Metric' : 'Create Metric'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    <div>
                  <Label htmlFor="metric-name">Name</Label>
                  <Input
                    id="metric-name"
                    value={selectedMetric.name || ''}
                    onChange={(e) => setSelectedMetric({
                      ...selectedMetric,
                      name: e.target.value
                    })}
                    placeholder="Metric name"
                  />
                    </div>
                    <div>
                  <Label htmlFor="metric-description">Description</Label>
                  <Textarea
                    id="metric-description"
                    value={selectedMetric.description || ''}
                    onChange={(e) => setSelectedMetric({
                      ...selectedMetric,
                      description: e.target.value
                    })}
                    placeholder="Metric description"
                    rows={3}
                  />
                    </div>
                <div>
                  <Label htmlFor="metric-formula">Formula</Label>
                  <Textarea
                    id="metric-formula"
                    value={selectedMetric.formula || ''}
                    onChange={(e) => setSelectedMetric({
                      ...selectedMetric,
                      formula: e.target.value
                    })}
                    placeholder="Metric formula"
                    rows={3}
                  />
                  </div>
                <div>
                  <Label htmlFor="metric-category">Category</Label>
                  <Input
                    id="metric-category"
                    value={selectedMetric.category || ''}
                    onChange={(e) => setSelectedMetric({
                      ...selectedMetric,
                      category: e.target.value
                    })}
                    placeholder="Metric category"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMetric(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedMetric.id) {
                        await updateCustomMetric(selectedMetric.id, selectedMetric);
                      } else {
                        await createCustomMetric(selectedMetric);
                      }
                      setSelectedMetric(null);
                    }}
                  >
                    {selectedMetric.id ? 'Update' : 'Create'}
                  </Button>
              </div>
          </div>
        </CardContent>
      </Card>
        </div>
      )}

      {/* Cohort Analysis Configuration Modal */}
      {selectedCohort && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
              <CardTitle>
                {selectedCohort.id ? 'Edit Cohort Analysis' : 'Create Cohort Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                    <div>
                  <Label htmlFor="cohort-name">Name</Label>
                  <Input
                    id="cohort-name"
                    value={selectedCohort.name || ''}
                    onChange={(e) => setSelectedCohort({
                      ...selectedCohort,
                      name: e.target.value
                    })}
                    placeholder="Cohort analysis name"
                  />
                    </div>
                <div>
                  <Label htmlFor="cohort-description">Description</Label>
                  <Textarea
                    id="cohort-description"
                    value={selectedCohort.description || ''}
                    onChange={(e) => setSelectedCohort({
                      ...selectedCohort,
                      description: e.target.value
                    })}
                    placeholder="Cohort analysis description"
                    rows={3}
                  />
                  </div>
                <div>
                  <Label htmlFor="cohort-type">Cohort Type</Label>
                  <select
                    id="cohort-type"
                    value={selectedCohort.cohortType || 'retention'}
                    onChange={(e) => setSelectedCohort({
                      ...selectedCohort,
                      cohortType: e.target.value as any
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="retention">Retention</option>
                    <option value="revenue">Revenue</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="cohort-time-range">Time Range</Label>
                  <Input
                    id="cohort-time-range"
                    value={selectedCohort.timeRange || ''}
                    onChange={(e) => setSelectedCohort({
                      ...selectedCohort,
                      timeRange: e.target.value
                    })}
                    placeholder="e.g., 30 days, 3 months"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCohort(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedCohort.id) {
                        await updateCohortAnalysis(selectedCohort.id, selectedCohort);
                      } else {
                        await createCohortAnalysis(selectedCohort);
                      }
                      setSelectedCohort(null);
                    }}
                  >
                    {selectedCohort.id ? 'Update' : 'Create'}
                  </Button>
                </div>
          </div>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
}