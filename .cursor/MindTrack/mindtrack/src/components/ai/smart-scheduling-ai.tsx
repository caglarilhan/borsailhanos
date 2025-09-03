"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  Users, 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Star, 
  Heart, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Settings, 
  RefreshCw, 
  Play, 
  Pause, 
  Stop, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Download, 
  Upload, 
  Filter, 
  Search, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Shield, 
  User, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  MessageSquare, 
  Bell, 
  BellOff, 
  BookOpen, 
  FileText, 
  FileCheck, 
  FileX, 
  FilePlus, 
  FileMinus, 
  FileEdit, 
  FileAlertCircle,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Server,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryEmpty,
  BatteryWarning,
  BatteryAlert,
  BatteryCheck,
  BatteryX,
  BatteryPlus,
  BatteryMinus,
  BatteryEdit,
  BatterySettings,
  BatteryRefresh,
  BatteryPlay,
  BatteryPause,
  BatteryStop,
  BatteryCopy,
  BatteryShare,
  BatteryDownload,
  BatteryUpload,
  BatteryFilter,
  BatterySearch,
  BatteryEye,
  BatteryEyeOff,
  BatteryLock,
  BatteryUnlock,
  BatteryShield,
  BatteryUser,
  BatteryUserCheck,
  BatteryUserX,
  BatteryPhone,
  BatteryMail,
  BatteryMessageSquare,
  BatteryBell,
  BatteryBellOff,
  BatteryBookOpen,
  BatteryFileText,
  BatteryFileCheck,
  BatteryFileX,
  BatteryFilePlus,
  BatteryFileMinus,
  BatteryFileEdit,
  BatteryFileAlertCircle
} from "lucide-react";

// AI Scheduling için gerekli interface'ler
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  condition: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  preferences: {
    timeSlots: string[];
    therapist: string[];
    duration: number;
    notes: string;
  };
  history: {
    lastVisit: Date;
    totalVisits: number;
    noShows: number;
    cancellations: number;
  };
}

interface Therapist {
  id: string;
  name: string;
  specialization: string[];
  availability: {
    [key: string]: {
      start: string;
      end: string;
      maxPatients: number;
    };
  };
  rating: number;
  experience: number;
  currentLoad: number;
}

interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  therapistId: string;
  patientId?: string;
  status: 'available' | 'booked' | 'pending' | 'cancelled';
  aiScore?: number;
  aiReason?: string;
}

interface AIScheduleRecommendation {
  slotId: string;
  patientId: string;
  therapistId: string;
  score: number;
  reasons: string[];
  alternatives: string[];
  riskFactors: string[];
  benefits: string[];
}

