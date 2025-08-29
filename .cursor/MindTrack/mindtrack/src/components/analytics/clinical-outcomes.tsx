"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Heart,
  Brain,
  Zap,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Microscope,
  TestTube,
  Stethoscope,
  Pill,
  ActivitySquare,
  BrainCircuit,
  Neuron,
  Synapse,
  CircuitBoard,
  Database,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ScatterChart,
  AreaChart,
  CandlestickChart,
  Radar,
  Gauge,
  Thermometer,
  Droplets,
  Pulse,
  Heartbeat,
  BrainActivity,
  BrainWave,
  BrainScan,
  BrainMri,
  BrainCt,
  BrainXray,
  BrainUltrasound,
  BrainEeg,
  BrainEmg,
  BrainEcg,
  BrainEeg2,
  BrainEmg2,
  BrainEcg2,
  BrainEeg3,
  BrainEmg3,
  BrainEcg3,
  BrainEeg4,
  BrainEmg4,
  BrainEcg4,
  BrainEeg5,
  BrainEmg5,
  BrainEcg5
} from "lucide-react";

/**
 * Clinical Outcomes Research Component - Klinik sonuçlar araştırması
 * 
 * Bu component ne işe yarar:
 * - Treatment effectiveness tracking
 * - Patient outcome analysis
 * - Evidence-based practice support
 * - Research methodology tools
 * - Statistical analysis support
 * - Publication-ready reports
 * - Clinical trial management
 * - Meta-analysis support
 */
interface ClinicalOutcome {
  id: string;
  patientId: string;
  treatmentType: 'therapy' | 'medication' | 'combination' | 'alternative';
  diagnosis: string;
  baselineScore: number;
  currentScore: number;
  improvement: number; // percentage
  duration: number; // weeks
  sideEffects: string[];
  adherence: number; // percentage
  qualityOfLife: number; // 1-10 scale
  followUpDate: Date;
  notes: string;
  researcher: string;
  studyPhase: 'baseline' | 'intervention' | 'followup' | 'completed';
}

interface ResearchStudy {
  id: string;
  title: string;
  description: string;
  objective: string;
  hypothesis: string;
  methodology: 'randomized' | 'observational' | 'case-control' | 'cohort' | 'cross-sectional';
  sampleSize: number;
  currentParticipants: number;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'recruiting' | 'active' | 'analysis' | 'completed' | 'published';
  primaryOutcome: string;
  secondaryOutcomes: string[];
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  interventions: string[];
  measurements: string[];
  statisticalMethods: string[];
  ethicalApproval: boolean;
  funding: string;
  principalInvestigator: string;
  coInvestigators: string[];
  publications: string[];
}

interface StatisticalAnalysis {
  id: string;
  studyId: string;
  analysisType: 'descriptive' | 'inferential' | 'correlation' | 'regression' | 'survival' | 'meta';
  variables: string[];
  sampleSize: number;
  statisticalTest: string;
  pValue: number;
  confidenceInterval: [number, number];
  effectSize: number;
  power: number;
  assumptions: string[];
  violations: string[];
  recommendations: string[];
  interpretation: string;
  limitations: string[];
  nextSteps: string[];
}

