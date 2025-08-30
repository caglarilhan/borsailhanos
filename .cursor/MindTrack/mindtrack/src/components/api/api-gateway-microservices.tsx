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
  Globe, 
  Network, 
  Server, 
  Database, 
  Cloud, 
  Zap, 
  Activity, 
  Clock, 
  Calendar, 
  User, 
  Users, 
  Settings, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  Save, 
  Bell, 
  BellOff, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  BookOpen, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  Link, 
  Link2, 
  LinkBreak, 
  LinkBreak2, 
  GitBranch, 
  Layers, 
  Filter, 
  Search, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Menu, 
  MoreVertical, 
  X, 
  Check, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Bookmark, 
  Tag, 
  Archive, 
  Folder, 
  File, 
  FilePlus, 
  FileMinus, 
  FileEdit, 
  FileSearch, 
  FileDownload, 
  FileUpload, 
  FileShare, 
  FileLock, 
  FileUnlock, 
  FileHeart, 
  FileStar, 
  FileAward, 
  FileCrown, 
  FileZap, 
  FileTarget, 
  FileShield, 
  FileSettings, 
  FileInfo, 
  FileAlert, 
  FileCheckCircle, 
  FileXCircle, 
  FilePlusCircle, 
  FileMinusCircle, 
  FileEditCircle, 
  FileSearchCircle, 
  FileDownloadCircle, 
  FileUploadCircle, 
  FileShareCircle, 
  FileLockCircle, 
  FileUnlockCircle, 
  FileHeartCircle, 
  FileStarCircle, 
  FileAwardCircle, 
  FileCrownCircle, 
  FileZapCircle, 
  FileTargetCircle, 
  FileShieldCircle, 
  FileSettingsCircle, 
  FileInfoCircle, 
  FileAlertCircle
} from "lucide-react";

