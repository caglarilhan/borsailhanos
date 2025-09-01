"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Brain, 
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Star,
  Target
} from "lucide-react";

interface SchedulingRecommendation {
  id: string;
  type: 'time_optimization' | 'capacity_planning' | 'client_preference' | 'revenue_optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  implementation: string;
  expectedOutcome: string;
}

interface TimeSlot {
  id: string;
  time: string;
  availability: 'available' | 'booked' | 'recommended' | 'peak';
  clientPreference: number;
  revenuePotential: number;
  aiScore: number;
}

export function SmartScheduling() {
  const [recommendations, setRecommendations] = useState<SchedulingRecommendation[]>([
    {
      id: '1',
      type: 'time_optimization',
      title: 'Salı Öğleden Sonra Optimizasyonu',
      description: 'Salı 14:00-16:00 arası en yüksek client availability gösteriyor',
      impact: 'high',
      confidence: 0.89,
      implementation: 'Bu saatleri premium pricing ile işaretleyin',
      expectedOutcome: 'Revenue %15 artış, client satisfaction %20 artış'
    },
    {
      id: '2',
      type: 'capacity_planning',
      title: 'Hafta Sonu Kapasite Artırımı',
      description: 'Cumartesi sabah saatleri için talep %40 artıyor',
      impact: 'medium',
      confidence: 0.76,
      implementation: 'Cumartesi 09:00-12:00 arası ek slot açın',
      expectedOutcome: 'Weekly capacity %25 artış, revenue %18 artış'
    },
    {
      id: '3',
      type: 'client_preference',
      title: 'Client Scheduling Pattern',
      description: 'Mevcut clientlar %70 oranında 2 hafta önceden randevu alıyor',
      impact: 'medium',
      confidence: 0.82,
      implementation: '2 hafta öncesi için reminder sistemini güçlendirin',
      expectedOutcome: 'No-show rate %30 azalma, planning efficiency %25 artış'
    }
  ]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '09:00', availability: 'available', clientPreference: 0.7, revenuePotential: 0.8, aiScore: 0.85 },
    { id: '2', time: '10:00', availability: 'booked', clientPreference: 0.9, revenuePotential: 0.9, aiScore: 0.95 },
    { id: '3', time: '11:00', availability: 'recommended', clientPreference: 0.8, revenuePotential: 0.7, aiScore: 0.88 },
    { id: '4', time: '12:00', availability: 'peak', clientPreference: 0.6, revenuePotential: 0.6, aiScore: 0.72 },
    { id: '5', time: '14:00', availability: 'available', clientPreference: 0.9, revenuePotential: 0.9, aiScore: 0.92 },
    { id: '6', time: '15:00', availability: 'available', clientPreference: 0.8, revenuePotential: 0.8, aiScore: 0.84 },
    { id: '7', time: '16:00', availability: 'booked', clientPreference: 0.7, revenuePotential: 0.7, aiScore: 0.78 },
    { id: '8', time: '17:00', availability: 'available', clientPreference: 0.5, revenuePotential: 0.5, aiScore: 0.65 }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'recommended': return 'bg-blue-100 text-blue-800';
      case 'peak': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'booked': return <AlertCircle className="h-4 w-4" />;
      case 'recommended': return <Star className="h-4 w-4" />;
      case 'peak': return <Target className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Scheduling</h2>
          <p className="text-gray-600">AI-powered scheduling optimization ve recommendations</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Brain className="h-4 w-4 mr-2" />
          AI Analizi Güncelle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Scheduling Recommendations
            </CardTitle>
            <CardDescription>
              AI analizi sonucu önerilen scheduling optimizasyonları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={getImpactColor(rec.impact)}>
                    {rec.impact === 'high' ? 'Yüksek Etki' : 
                     rec.impact === 'medium' ? 'Orta Etki' : 'Düşük Etki'}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.round(rec.confidence * 100)}%</div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>
                
                <h4 className="font-medium mb-2">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Implementation:</div>
                    <p className="text-sm text-gray-600">{rec.implementation}</p>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Expected Outcome:</div>
                    <p className="text-sm text-blue-600 font-medium">{rec.expectedOutcome}</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Uygula
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Time Slot Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Slot Analysis
            </CardTitle>
            <CardDescription>
              AI scoring ile time slot optimizasyonu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-16 text-sm font-medium">{slot.time}</div>
                  
                  <Badge className={getAvailabilityColor(slot.availability)}>
                    <div className="flex items-center gap-1">
                      {getAvailabilityIcon(slot.availability)}
                      {slot.availability === 'available' ? 'Müsait' :
                       slot.availability === 'booked' ? 'Dolu' :
                       slot.availability === 'recommended' ? 'Önerilen' : 'Peak'}
                    </div>
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">AI Score:</span>
                      <Progress value={slot.aiScore * 100} className="h-2 w-20" />
                      <span className="text-xs font-medium">{Math.round(slot.aiScore * 100)}%</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Client Pref: {Math.round(slot.clientPreference * 100)}%</span>
                      <span>Revenue: {Math.round(slot.revenuePotential * 100)}%</span>
                    </div>
                  </div>
                  
                  {slot.availability === 'available' && (
                    <Button size="sm" variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Book
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Scheduling Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-gray-600">AI Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+23%</div>
              <div className="text-sm text-gray-600">Revenue Increase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">-18%</div>
              <div className="text-sm text-gray-600">No-show Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">+31%</div>
              <div className="text-sm text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

