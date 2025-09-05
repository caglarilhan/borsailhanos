"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Activity, 
  Zap, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Settings, 
  Eye, 
  Download, 
  Upload, 
  Database, 
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal,
  Bell,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Edit,
  Trash2,
  Copy,
  Share2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
  Printer,
  Archive,
  Shield,
  Key,
  Lock,
  Unlock,
  Globe,
  MapPin,
  Phone,
  Mail,
  Video,
  Image,
  File,
  Folder,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Table,
  List,
  Grid,
  Columns,
  Rows,
  SortAsc,
  SortDesc,
  FilterIcon,
  Search as SearchIcon,
  Database as DatabaseIcon,
  BarChart3 as BarChart3Icon,
  TrendingUp as TrendingUpIcon,
  Target as TargetIcon,
  Activity as ActivityIcon,
  Brain as BrainIcon,
  Zap as ZapIcon
} from "lucide-react";

// Predictive Analytics & Machine Learning için gerekli interface'ler
interface MLModel {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'regression' | 'clustering' | 'nlp' | 'computer-vision' | 'recommendation';
  algorithm: string;
  version: string;
  status: 'training' | 'active' | 'inactive' | 'error' | 'deployed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: {
    size: number;
    features: number;
    samples: number;
    lastUpdated: Date;
  };
  performance: {
    trainingTime: number;
    inferenceTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  hyperparameters: {
    [key: string]: any;
  };
  metrics: {
    mse?: number;
    mae?: number;
    r2?: number;
    confusionMatrix?: number[][];
    rocCurve?: {
      fpr: number[];
      tpr: number[];
      auc: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  createdBy: string;
}

interface Prediction {
  id: string;
  modelId: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: Date;
  processingTime: number;
  status: 'success' | 'error' | 'pending';
  metadata: {
    featureImportance?: number[];
    predictionInterval?: {
      lower: number;
      upper: number;
    };
    explanation?: string;
  };
}

interface PatternRecognition {
  id: string;
  name: string;
  description: string;
  type: 'anomaly' | 'trend' | 'seasonality' | 'correlation' | 'clustering';
  dataSource: string;
  pattern: {
    frequency: string;
    strength: number;
    confidence: number;
    description: string;
  };
  detection: {
    algorithm: string;
    threshold: number;
    sensitivity: number;
    lastDetected: Date;
  };
  insights: {
    businessImpact: 'high' | 'medium' | 'low';
    recommendations: string[];
    actions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ModelPerformance {
  id: string;
  modelId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    mse?: number;
    mae?: number;
    r2?: number;
    auc?: number;
  };
  drift: {
    dataDrift: number;
    conceptDrift: number;
    performanceDrift: number;
    isDrifting: boolean;
  };
  monitoring: {
    predictions: number;
    errors: number;
    errorRate: number;
    averageResponseTime: number;
    throughput: number;
  };
  alerts: {
    type: 'performance' | 'drift' | 'error' | 'resource';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    isResolved: boolean;
  }[];
}

interface Forecasting {
  id: string;
  name: string;
  description: string;
  target: string;
  horizon: number; // days
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  model: string;
  data: {
    historical: {
      date: Date;
      value: number;
    }[];
    forecast: {
      date: Date;
      value: number;
      lowerBound: number;
      upperBound: number;
      confidence: number;
    }[];
  };
  accuracy: {
    mape: number;
    rmse: number;
    mae: number;
  };
  seasonality: {
    detected: boolean;
    period: number;
    strength: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    slope: number;
    significance: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastForecast: Date;
}

interface ModelTraining {
  id: string;
  modelId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  dataset: {
    name: string;
    size: number;
    features: number;
    samples: number;
    split: {
      train: number;
      validation: number;
      test: number;
    };
  };
  hyperparameters: {
    [key: string]: any;
  };
  results: {
    accuracy: number;
    loss: number;
    validationAccuracy: number;
    validationLoss: number;
  };
  logs: {
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    message: string;
  }[];
  artifacts: {
    modelPath: string;
    metricsPath: string;
    logsPath: string;
  };
  createdBy: string;
  createdAt: Date;
}

interface FeatureEngineering {
  id: string;
  name: string;
  description: string;
  type: 'numerical' | 'categorical' | 'temporal' | 'text' | 'image';
  source: string;
  transformation: {
    method: string;
    parameters: any;
    output: string;
  };
  statistics: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    uniqueValues?: number;
    missingValues: number;
    missingPercentage: number;
  };
  importance: {
    score: number;
    rank: number;
    contribution: number;
  };
  quality: {
    completeness: number;
    consistency: number;
    accuracy: number;
    timeliness: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Predictive Analytics & Machine Learning Component - Tahminsel analitikler ve makine öğrenmesi
export function PredictiveAnalytics() {
  // State management - Durum yönetimi
  const [mlModels, setMlModels] = useState<MLModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [patternRecognition, setPatternRecognition] = useState<PatternRecognition[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [forecasting, setForecasting] = useState<Forecasting[]>([]);
  const [modelTraining, setModelTraining] = useState<ModelTraining[]>([]);
  const [featureEngineering, setFeatureEngineering] = useState<FeatureEngineering[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTrainModel, setShowTrainModel] = useState(false);
  const [showCreateForecast, setShowCreateForecast] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState(94.2);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockMLModels: MLModel[] = [
      {
        id: '1',
        name: 'Patient Outcome Predictor',
        description: 'Predicts patient treatment outcomes based on clinical data',
        type: 'classification',
        algorithm: 'Random Forest',
        version: '2.1.0',
        status: 'active',
        accuracy: 94.2,
        precision: 92.8,
        recall: 95.1,
        f1Score: 93.9,
        trainingData: {
          size: 2048576,
          features: 45,
          samples: 12500,
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        performance: {
          trainingTime: 1800,
          inferenceTime: 0.15,
          memoryUsage: 512,
          cpuUsage: 25
        },
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 2,
          min_samples_leaf: 1
        },
        metrics: {
          confusionMatrix: [
            [850, 50],
            [30, 870]
          ],
          rocCurve: {
            fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            tpr: [0, 0.85, 0.92, 0.95, 0.97, 0.98, 0.99, 0.995, 0.998, 0.999, 1.0],
            auc: 0.945
          }
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        deployedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        createdBy: 'ml_team@mindtrack.com'
      }
    ];

    const mockPredictions: Prediction[] = [
      {
        id: '1',
        modelId: '1',
        input: {
          age: 35,
          gender: 'female',
          diagnosis: 'anxiety',
          treatment_duration: 6,
          previous_sessions: 8
        },
        output: {
          predicted_outcome: 'positive',
          probability: 0.87,
          confidence_interval: [0.82, 0.92]
        },
        confidence: 0.87,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        processingTime: 0.12,
        status: 'success',
        metadata: {
          featureImportance: [0.25, 0.18, 0.15, 0.12, 0.10],
          explanation: 'High confidence due to positive treatment history and moderate session count'
        }
      }
    ];

    const mockPatternRecognition: PatternRecognition[] = [
      {
        id: '1',
        name: 'Seasonal Depression Pattern',
        description: 'Identifies seasonal patterns in depression-related appointments',
        type: 'seasonality',
        dataSource: 'appointment_data',
        pattern: {
          frequency: 'yearly',
          strength: 0.78,
          confidence: 0.92,
          description: 'Peak in winter months (Dec-Feb), decline in summer (Jun-Aug)'
        },
        detection: {
          algorithm: 'Fourier Transform',
          threshold: 0.7,
          sensitivity: 0.85,
          lastDetected: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        insights: {
          businessImpact: 'high',
          recommendations: [
            'Increase staff during winter months',
            'Develop seasonal treatment programs',
            'Prepare marketing campaigns for seasonal awareness'
          ],
          actions: [
            'Schedule additional therapists for winter',
            'Create seasonal treatment protocols'
          ]
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockModelPerformance: ModelPerformance[] = [
      {
        id: '1',
        modelId: '1',
        period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        metrics: {
          accuracy: 94.2,
          precision: 92.8,
          recall: 95.1,
          f1Score: 93.9,
          auc: 0.945
        },
        drift: {
          dataDrift: 0.08,
          conceptDrift: 0.05,
          performanceDrift: 0.03,
          isDrifting: false
        },
        monitoring: {
          predictions: 1250,
          errors: 12,
          errorRate: 0.96,
          averageResponseTime: 0.15,
          throughput: 45.2
        },
        alerts: [
          {
            type: 'performance',
            severity: 'low',
            message: 'Model accuracy slightly decreased by 0.5%',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            isResolved: true
          }
        ]
      }
    ];

    const mockForecasting: Forecasting[] = [
      {
        id: '1',
        name: 'Patient Volume Forecast',
        description: 'Predicts patient volume for the next 30 days',
        target: 'daily_patients',
        horizon: 30,
        frequency: 'daily',
        model: 'Prophet',
        data: {
          historical: [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 45 },
            { date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), value: 52 },
            { date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), value: 48 }
          ],
          forecast: [
            {
              date: new Date(Date.now() + 24 * 60 * 60 * 1000),
              value: 55,
              lowerBound: 48,
              upperBound: 62,
              confidence: 0.85
            }
          ]
        },
        accuracy: {
          mape: 8.5,
          rmse: 4.2,
          mae: 3.1
        },
        seasonality: {
          detected: true,
          period: 7,
          strength: 0.75
        },
        trends: {
          direction: 'up',
          slope: 0.15,
          significance: 0.92
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastForecast: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    setMlModels(mockMLModels);
    setPredictions(mockPredictions);
    setPatternRecognition(mockPatternRecognition);
    setModelPerformance(mockModelPerformance);
    setForecasting(mockForecasting);
  }, []);

  // Train model - Model eğitimi
  const trainModel = useCallback(async (
    modelId: string,
    dataset: string,
    hyperparameters: any
  ) => {
    setLoading(true);
    
    try {
      // Simulated model training - Model eğitimi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const trainingJob: ModelTraining = {
        id: `training_${Date.now()}`,
        modelId,
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 3000),
        endTime: new Date(),
        duration: 3000,
        dataset: {
          name: dataset,
          size: 2048576,
          features: 45,
          samples: 12500,
          split: {
            train: 70,
            validation: 15,
            test: 15
          }
        },
        hyperparameters,
        results: {
          accuracy: 94.2,
          loss: 0.058,
          validationAccuracy: 93.8,
          validationLoss: 0.062
        },
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: 'Training completed successfully'
          }
        ],
        artifacts: {
          modelPath: '/models/patient_outcome_predictor_v2.1.1.pkl',
          metricsPath: '/metrics/training_metrics.json',
          logsPath: '/logs/training_logs.txt'
        },
        createdBy: 'current_user',
        createdAt: new Date()
      };
      
      setModelTraining(prev => [trainingJob, ...prev]);
      
      return trainingJob;
      
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Make prediction - Tahmin yapma
  const makePrediction = useCallback(async (
    modelId: string,
    input: any
  ) => {
    setLoading(true);
    
    try {
      // Simulated prediction - Tahmin simülasyonu
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const prediction: Prediction = {
        id: `prediction_${Date.now()}`,
        modelId,
        input,
        output: {
          predicted_outcome: Math.random() > 0.5 ? 'positive' : 'negative',
          probability: Math.random() * 0.3 + 0.7,
          confidence_interval: [0.75, 0.95]
        },
        confidence: Math.random() * 0.3 + 0.7,
        timestamp: new Date(),
        processingTime: Math.random() * 0.2 + 0.1,
        status: 'success',
        metadata: {
          featureImportance: [0.25, 0.18, 0.15, 0.12, 0.10],
          explanation: 'Prediction based on input features and model confidence'
        }
      };
      
      setPredictions(prev => [prediction, ...prev]);
      
      return prediction;
      
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate ML metrics - ML metriklerini hesaplama
  const calculateMLMetrics = useCallback(() => {
    const totalModels = mlModels.length;
    const activeModels = mlModels.filter(m => m.status === 'active').length;
    const totalPredictions = predictions.length;
    const successfulPredictions = predictions.filter(p => p.status === 'success').length;
    const totalPatterns = patternRecognition.length;
    const totalForecasts = forecasting.length;
    const totalTrainingJobs = modelTraining.length;
    const completedTrainingJobs = modelTraining.filter(t => t.status === 'completed').length;
    
    return {
      totalModels,
      activeModels,
      modelActivationRate: totalModels > 0 ? Math.round((activeModels / totalModels) * 100) : 0,
      totalPredictions,
      successfulPredictions,
      predictionSuccessRate: totalPredictions > 0 ? Math.round((successfulPredictions / totalPredictions) * 100) : 0,
      totalPatterns,
      totalForecasts,
      totalTrainingJobs,
      completedTrainingJobs,
      trainingSuccessRate: totalTrainingJobs > 0 ? Math.round((completedTrainingJobs / totalTrainingJobs) * 100) : 0
    };
  }, [mlModels, predictions, patternRecognition, forecasting, modelTraining]);

  const metrics = calculateMLMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 Predictive Analytics & Machine Learning</h2>
          <p className="text-gray-600">Advanced ML models and predictive analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Brain className="h-3 w-3 mr-1" />
            {metrics.activeModels} Active Models
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {modelAccuracy}% Accuracy
          </Badge>
        </div>
      </div>

      {/* ML Overview - ML Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeModels}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalModels} total models
            </p>
            <Progress value={metrics.modelActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Predictions</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.successfulPredictions}</div>
            <p className="text-xs text-green-700">
              {metrics.totalPredictions} total predictions
            </p>
            <Progress value={metrics.predictionSuccessRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Pattern Recognition</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.totalPatterns}</div>
            <p className="text-xs text-purple-700">
              Detected patterns
            </p>
            <Progress value={85} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Forecasts</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.totalForecasts}</div>
            <p className="text-xs text-orange-700">
              Active forecasts
            </p>
            <Progress value={92} className="mt-2 h-1" />
          </CardContent>
        </Card>
             </div>

       {/* ML Models - ML Modelleri */}
       <Card className="border-2 border-blue-100 shadow-lg">
         <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
           <CardTitle className="flex items-center justify-between">
             <div className="flex items-center">
               <Brain className="h-5 w-5 mr-2 text-blue-600" />
               <span className="text-blue-900">ML Models</span>
             </div>
             <Button
               onClick={() => setShowTrainModel(true)}
               className="bg-blue-600 hover:bg-blue-700 text-white"
             >
               <Play className="h-4 w-4 mr-2" />
               Train Model
             </Button>
           </CardTitle>
           <CardDescription className="text-blue-700">
             Manage machine learning models and their performance
           </CardDescription>
         </CardHeader>
         <CardContent className="p-6">
           <div className="space-y-4">
             {mlModels.map((model) => (
               <div key={model.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between mb-3">
                   <div>
                     <div className="font-semibold text-blue-900">{model.name}</div>
                     <div className="text-sm text-blue-600">{model.description}</div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Badge variant={model.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                       {model.status}
                     </Badge>
                     <Badge variant="outline" className="border-blue-300 text-blue-700">
                       {model.type}
                     </Badge>
                     <Badge variant="outline" className="border-blue-300 text-blue-700">
                       v{model.version}
                     </Badge>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance Metrics</h4>
                     <div className="space-y-1 text-sm text-blue-600">
                       <div>Accuracy: {model.accuracy}%</div>
                       <div>Precision: {model.precision}%</div>
                       <div>Recall: {model.recall}%</div>
                       <div>F1 Score: {model.f1Score}%</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-blue-800">Training Data</h4>
                     <div className="space-y-1 text-sm text-blue-600">
                       <div>Samples: {model.trainingData.samples.toLocaleString()}</div>
                       <div>Features: {model.trainingData.features}</div>
                       <div>Size: {(model.trainingData.size / 1024 / 1024).toFixed(1)} MB</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                     <div className="space-y-1 text-sm text-blue-600">
                       <div>Training: {model.performance.trainingTime}s</div>
                       <div>Inference: {model.performance.inferenceTime}s</div>
                       <div>Memory: {model.performance.memoryUsage}MB</div>
                       <div>CPU: {model.performance.cpuUsage}%</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-blue-800">Algorithm</h4>
                     <div className="space-y-1 text-sm text-blue-600">
                       <div>{model.algorithm}</div>
                       <div>Created: {model.createdAt.toLocaleDateString()}</div>
                       <div>Updated: {model.updatedAt.toLocaleDateString()}</div>
                       {model.deployedAt && (
                         <div>Deployed: {model.deployedAt.toLocaleDateString()}</div>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>

       {/* Pattern Recognition - Örüntü Tanıma */}
       <Card className="border-2 border-purple-100 shadow-lg">
         <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
           <CardTitle className="flex items-center">
             <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
             <span className="text-purple-900">Pattern Recognition</span>
           </CardTitle>
           <CardDescription className="text-purple-700">
             Detect patterns and anomalies in data
           </CardDescription>
         </CardHeader>
         <CardContent className="p-6">
           <div className="space-y-4">
             {patternRecognition.map((pattern) => (
               <div key={pattern.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between mb-3">
                   <div>
                     <div className="font-semibold text-purple-900">{pattern.name}</div>
                     <div className="text-sm text-purple-600">{pattern.description}</div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Badge variant="outline" className="border-purple-300 text-purple-700">
                       {pattern.type}
                     </Badge>
                     <Badge variant="outline" className="border-purple-300 text-purple-700">
                       {Math.round(pattern.pattern.confidence * 100)}% confidence
                     </Badge>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-purple-800">Pattern Details</h4>
                     <div className="space-y-1 text-sm text-purple-600">
                       <div>Frequency: {pattern.pattern.frequency}</div>
                       <div>Strength: {pattern.pattern.strength}</div>
                       <div>Description: {pattern.pattern.description}</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-purple-800">Detection</h4>
                     <div className="space-y-1 text-sm text-purple-600">
                       <div>Algorithm: {pattern.detection.algorithm}</div>
                       <div>Threshold: {pattern.detection.threshold}</div>
                       <div>Sensitivity: {pattern.detection.sensitivity}</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-purple-800">Insights</h4>
                     <div className="space-y-1 text-sm text-purple-600">
                       <div>Impact: {pattern.insights.businessImpact}</div>
                       <div>Actions: {pattern.insights.actions.length}</div>
                       <div>Recommendations: {pattern.insights.recommendations.length}</div>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>

       {/* Forecasting - Tahminleme */}
       <Card className="border-2 border-orange-100 shadow-lg">
         <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
           <CardTitle className="flex items-center justify-between">
             <div className="flex items-center">
               <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
               <span className="text-orange-900">Forecasting</span>
             </div>
             <Button
               onClick={() => setShowCreateForecast(true)}
               className="bg-orange-600 hover:bg-orange-700 text-white"
             >
               <Plus className="h-4 w-4 mr-2" />
               Create Forecast
             </Button>
           </CardTitle>
           <CardDescription className="text-orange-700">
             Time series forecasting and predictions
           </CardDescription>
         </CardHeader>
         <CardContent className="p-6">
           <div className="space-y-4">
             {forecasting.map((forecast) => (
               <div key={forecast.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between mb-3">
                   <div>
                     <div className="font-semibold text-orange-900">{forecast.name}</div>
                     <div className="text-sm text-orange-600">{forecast.description}</div>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Badge variant="outline" className="border-orange-300 text-orange-700">
                       {forecast.frequency}
                     </Badge>
                     <Badge variant="outline" className="border-orange-300 text-orange-700">
                       {forecast.horizon} days
                     </Badge>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-orange-800">Accuracy</h4>
                     <div className="space-y-1 text-sm text-orange-600">
                       <div>MAPE: {forecast.accuracy.mape}%</div>
                       <div>RMSE: {forecast.accuracy.rmse}</div>
                       <div>MAE: {forecast.accuracy.mae}</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-orange-800">Seasonality</h4>
                     <div className="space-y-1 text-sm text-orange-600">
                       <div>Detected: {forecast.seasonality.detected ? 'Yes' : 'No'}</div>
                       <div>Period: {forecast.seasonality.period}</div>
                       <div>Strength: {forecast.seasonality.strength}</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-orange-800">Trends</h4>
                     <div className="space-y-1 text-sm text-orange-600">
                       <div>Direction: {forecast.trends.direction}</div>
                       <div>Slope: {forecast.trends.slope}</div>
                       <div>Significance: {forecast.trends.significance}</div>
                     </div>
                   </div>
                   
                   <div>
                     <h4 className="font-semibold text-sm mb-2 text-orange-800">Model Info</h4>
                     <div className="space-y-1 text-sm text-orange-600">
                       <div>Model: {forecast.model}</div>
                       <div>Target: {forecast.target}</div>
                       <div>Last Forecast: {forecast.lastForecast.toLocaleDateString()}</div>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }
