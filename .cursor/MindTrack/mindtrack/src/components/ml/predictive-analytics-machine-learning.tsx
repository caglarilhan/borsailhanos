"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain, TrendingUp, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Target, Zap, Users, Calendar, Clock,
  Book, Library, GraduationCap, Award, Certificate, Diploma, Scroll, Document, Clipboard,
  ClipboardList, ClipboardCheck, ClipboardX, ClipboardCopy, ClipboardPaste, Search, FileText, Tag, Filter, Star, Heart, ThumbsUp,
  ThumbsDown, Share, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  MapPin, Phone, Mail, MessageSquare, Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Flag, Bookmark, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, Table, List, Grid, Columns, Rows, SortAsc, SortDesc, Lightbulb, Settings, Plus, MoreHorizontal as MoreHorizontalIcon
} from "lucide-react";

// Interfaces
interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer_vision' | 'recommendation';
  description: string;
  status: 'training' | 'active' | 'inactive' | 'failed' | 'deployed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastUpdated: string;
  version: string;
  features: string[];
  performance: ModelPerformance;
}

interface ModelPerformance {
  trainingTime: number;
  inferenceTime: number;
  dataSize: number;
  featureCount: number;
  predictionCount: number;
  driftScore: number;
}

interface Prediction {
  id: string;
  modelId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  confidence: number;
  timestamp: string;
  userId: string;
  isCorrect: boolean;
}