// API Gateway & Microservices için gerekli interface'ler
interface APIGateway {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  environment: 'production' | 'staging' | 'development';
  endpoints: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    service: string;
    rateLimit: number;
    timeout: number;
    authentication: boolean;
    authorization: string[];
  }[];
  security: {
    sslEnabled: boolean;
    certificateExpiry: Date;
    rateLimiting: boolean;
    ipWhitelist: string[];
    corsEnabled: boolean;
    corsOrigins: string[];
  };
  monitoring: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    lastHealthCheck: Date;
  };
  loadBalancing: {
    algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted';
    healthCheck: boolean;
    healthCheckInterval: number;
    failoverEnabled: boolean;
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    strategy: 'lru' | 'lfu' | 'fifo';
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number;
    format: 'json' | 'text';
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Microservice {
  id: string;
  name: string;
  version: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  type: 'user-service' | 'auth-service' | 'payment-service' | 'notification-service' | 'analytics-service' | 'file-service';
  language: 'nodejs' | 'python' | 'java' | 'go' | 'rust' | 'csharp';
  framework: string;
  port: number;
  health: {
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastCheck: Date;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
  deployment: {
    replicas: number;
    strategy: 'rolling' | 'blue-green' | 'canary';
    image: string;
    tag: string;
    registry: string;
  };
  networking: {
    internalPort: number;
    externalPort: number;
    protocol: 'http' | 'https' | 'grpc';
    loadBalancer: boolean;
    serviceMesh: boolean;
  };
  database: {
    type: 'postgresql' | 'mongodb' | 'redis' | 'mysql' | 'none';
    connectionString: string;
    poolSize: number;
    migrations: boolean;
  };
  dependencies: {
    service: string;
    type: 'required' | 'optional';
    healthCheck: boolean;
  }[];
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    latency: number;
  };
  logs: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number;
    aggregation: boolean;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceDiscovery {
  id: string;
  name: string;
  type: 'consul' | 'etcd' | 'zookeeper' | 'kubernetes' | 'custom';
  status: 'active' | 'inactive' | 'error';
  services: {
    serviceId: string;
    serviceName: string;
    address: string;
    port: number;
    health: 'healthy' | 'unhealthy' | 'unknown';
    lastSeen: Date;
    metadata: Record<string, string>;
  }[];
  healthChecks: {
    serviceId: string;
    type: 'http' | 'tcp' | 'grpc' | 'script';
    interval: number;
    timeout: number;
    retries: number;
    lastCheck: Date;
    status: 'passing' | 'warning' | 'critical';
  }[];
  configuration: {
    datacenter: string;
    encryption: boolean;
    acl: boolean;
    gossip: boolean;
  };
  performance: {
    registrationTime: number;
    discoveryTime: number;
    healthCheckTime: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoadBalancer {
  id: string;
  name: string;
  type: 'application' | 'network' | 'gateway';
  status: 'active' | 'inactive' | 'maintenance';
  algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted' | 'least-response-time';
  backendServers: {
    id: string;
    address: string;
    port: number;
    weight: number;
    health: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    responseTime: number;
  }[];
  healthChecks: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    path: string;
    expectedStatus: number;
  };
  ssl: {
    enabled: boolean;
    certificate: string;
    privateKey: string;
    certificateExpiry: Date;
  };
  monitoring: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
    totalRequests: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CircuitBreaker {
  id: string;
  name: string;
  service: string;
  status: 'closed' | 'open' | 'half-open';
  configuration: {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringWindow: number;
    minimumRequests: number;
  };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    timeoutRequests: number;
    lastFailure: Date;
    lastSuccess: Date;
  };
  state: {
    currentFailures: number;
    lastStateChange: Date;
    nextAttempt: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface APIMetrics {
  id: string;
  timestamp: Date;
  gateway: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsPerSecond: number;
  };
  services: {
    service: string;
    requests: number;
    errors: number;
    responseTime: number;
    throughput: number;
  }[];
  errors: {
    type: string;
    count: number;
    percentage: number;
  }[];
  performance: {
    p50: number;
    p95: number;
    p99: number;
    maxResponseTime: number;
  };
  createdBy: string;
  createdAt: Date;
}

// API Gateway & Microservices Component - API Gateway ve mikroservisler
export function APIGatewayMicroservices() {
  // State management - Durum yönetimi
  const [apiGateways, setApiGateways] = useState<APIGateway[]>([]);
  const [microservices, setMicroservices] = useState<Microservice[]>([]);
  const [serviceDiscovery, setServiceDiscovery] = useState<ServiceDiscovery[]>([]);
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([]);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<APIGateway | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateGateway, setShowCreateGateway] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [apiPerformance, setApiPerformance] = useState(98.5);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockApiGateways: APIGateway[] = [
      {
        id: '1',
        name: 'MindTrack API Gateway',
        version: '2.1.0',
        status: 'active',
        environment: 'production',
        endpoints: [
          {
            path: '/api/v1/users',
            method: 'GET',
            service: 'user-service',
            rateLimit: 1000,
            timeout: 30,
            authentication: true,
            authorization: ['user', 'admin']
          },
          {
            path: '/api/v1/auth/login',
            method: 'POST',
            service: 'auth-service',
            rateLimit: 100,
            timeout: 15,
            authentication: false,
            authorization: []
          }
        ],
        security: {
          sslEnabled: true,
          certificateExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          rateLimiting: true,
          ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
          corsEnabled: true,
          corsOrigins: ['https://mindtrack.com', 'https://app.mindtrack.com']
        },
        monitoring: {
          requestsPerSecond: 1250,
          averageResponseTime: 45,
          errorRate: 0.02,
          uptime: 99.99,
          lastHealthCheck: new Date(Date.now() - 5 * 60 * 1000)
        },
        loadBalancing: {
          algorithm: 'least-connections',
          healthCheck: true,
          healthCheckInterval: 30,
          failoverEnabled: true
        },
        caching: {
          enabled: true,
          ttl: 300,
          maxSize: 1000,
          strategy: 'lru'
        },
        logging: {
          enabled: true,
          level: 'info',
          retention: 30,
          format: 'json'
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockMicroservices: Microservice[] = [
      {
        id: '1',
        name: 'user-service',
        version: '1.2.0',
        status: 'running',
        type: 'user-service',
        language: 'nodejs',
        framework: 'Express.js',
        port: 3001,
        health: {
          status: 'healthy',
          lastCheck: new Date(Date.now() - 30 * 1000),
          responseTime: 25,
          memoryUsage: 45,
          cpuUsage: 12,
          diskUsage: 15
        },
        deployment: {
          replicas: 3,
          strategy: 'rolling',
          image: 'mindtrack/user-service',
          tag: 'v1.2.0',
          registry: 'docker.io/mindtrack'
        },
        networking: {
          internalPort: 3001,
          externalPort: 3001,
          protocol: 'http',
          loadBalancer: true,
          serviceMesh: true
        },
        database: {
          type: 'postgresql',
          connectionString: 'postgresql://user:pass@db:5432/users',
          poolSize: 20,
          migrations: true
        },
        dependencies: [
          {
            service: 'auth-service',
            type: 'required',
            healthCheck: true
          }
        ],
        metrics: {
          requestsPerSecond: 450,
          averageResponseTime: 25,
          errorRate: 0.01,
          throughput: 1800,
          latency: 15
        },
        logs: {
          level: 'info',
          retention: 7,
          aggregation: true
        },
        createdBy: 'backend-team@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockServiceDiscovery: ServiceDiscovery[] = [
      {
        id: '1',
        name: 'Consul Service Discovery',
        type: 'consul',
        status: 'active',
        services: [
          {
            serviceId: 'user-service-1',
            serviceName: 'user-service',
            address: '10.0.1.10',
            port: 3001,
            health: 'healthy',
            lastSeen: new Date(Date.now() - 30 * 1000),
            metadata: {
              version: '1.2.0',
              environment: 'production',
              datacenter: 'us-west-2'
            }
          }
        ],
        healthChecks: [
          {
            serviceId: 'user-service-1',
            type: 'http',
            interval: 10,
            timeout: 5,
            retries: 3,
            lastCheck: new Date(Date.now() - 30 * 1000),
            status: 'passing'
          }
        ],
        configuration: {
          datacenter: 'us-west-2',
          encryption: true,
          acl: true,
          gossip: true
        },
        performance: {
          registrationTime: 50,
          discoveryTime: 25,
          healthCheckTime: 15
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockLoadBalancers: LoadBalancer[] = [
      {
        id: '1',
        name: 'Application Load Balancer',
        type: 'application',
        status: 'active',
        algorithm: 'least-connections',
        backendServers: [
          {
            id: 'server-1',
            address: '10.0.1.10',
            port: 3001,
            weight: 100,
            health: 'healthy',
            lastCheck: new Date(Date.now() - 30 * 1000),
            responseTime: 25
          }
        ],
        healthChecks: {
          enabled: true,
          interval: 30,
          timeout: 5,
          retries: 3,
          path: '/health',
          expectedStatus: 200
        },
        ssl: {
          enabled: true,
          certificate: 'mindtrack.com.crt',
          privateKey: 'mindtrack.com.key',
          certificateExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        monitoring: {
          requestsPerSecond: 1250,
          averageResponseTime: 45,
          errorRate: 0.02,
          activeConnections: 150,
          totalRequests: 1250000
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCircuitBreakers: CircuitBreaker[] = [
      {
        id: '1',
        name: 'user-service-circuit-breaker',
        service: 'user-service',
        status: 'closed',
        configuration: {
          failureThreshold: 5,
          recoveryTimeout: 60,
          monitoringWindow: 300,
          minimumRequests: 10
        },
        metrics: {
          totalRequests: 125000,
          successfulRequests: 124750,
          failedRequests: 250,
          timeoutRequests: 50,
          lastFailure: new Date(Date.now() - 24 * 60 * 60 * 1000),
          lastSuccess: new Date(Date.now() - 30 * 1000)
        },
        state: {
          currentFailures: 0,
          lastStateChange: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextAttempt: new Date(Date.now() + 60 * 1000)
        },
        createdBy: 'backend-team@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    const mockApiMetrics: APIMetrics = {
      id: '1',
      timestamp: new Date(),
      gateway: {
        totalRequests: 1250000,
        successfulRequests: 1247500,
        failedRequests: 2500,
        averageResponseTime: 45,
        requestsPerSecond: 1250
      },
      services: [
        {
          service: 'user-service',
          requests: 450000,
          errors: 450,
          responseTime: 25,
          throughput: 1800
        },
        {
          service: 'auth-service',
          requests: 300000,
          errors: 300,
          responseTime: 35,
          throughput: 1200
        }
      ],
      errors: [
        {
          type: 'timeout',
          count: 1500,
          percentage: 0.12
        },
        {
          type: 'validation',
          count: 800,
          percentage: 0.064
        },
        {
          type: 'authentication',
          count: 200,
          percentage: 0.016
        }
      ],
      performance: {
        p50: 25,
        p95: 120,
        p99: 250,
        maxResponseTime: 500
      },
      createdBy: 'monitoring@mindtrack.com',
      createdAt: new Date()
    };

    setApiGateways(mockApiGateways);
    setMicroservices(mockMicroservices);
    setServiceDiscovery(mockServiceDiscovery);
    setLoadBalancers(mockLoadBalancers);
    setCircuitBreakers(mockCircuitBreakers);
    setApiMetrics(mockApiMetrics);
  }, []);

  // Create API Gateway - API Gateway oluşturma
  const createApiGateway = useCallback(async (
    name: string,
    environment: APIGateway['environment']
  ) => {
    setLoading(true);
    
    try {
      // Simulated gateway creation - Gateway oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newGateway: APIGateway = {
        id: `gateway_${Date.now()}`,
        name,
        version: '1.0.0',
        status: 'inactive',
        environment,
        endpoints: [],
        security: {
          sslEnabled: false,
          certificateExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          rateLimiting: false,
          ipWhitelist: [],
          corsEnabled: false,
          corsOrigins: []
        },
        monitoring: {
          requestsPerSecond: 0,
          averageResponseTime: 0,
          errorRate: 0,
          uptime: 0,
          lastHealthCheck: new Date()
        },
        loadBalancing: {
          algorithm: 'round-robin',
          healthCheck: false,
          healthCheckInterval: 30,
          failoverEnabled: false
        },
        caching: {
          enabled: false,
          ttl: 300,
          maxSize: 1000,
          strategy: 'lru'
        },
        logging: {
          enabled: false,
          level: 'info',
          retention: 30,
          format: 'json'
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setApiGateways(prev => [newGateway, ...prev]);
      
      return newGateway;
      
    } catch (error) {
      console.error('API Gateway creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create microservice - Mikroservis oluşturma
  const createMicroservice = useCallback(async (
    name: string,
    type: Microservice['type'],
    language: Microservice['language']
  ) => {
    setLoading(true);
    
    try {
      // Simulated service creation - Servis oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newService: Microservice = {
        id: `service_${Date.now()}`,
        name,
        version: '1.0.0',
        status: 'stopped',
        type,
        language,
        framework: 'Express.js',
        port: 3000,
        health: {
          status: 'unknown',
          lastCheck: new Date(),
          responseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          diskUsage: 0
        },
        deployment: {
          replicas: 1,
          strategy: 'rolling',
          image: `mindtrack/${name}`,
          tag: 'v1.0.0',
          registry: 'docker.io/mindtrack'
        },
        networking: {
          internalPort: 3000,
          externalPort: 3000,
          protocol: 'http',
          loadBalancer: false,
          serviceMesh: false
        },
        database: {
          type: 'none',
          connectionString: '',
          poolSize: 10,
          migrations: false
        },
        dependencies: [],
        metrics: {
          requestsPerSecond: 0,
          averageResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          latency: 0
        },
        logs: {
          level: 'info',
          retention: 7,
          aggregation: false
        },
        createdBy: 'backend-team@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setMicroservices(prev => [newService, ...prev]);
      
      return newService;
      
    } catch (error) {
      console.error('Microservice creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate API metrics - API metriklerini hesaplama
  const calculateApiMetrics = useCallback(() => {
    const totalGateways = apiGateways.length;
    const activeGateways = apiGateways.filter(gateway => gateway.status === 'active').length;
    const totalServices = microservices.length;
    const runningServices = microservices.filter(service => service.status === 'running').length;
    const totalLoadBalancers = loadBalancers.length;
    const activeLoadBalancers = loadBalancers.filter(lb => lb.status === 'active').length;
    const totalCircuitBreakers = circuitBreakers.length;
    const closedCircuitBreakers = circuitBreakers.filter(cb => cb.status === 'closed').length;
    
    return {
      totalGateways,
      activeGateways,
      gatewayActivationRate: totalGateways > 0 ? Math.round((activeGateways / totalGateways) * 100) : 0,
      totalServices,
      runningServices,
      serviceActivationRate: totalServices > 0 ? Math.round((runningServices / totalServices) * 100) : 0,
      totalLoadBalancers,
      activeLoadBalancers,
      loadBalancerActivationRate: totalLoadBalancers > 0 ? Math.round((activeLoadBalancers / totalLoadBalancers) * 100) : 0,
      totalCircuitBreakers,
      closedCircuitBreakers,
      circuitBreakerHealthRate: totalCircuitBreakers > 0 ? Math.round((closedCircuitBreakers / totalCircuitBreakers) * 100) : 0
    };
  }, [apiGateways, microservices, loadBalancers, circuitBreakers]);

  const metrics = calculateApiMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🌐 API Gateway & Microservices</h2>
          <p className="text-gray-600">API gateway management and microservices architecture</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Globe className="h-3 w-3 mr-1" />
            {metrics.activeGateways} Active Gateways
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {apiPerformance}% Performance
          </Badge>
        </div>
      </div>

      {/* API Overview - API Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">API Gateways</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeGateways}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalGateways} total gateways
            </p>
            <Progress value={metrics.gatewayActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Microservices</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.runningServices}</div>
            <p className="text-xs text-green-700">
              {metrics.totalServices} total services
            </p>
            <Progress value={metrics.serviceActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Load Balancers</CardTitle>
            <Network className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activeLoadBalancers}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalLoadBalancers} total load balancers
            </p>
            <Progress value={metrics.loadBalancerActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Circuit Breakers</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.closedCircuitBreakers}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalCircuitBreakers} total circuit breakers
            </p>
            <Progress value={metrics.circuitBreakerHealthRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* API Gateways - API Gateway'ler */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">API Gateways</span>
            </div>
            <Button
              onClick={() => setShowCreateGateway(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Gateway
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage API gateways and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {apiGateways.map((gateway) => (
              <div key={gateway.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{gateway.name}</div>
                    <div className="text-sm text-blue-600">v{gateway.version} • {gateway.environment}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={gateway.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {gateway.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {gateway.endpoints.length} endpoints
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {gateway.monitoring.requestsPerSecond} req/s
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Security</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>SSL: {gateway.security.sslEnabled ? '✅' : '❌'}</div>
                      <div>Rate Limiting: {gateway.security.rateLimiting ? '✅' : '❌'}</div>
                      <div>CORS: {gateway.security.corsEnabled ? '✅' : '❌'}</div>
                      <div>IP Whitelist: {gateway.security.ipWhitelist.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Monitoring</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Requests/sec: {gateway.monitoring.requestsPerSecond}</div>
                      <div>Avg Response: {gateway.monitoring.averageResponseTime}ms</div>
                      <div>Error Rate: {gateway.monitoring.errorRate}%</div>
                      <div>Uptime: {gateway.monitoring.uptime}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Load Balancing</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Algorithm: {gateway.loadBalancing.algorithm}</div>
                      <div>Health Check: {gateway.loadBalancing.healthCheck ? '✅' : '❌'}</div>
                      <div>Failover: {gateway.loadBalancing.failoverEnabled ? '✅' : '❌'}</div>
                      <div>Interval: {gateway.loadBalancing.healthCheckInterval}s</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Caching</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Enabled: {gateway.caching.enabled ? '✅' : '❌'}</div>
                      <div>TTL: {gateway.caching.ttl}s</div>
                      <div>Max Size: {gateway.caching.maxSize}</div>
                      <div>Strategy: {gateway.caching.strategy}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Microservices - Mikroservisler */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Microservices</span>
            </div>
            <Button
              onClick={() => setShowCreateService(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Monitor microservices and their health status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {microservices.map((service) => (
              <div key={service.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{service.name}</div>
                    <div className="text-sm text-green-600">{service.language} • {service.framework} • v{service.version}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={service.status === 'running' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {service.status}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {service.type}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      Port {service.port}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Health</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Status: {service.health.status}</div>
                      <div>Response Time: {service.health.responseTime}ms</div>
                      <div>Memory: {service.health.memoryUsage}%</div>
                      <div>CPU: {service.health.cpuUsage}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Deployment</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Replicas: {service.deployment.replicas}</div>
                      <div>Strategy: {service.deployment.strategy}</div>
                      <div>Image: {service.deployment.image}:{service.deployment.tag}</div>
                      <div>Registry: {service.deployment.registry}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Metrics</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Requests/sec: {service.metrics.requestsPerSecond}</div>
                      <div>Avg Response: {service.metrics.averageResponseTime}ms</div>
                      <div>Error Rate: {service.metrics.errorRate}%</div>
                      <div>Throughput: {service.metrics.throughput}</div>
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
