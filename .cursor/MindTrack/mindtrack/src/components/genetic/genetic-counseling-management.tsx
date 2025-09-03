"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dna, 
  Users, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Shield,
  Heart,
  Baby,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Download,
  Share2
} from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  livingStatus: 'living' | 'deceased' | 'unknown';
  psychiatricConditions: string[];
  suicideAttempts: number;
  suicideCompletions: number;
  geneticTestingCompleted: boolean;
}

interface GeneticRiskAssessment {
  id: string;
  condition: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  familyHistoryScore: number;
  geneticVariantScore: number;
  probabilityEstimate: number;
  recommendations: string;
}

interface GeneticTestingOrder {
  id: string;
  testType: string;
  testingLab: string;
  orderDate: string;
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed';
  expectedResultsDate: string;
  insuranceCoverage: boolean;
  outOfPocketCost: number;
}

const GeneticCounselingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const familyHistory: FamilyMember[] = [
    {
      id: "1",
      name: "John Smith",
      relationship: "Father",
      age: 65,
      livingStatus: "living",
      psychiatricConditions: ["Major Depression", "Anxiety"],
      suicideAttempts: 1,
      suicideCompletions: 0,
      geneticTestingCompleted: false
    },
    {
      id: "2",
      name: "Mary Smith",
      relationship: "Mother",
      age: 62,
      livingStatus: "living",
      psychiatricConditions: ["Bipolar Disorder"],
      suicideAttempts: 0,
      suicideCompletions: 0,
      geneticTestingCompleted: true
    },
    {
      id: "3",
      name: "Robert Smith",
      relationship: "Brother",
      age: 35,
      livingStatus: "living",
      psychiatricConditions: ["Schizophrenia"],
      suicideAttempts: 2,
      suicideCompletions: 0,
      geneticTestingCompleted: false
    }
  ];

  const geneticRisks: GeneticRiskAssessment[] = [
    {
      id: "1",
      condition: "Schizophrenia",
      riskLevel: "high",
      familyHistoryScore: 7,
      geneticVariantScore: 3.2,
      probabilityEstimate: 12.5,
      recommendations: "Regular monitoring, early intervention strategies, family education"
    },
    {
      id: "2",
      condition: "Bipolar Disorder",
      riskLevel: "moderate",
      familyHistoryScore: 5,
      geneticVariantScore: 1.8,
      probabilityEstimate: 8.3,
      recommendations: "Mood monitoring, stress management, regular psychiatric follow-up"
    },
    {
      id: "3",
      condition: "Major Depression",
      riskLevel: "moderate",
      familyHistoryScore: 6,
      geneticVariantScore: 2.1,
      probabilityEstimate: 15.2,
      recommendations: "Depression screening, cognitive behavioral therapy, medication monitoring"
    }
  ];

  const geneticTestingOrders: GeneticTestingOrder[] = [
    {
      id: "1",
      testType: "Psychiatric Panel",
      testingLab: "Genomics Lab Inc.",
      orderDate: "2024-01-15",
      status: "completed",
      expectedResultsDate: "2024-02-15",
      insuranceCoverage: true,
      outOfPocketCost: 150
    },
    {
      id: "2",
      testType: "Pharmacogenomic Panel",
      testingLab: "PGx Solutions",
      orderDate: "2024-02-01",
      status: "in_progress",
      expectedResultsDate: "2024-03-01",
      insuranceCoverage: false,
      outOfPocketCost: 450
    }
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'sample_collected': return 'bg-purple-100 text-purple-800';
      case 'ordered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Genetic Counseling Management</h2>
          <p className="text-muted-foreground">
            Comprehensive genetic counseling and family history management for psychiatric care
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="family-history">Family History</TabsTrigger>
          <TabsTrigger value="risk-assessments">Risk Assessments</TabsTrigger>
          <TabsTrigger value="genetic-testing">Genetic Testing</TabsTrigger>
          <TabsTrigger value="counseling-sessions">Counseling Sessions</TabsTrigger>
          <TabsTrigger value="reproductive-planning">Reproductive Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Family Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{familyHistory.length}</div>
                <p className="text-xs text-muted-foreground">
                  With psychiatric history
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Conditions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {geneticRisks.filter(r => r.riskLevel === 'high' || r.riskLevel === 'very_high').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiring monitoring
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Genetic Tests</CardTitle>
                <Dna className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{geneticTestingOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ordered this year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Counseling Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Last 6 months
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Genetic Risk Summary</CardTitle>
                <CardDescription>
                  Current risk assessments for major psychiatric conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {geneticRisks.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{risk.condition}</h4>
                      <p className="text-sm text-muted-foreground">
                        Probability: {risk.probabilityEstimate}%
                      </p>
                    </div>
                    <Badge className={getRiskLevelColor(risk.riskLevel)}>
                      {risk.riskLevel.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Genetic Testing</CardTitle>
                <CardDescription>
                  Latest genetic testing orders and results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {geneticTestingOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{order.testType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.testingLab} • {order.orderDate}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="family-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Family History</CardTitle>
              <CardDescription>
                Comprehensive family psychiatric history tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyHistory.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.relationship} • Age: {member.age} • {member.livingStatus}
                        </p>
                      </div>
                      <Badge variant={member.geneticTestingCompleted ? "default" : "secondary"}>
                        {member.geneticTestingCompleted ? "Tested" : "Not Tested"}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Psychiatric Conditions</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.psychiatricConditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Suicide History</Label>
                        <div className="mt-1 text-sm">
                          <p>Attempts: {member.suicideAttempts}</p>
                          <p>Completions: {member.suicideCompletions}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Actions</Label>
                        <div className="flex gap-2 mt-1">
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Dna className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Risk Assessments</CardTitle>
              <CardDescription>
                Detailed risk analysis for psychiatric conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geneticRisks.map((risk) => (
                  <div key={risk.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{risk.condition}</h3>
                      <Badge className={getRiskLevelColor(risk.riskLevel)}>
                        {risk.riskLevel.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium">Risk Factors</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Family History Score:</span>
                            <span className="font-medium">{risk.familyHistoryScore}/10</span>
                          </div>
                          <Progress value={risk.familyHistoryScore * 10} className="h-2" />
                          
                          <div className="flex justify-between text-sm">
                            <span>Genetic Variant Score:</span>
                            <span className="font-medium">{risk.geneticVariantScore}</span>
                          </div>
                          <Progress value={risk.geneticVariantScore * 20} className="h-2" />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Probability Estimate</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {risk.probabilityEstimate}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Lifetime risk estimate
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Clinical Recommendations</Label>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {risk.recommendations}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                      <Button size="sm" variant="outline">
                        <Dna className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Counsel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genetic-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Testing Orders</CardTitle>
              <CardDescription>
                Manage genetic testing orders and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geneticTestingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{order.testType}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.testingLab} • Ordered: {order.orderDate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Expected Results</Label>
                        <p className="text-sm mt-1">{order.expectedResultsDate}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Insurance Coverage</Label>
                        <Badge variant={order.insuranceCoverage ? "default" : "secondary"} className="mt-1">
                          {order.insuranceCoverage ? "Covered" : "Not Covered"}
                        </Badge>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Out-of-Pocket Cost</Label>
                        <p className="text-sm mt-1 font-medium">${order.outOfPocketCost}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        View Results
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counseling-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Counseling Sessions</CardTitle>
              <CardDescription>
                Track genetic counseling sessions and outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Initial Genetic Counseling</h3>
                      <p className="text-sm text-muted-foreground">
                        January 15, 2024 • 60 minutes • Dr. Sarah Johnson
                      </p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Session Summary</Label>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Discussed family history, genetic risk factors, and testing options. 
                        Patient expressed concerns about children's risk and requested testing.
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Genetic Risks Discussed</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline">Schizophrenia</Badge>
                        <Badge variant="outline">Bipolar Disorder</Badge>
                        <Badge variant="outline">Major Depression</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Testing Recommendations</Label>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Psychiatric panel and pharmacogenomic testing recommended
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reproductive-planning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reproductive Planning</CardTitle>
              <CardDescription>
                Family planning considerations and genetic risk counseling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Family Planning Assessment</h3>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Reproductive Goals</Label>
                      <p className="text-sm mt-1 text-muted-foreground">
                        Planning to start a family within 2-3 years
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Genetic Risks Assessed</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline">Schizophrenia</Badge>
                        <Badge variant="outline">Bipolar Disorder</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Risk Mitigation Strategies</Label>
                    <ul className="text-sm mt-1 text-muted-foreground list-disc list-inside">
                      <li>Preconception genetic counseling</li>
                      <li>Prenatal testing options</li>
                      <li>Early intervention planning</li>
                      <li>Family support preparation</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Baby className="h-3 w-3 mr-1" />
                      Preconception
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-3 w-3 mr-1" />
                      Partner Testing
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      Safety Plan
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneticCounselingManagement;
