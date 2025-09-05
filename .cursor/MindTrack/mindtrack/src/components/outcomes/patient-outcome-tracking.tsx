'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Activity,
  Plus,
  Edit,
  FileText,
  Calendar,
  BarChart3,
  ArrowUp
} from "lucide-react";

export default function PatientOutcomeTracking() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patient Outcome Tracking</h2>
          <p className="text-muted-foreground">
            Comprehensive patient outcome tracking and analytics for American psychiatrists
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Measure
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measures</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Outcome measures tracked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improved Measures</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">
              67% improvement rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <p className="text-xs text-muted-foreground">
              2 achieved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">24</div>
            <p className="text-xs text-muted-foreground">
              18 positive outcomes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measures">Outcome Measures</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Outcome Measures</CardTitle>
                <CardDescription>Latest patient outcome measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Depression Severity - John Doe
                        </p>
                        <p className="text-sm text-muted-foreground">
                          4.2 score • 1/15/2024
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        clinical
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Improved
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
                <CardDescription>Current patient outcome goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Reduce Depression Symptoms - John Doe
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Target: 3/1/2024
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        clinical
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        65% Complete
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="measures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Outcome Measures</CardTitle>
              <CardDescription>Comprehensive patient outcome measurements and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <BarChart3 className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            Depression Severity - John Doe
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            clinical
                          </Badge>
                          <Badge variant="outline">continuous</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Measurement Date: 1/15/2024
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tool: PHQ-9 (rating_scale)
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">
                        4.2 score
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          Improved
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="flex justify-between text-sm">
                        <span>Baseline:</span>
                        <span>8.5 score</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current:</span>
                        <span>4.2 score</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span>3.0 score</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Clinical Significance:</p>
                    <p className="text-sm text-muted-foreground">clinically meaningful</p>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-muted-foreground">Significant improvement in depression symptoms</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Outcome Goals</CardTitle>
              <CardDescription>Patient-centered outcome goals and progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            Reduce Depression Symptoms - John Doe
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            clinical
                          </Badge>
                          <Badge variant="outline">medium term</Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Target Date: 3/1/2024
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Achieve remission of major depressive episode
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Success Criteria: PHQ-9 score &lt; 5
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">
                        65%
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        In Progress
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="flex justify-between text-sm">
                        <span>Baseline:</span>
                        <span>8.5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span>3.0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frequency:</span>
                        <span>weekly</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Progress Notes:</p>
                    <p className="text-sm text-muted-foreground">Making good progress with current treatment</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Outcome Sessions</CardTitle>
              <CardDescription>Clinical sessions and outcome tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Activity className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            John Doe
                          </h3>
                          <Badge className="bg-green-100 text-green-800">
                            follow up
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            positive
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Session Date: 1/15/2024
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: 45 minutes
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Diagnosis: Major Depressive Disorder
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm">
                        <div className="font-semibold">4/5</div>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">5/5</div>
                        <p className="text-xs text-muted-foreground">Alliance</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Session Objectives:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Assess mood improvement</li>
                      <li>Review medication response</li>
                    </ul>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Interventions Provided:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>Cognitive Behavioral Therapy</li>
                      <li>Medication management</li>
                    </ul>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium">Clinical Notes:</p>
                    <p className="text-sm text-muted-foreground">Patient reports significant improvement in mood and sleep</p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Outcome Analytics</CardTitle>
              <CardDescription>Comprehensive analytics and outcome metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        John Doe
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analysis Period: 12/1/2023 - 1/15/2024
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-sm text-muted-foreground">Outcome Measures</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        33.3%
                      </div>
                      <p className="text-sm text-muted-foreground">Goal Achievement</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        75.0%
                      </div>
                      <p className="text-sm text-muted-foreground">Positive Sessions</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Session Duration:</span>
                        <span>45 minutes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Engagement Level:</span>
                        <span>4.2/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Therapeutic Alliance:</span>
                        <span>4.8/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Functional Improvement Rate:</span>
                        <span>60.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Quality of Life Improvement:</span>
                        <span>45.0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Symptom Reduction Rate:</span>
                        <span>70.0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}