export function ClinicalOutcomes() {
  // State management for clinical outcomes
  const [outcomes, setOutcomes] = useState<ClinicalOutcome[]>([
    {
      id: '1',
      patientId: 'P001',
      treatmentType: 'therapy',
      diagnosis: 'Major Depressive Disorder',
      baselineScore: 25,
      currentScore: 12,
      improvement: 52,
      duration: 12,
      sideEffects: ['mild fatigue'],
      adherence: 95,
      qualityOfLife: 7,
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Significant improvement in mood and energy levels',
      researcher: 'Dr. Sarah Johnson',
      studyPhase: 'intervention'
    },
    {
      id: '2',
      patientId: 'P002',
      treatmentType: 'medication',
      diagnosis: 'Generalized Anxiety Disorder',
      baselineScore: 18,
      currentScore: 8,
      improvement: 56,
      duration: 8,
      sideEffects: ['nausea', 'dizziness'],
      adherence: 88,
      qualityOfLife: 6,
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'Good response to medication, side effects manageable',
      researcher: 'Dr. Michael Chen',
      studyPhase: 'intervention'
    }
  ]);

  const [studies, setStudies] = useState<ResearchStudy[]>([
    {
      id: '1',
      title: 'Effectiveness of CBT vs. Medication in Depression Treatment',
      description: 'Randomized controlled trial comparing cognitive behavioral therapy with antidepressant medication',
      objective: 'To determine the relative effectiveness of CBT vs. medication in treating major depressive disorder',
      hypothesis: 'CBT will show non-inferiority to medication with fewer side effects',
      methodology: 'randomized',
      sampleSize: 200,
      currentParticipants: 156,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'active',
      primaryOutcome: 'Change in Hamilton Depression Rating Scale (HAM-D) score',
      secondaryOutcomes: ['Quality of Life Scale', 'Side Effect Profile', 'Treatment Adherence'],
      inclusionCriteria: ['Age 18-65', 'HAM-D score ≥17', 'First episode or recurrent MDD'],
      exclusionCriteria: ['Bipolar disorder', 'Psychosis', 'Substance abuse'],
      interventions: ['CBT (16 sessions)', 'Sertraline (50-200mg)'],
      measurements: ['HAM-D', 'QOL Scale', 'Side Effects Checklist', 'Adherence Log'],
      statisticalMethods: ['Mixed-effects models', 'Intention-to-treat analysis', 'Non-inferiority testing'],
      ethicalApproval: true,
      funding: 'National Institute of Mental Health',
      principalInvestigator: 'Dr. Sarah Johnson',
      coInvestigators: ['Dr. Michael Chen', 'Dr. Emily Rodriguez'],
      publications: []
    }
  ]);

  const [analyses, setAnalyses] = useState<StatisticalAnalysis[]>([
    {
      id: '1',
      studyId: '1',
      analysisType: 'inferential',
      variables: ['HAM-D Score', 'Treatment Group', 'Time', 'Age', 'Gender'],
      sampleSize: 156,
      statisticalTest: 'Mixed-effects linear regression',
      pValue: 0.023,
      confidenceInterval: [0.15, 0.89],
      effectSize: 0.45,
      power: 0.87,
      assumptions: ['Normality', 'Independence', 'Homoscedasticity'],
      violations: ['Minor deviation from normality'],
      recommendations: ['Use robust standard errors', 'Consider non-parametric alternatives'],
      interpretation: 'CBT shows significant improvement over time (p=0.023) with medium effect size',
      limitations: ['Sample size may be insufficient for subgroup analyses'],
      nextSteps: ['Conduct power analysis for future studies', 'Explore moderating factors']
    }
  ]);

  const [selectedStudy, setSelectedStudy] = useState<string>('1');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('1');
  const [showNewStudyForm, setShowNewStudyForm] = useState(false);
  const [showNewAnalysisForm, setShowNewAnalysisForm] = useState(false);

  /**
   * Calculate treatment effectiveness function - Tedavi etkinliğini hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Improvement percentage hesaplar
   * - Effect size hesaplar
   * - Statistical significance belirler
   * - Clinical significance değerlendirir
   */
  const calculateEffectiveness = (outcome: ClinicalOutcome) => {
    const improvement = ((outcome.baselineScore - outcome.currentScore) / outcome.baselineScore) * 100;
    const effectSize = (outcome.baselineScore - outcome.currentScore) / Math.sqrt((outcome.baselineScore + outcome.currentScore) / 2);
    
    return {
      improvement: Math.round(improvement),
      effectSize: Math.abs(effectSize),
      clinicalSignificance: improvement > 50 ? 'high' : improvement > 25 ? 'moderate' : 'low'
    };
  };

  /**
   * Generate research report function - Araştırma raporu oluşturur
   * Bu fonksiyon ne işe yarar:
   * - Executive summary oluşturur
   * - Methodology description yazar
   * - Results summary hazırlar
   * - Discussion points listeler
   * - Recommendations sunar
   */
  const generateResearchReport = (study: ResearchStudy, outcomes: ClinicalOutcome[]) => {
    const report = {
      title: study.title,
      executiveSummary: `This ${study.methodology} study aims to ${study.objective}. Current status: ${study.status} with ${study.currentParticipants}/${study.sampleSize} participants.`,
      methodology: `Study design: ${study.methodology} trial. Sample size: ${study.sampleSize}. Primary outcome: ${study.primaryOutcome}.`,
      results: `Preliminary results from ${outcomes.length} participants show varying treatment responses.`,
      discussion: 'Results suggest potential treatment effectiveness, but final analysis pending.',
      recommendations: 'Continue recruitment, monitor outcomes, prepare for final analysis.'
    };
    
    return report;
  };

  /**
   * Statistical power analysis function - İstatistiksel güç analizi yapar
   * Bu fonksiyon ne işe yarar:
   * - Required sample size hesaplar
   * - Power calculation yapar
   * - Effect size estimation sağlar
   * - Study design optimization önerir
   */
  const performPowerAnalysis = (study: ResearchStudy, effectSize: number, alpha: number = 0.05, power: number = 0.8) => {
    // Simplified power analysis calculation
    const requiredSampleSize = Math.ceil((2 * Math.pow(1.96 + 0.84, 2)) / Math.pow(effectSize, 2));
    
    return {
      requiredSampleSize,
      currentPower: study.currentParticipants >= requiredSampleSize ? 'adequate' : 'insufficient',
      recommendation: study.currentParticipants >= requiredSampleSize 
        ? 'Sample size adequate for planned analysis'
        : `Need ${requiredSampleSize - study.currentParticipants} more participants`
    };
  };

  /**
   * Quality assessment function - Çalışma kalitesini değerlendirir
   * Bu fonksiyon ne işe yarar:
   * - Study design quality değerlendirir
   * - Risk of bias assessment yapar
   * - Methodology strength belirler
   * - Quality score hesaplar
   */
  const assessStudyQuality = (study: ResearchStudy) => {
    let qualityScore = 0;
    const maxScore = 100;
    
    // Methodology quality
    if (study.methodology === 'randomized') qualityScore += 25;
    else if (study.methodology === 'cohort') qualityScore += 20;
    else if (study.methodology === 'case-control') qualityScore += 15;
    else qualityScore += 10;
    
    // Sample size
    if (study.sampleSize >= 500) qualityScore += 20;
    else if (study.sampleSize >= 200) qualityScore += 15;
    else if (study.sampleSize >= 100) qualityScore += 10;
    else qualityScore += 5;
    
    // Ethical approval
    if (study.ethicalApproval) qualityScore += 15;
    
    // Statistical methods
    if (study.statisticalMethods.length >= 3) qualityScore += 15;
    else if (study.statisticalMethods.length >= 2) qualityScore += 10;
    else qualityScore += 5;
    
    // Documentation
    if (study.description.length > 100) qualityScore += 10;
    if (study.objective.length > 50) qualityScore += 10;
    
    return {
      score: qualityScore,
      maxScore,
      percentage: Math.round((qualityScore / maxScore) * 100),
      rating: qualityScore >= 80 ? 'excellent' : qualityScore >= 60 ? 'good' : qualityScore >= 40 ? 'fair' : 'poor'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Outcomes Research</h1>
          <p className="text-gray-600">Evidence-based practice and research methodology support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Research Studies */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Research Studies
                    </CardTitle>
                    <CardDescription>
                      Active research studies and clinical trials
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowNewStudyForm(!showNewStudyForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Study
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studies.map((study) => {
                    const quality = assessStudyQuality(study);
                    const powerAnalysis = performPowerAnalysis(study, 0.5);
                    
                    return (
                      <div key={study.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{study.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{study.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <div className="text-sm text-gray-500">Status</div>
                                <Badge className={
                                  study.status === 'active' ? 'bg-green-100 text-green-800' :
                                  study.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {study.status}
                                </Badge>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Participants</div>
                                <div className="font-medium">{study.currentParticipants}/{study.sampleSize}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Quality Score</div>
                                <div className="flex items-center gap-2">
                                  <Progress value={quality.percentage} className="w-16" />
                                  <span className="text-sm font-medium">{quality.percentage}%</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Power</div>
                                <Badge className={
                                  powerAnalysis.currentPower === 'adequate' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }>
                                  {powerAnalysis.currentPower}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{study.startDate.toLocaleDateString()} - {study.endDate.toLocaleDateString()}</span>
                              <Users className="h-4 w-4 ml-4" />
                              <span>PI: {study.principalInvestigator}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Clinical Outcomes
                </CardTitle>
                <CardDescription>
                  Patient treatment outcomes and effectiveness measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {outcomes.map((outcome) => {
                    const effectiveness = calculateEffectiveness(outcome);
                    
                    return (
                      <div key={outcome.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Patient {outcome.patientId}</h4>
                            <p className="text-sm text-gray-600">{outcome.diagnosis}</p>
                          </div>
                          <Badge className={
                            outcome.studyPhase === 'completed' ? 'bg-green-100 text-green-800' :
                            outcome.studyPhase === 'intervention' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {outcome.studyPhase}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-gray-500">Improvement</div>
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold text-green-600">{effectiveness.improvement}%</div>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Effect Size</div>
                            <div className="text-lg font-medium">{effectiveness.effectSize.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Adherence</div>
                            <div className="flex items-center gap-2">
                              <Progress value={outcome.adherence} className="w-16" />
                              <span className="text-sm font-medium">{outcome.adherence}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Quality of Life</div>
                            <div className="text-lg font-medium">{outcome.qualityOfLife}/10</div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <strong>Notes:</strong> {outcome.notes}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {outcome.duration} weeks</span>
                          <Stethoscope className="h-4 w-4 ml-4" />
                          <span>Researcher: {outcome.researcher}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistical Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{analysis.analysisType}</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          p = {analysis.pValue.toFixed(3)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Effect Size: {analysis.effectSize.toFixed(2)}</div>
                        <div>Power: {(analysis.power * 100).toFixed(0)}%</div>
                        <div>Sample: {analysis.sampleSize}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Research Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  Research Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart className="h-4 w-4 mr-2" />
                  Power Analysis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Sample Size Calculator
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Effect Size Calculator
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Report Generator
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Data Export
                </Button>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Studies Active</span>
                    <Badge className="bg-green-100 text-green-800">
                      {studies.filter(s => s.status === 'active').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Participants</span>
                    <span className="font-medium">
                      {studies.reduce((sum, s) => sum + s.currentParticipants, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Quality Score</span>
                    <span className="font-medium">
                      {Math.round(studies.reduce((sum, s) => sum + assessStudyQuality(s).percentage, 0) / studies.length)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Publications</span>
                    <span className="font-medium">
                      {studies.reduce((sum, s) => sum + s.publications.length, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
