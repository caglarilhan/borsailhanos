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
  Brain, 
  Heart, 
  Users, 
  BookOpen, 
  Target, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  Share2, 
  MessageSquare, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Zap, 
  Lightbulb, 
  Shield, 
  Star, 
  Award, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Bell, 
  AlertCircle, 
  Info, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  MapPin, 
  Compass, 
  Navigation
} from 'lucide-react';

interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  date: string;
  duration: number;
  type: 'individual' | 'group' | 'family' | 'couples';
  modality: 'cbt' | 'dbt' | 'emdr' | 'mindfulness' | 'psychodynamic' | 'humanistic' | 'other';
  goals: string[];
  interventions: TherapyIntervention[];
  homework: HomeworkAssignment[];
  notes: string;
  moodRating: number;
  progressNotes: string;
  nextSessionPlan: string;
  createdAt: string;
}

interface TherapyIntervention {
  id: string;
  name: string;
  description: string;
  duration: number;
  effectiveness: number;
  notes: string;
  tools: string[];
}

interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  type: 'journaling' | 'practice' | 'reading' | 'exercise' | 'other';
  dueDate: string;
  status: 'assigned' | 'completed' | 'overdue';
  patientNotes?: string;
  therapistFeedback?: string;
}

interface TreatmentPlan {
  id: string;
  patientId: string;
  therapistId: string;
  diagnosis: string;
  goals: TreatmentGoal[];
  interventions: string[];
  timeline: string;
  progressMetrics: string[];
  status: 'active' | 'completed' | 'on_hold';
  createdAt: string;
  updatedAt: string;
}

interface TreatmentGoal {
  id: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  milestones: string[];
}

interface Assessment {
  id: string;
  patientId: string;
  therapistId: string;
  name: string;
  type: 'phq9' | 'gad7' | 'dass21' | 'beck_depression' | 'beck_anxiety' | 'custom';
  questions: AssessmentQuestion[];
  results: AssessmentResult;
  completedAt: string;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'yes_no';
  options?: string[];
  required: boolean;
}

