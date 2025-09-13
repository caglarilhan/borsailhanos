"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Microscope, 
  RefreshCw, 
  Upload, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Activity
} from 'lucide-react';
import { useLaboratoryIntegration } from '@/hooks/useLaboratoryIntegration';

export default function AdvancedLaboratoryIntegration() {
  const {
    loading,
    error,
    getLabIntegrations,
    createLabIntegration,
    updateLabIntegration,
    getLabResults,
    processLabResults,
    syncLabData,
    getLabAnalytics,
    performQualityControl,
    formatLabResult,
    getStatusColor,
    getStatusBadgeVariant,
  } = useLaboratoryIntegration();

  const [integrations, setIntegrations] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'api' as 'hl7' | 'api' | 'file' | 'manual',
    endpoint: '',
    syncFrequency: 60
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [integrationsData, analyticsData, qualityData] = await Promise.all([
        getLabIntegrations(),
        getLabAnalytics(dateRange),
        performQualityControl()
      ]);
      
      setIntegrations(integrationsData);
      setAnalytics(analyticsData);
      setQualityMetrics(qualityData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      await createLabIntegration({
        ...newIntegration,
        isActive: true,
        credentials: {}
      });
      setNewIntegration({ name: '', type: 'api', endpoint: '', syncFrequency: 60 });
      loadData();
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const handleSyncData = async (integrationId: string) => {
    try {
      await syncLabData(integrationId);
      loadData();
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  };

  const handleLoadResults = async () => {
    try {
      const results = await getLabResults(selectedPatient || undefined, dateRange);
      setLabResults(results);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Microscope className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Advanced Laboratory Integration</h1>
          <p className="text-gray-600">Comprehensive lab result integration with automated interpretation</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="results">Lab Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Microscope className="h-5 w-5" />
                  <span>Total Tests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalTests || 0}</div>
                <p className="text-sm text-gray-600">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Critical Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{analytics?.criticalResults || 0}</div>
                <p className="text-sm text-gray-600">{analytics?.criticalRate?.toFixed(1) || 0}% of total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <span>Abnormal Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{analytics?.abnormalResults || 0}</div>
                <p className="text-sm text-gray-600">{analytics?.abnormalRate?.toFixed(1) || 0}% of total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Avg Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.averageProcessingTime?.toFixed(1) || 0}h</div>
                <p className="text-sm text-gray-600">Turnaround time</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Laboratory Integration Features</CardTitle>
              <CardDescription>Advanced capabilities for lab result management and interpretation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Integration Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">HL7 Message Processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">REST API Integration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">File Upload Processing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Manual Entry Support</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Automated Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Result Interpretation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Clinical Recommendations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Alert Generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Quality Monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Lab Integrations</span>
              </CardTitle>
              <CardDescription>Manage laboratory system integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration-name">Integration Name</Label>
                  <Input
                    id="integration-name"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter integration name"
                  />
                </div>
                <div>
                  <Label htmlFor="integration-type">Type</Label>
                  <Select value={newIntegration.type} onValueChange={(value: any) => setNewIntegration(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hl7">HL7</SelectItem>
                      <SelectItem value="api">REST API</SelectItem>
                      <SelectItem value="file">File Upload</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="integration-endpoint">Endpoint URL</Label>
                  <Input
                    id="integration-endpoint"
                    value={newIntegration.endpoint}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, endpoint: e.target.value }))}
                    placeholder="https://api.lab.com/results"
                  />
                </div>
                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                  <Input
                    id="sync-frequency"
                    type="number"
                    value={newIntegration.syncFrequency}
                    onChange={(e) => setNewIntegration(prev => ({ ...prev, syncFrequency: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <Button onClick={handleCreateIntegration} disabled={loading}>
                <Settings className="h-4 w-4 mr-2" />
                Create Integration
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{integration.name}</span>
                    <Badge variant={integration.isActive ? "default" : "secondary"}>
                      {integration.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{integration.type.toUpperCase()} Integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Last Sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}</div>
                    <div>Sync Frequency: {integration.syncFrequency} minutes</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSyncData(integration.id)}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Lab Results</span>
              </CardTitle>
              <CardDescription>View and manage laboratory test results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="patient-id">Patient ID</Label>
                  <Input
                    id="patient-id"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleLoadResults} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Load Results
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {labResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{result.testName}</span>
                    <Badge variant={getStatusBadgeVariant(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {result.labName} • {new Date(result.resultDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Result</Label>
                      <div className="text-lg font-semibold">{formatLabResult(result)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Interpretation</Label>
                      <div className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.interpretation || 'Pending interpretation'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Ordered By</Label>
                      <div className="text-sm">{result.orderedBy}</div>
                    </div>
                  </div>
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Recommendations</Label>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {result.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Laboratory Analytics</span>
              </CardTitle>
              <CardDescription>Comprehensive analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{analytics.normalResults}</div>
                      <div className="text-sm text-gray-600">Normal Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{analytics.abnormalResults}</div>
                      <div className="text-sm text-gray-600">Abnormal Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{analytics.criticalResults}</div>
                      <div className="text-sm text-gray-600">Critical Results</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Test Types Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.testTypes).map(([testType, count]) => (
                        <div key={testType} className="flex justify-between items-center">
                          <span className="text-sm">{testType}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Quality Control</span>
              </CardTitle>
              <CardDescription>Monitor data quality and completeness</CardDescription>
            </CardHeader>
            <CardContent>
              {qualityMetrics && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{qualityMetrics.qualityScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Overall Quality Score</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{qualityMetrics.totalResults}</div>
                      <div className="text-sm text-gray-600">Total Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{qualityMetrics.missingInterpretations}</div>
                      <div className="text-sm text-gray-600">Missing Interpretations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{qualityMetrics.missingRecommendations}</div>
                      <div className="text-sm text-gray-600">Missing Recommendations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{qualityMetrics.incompleteResults}</div>
                      <div className="text-sm text-gray-600">Incomplete Results</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
