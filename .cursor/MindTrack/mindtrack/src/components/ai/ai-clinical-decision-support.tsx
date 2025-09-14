"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Stethoscope, 
  AlertTriangle, 
  Pill, 
  FileText, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAIClinicalDecision } from '@/hooks/useAIClinicalDecision';
import { PatientProfile, ClinicalSymptom } from '@/lib/ai-clinical-decision';

export default function AIClinicalDecisionSupport() {
  const {
    diagnosticSuggestions,
    treatmentRecommendations,
    riskAssessments,
    sessionAnalysis,
    medicationInteractions,
    loading,
    error,
    getDiagnosticSuggestions,
    getTreatmentRecommendations,
    getRiskAssessment,
    analyzeSessionNotes,
    checkMedicationInteractions,
    clearResults,
  } = useAIClinicalDecision();

  const [patientData, setPatientData] = useState<PatientProfile>({
    id: '',
    age: 0,
    gender: 'other',
    medicalHistory: [],
    currentMedications: [],
    symptoms: [],
    riskFactors: [],
    previousDiagnoses: []
  });

  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');

  const addSymptom = () => {
    const newSymptom: ClinicalSymptom = {
      id: Date.now().toString(),
      name: '',
      severity: 5,
      duration: 1,
      frequency: 'daily',
      impact: 'moderate'
    };
    setPatientData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, newSymptom]
    }));
  };

  const updateSymptom = (id: string, field: keyof ClinicalSymptom, value: any) => {
    setPatientData(prev => ({
      ...prev,
      symptoms: prev.symptoms.map(symptom =>
        symptom.id === id ? { ...symptom, [field]: value } : symptom
      )
    }));
  };

  const removeSymptom = (id: string) => {
    setPatientData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(symptom => symptom.id !== id)
    }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Clinical Decision Support</h1>
          <p className="text-gray-600">AI-powered diagnostic suggestions, treatment recommendations, and risk assessments</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="patient-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="session-analysis">Session Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Enter patient details for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={patientData.age}
                    onChange={(e) => setPatientData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full p-2 border rounded-md"
                    value={patientData.gender}
                    onChange={(e) => setPatientData(prev => ({ ...prev, gender: e.target.value as any }))}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Current Medications</Label>
                <Textarea
                  placeholder="Enter medications separated by commas"
                  value={patientData.currentMedications.join(', ')}
                  onChange={(e) => setPatientData(prev => ({ 
                    ...prev, 
                    currentMedications: e.target.value.split(',').map(med => med.trim()).filter(Boolean)
                  }))}
                />
              </div>

              <div>
                <Label>Medical History</Label>
                <Textarea
                  placeholder="Enter medical history separated by commas"
                  value={patientData.medicalHistory.join(', ')}
                  onChange={(e) => setPatientData(prev => ({ 
                    ...prev, 
                    medicalHistory: e.target.value.split(',').map(hist => hist.trim()).filter(Boolean)
                  }))}
                />
              </div>

              <div>
                <Label>Risk Factors</Label>
                <Textarea
                  placeholder="Enter risk factors separated by commas"
                  value={patientData.riskFactors.join(', ')}
                  onChange={(e) => setPatientData(prev => ({ 
                    ...prev, 
                    riskFactors: e.target.value.split(',').map(factor => factor.trim()).filter(Boolean)
                  }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Symptoms</Label>
                  <Button onClick={addSymptom} size="sm">Add Symptom</Button>
                </div>
                <div className="space-y-2">
                  {patientData.symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Input
                        placeholder="Symptom name"
                        value={symptom.name}
                        onChange={(e) => updateSymptom(symptom.id, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={symptom.severity}
                        onChange={(e) => updateSymptom(symptom.id, 'severity', parseInt(e.target.value))}
                        className="w-20"
                      />
                      <select
                        value={symptom.frequency}
                        onChange={(e) => updateSymptom(symptom.id, 'frequency', e.target.value)}
                        className="w-32 p-1 border rounded"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="occasional">Occasional</option>
                      </select>
                      <Button
                        onClick={() => removeSymptom(symptom.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => getDiagnosticSuggestions(patientData)}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Get Diagnostic Suggestions</span>
                </Button>
                <Button 
                  onClick={() => getRiskAssessment(patientData)}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Assess Risk Factors</span>
                </Button>
                <Button 
                  onClick={() => checkMedicationInteractions(patientData.currentMedications)}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Pill className="h-4 w-4" />
                  <span>Check Interactions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Suggestions</CardTitle>
              <CardDescription>AI-powered diagnostic recommendations based on symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-center py-4">Analyzing symptoms...</div>}
              
              {diagnosticSuggestions.length > 0 && (
                <div className="space-y-4">
                  {diagnosticSuggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{suggestion.diagnosis}</h3>
                        <Badge variant="secondary">DSM-5: {suggestion.dsm5Code}</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <Progress value={suggestion.confidence} className="flex-1" />
                          <span className="text-sm font-medium">{suggestion.confidence}%</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Diagnostic Criteria:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {suggestion.criteria.map((criterion, idx) => (
                            <li key={idx}>{criterion}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Differential Diagnoses:</h4>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.differentialDiagnoses.map((diff, idx) => (
                            <Badge key={idx} variant="outline">{diff}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Recommended Assessments:</h4>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.recommendedAssessments.map((assessment, idx) => (
                            <Badge key={idx} variant="secondary">{assessment}</Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedDiagnosis(suggestion.diagnosis);
                          getTreatmentRecommendations(suggestion.diagnosis, patientData);
                        }}
                        className="w-full"
                      >
                        Get Treatment Recommendations
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {diagnosticSuggestions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No diagnostic suggestions available. Please enter patient symptoms and click "Get Diagnostic Suggestions".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Recommendations</CardTitle>
              <CardDescription>Evidence-based treatment options for selected diagnosis</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-center py-4">Generating treatment recommendations...</div>}
              
              {treatmentRecommendations.length > 0 && (
                <div className="space-y-4">
                  {treatmentRecommendations.map((treatment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{treatment.treatment}</h3>
                        <Badge 
                          variant={treatment.evidenceLevel === 'A' ? 'default' : 'secondary'}
                        >
                          Evidence Level: {treatment.evidenceLevel}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Effectiveness:</span>
                          <Progress value={treatment.effectiveness} className="flex-1" />
                          <span className="text-sm font-medium">{treatment.effectiveness}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <h4 className="font-medium mb-2 text-red-600">Side Effects:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {treatment.sideEffects.map((effect, idx) => (
                              <li key={idx}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 text-orange-600">Contraindications:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {treatment.contraindications.map((contraindication, idx) => (
                              <li key={idx}>{contraindication}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-blue-600">Monitoring:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {treatment.monitoring.map((monitor, idx) => (
                            <li key={idx}>{monitor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {treatmentRecommendations.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No treatment recommendations available. Please select a diagnosis first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>AI-powered risk evaluation and safety recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-center py-4">Assessing risk factors...</div>}
              
              {riskAssessments.length > 0 && (
                <div className="space-y-4">
                  {riskAssessments.map((assessment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold capitalize">
                          {assessment.riskType.replace('-', ' ')} Risk
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${getRiskColor(assessment.riskLevel)} text-white`}
                          >
                            {assessment.riskLevel.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {assessment.urgency}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Risk Score:</span>
                          <Progress value={assessment.score} className="flex-1" />
                          <span className="text-sm font-medium">{assessment.score}/100</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium mb-2 text-red-600">Risk Factors:</h4>
                        <div className="flex flex-wrap gap-1">
                          {assessment.factors.map((factor, idx) => (
                            <Badge key={idx} variant="destructive">{factor}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {assessment.recommendations.map((recommendation, idx) => (
                            <li key={idx}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {medicationInteractions.length > 0 && (
                <div className="mt-4">
                  <Separator className="my-4" />
                  <h3 className="text-lg font-semibold mb-2 text-orange-600">Medication Interactions</h3>
                  <div className="space-y-2">
                    {medicationInteractions.map((interaction, idx) => (
                      <Alert key={idx}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{interaction}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {riskAssessments.length === 0 && medicationInteractions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No risk assessments available. Please enter patient information and click "Assess Risk Factors".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Notes Analysis</CardTitle>
              <CardDescription>AI-powered analysis of session notes for sentiment and risk indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="session-notes">Session Notes</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Enter session notes for AI analysis..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={8}
                />
              </div>

              <Button 
                onClick={() => analyzeSessionNotes(sessionNotes)}
                disabled={loading || !sessionNotes.trim()}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Analyze Session Notes
              </Button>

              {sessionAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">Sentiment Analysis:</span>
                    <Badge 
                      variant="outline" 
                      className={getSentimentColor(sessionAnalysis.sentiment)}
                    >
                      {sessionAnalysis.sentiment.toUpperCase()}
                    </Badge>
                  </div>

                  {sessionAnalysis.riskIndicators.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Risk Indicators Detected:</h4>
                      <div className="flex flex-wrap gap-1">
                        {sessionAnalysis.riskIndicators.map((indicator, idx) => (
                          <Badge key={idx} variant="destructive">{indicator}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {sessionAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">AI Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {sessionAnalysis.recommendations.map((recommendation, idx) => (
                          <li key={idx}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!sessionAnalysis && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter session notes and click "Analyze Session Notes" to get AI insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button onClick={clearResults} variant="outline">
          Clear All Results
        </Button>
      </div>
    </div>
  );
}

