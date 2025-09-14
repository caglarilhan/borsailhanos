"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TestTube, AlertTriangle, CheckCircle, Clock, ActivitySquare, Eye, Plus, FileWarning, BarChart3, Beaker 
} from "lucide-react";

interface LabPanel { id: string; panelCode: string; panelName: string; description?: string; analytes: Array<{ code: string; name: string; unit: string }>; }
interface LabOrder { id: string; patientId: string; orderStatus: string; panelCode?: string; priority: string; orderDate: string; collectionDatetime?: string; }
interface LabResult { id: string; orderId: string; analyteCode: string; resultValue: number; unit: string; flag: string; resultDatetime: string; }
interface LabAlert { id: string; patientId: string; analyteCode: string; resultValue: number; unit: string; severity: string; alertMessage: string; status: string; alertedAt: string; }

const AdvancedLabTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const mockPanels: LabPanel[] = [
    { id: "1", panelCode: "CMP", panelName: "Comprehensive Metabolic Panel", description: "14 analytes", analytes: [
      { code: "GLU", name: "Glucose", unit: "mg/dL" },
      { code: "CRE", name: "Creatinine", unit: "mg/dL" }
    ]},
    { id: "2", panelCode: "CBC", panelName: "Complete Blood Count", description: "7 analytes", analytes: [
      { code: "WBC", name: "White Blood Cells", unit: "10^3/uL" },
      { code: "HGB", name: "Hemoglobin", unit: "g/dL" }
    ]}
  ];

  const mockOrders: LabOrder[] = [
    { id: "o1", patientId: "patient-1", orderStatus: "completed", panelCode: "CMP", priority: "routine", orderDate: "2024-01-10", collectionDatetime: "2024-01-10T09:30:00Z" },
    { id: "o2", patientId: "patient-2", orderStatus: "in_progress", panelCode: "CBC", priority: "urgent", orderDate: "2024-01-12" }
  ];

  const mockResults: LabResult[] = [
    { id: "r1", orderId: "o1", analyteCode: "GLU", resultValue: 102, unit: "mg/dL", flag: "normal", resultDatetime: "2024-01-10T12:00:00Z" },
    { id: "r2", orderId: "o1", analyteCode: "CRE", resultValue: 1.4, unit: "mg/dL", flag: "high", resultDatetime: "2024-01-10T12:00:00Z" }
  ];

  const mockAlerts: LabAlert[] = [
    { id: "a1", patientId: "patient-3", analyteCode: "K", resultValue: 2.7, unit: "mmol/L", severity: "critical", alertMessage: "Critical low potassium", status: "active", alertedAt: "2024-01-11T08:00:00Z" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800 border-green-200">completed</Badge>;
      case "in_progress": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">in progress</Badge>;
      case "ordered": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">ordered</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const totalOrders = mockOrders.length;
  const completedOrders = mockOrders.filter(o => o.orderStatus === 'completed').length;
  const activeAlerts = mockAlerts.filter(a => a.status === 'active').length;
  const abnormalResults = mockResults.filter(r => r.flag !== 'normal').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Lab Tracking</h1>
          <p className="text-muted-foreground">Order, result, alert, and trend management for labs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Plus className="h-4 w-4 mr-2"/>New Order</Button>
          <Button><Beaker className="h-4 w-4 mr-2"/>Add Panel</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">Results available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abnormalResults}</div>
            <p className="text-xs text-muted-foreground">Require review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Critical attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="panels">Panels</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ActivitySquare className="h-5 w-5 text-blue-500"/>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Plus className="h-4 w-4 text-green-500"/><span className="text-sm">New CMP order</span></div><span className="text-xs text-muted-foreground">2h ago</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500"/><span className="text-sm">Results posted</span></div><span className="text-xs text-muted-foreground">1d ago</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500"/><span className="text-sm">Critical potassium alert</span></div><span className="text-xs text-muted-foreground">3d ago</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Orders</CardTitle>
              <CardDescription>Track orders and collection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map(o => (
                  <div key={o.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><TestTube className="h-4 w-4"/><span className="font-medium">Order #{o.id}</span></div>
                      {getStatusBadge(o.orderStatus)}
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div><span className="font-medium">Patient:</span> {o.patientId}</div>
                      <div><span className="font-medium">Panel:</span> {o.panelCode || 'Custom'}</div>
                      <div><span className="font-medium">Priority:</span> {o.priority}</div>
                      <div><span className="font-medium">Order Date:</span> {o.orderDate}</div>
                    </div>
                    <div className="mt-3 flex gap-2"><Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-2"/>Details</Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>View result values and flags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResults.map(r => (
                  <div key={r.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4"/><span className="font-medium">{r.analyteCode}</span></div>
                      <Badge className={r.flag === 'normal' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>{r.flag}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div><span className="font-medium">Value:</span> {r.resultValue} {r.unit}</div>
                      <div><span className="font-medium">Result Date:</span> {r.resultDatetime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAlerts.map(a => (
                  <div key={a.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4"/><span className="font-medium">{a.alertMessage}</span></div>
                      <Badge className={a.status === 'active' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>{a.status}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div><span className="font-medium">Patient:</span> {a.patientId}</div>
                      <div><span className="font-medium">Analyte:</span> {a.analyteCode}</div>
                      <div><span className="font-medium">Value:</span> {a.resultValue} {a.unit}</div>
                      <div><span className="font-medium">Time:</span> {a.alertedAt}</div>
                    </div>
                    <div className="mt-3 flex gap-2"><Button size="sm" variant="outline">Acknowledge</Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="panels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Panels</CardTitle>
              <CardDescription>Panel catalog and analytes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPanels.map(p => (
                  <div key={p.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><Beaker className="h-4 w-4"/><span className="font-medium">{p.panelName}</span></div>
                      <Badge variant="outline">{p.panelCode}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{p.description}</div>
                    <div className="mt-3">
                      <span className="font-medium">Analytes:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.analytes.map(a => (
                          <Badge key={a.code} variant="secondary" className="text-xs">{a.name} ({a.unit})</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedLabTracking;