interface PredictionPattern {
  id: string;
  name: string;
  type: 'anomaly' | 'trend' | 'seasonality' | 'correlation';
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface Forecast {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidenceInterval: [number, number];
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface MLMetrics {
  totalModels: number;
  activeModels: number;
  averageAccuracy: number;
  totalPredictions: number;
  successfulPredictions: number;
  modelDrift: number;
  predictionLatency: number;
}

// Mock Data
const mockMLModels: MLModel[] = [
  {
    id: "ML001",
    name: "Patient Outcome Predictor",
    type: "classification",
    description: "Predicts patient treatment outcomes based on clinical data and demographics",
    status: "active",
    accuracy: 87.5,
    precision: 89.2,
    recall: 85.8,
    f1Score: 87.4,
    lastUpdated: "2024-12-14T10:30:00Z",
    version: "2.1.0",
    features: ["age", "diagnosis", "treatment_history", "symptoms", "medications"],
    performance: {
      trainingTime: 45,
      inferenceTime: 0.2,
      dataSize: 15420,
      featureCount: 15,
      predictionCount: 2340,
      driftScore: 0.12
    }
  },
  {
    id: "ML002",
    name: "Revenue Forecasting Model",
    type: "regression",
    description: "Forecasts practice revenue based on historical data and market trends",
    status: "active",
    accuracy: 92.3,
    precision: 91.8,
    recall: 93.1,
    f1Score: 92.4,
    lastUpdated: "2024-12-13T15:45:00Z",
    version: "1.8.2",
    features: ["appointments", "billing_data", "seasonality", "market_conditions"],
    performance: {
      trainingTime: 32,
      inferenceTime: 0.1,
      dataSize: 8920,
      featureCount: 12,
      predictionCount: 1560,
      driftScore: 0.08
    }
  },
  {
    id: "ML003",
    name: "Patient Segmentation Clustering",
    type: "clustering",
    description: "Segments patients into groups based on behavior and treatment patterns",
    status: "training",
    accuracy: 78.9,
    precision: 76.5,
    recall: 81.2,
    f1Score: 78.8,
    lastUpdated: "2024-12-14T08:15:00Z",
    version: "1.2.0",
    features: ["appointment_frequency", "treatment_compliance", "satisfaction_scores"],
    performance: {
      trainingTime: 28,
      inferenceTime: 0.3,
      dataSize: 5670,
      featureCount: 8,
      predictionCount: 890,
      driftScore: 0.15
    }
  }
];

const mockPredictions: Prediction[] = [
  {
    id: "P001",
    modelId: "ML001",
    input: { "age": 35, "diagnosis": "MDD", "treatment_history": "CBT", "symptoms": ["depression", "anxiety"] },
    output: { "outcome": "positive", "confidence": 0.87, "recommended_treatment": "CBT + Medication" },
    confidence: 0.87,
    timestamp: "2024-12-14T10:30:00Z",
    userId: "dr.sarah.johnson",
    isCorrect: true
  },
  {
    id: "P002",
    modelId: "ML002",
    input: { "appointments": 45, "billing_data": 12500, "seasonality": "Q4" },
    output: { "revenue_forecast": 14200, "confidence": 0.92, "growth_rate": 0.136 },
    confidence: 0.92,
    timestamp: "2024-12-14T09:45:00Z",
    userId: "dr.michael.chen",
    isCorrect: true
  }
];

const mockPredictionPatterns: PredictionPattern[] = [
  {
    id: "PP001",
    name: "Anomaly Detection - High No-Show Rate",
    type: "anomaly",
    description: "Detected unusually high no-show rate for appointments in the last 7 days",
    confidence: 0.89,
    severity: "high",
    detectedAt: "2024-12-14T08:00:00Z",
    status: "investigating"
  },
  {
    id: "PP002",
    name: "Trend Analysis - Increasing Telehealth Usage",
    type: "trend",
    description: "Telehealth appointment usage has increased by 23% over the last 30 days",
    confidence: 0.94,
    severity: "low",
    detectedAt: "2024-12-13T16:30:00Z",
    status: "active"
  }
];

const mockForecasts: Forecast[] = [
  {
    id: "F001",
    metric: "Monthly Revenue",
    currentValue: 12500,
    predictedValue: 14200,
    confidenceInterval: [13800, 14600],
    timeframe: "Next Month",
    trend: "up",
    lastUpdated: "2024-12-14T10:00:00Z"
  },
  {
    id: "F002",
    metric: "Patient Satisfaction",
    currentValue: 4.7,
    predictedValue: 4.8,
    confidenceInterval: [4.6, 4.9],
    timeframe: "Next Quarter",
    trend: "up",
    lastUpdated: "2024-12-14T09:30:00Z"
  }
];

const mockMLMetrics: MLMetrics = {
  totalModels: 8,
  activeModels: 6,
  averageAccuracy: 86.2,
  totalPredictions: 4790,
  successfulPredictions: 4234,
  modelDrift: 0.12,
  predictionLatency: 0.2
};

// Utility Functions
const getModelTypeColor = (type: string) => {
  switch (type) {
    case 'classification': return 'bg-blue-500 text-white';
    case 'regression': return 'bg-green-500 text-white';
    case 'clustering': return 'bg-purple-500 text-white';
    case 'nlp': return 'bg-orange-500 text-white';
    case 'computer_vision': return 'bg-red-500 text-white';
    case 'recommendation': return 'bg-teal-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'training': return 'bg-yellow-500 text-black';
    case 'active': return 'bg-green-500 text-white';
    case 'inactive': return 'bg-gray-500 text-white';
    case 'failed': return 'bg-red-500 text-white';
    case 'deployed': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPatternTypeColor = (type: string) => {
  switch (type) {
    case 'anomaly': return 'bg-red-100 text-red-800';
    case 'trend': return 'bg-blue-100 text-blue-800';
    case 'seasonality': return 'bg-green-100 text-green-800';
    case 'correlation': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function PredictiveAnalyticsMachineLearning() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedModelType, setSelectedModelType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredModels = mockMLModels.filter(model => {
    const matchesType = selectedModelType === "all" || model.type === selectedModelType;
    const matchesStatus = selectedStatus === "all" || model.status === selectedStatus;
    
    return matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Predictive Analytics & Machine Learning
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered predictive analytics and machine learning for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Brain className="h-4 w-4 mr-1" />
            AI/ML
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <TrendingUp className="h-4 w-4 mr-1" />
            Predictive
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMLMetrics.activeModels}</div>
            <p className="text-xs opacity-75 mt-1">Of {mockMLMetrics.totalModels} total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Average Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMLMetrics.averageAccuracy}%</div>
            <p className="text-xs opacity-75 mt-1">High performance</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMLMetrics.totalPredictions.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">AI insights generated</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((mockMLMetrics.successfulPredictions / mockMLMetrics.totalPredictions) * 100).toFixed(1)}%</div>
            <p className="text-xs opacity-75 mt-1">Prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Forecasts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Model Performance
                </CardTitle>
                <CardDescription>
                  Key machine learning model metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Models</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockMLMetrics.activeModels / mockMLMetrics.totalModels) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockMLMetrics.totalModels}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Models</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockMLMetrics.activeModels / mockMLMetrics.totalModels) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockMLMetrics.activeModels}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Accuracy</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockMLMetrics.averageAccuracy} className="w-20" />
                      <span className="text-sm font-medium">{mockMLMetrics.averageAccuracy}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Model Drift</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockMLMetrics.modelDrift * 100} className="w-20" />
                      <span className="text-sm font-medium">{(mockMLMetrics.modelDrift * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Prediction Analytics
                </CardTitle>
                <CardDescription>
                  Prediction performance and analytics metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Predictions</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockMLMetrics.totalPredictions / 10000) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockMLMetrics.totalPredictions.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Successful Predictions</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockMLMetrics.successfulPredictions / mockMLMetrics.totalPredictions) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockMLMetrics.successfulPredictions.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Success Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockMLMetrics.successfulPredictions / mockMLMetrics.totalPredictions) * 100} className="w-20" />
                      <span className="text-sm font-medium">{((mockMLMetrics.successfulPredictions / mockMLMetrics.totalPredictions) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prediction Latency</span>
                    <span className="text-sm font-medium text-green-600">{mockMLMetrics.predictionLatency}s average</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recent Predictions
              </CardTitle>
              <CardDescription>
                Latest AI predictions and their accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPredictions.map((prediction) => (
                  <div key={prediction.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">Model: {mockMLModels.find(m => m.id === prediction.modelId)?.name}</h3>
                      <p className="text-xs text-gray-600">{new Date(prediction.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {(prediction.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                      {prediction.isCorrect ? (
                        <Badge className="bg-green-100 text-green-800">Correct</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Incorrect</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>ML Model Management</CardTitle>
              <CardDescription>
                Manage and monitor machine learning models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium">Model Type</label>
                  <select 
                    value={selectedModelType} 
                    onChange={(e) => setSelectedModelType(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                    <option value="clustering">Clustering</option>
                    <option value="nlp">NLP</option>
                    <option value="computer_vision">Computer Vision</option>
                    <option value="recommendation">Recommendation</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-40 mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="training">Training</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="failed">Failed</option>
                    <option value="deployed">Deployed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Models List */}
          <div className="grid gap-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{model.name}</h3>
                          <Badge className={getModelTypeColor(model.type)}>
                            {model.type}
                          </Badge>
                          <Badge className={getStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                          <Badge variant="outline">
                            v{model.version}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{model.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Accuracy:</span>
                            <p className="text-gray-600">{model.accuracy}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Precision:</span>
                            <p className="text-gray-600">{model.precision}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Recall:</span>
                            <p className="text-gray-600">{model.recall}%</p>
                          </div>
                          <div>
                            <span className="font-medium">F1 Score:</span>
                            <p className="text-gray-600">{model.f1Score}%</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {model.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {model.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{model.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prediction History
              </CardTitle>
              <CardDescription>
                Historical predictions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPredictions.map((prediction) => (
                  <div key={prediction.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {mockMLModels.find(m => m.id === prediction.modelId)?.name}
                          </h3>
                          <p className="text-gray-600">{new Date(prediction.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {(prediction.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                        {prediction.isCorrect ? (
                          <Badge className="bg-green-500 text-white">Correct</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white">Incorrect</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Input Data:</span>
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(prediction.input, null, 2)}</pre>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Prediction Output:</span>
                        <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(prediction.output, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pattern Detection
              </CardTitle>
              <CardDescription>
                AI-detected patterns and anomalies in data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPredictionPatterns.map((pattern) => (
                  <div key={pattern.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{pattern.name}</h3>
                          <p className="text-gray-600">{pattern.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPatternTypeColor(pattern.type)}>
                          {pattern.type}
                        </Badge>
                        <Badge className={getSeverityColor(pattern.severity)}>
                          {pattern.severity}
                        </Badge>
                        <Badge className={getStatusColor(pattern.status)}>
                          {pattern.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{(pattern.confidence * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {new Date(pattern.detectedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">Detected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {pattern.severity.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">Severity</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Investigate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-1" />
                        Set Alert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Predictive Forecasts
              </CardTitle>
              <CardDescription>
                AI-generated forecasts and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockForecasts.map((forecast) => (
                  <div key={forecast.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <LineChart className="h-6 w-6 text-purple-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{forecast.metric}</h3>
                          <p className="text-gray-600">{forecast.timeframe}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {forecast.trend.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {new Date(forecast.lastUpdated).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{forecast.currentValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{forecast.predictedValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Predicted Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {forecast.confidenceInterval[0].toLocaleString()} - {forecast.confidenceInterval[1].toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Confidence Interval</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <LineChart className="h-4 w-4 mr-1" />
                        View Chart
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export Data
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
}