// Smart Scheduling AI Component - Akıllı randevu planlama sistemi
export function SmartSchedulingAI() {
  // State management - Uygulama durumunu yönetmek için
  const [patients, setPatients] = useState<Patient[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [recommendations, setRecommendations] = useState<AIScheduleRecommendation[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [aiMode, setAiMode] = useState<'auto' | 'suggest' | 'manual'>('suggest');
  const [aiConfidence, setAiConfidence] = useState(0.85);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        age: 35,
        gender: 'male',
        condition: 'Anxiety Disorder',
        priority: 'high',
        preferences: {
          timeSlots: ['09:00', '14:00', '16:00'],
          therapist: ['Dr. Ayşe Kaya'],
          duration: 60,
          notes: 'Prefers morning sessions'
        },
        history: {
          lastVisit: new Date('2024-01-15'),
          totalVisits: 12,
          noShows: 1,
          cancellations: 0
        }
      },
      {
        id: '2',
        name: 'Fatma Demir',
        age: 28,
        gender: 'female',
        condition: 'Depression',
        priority: 'medium',
        preferences: {
          timeSlots: ['10:00', '15:00', '17:00'],
          therapist: ['Dr. Mehmet Öz'],
          duration: 45,
          notes: 'Evening sessions preferred'
        },
        history: {
          lastVisit: new Date('2024-01-20'),
          totalVisits: 8,
          noShows: 0,
          cancellations: 2
        }
      }
    ];

    const mockTherapists: Therapist[] = [
      {
        id: '1',
        name: 'Dr. Ayşe Kaya',
        specialization: ['Anxiety', 'Depression', 'PTSD'],
        availability: {
          'monday': { start: '09:00', end: '17:00', maxPatients: 8 },
          'tuesday': { start: '09:00', end: '17:00', maxPatients: 8 },
          'wednesday': { start: '09:00', end: '17:00', maxPatients: 8 },
          'thursday': { start: '09:00', end: '17:00', maxPatients: 8 },
          'friday': { start: '09:00', end: '17:00', maxPatients: 8 }
        },
        rating: 4.8,
        experience: 8,
        currentLoad: 0.7
      },
      {
        id: '2',
        name: 'Dr. Mehmet Öz',
        specialization: ['Depression', 'Bipolar Disorder', 'Anxiety'],
        availability: {
          'monday': { start: '10:00', end: '18:00', maxPatients: 6 },
          'tuesday': { start: '10:00', end: '18:00', maxPatients: 6 },
          'wednesday': { start: '10:00', end: '18:00', maxPatients: 6 },
          'thursday': { start: '10:00', end: '18:00', maxPatients: 6 },
          'friday': { start: '10:00', end: '18:00', maxPatients: 6 }
        },
        rating: 4.6,
        experience: 5,
        currentLoad: 0.5
      }
    ];

    setPatients(mockPatients);
    setTherapists(mockTherapists);
  }, []);

  // AI Schedule Analysis - Yapay zeka ile randevu analizi
  const analyzeSchedule = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulated AI analysis - AI analiz simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // AI scoring algorithm - AI puanlama algoritması
      const aiRecommendations: AIScheduleRecommendation[] = patients.map(patient => {
        const bestTherapist = therapists.find(t => 
          t.specialization.includes(patient.condition) && 
          t.currentLoad < 0.8
        );
        
        if (!bestTherapist) return null;
        
        // Calculate AI score - AI puanı hesaplama
        let score = 0.5; // Base score - Temel puan
        
        // Priority bonus - Öncelik bonusu
        if (patient.priority === 'urgent') score += 0.3;
        else if (patient.priority === 'high') score += 0.2;
        else if (patient.priority === 'medium') score += 0.1;
        
        // Therapist rating bonus - Terapist puanı bonusu
        score += (bestTherapist.rating - 3) * 0.1;
        
        // Experience bonus - Deneyim bonusu
        score += Math.min(bestTherapist.experience / 10, 0.2);
        
        // Load factor - Yük faktörü
        score -= bestTherapist.currentLoad * 0.2;
        
        // History factor - Geçmiş faktörü
        if (patient.history.noShows === 0 && patient.history.cancellations === 0) {
          score += 0.1;
        }
        
        score = Math.max(0, Math.min(1, score));
        
        return {
          slotId: `slot_${patient.id}_${bestTherapist.id}`,
          patientId: patient.id,
          therapistId: bestTherapist.id,
          score,
          reasons: [
            `Specialization match: ${patient.condition}`,
            `Priority level: ${patient.priority}`,
            `Therapist rating: ${bestTherapist.rating}/5`,
            `Load factor: ${(bestTherapist.currentLoad * 100).toFixed(0)}%`
          ],
          alternatives: therapists
            .filter(t => t.id !== bestTherapist.id)
            .slice(0, 2)
            .map(t => t.name),
          riskFactors: patient.history.noShows > 0 ? ['Previous no-shows'] : [],
          benefits: [
            'Optimal timing for patient',
            'Therapist expertise match',
            'Balanced workload distribution'
          ]
        };
      }).filter(Boolean) as AIScheduleRecommendation[];
      
      setRecommendations(aiRecommendations);
      
      // Generate AI insights - AI içgörüleri oluşturma
      const insights = [
        `Found ${aiRecommendations.length} optimal matches`,
        `Average confidence score: ${(aiRecommendations.reduce((sum, r) => sum + r.score, 0) / aiRecommendations.length * 100).toFixed(1)}%`,
        'Consider patient preferences for better satisfaction',
        'Monitor therapist workload for optimal distribution'
      ];
      
      setAiInsights(insights);
      
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }, [patients, therapists]);

  // Auto-schedule appointments - Otomatik randevu planlama
  const autoSchedule = useCallback(async () => {
    setLoading(true);
    
    try {
      // Apply AI recommendations automatically - AI önerilerini otomatik uygulama
      const newAppointments = recommendations
        .filter(r => r.score >= aiConfidence)
        .map(r => ({
          id: r.slotId,
          date: new Date().toISOString().split('T')[0],
          time: '10:00', // Default time - Varsayılan saat
          duration: 60,
          therapistId: r.therapistId,
          patientId: r.patientId,
          status: 'booked' as const,
          aiScore: r.score,
          aiReason: r.reasons.join(', ')
        }));
      
      setAppointments(prev => [...prev, ...newAppointments]);
      
    } catch (error) {
      console.error('Auto-scheduling failed:', error);
    } finally {
      setLoading(false);
    }
  }, [recommendations, aiConfidence]);

  // Manual schedule override - Manuel randevu geçersiz kılma
  const manualSchedule = useCallback((patientId: string, therapistId: string, date: string, time: string) => {
    const newAppointment: AppointmentSlot = {
      id: `manual_${Date.now()}`,
      date,
      time,
      duration: 60,
      therapistId,
      patientId,
      status: 'booked',
      aiScore: 0.5,
      aiReason: 'Manual override'
    };
    
    setAppointments(prev => [...prev, newAppointment]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🧠 Smart Scheduling AI</h2>
          <p className="text-gray-600">AI-powered appointment optimization and scheduling</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="h-3 w-3 mr-1" />
            AI Active
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            {recommendations.length} Recommendations
          </Badge>
        </div>
      </div>

      {/* AI Mode Selection - AI Modu Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            AI Scheduling Mode
          </CardTitle>
          <CardDescription>
            Choose how AI should handle appointment scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={aiMode === 'auto' ? 'default' : 'outline'}
              onClick={() => setAiMode('auto')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Target className="h-6 w-6 mb-2" />
              <span className="font-semibold">Auto Schedule</span>
              <span className="text-xs text-gray-500">AI makes all decisions</span>
            </Button>
            <Button
              variant={aiMode === 'suggest' ? 'default' : 'outline'}
              onClick={() => setAiMode('suggest')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Brain className="h-6 w-6 mb-2" />
              <span className="font-semibold">AI Suggestions</span>
              <span className="text-xs text-gray-500">Review before applying</span>
            </Button>
            <Button
              variant={aiMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setAiMode('manual')}
              className="h-auto p-4 flex flex-col items-center"
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="font-semibold">Manual Override</span>
              <span className="text-xs text-gray-500">Full human control</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Controls - AI Analiz Kontrolleri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              AI Confidence Threshold
            </CardTitle>
            <CardDescription>
              Minimum confidence score for auto-scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Confidence Level</Label>
                <Badge variant="outline">{Math.round(aiConfidence * 100)}%</Badge>
              </div>
              <Progress value={aiConfidence * 100} className="w-full" />
              <Input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={aiConfidence}
                onChange={(e) => setAiConfidence(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Patient Overview
            </CardTitle>
            <CardDescription>
              Current patient queue and priorities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold">{patient.name}</div>
                    <div className="text-sm text-gray-600">{patient.condition}</div>
                  </div>
                  <Badge 
                    variant={
                      patient.priority === 'urgent' ? 'destructive' :
                      patient.priority === 'high' ? 'default' :
                      patient.priority === 'medium' ? 'secondary' : 'outline'
                    }
                  >
                    {patient.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Real-time AI analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                  <Brain className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span className="text-sm text-blue-800">{insight}</span>
                </div>
              ))}
              {aiInsights.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Run AI analysis to see insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations - AI Önerileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              AI Schedule Recommendations
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={analyzeSchedule}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Analyze Schedule
              </Button>
              {aiMode === 'auto' && (
                <Button
                  onClick={autoSchedule}
                  disabled={loading || recommendations.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Auto Schedule
                </Button>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            AI-generated optimal appointment suggestions based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const patient = patients.find(p => p.id === rec.patientId);
              const therapist = therapists.find(t => t.id === rec.therapistId);
              
              return (
                <div key={rec.slotId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">{patient?.name}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">{therapist?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={rec.score >= 0.8 ? 'default' : rec.score >= 0.6 ? 'secondary' : 'outline'}
                        className="bg-blue-50 text-blue-700"
                      >
                        {Math.round(rec.score * 100)}% Match
                      </Badge>
                      {aiMode === 'suggest' && (
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">AI Reasons</h4>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {rec.reasons.map((reason, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Benefits</h4>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {rec.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Risk Factors</h4>
                      {rec.riskFactors.length > 0 ? (
                        <ul className="space-y-1 text-xs text-gray-600">
                          {rec.riskFactors.map((risk, index) => (
                            <li key={index} className="flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-green-600">No significant risks</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {recommendations.length === 0 && !loading && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No AI recommendations yet</p>
                <p className="text-sm text-gray-400">Click "Analyze Schedule" to generate recommendations</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600">AI is analyzing your schedule...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Appointments - Planlanan Randevular */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Scheduled Appointments
          </CardTitle>
          <CardDescription>
            Current appointments with AI scheduling information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const patient = patients.find(p => p.id === appointment.patientId);
              const therapist = therapists.find(t => t.id === appointment.therapistId);
              
              return (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="font-semibold">{appointment.date}</div>
                      <div className="text-sm text-gray-600">{appointment.time}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{patient?.name}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold">{therapist?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {appointment.status}
                    </Badge>
                    {appointment.aiScore && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        AI: {Math.round(appointment.aiScore * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            
            {appointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No appointments scheduled</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




