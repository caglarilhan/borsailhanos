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
  BookOpen, 
  GraduationCap, 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock,
  Award,
  Target,
  BarChart3,
  Globe,
  Microscope,
  Presentation,
  PenTool,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Star,
  CheckCircle
} from "lucide-react";

interface ResearchStudy {
  id: string;
  title: string;
  type: string;
  status: string;
  principalInvestigator: string;
  startDate: string;
  endDate: string;
  targetSampleSize: number;
  currentSampleSize: number;
  irbApprovalNumber: string;
  fundingSource: string;
  budgetAmount: number;
}

interface Publication {
  id: string;
  title: string;
  type: string;
  journalName: string;
  publicationDate: string;
  impactFactor: number;
  citationCount: number;
  status: string;
  authors: string[];
  doi: string;
}

interface CMEActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  provider: string;
  amaCredits: number;
  specialtyCredits: Record<string, number>;
  status: string;
  evaluationScore: number;
}

interface TeachingActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  learners: number;
  averageEvaluationScore: number;
  status: string;
  compensation: number;
}

const AcademicResearchManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const researchStudies: ResearchStudy[] = [
    {
      id: "1",
      title: "Efficacy of Novel Antidepressant in Treatment-Resistant Depression",
      type: "Clinical Trial",
      status: "active",
      principalInvestigator: "Dr. Sarah Johnson",
      startDate: "2024-01-15",
      endDate: "2026-01-15",
      targetSampleSize: 200,
      currentSampleSize: 85,
      irbApprovalNumber: "IRB-2024-001",
      fundingSource: "NIH R01",
      budgetAmount: 2500000
    },
    {
      id: "2",
      title: "Genetic Markers in Bipolar Disorder: A Longitudinal Study",
      type: "Observational",
      status: "recruiting",
      principalInvestigator: "Dr. Michael Chen",
      startDate: "2024-03-01",
      endDate: "2027-03-01",
      targetSampleSize: 500,
      currentSampleSize: 120,
      irbApprovalNumber: "IRB-2024-002",
      fundingSource: "Private Foundation",
      budgetAmount: 1800000
    },
    {
      id: "3",
      title: "Digital Therapeutics for Anxiety Disorders",
      type: "Pilot Study",
      status: "completed",
      principalInvestigator: "Dr. Emily Rodriguez",
      startDate: "2023-06-01",
      endDate: "2024-01-31",
      targetSampleSize: 50,
      currentSampleSize: 50,
      irbApprovalNumber: "IRB-2023-005",
      fundingSource: "Industry Grant",
      budgetAmount: 500000
    }
  ];

  const publications: Publication[] = [
    {
      id: "1",
      title: "Novel Approaches to Treatment-Resistant Depression: A Meta-Analysis",
      type: "Journal Article",
      journalName: "American Journal of Psychiatry",
      publicationDate: "2024-01-15",
      impactFactor: 18.2,
      citationCount: 45,
      status: "published",
      authors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Emily Rodriguez"],
      doi: "10.1176/appi.ajp.2024.12345"
    },
    {
      id: "2",
      title: "Genetic Risk Factors in Bipolar Disorder: Current Evidence",
      type: "Review Article",
      journalName: "Molecular Psychiatry",
      publicationDate: "2023-11-20",
      impactFactor: 13.4,
      citationCount: 28,
      status: "published",
      authors: ["Dr. Michael Chen", "Dr. Sarah Johnson"],
      doi: "10.1038/s41380-023-12345"
    },
    {
      id: "3",
      title: "Digital Therapeutics in Mental Health: A Systematic Review",
      type: "Systematic Review",
      journalName: "JAMA Psychiatry",
      publicationDate: "2023-09-10",
      impactFactor: 25.8,
      citationCount: 67,
      status: "published",
      authors: ["Dr. Emily Rodriguez", "Dr. Sarah Johnson"],
      doi: "10.1001/jamapsychiatry.2023.12345"
    }
  ];

  const cmeActivities: CMEActivity[] = [
    {
      id: "1",
      title: "Advances in Psychopharmacology 2024",
      type: "Conference",
      date: "2024-02-15",
      duration: 8,
      provider: "American Psychiatric Association",
      amaCredits: 8.0,
      specialtyCredits: { "Psychiatry": 8.0, "Addiction Medicine": 4.0 },
      status: "completed",
      evaluationScore: 4.8
    },
    {
      id: "2",
      title: "Digital Mental Health Interventions",
      type: "Webinar",
      date: "2024-01-20",
      duration: 2,
      provider: "Digital Psychiatry Society",
      amaCredits: 2.0,
      specialtyCredits: { "Psychiatry": 2.0 },
      status: "completed",
      evaluationScore: 4.5
    },
    {
      id: "3",
      title: "Genetic Counseling in Psychiatry",
      type: "Workshop",
      date: "2024-03-10",
      duration: 4,
      provider: "Genetics Society of America",
      amaCredits: 4.0,
      specialtyCredits: { "Psychiatry": 4.0, "Genetics": 4.0 },
      status: "scheduled",
      evaluationScore: 0
    }
  ];

  const teachingActivities: TeachingActivity[] = [
    {
      id: "1",
      title: "Psychiatry Resident Supervision",
      type: "Clinical Teaching",
      date: "2024-02-14",
      duration: 4,
      learners: 8,
      averageEvaluationScore: 4.7,
      status: "completed",
      compensation: 0
    },
    {
      id: "2",
      title: "Medical Student Psychiatry Rotation",
      type: "Medical Student Teaching",
      date: "2024-02-10",
      duration: 6,
      learners: 12,
      averageEvaluationScore: 4.6,
      status: "completed",
      compensation: 0
    },
    {
      id: "3",
      title: "Grand Rounds: Novel Antidepressants",
      type: "Grand Rounds",
      date: "2024-02-16",
      duration: 1,
      learners: 45,
      averageEvaluationScore: 4.8,
      status: "scheduled",
      compensation: 500
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'recruiting':
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'planning':
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudyTypeColor = (type: string) => {
    switch (type) {
      case 'Clinical Trial': return 'bg-purple-100 text-purple-800';
      case 'Observational': return 'bg-blue-100 text-blue-800';
      case 'Pilot Study': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPublicationTypeColor = (type: string) => {
    switch (type) {
      case 'Journal Article': return 'bg-green-100 text-green-800';
      case 'Review Article': return 'bg-blue-100 text-blue-800';
      case 'Systematic Review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Research & Education</h2>
          <p className="text-muted-foreground">
            Comprehensive academic research and continuing education management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Study
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="research">Research Studies</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="cme">CME Activities</TabsTrigger>
          <TabsTrigger value="teaching">Teaching</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Studies</CardTitle>
                <Microscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {researchStudies.filter(s => s.status === 'active' || s.status === 'recruiting').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Research studies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Publications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{publications.length}</div>
                <p className="text-xs text-muted-foreground">
                  This year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CME Credits</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cmeActivities.reduce((sum, activity) => sum + activity.amaCredits, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  AMA credits earned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teaching Hours</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teachingActivities.reduce((sum, activity) => sum + activity.duration, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hours this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Research Studies Overview</CardTitle>
                <CardDescription>
                  Current research studies and enrollment progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {researchStudies.slice(0, 3).map((study) => (
                  <div key={study.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{study.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {study.principalInvestigator} • {study.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {study.currentSampleSize}/{study.targetSampleSize}
                      </div>
                      <Progress 
                        value={(study.currentSampleSize / study.targetSampleSize) * 100} 
                        className="h-2 w-20" 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Publications</CardTitle>
                <CardDescription>
                  Latest publications and impact metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {publications.slice(0, 3).map((pub) => (
                  <div key={pub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{pub.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {pub.journalName} • IF: {pub.impactFactor}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{pub.citationCount}</div>
                      <p className="text-xs text-muted-foreground">Citations</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Research Studies</CardTitle>
              <CardDescription>
                Manage research studies, track enrollment, and monitor progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {researchStudies.map((study) => (
                  <div key={study.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{study.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          PI: {study.principalInvestigator} • {study.startDate} - {study.endDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStudyTypeColor(study.type)}>
                          {study.type}
                        </Badge>
                        <Badge className={getStatusColor(study.status)}>
                          {study.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <Label className="text-sm font-medium">Enrollment Progress</Label>
                        <div className="mt-2">
                          <Progress value={(study.currentSampleSize / study.targetSampleSize) * 100} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">
                            {study.currentSampleSize}/{study.targetSampleSize} ({Math.round((study.currentSampleSize / study.targetSampleSize) * 100)}%)
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">IRB Approval</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {study.irbApprovalNumber}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Funding</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {study.fundingSource}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Budget</Label>
                        <p className="text-sm mt-1 font-medium">
                          ${(study.budgetAmount / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        Participants
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publications</CardTitle>
              <CardDescription>
                Track academic publications, citations, and impact metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publications.map((pub) => (
                  <div key={pub.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{pub.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pub.journalName} • {pub.publicationDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPublicationTypeColor(pub.type)}>
                          {pub.type}
                        </Badge>
                        <Badge className={getStatusColor(pub.status)}>
                          {pub.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <Label className="text-sm font-medium">Impact Factor</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {pub.impactFactor}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Journal impact
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Citations</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-green-600">
                            {pub.citationCount}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Total citations
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Authors</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {pub.authors.length} authors
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">DOI</Label>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {pub.doi}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Paper
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Track Citations
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

        <TabsContent value="cme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Continuing Medical Education</CardTitle>
              <CardDescription>
                Track CME activities, credits earned, and professional development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cmeActivities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.provider} • {activity.date} • {activity.duration} hours
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">AMA Credits</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {activity.amaCredits}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Credits earned
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Specialty Credits</Label>
                        <div className="mt-2">
                          {Object.entries(activity.specialtyCredits).map(([specialty, credits]) => (
                            <div key={specialty} className="flex justify-between text-sm">
                              <span>{specialty}:</span>
                              <span className="font-medium">{credits}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Evaluation</Label>
                        <div className="mt-2">
                          {activity.evaluationScore > 0 ? (
                            <div className="flex items-center">
                              <div className="text-2xl font-bold text-yellow-600">
                                {activity.evaluationScore}/5
                              </div>
                              <Star className="h-4 w-4 text-yellow-500 ml-1" />
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Pending</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Certificate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download Credits
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Evaluate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teaching & Mentoring</CardTitle>
              <CardDescription>
                Track teaching activities, evaluations, and educational impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachingActivities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.type} • {activity.date} • {activity.duration} hours
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Learners</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-green-600">
                            {activity.learners}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Students/residents
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Evaluation Score</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {activity.averageEvaluationScore}/5
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Average rating
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Compensation</Label>
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-purple-600">
                            ${activity.compensation}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Honorarium
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Evaluations
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
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

export default AcademicResearchManagement;
