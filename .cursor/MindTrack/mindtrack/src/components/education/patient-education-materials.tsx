'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Activity, 
  TrendingUp,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  Award,
  GraduationCap
} from 'lucide-react';

// Interfaces
interface PatientEducationMaterial {
  id: string;
  material_title: string;
  material_type: string;
  material_category: string;
  material_description: string;
  material_language: string;
  target_audience: string;
  difficulty_level: string;
  estimated_completion_time: number;
  material_status: string;
  approval_status: string;
  accessibility_features: string[];
  learning_objectives: string[];
  key_points: string[];
}

interface PatientEducationAssignment {
  id: string;
  patient_id: string;
  material_id: string;
  assignment_date: string;
  due_date: string;
  priority_level: string;
  assignment_type: string;
  assignment_status: string;
  completion_percentage: number;
  assessment_score: number;
  patient_rating: number;
  follow_up_required: boolean;
}

interface PatientEducationCompliance {
  id: string;
  patient_id: string;
  compliance_period_start: string;
  compliance_period_end: string;
  total_assignments: number;
  completed_assignments: number;
  compliance_rate: number;
  average_completion_time: number;
  average_assessment_score: number;
  engagement_score: number;
}

export function PatientEducationMaterials() {
  const [activeTab, setActiveTab] = useState('overview');
  const [materials, setMaterials] = useState<PatientEducationMaterial[]>([]);
  const [assignments, setAssignments] = useState<PatientEducationAssignment[]>([]);
  const [compliance, setCompliance] = useState<PatientEducationCompliance[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setMaterials([
      {
        id: '1',
        material_title: 'Understanding Depression',
        material_type: 'video',
        material_category: 'condition_education',
        material_description: 'Comprehensive video about depression symptoms, causes, and treatment options',
        material_language: 'en',
        target_audience: 'adult',
        difficulty_level: 'beginner',
        estimated_completion_time: 15,
        material_status: 'active',
        approval_status: 'approved',
        accessibility_features: ['closed_captions', 'audio_description'],
        learning_objectives: ['Understand depression symptoms', 'Learn about treatment options'],
        key_points: ['Depression is treatable', 'Seek professional help']
      },
      {
        id: '2',
        material_title: 'Medication Safety Guide',
        material_type: 'document',
        material_category: 'medication_education',
        material_description: 'Important safety information about psychiatric medications',
        material_language: 'en',
        target_audience: 'adult',
        difficulty_level: 'intermediate',
        estimated_completion_time: 10,
        material_status: 'active',
        approval_status: 'approved',
        accessibility_features: ['screen_reader', 'large_text'],
        learning_objectives: ['Understand medication safety', 'Recognize side effects'],
        key_points: ['Take medications as prescribed', 'Report side effects immediately']
      }
    ]);

    setAssignments([
      {
        id: '1',
        patient_id: 'patient-1',
        material_id: '1',
        assignment_date: '2024-01-25',
        due_date: '2024-02-01',
        priority_level: 'high',
        assignment_type: 'required',
        assignment_status: 'completed',
        completion_percentage: 1.0,
        assessment_score: 0.85,
        patient_rating: 5,
        follow_up_required: false
      },
      {
        id: '2',
        patient_id: 'patient-2',
        material_id: '2',
        assignment_date: '2024-01-24',
        due_date: '2024-01-31',
        priority_level: 'medium',
        assignment_type: 'recommended',
        assignment_status: 'in_progress',
        completion_percentage: 0.6,
        assessment_score: 0.0,
        patient_rating: 0,
        follow_up_required: true
      }
    ]);

    setCompliance([
      {
        id: '1',
        patient_id: 'patient-1',
        compliance_period_start: '2024-01-01',
        compliance_period_end: '2024-01-31',
        total_assignments: 5,
        completed_assignments: 4,
        compliance_rate: 0.8,
        average_completion_time: 12,
        average_assessment_score: 0.82,
        engagement_score: 0.75
      }
    ]);
  }, []);

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Pause className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Activity className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'overdue': return 'destructive';
      case 'assigned': return 'default';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'default';
      case 'intermediate': return 'secondary';
      case 'advanced': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patient Education Materials</h2>
          <p className="text-muted-foreground">
            Comprehensive patient education library and assignment management
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Material
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials Library</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{materials.length}</div>
                <p className="text-xs text-muted-foreground">
                  {materials.filter(m => m.approval_status === 'approved').length} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {assignments.filter(a => a.assignment_status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {compliance.length > 0 ? (compliance[0].compliance_rate * 100).toFixed(0) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average engagement score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assignments.filter(a => a.follow_up_required).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Required follow-ups
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Materials</CardTitle>
                <CardDescription>Latest education materials added</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {materials.slice(0, 3).map((material) => (
                  <div key={material.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{material.material_title}</p>
                      <p className="text-xs text-muted-foreground">{material.material_category}</p>
                    </div>
                    <div className="flex gap-2">
                      {getMaterialTypeIcon(material.material_type)}
                      <Badge variant={getDifficultyColor(material.difficulty_level)}>
                        {material.difficulty_level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignment Status</CardTitle>
                <CardDescription>Current assignment status overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Patient {assignment.patient_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {(assignment.completion_percentage * 100).toFixed(0)}% complete
                      </p>
                    </div>
                    <Badge variant={getStatusColor(assignment.assignment_status)}>
                      {assignment.assignment_status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education Materials Library</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{material.material_title}</CardTitle>
                    <div className="flex gap-2">
                      {getMaterialTypeIcon(material.material_type)}
                      <Badge variant={getDifficultyColor(material.difficulty_level)}>
                        {material.difficulty_level}
                      </Badge>
                      <Badge variant="default">{material.target_audience}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {material.material_category} - {material.material_language.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{material.material_description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Estimated Time</p>
                      <p className="text-sm text-muted-foreground">{material.estimated_completion_time} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Accessibility</p>
                      <p className="text-sm text-muted-foreground">
                        {material.accessibility_features.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Learning Objectives:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {material.learning_objectives.map((objective, index) => (
                        <li key={index}>• {objective}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status: {material.material_status} | Approval: {material.approval_status}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Assignments</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Assignment
            </Button>
          </div>

          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {assignment.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(assignment.priority_level)}>
                        {assignment.priority_level}
                      </Badge>
                      <Badge variant={getStatusColor(assignment.assignment_status)}>
                        {assignment.assignment_status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Material {assignment.material_id} - Due: {assignment.due_date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm">{(assignment.completion_percentage * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${assignment.completion_percentage * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Assessment Score</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.assessment_score > 0 ? (assignment.assessment_score * 100).toFixed(0) : 'N/A'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Patient Rating</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < assignment.patient_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {assignment.follow_up_required && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Follow-up required for this assignment
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education Compliance</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Calculate Compliance
            </Button>
          </div>

          <div className="grid gap-4">
            {compliance.map((comp) => (
              <Card key={comp.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient {comp.patient_id}</CardTitle>
                    <Badge variant="default">
                      {(comp.compliance_rate * 100).toFixed(0)}% Compliant
                    </Badge>
                  </div>
                  <CardDescription>
                    {comp.compliance_period_start} to {comp.compliance_period_end}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Total Assignments</p>
                      <p className="text-sm text-muted-foreground">{comp.total_assignments}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-sm text-muted-foreground">{comp.completed_assignments}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Time</p>
                      <p className="text-sm text-muted-foreground">{comp.average_completion_time} min</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Average Score</p>
                      <p className="text-sm text-muted-foreground">
                        {(comp.average_assessment_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className="text-sm">{(comp.engagement_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${comp.engagement_score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress Trends</CardTitle>
                <CardDescription>Patient education progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Progress trends chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Analysis</CardTitle>
                <CardDescription>Patient engagement patterns and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <span className="ml-2">Engagement analysis chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Material Effectiveness</CardTitle>
                <CardDescription>Education material effectiveness analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <GraduationCap className="h-8 w-8" />
                  <span className="ml-2">Material effectiveness chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Analytics</CardTitle>
                <CardDescription>Education compliance trends and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Award className="h-8 w-8" />
                  <span className="ml-2">Compliance analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