interface AssessmentResult {
  totalScore: number;
  categoryScores: { [key: string]: number };
  interpretation: string;
  recommendations: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

interface TherapyToolsProps {
  patientId: string;
  providerId: string;
  providerType: 'psychiatrist' | 'psychologist';
}

export default function TherapyTools({ patientId, providerId, providerType }: TherapyToolsProps) {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'plans' | 'assessments' | 'tools'>('sessions');

  // Show therapy tools for both psychologists and psychiatrists, but emphasize psychology focus
  useEffect(() => {
    loadSessions();
    loadTreatmentPlans();
    loadAssessments();
  }, [patientId]);

  const loadSessions = async () => {
    try {
      const response = await fetch(`/api/psychology/therapy-sessions?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading therapy sessions:', error);
    }
  };

  const loadTreatmentPlans = async () => {
    try {
      const response = await fetch(`/api/psychology/treatment-plans?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setTreatmentPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading treatment plans:', error);
    }
  };

  const loadAssessments = async () => {
    try {
      const response = await fetch(`/api/psychology/assessments?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  const createSession = async (sessionData: Partial<TherapySession>) => {
    try {
      const response = await fetch('/api/psychology/therapy-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          patientId,
          therapistId: providerId
        }),
      });

      if (response.ok) {
        await loadSessions();
        return true;
      }
    } catch (error) {
      console.error('Error creating therapy session:', error);
    }
    return false;
  };

  const createTreatmentPlan = async (planData: Partial<TreatmentPlan>) => {
    try {
      const response = await fetch('/api/psychology/treatment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planData,
          patientId,
          therapistId: providerId
        }),
      });

      if (response.ok) {
        await loadTreatmentPlans();
        return true;
      }
    } catch (error) {
      console.error('Error creating treatment plan:', error);
    }
    return false;
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'cbt': return <Brain className="h-4 w-4" />;
      case 'dbt': return <Heart className="h-4 w-4" />;
      case 'emdr': return <Zap className="h-4 w-4" />;
      case 'mindfulness': return <Compass className="h-4 w-4" />;
      case 'psychodynamic': return <Users className="h-4 w-4" />;
      case 'humanistic': return <Star className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case 'cbt': return 'bg-blue-100 text-blue-800';
      case 'dbt': return 'bg-pink-100 text-pink-800';
      case 'emdr': return 'bg-yellow-100 text-yellow-800';
      case 'mindfulness': return 'bg-green-100 text-green-800';
      case 'psychodynamic': return 'bg-purple-100 text-purple-800';
      case 'humanistic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSession = (session: TherapySession) => (
    <Card key={session.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getModalityIcon(session.modality)}
            <div>
              <CardTitle className="text-lg">
                {session.modality.toUpperCase()} Session
              </CardTitle>
              <CardDescription>
                {new Date(session.date).toLocaleDateString()} - {session.duration} minutes
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getModalityColor(session.modality)}>
              {session.modality}
            </Badge>
            <Badge variant="outline">
              {session.type}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSession(session)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Mood Rating</Label>
              <div className="flex items-center space-x-2">
                <Progress value={session.moodRating * 10} className="flex-1" />
                <span className="text-sm font-medium">{session.moodRating}/10</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Interventions</Label>
              <div className="text-sm text-muted-foreground">
                {session.interventions.length} used
              </div>
            </div>
          </div>
          {session.goals.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Goals</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {session.goals.map((goal, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {session.notes && (
            <div>
              <Label className="text-sm font-medium">Session Notes</Label>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {session.notes}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTreatmentPlan = (plan: TreatmentPlan) => (
    <Card key={plan.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-lg">Treatment Plan</CardTitle>
              <CardDescription>
                Created {new Date(plan.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(plan.status)}>
              {plan.status.replace('_', ' ')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlan(plan)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Diagnosis</Label>
            <div className="text-sm text-muted-foreground">{plan.diagnosis}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Goals ({plan.goals.length})</Label>
            <div className="space-y-1 mt-1">
              {plan.goals.slice(0, 3).map((goal, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Progress value={goal.progress} className="flex-1" />
                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                </div>
              ))}
              {plan.goals.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{plan.goals.length - 3} more goals
                </div>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Timeline</Label>
            <div className="text-sm text-muted-foreground">{plan.timeline}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAssessment = (assessment: Assessment) => (
    <Card key={assessment.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-lg">{assessment.name}</CardTitle>
              <CardDescription>
                Completed {new Date(assessment.completedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(assessment.results.severity)}>
              {assessment.results.severity}
            </Badge>
            <div className="text-sm font-medium">
              Score: {assessment.results.totalScore}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAssessment(assessment)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Interpretation</Label>
            <div className="text-sm text-muted-foreground">
              {assessment.results.interpretation}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Recommendations</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {assessment.results.recommendations.slice(0, 3).map((rec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {rec}
                </Badge>
              ))}
              {assessment.results.recommendations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{assessment.results.recommendations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const therapyTools = [
    {
      name: 'CBT Thought Record',
      description: 'Cognitive Behavioral Therapy thought challenging worksheet',
      modality: 'cbt',
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'DBT Distress Tolerance',
      description: 'Dialectical Behavior Therapy crisis survival skills',
      modality: 'dbt',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-pink-100 text-pink-800'
    },
    {
      name: 'EMDR Bilateral Stimulation',
      description: 'Eye Movement Desensitization and Reprocessing tool',
      modality: 'emdr',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      name: 'Mindfulness Meditation',
      description: 'Guided mindfulness and breathing exercises',
      modality: 'mindfulness',
      icon: <Compass className="h-6 w-6" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Mood Tracker',
      description: 'Daily mood and emotion tracking tool',
      modality: 'general',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'Goal Setting Worksheet',
      description: 'SMART goals and action planning template',
      modality: 'general',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Therapy Tools</h1>
          <p className="text-muted-foreground">
            Comprehensive therapy tools and interventions for psychological treatment
            {providerType === 'psychologist' && (
              <span className="ml-2 text-green-600 font-medium">(Primary Focus)</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setSelectedSession({} as TherapySession)}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'sessions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sessions')}
          className="flex-1"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Sessions
        </Button>
        <Button
          variant={activeTab === 'plans' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('plans')}
          className="flex-1"
        >
          <Target className="h-4 w-4 mr-2" />
          Treatment Plans
        </Button>
        <Button
          variant={activeTab === 'assessments' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('assessments')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Assessments
        </Button>
        <Button
          variant={activeTab === 'tools' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('tools')}
          className="flex-1"
        >
          <Brain className="h-4 w-4 mr-2" />
          Tools
        </Button>
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Therapy Sessions</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start documenting therapy sessions to track progress
                </p>
                <Button onClick={() => setSelectedSession({} as TherapySession)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map(renderSession)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Treatment Plans</h2>
            <Button onClick={() => setSelectedPlan({} as TreatmentPlan)}>
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>

          {treatmentPlans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Treatment Plans</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create a comprehensive treatment plan for your patient
                </p>
                <Button onClick={() => setSelectedPlan({} as TreatmentPlan)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Treatment Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {treatmentPlans.map(renderTreatmentPlan)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Psychological Assessments</h2>
            <Button onClick={() => setSelectedAssessment({} as Assessment)}>
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>

          {assessments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Conduct psychological assessments to measure progress
                </p>
                <Button onClick={() => setSelectedAssessment({} as Assessment)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assessments.map(renderAssessment)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Therapy Tools & Interventions</h2>
            <p className="text-sm text-muted-foreground">
              Interactive tools for various therapeutic modalities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {therapyTools.map((tool, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded ${tool.color}`}>
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className={tool.color}>
                      {tool.modality}
                    </Badge>
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Use Tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Assessment Tools</CardTitle>
              <CardDescription>
                Standardized psychological assessment instruments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Depression & Anxiety</h4>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      PHQ-9 (Depression)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      GAD-7 (Anxiety)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      DASS-21 (Stress)
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Other Assessments</h4>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Beck Depression Inventory
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Beck Anxiety Inventory
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Custom Assessment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedSession.id ? 'Session Details' : 'New Therapy Session'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedSession.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Date</Label>
                        <div className="text-sm text-muted-foreground">
                          {new Date(selectedSession.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Duration</Label>
                        <div className="text-sm text-muted-foreground">
                          {selectedSession.duration} minutes
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Modality</Label>
                        <div className="mt-1">
                          <Badge className={getModalityColor(selectedSession.modality)}>
                            {selectedSession.modality.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <div className="text-sm text-muted-foreground capitalize">
                          {selectedSession.type}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Session Notes</Label>
                      <div className="text-sm text-muted-foreground">
                        {selectedSession.notes}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Progress Notes</Label>
                      <div className="text-sm text-muted-foreground">
                        {selectedSession.progressNotes}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Next Session Plan</Label>
                      <div className="text-sm text-muted-foreground">
                        {selectedSession.nextSessionPlan}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-date">Date</Label>
                        <Input
                          id="session-date"
                          type="date"
                          value={selectedSession.date || ''}
                          onChange={(e) => setSelectedSession({
                            ...selectedSession,
                            date: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="session-duration">Duration (minutes)</Label>
                        <Input
                          id="session-duration"
                          type="number"
                          value={selectedSession.duration || 60}
                          onChange={(e) => setSelectedSession({
                            ...selectedSession,
                            duration: parseInt(e.target.value)
                          })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session-modality">Modality</Label>
                        <select
                          id="session-modality"
                          className="w-full p-2 border rounded"
                          value={selectedSession.modality || 'cbt'}
                          onChange={(e) => setSelectedSession({
                            ...selectedSession,
                            modality: e.target.value as any
                          })}
                        >
                          <option value="cbt">CBT</option>
                          <option value="dbt">DBT</option>
                          <option value="emdr">EMDR</option>
                          <option value="mindfulness">Mindfulness</option>
                          <option value="psychodynamic">Psychodynamic</option>
                          <option value="humanistic">Humanistic</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="session-type">Type</Label>
                        <select
                          id="session-type"
                          className="w-full p-2 border rounded"
                          value={selectedSession.type || 'individual'}
                          onChange={(e) => setSelectedSession({
                            ...selectedSession,
                            type: e.target.value as any
                          })}
                        >
                          <option value="individual">Individual</option>
                          <option value="group">Group</option>
                          <option value="family">Family</option>
                          <option value="couples">Couples</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="session-notes">Session Notes</Label>
                      <Textarea
                        id="session-notes"
                        value={selectedSession.notes || ''}
                        onChange={(e) => setSelectedSession({
                          ...selectedSession,
                          notes: e.target.value
                        })}
                        placeholder="Document the session..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mood-rating">Mood Rating (1-10)</Label>
                      <Input
                        id="mood-rating"
                        type="number"
                        min="1"
                        max="10"
                        value={selectedSession.moodRating || 5}
                        onChange={(e) => setSelectedSession({
                          ...selectedSession,
                          moodRating: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSession(null)}
                  >
                    Cancel
                  </Button>
                  {!selectedSession.id && (
                    <Button
                      onClick={async () => {
                        await createSession(selectedSession);
                        setSelectedSession(null);
                      }}
                    >
                      Create Session
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
