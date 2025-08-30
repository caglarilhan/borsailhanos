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
  Cloud, 
  Server, 
  Database, 
  Network, 
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

// Cloud Infrastructure & DevOps için gerekli interface'ler
interface CloudProvider {
  id: string;
  name: 'aws' | 'azure' | 'gcp' | 'digitalocean' | 'linode' | 'custom';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  region: string;
  credentials: {
    accessKey: string;
    secretKey: string;
    region: string;
    lastRotated: Date;
  };
  services: {
    compute: boolean;
    storage: boolean;
    database: boolean;
    networking: boolean;
    monitoring: boolean;
    security: boolean;
  };
  resources: {
    instances: number;
    storage: number;
    databases: number;
    loadBalancers: number;
    networks: number;
  };
  costs: {
    monthly: number;
    daily: number;
    hourly: number;
    currency: string;
  };
  compliance: {
    hipaa: boolean;
    soc2: boolean;
    gdpr: boolean;
    pci: boolean;
    iso27001: boolean;
  };
  monitoring: {
    uptime: number;
    lastCheck: Date;
    alerts: number;
    incidents: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Infrastructure {
  id: string;
  name: string;
  type: 'vpc' | 'subnet' | 'security-group' | 'route-table' | 'internet-gateway';
  provider: string;
  region: string;
  status: 'active' | 'inactive' | 'creating' | 'deleting' | 'error';
  configuration: {
    cidr: string;
    availabilityZone: string;
    publicSubnet: boolean;
    privateSubnet: boolean;
    natGateway: boolean;
  };
  security: {
    encryption: boolean;
    firewall: boolean;
    vpn: boolean;
    accessControl: boolean;
  };
  networking: {
    ipAddresses: string[];
    dns: string[];
    routing: Record<string, string>;
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    logs: boolean;
    alerts: boolean;
  };
  tags: Record<string, string>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ContainerOrchestration {
  id: string;
  name: string;
  type: 'kubernetes' | 'docker-swarm' | 'nomad' | 'rancher' | 'openshift';
  version: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  cluster: {
    nodes: number;
    masters: number;
    workers: number;
    capacity: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
  workloads: {
    deployments: number;
    services: number;
    pods: number;
    configmaps: number;
    secrets: number;
  };
  networking: {
    serviceMesh: boolean;
    ingress: boolean;
    loadBalancer: boolean;
    dns: boolean;
  };
  storage: {
    persistentVolumes: number;
    storageClasses: number;
    claims: number;
  };
  security: {
    rbac: boolean;
    networkPolicies: boolean;
    podSecurity: boolean;
    secretsManagement: boolean;
  };
  monitoring: {
    prometheus: boolean;
    grafana: boolean;
    jaeger: boolean;
    elasticsearch: boolean;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CI_CDPipeline {
  id: string;
  name: string;
  type: 'jenkins' | 'gitlab-ci' | 'github-actions' | 'azure-devops' | 'circleci' | 'travis-ci';
  status: 'active' | 'inactive' | 'running' | 'failed' | 'success';
  repository: {
    url: string;
    branch: string;
    provider: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  };
  stages: {
    name: string;
    type: 'build' | 'test' | 'deploy' | 'security' | 'notification';
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
    duration: number;
    logs: string[];
  }[];
  triggers: {
    push: boolean;
    pullRequest: boolean;
    schedule: boolean;
    manual: boolean;
  };
  environments: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
  security: {
    secretsManagement: boolean;
    vulnerabilityScanning: boolean;
    complianceChecking: boolean;
  };
  monitoring: {
    buildTime: number;
    successRate: number;
    failureRate: number;
    lastBuild: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InfrastructureAsCode {
  id: string;
  name: string;
  type: 'terraform' | 'cloudformation' | 'ansible' | 'puppet' | 'chef' | 'arm';
  status: 'active' | 'inactive' | 'applying' | 'destroying' | 'error';
  provider: string;
  version: string;
  modules: {
    name: string;
    version: string;
    source: string;
    variables: Record<string, string>;
  }[];
  state: {
    managed: number;
    data: number;
    outputs: number;
    lastApplied: Date;
  };
  configuration: {
    backend: string;
    workspace: string;
    variables: Record<string, string>;
    outputs: Record<string, string>;
  };
  security: {
    encryption: boolean;
    accessControl: boolean;
    auditLogging: boolean;
  };
  collaboration: {
    teamAccess: boolean;
    versionControl: boolean;
    reviewProcess: boolean;
  };
  monitoring: {
    driftDetection: boolean;
    complianceChecking: boolean;
    costOptimization: boolean;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MonitoringStack {
  id: string;
  name: string;
  type: 'prometheus' | 'grafana' | 'datadog' | 'new-relic' | 'splunk' | 'elastic';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  components: {
    metrics: boolean;
    logging: boolean;
    tracing: boolean;
    alerting: boolean;
    visualization: boolean;
  };
  dataSources: {
    name: string;
    type: string;
    url: string;
    status: 'connected' | 'disconnected' | 'error';
  }[];
  dashboards: {
    name: string;
    description: string;
    panels: number;
    lastUpdated: Date;
  }[];
  alerts: {
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'inactive' | 'firing' | 'resolved';
    threshold: number;
    lastTriggered: Date;
  }[];
  retention: {
    metrics: number;
    logs: number;
    traces: number;
  };
  performance: {
    queryResponseTime: number;
    dataIngestionRate: number;
    storageUsage: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cloud Infrastructure & DevOps Component - Bulut altyapısı ve DevOps
export function CloudInfrastructureDevOps() {
  // State management - Durum yönetimi
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [containerOrchestration, setContainerOrchestration] = useState<ContainerOrchestration[]>([]);
  const [ciCdPipelines, setCiCdPipelines] = useState<CI_CDPipeline[]>([]);
  const [infrastructureAsCode, setInfrastructureAsCode] = useState<InfrastructureAsCode[]>([]);
  const [monitoringStacks, setMonitoringStacks] = useState<MonitoringStack[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateProvider, setShowCreateProvider] = useState(false);
  const [showCreatePipeline, setShowCreatePipeline] = useState(false);
  const [infrastructureHealth, setInfrastructureHealth] = useState(97.8);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockCloudProviders: CloudProvider[] = [
      {
        id: '1',
        name: 'aws',
        status: 'active',
        region: 'us-west-2',
        credentials: {
          accessKey: 'AKIAIOSFODNN7EXAMPLE',
          secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          region: 'us-west-2',
          lastRotated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        services: {
          compute: true,
          storage: true,
          database: true,
          networking: true,
          monitoring: true,
          security: true
        },
        resources: {
          instances: 25,
          storage: 500,
          databases: 8,
          loadBalancers: 5,
          networks: 12
        },
        costs: {
          monthly: 12500,
          daily: 417,
          hourly: 17.4,
          currency: 'USD'
        },
        compliance: {
          hipaa: true,
          soc2: true,
          gdpr: true,
          pci: true,
          iso27001: true
        },
        monitoring: {
          uptime: 99.99,
          lastCheck: new Date(Date.now() - 5 * 60 * 1000),
          alerts: 2,
          incidents: 0
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockInfrastructure: Infrastructure[] = [
      {
        id: '1',
        name: 'MindTrack VPC',
        type: 'vpc',
        provider: 'aws',
        region: 'us-west-2',
        status: 'active',
        configuration: {
          cidr: '10.0.0.0/16',
          availabilityZone: 'us-west-2a,us-west-2b,us-west-2c',
          publicSubnet: true,
          privateSubnet: true,
          natGateway: true
        },
        security: {
          encryption: true,
          firewall: true,
          vpn: true,
          accessControl: true
        },
        networking: {
          ipAddresses: ['10.0.1.0/24', '10.0.2.0/24', '10.0.3.0/24'],
          dns: ['8.8.8.8', '8.8.4.4'],
          routing: {
            '0.0.0.0/0': 'igw-12345678'
          }
        },
        monitoring: {
          enabled: true,
          metrics: ['cpu', 'memory', 'network', 'disk'],
          logs: true,
          alerts: true
        },
        tags: {
          Environment: 'production',
          Project: 'mindtrack',
          Owner: 'devops-team'
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockContainerOrchestration: ContainerOrchestration[] = [
      {
        id: '1',
        name: 'MindTrack Kubernetes Cluster',
        type: 'kubernetes',
        version: '1.28.0',
        status: 'running',
        cluster: {
          nodes: 12,
          masters: 3,
          workers: 9,
          capacity: {
            cpu: 48,
            memory: 192,
            storage: 2000
          }
        },
        workloads: {
          deployments: 25,
          services: 18,
          pods: 45,
          configmaps: 12,
          secrets: 8
        },
        networking: {
          serviceMesh: true,
          ingress: true,
          loadBalancer: true,
          dns: true
        },
        storage: {
          persistentVolumes: 15,
          storageClasses: 3,
          claims: 12
        },
        security: {
          rbac: true,
          networkPolicies: true,
          podSecurity: true,
          secretsManagement: true
        },
        monitoring: {
          prometheus: true,
          grafana: true,
          jaeger: true,
          elasticsearch: true
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCiCdPipelines: CI_CDPipeline[] = [
      {
        id: '1',
        name: 'MindTrack CI/CD Pipeline',
        type: 'github-actions',
        status: 'active',
        repository: {
          url: 'https://github.com/mindtrack/mindtrack-app',
          branch: 'main',
          provider: 'github'
        },
        stages: [
          {
            name: 'Build',
            type: 'build',
            status: 'success',
            duration: 120,
            logs: ['Building application...', 'Dependencies installed', 'Build completed successfully']
          },
          {
            name: 'Test',
            type: 'test',
            status: 'success',
            duration: 180,
            logs: ['Running unit tests...', 'Running integration tests...', 'All tests passed']
          },
          {
            name: 'Deploy',
            type: 'deploy',
            status: 'success',
            duration: 300,
            logs: ['Deploying to staging...', 'Health checks passed', 'Deployment successful']
          }
        ],
        triggers: {
          push: true,
          pullRequest: true,
          schedule: false,
          manual: true
        },
        environments: {
          development: true,
          staging: true,
          production: true
        },
        security: {
          secretsManagement: true,
          vulnerabilityScanning: true,
          complianceChecking: true
        },
        monitoring: {
          buildTime: 600,
          successRate: 98.5,
          failureRate: 1.5,
          lastBuild: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    const mockInfrastructureAsCode: InfrastructureAsCode[] = [
      {
        id: '1',
        name: 'MindTrack Infrastructure',
        type: 'terraform',
        status: 'active',
        provider: 'aws',
        version: '1.5.0',
        modules: [
          {
            name: 'vpc',
            version: '4.0.0',
            source: 'terraform-aws-modules/vpc/aws',
            variables: {
              name: 'mindtrack-vpc',
              cidr: '10.0.0.0/16'
            }
          }
        ],
        state: {
          managed: 45,
          data: 12,
          outputs: 8,
          lastApplied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        configuration: {
          backend: 's3',
          workspace: 'production',
          variables: {
            environment: 'production',
            region: 'us-west-2'
          },
          outputs: {
            vpc_id: 'vpc-12345678',
            subnet_ids: '["subnet-12345678", "subnet-87654321"]'
          }
        },
        security: {
          encryption: true,
          accessControl: true,
          auditLogging: true
        },
        collaboration: {
          teamAccess: true,
          versionControl: true,
          reviewProcess: true
        },
        monitoring: {
          driftDetection: true,
          complianceChecking: true,
          costOptimization: true
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockMonitoringStacks: MonitoringStack[] = [
      {
        id: '1',
        name: 'MindTrack Monitoring Stack',
        type: 'prometheus',
        status: 'active',
        components: {
          metrics: true,
          logging: true,
          tracing: true,
          alerting: true,
          visualization: true
        },
        dataSources: [
          {
            name: 'Prometheus',
            type: 'metrics',
            url: 'http://prometheus:9090',
            status: 'connected'
          },
          {
            name: 'Grafana',
            type: 'visualization',
            url: 'http://grafana:3000',
            status: 'connected'
          }
        ],
        dashboards: [
          {
            name: 'Infrastructure Overview',
            description: 'Overall infrastructure health and performance',
            panels: 12,
            lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        alerts: [
          {
            name: 'High CPU Usage',
            severity: 'high',
            status: 'active',
            threshold: 80,
            lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000)
          }
        ],
        retention: {
          metrics: 30,
          logs: 90,
          traces: 7
        },
        performance: {
          queryResponseTime: 150,
          dataIngestionRate: 10000,
          storageUsage: 75
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    setCloudProviders(mockCloudProviders);
    setInfrastructure(mockInfrastructure);
    setContainerOrchestration(mockContainerOrchestration);
    setCiCdPipelines(mockCiCdPipelines);
    setInfrastructureAsCode(mockInfrastructureAsCode);
    setMonitoringStacks(mockMonitoringStacks);
  }, []);

  // Create cloud provider - Bulut sağlayıcısı oluşturma
  const createCloudProvider = useCallback(async (
    name: CloudProvider['name'],
    region: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated provider creation - Sağlayıcı oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProvider: CloudProvider = {
        id: `provider_${Date.now()}`,
        name,
        status: 'inactive',
        region,
        credentials: {
          accessKey: '',
          secretKey: '',
          region,
          lastRotated: new Date()
        },
        services: {
          compute: false,
          storage: false,
          database: false,
          networking: false,
          monitoring: false,
          security: false
        },
        resources: {
          instances: 0,
          storage: 0,
          databases: 0,
          loadBalancers: 0,
          networks: 0
        },
        costs: {
          monthly: 0,
          daily: 0,
          hourly: 0,
          currency: 'USD'
        },
        compliance: {
          hipaa: false,
          soc2: false,
          gdpr: false,
          pci: false,
          iso27001: false
        },
        monitoring: {
          uptime: 0,
          lastCheck: new Date(),
          alerts: 0,
          incidents: 0
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCloudProviders(prev => [newProvider, ...prev]);
      
      return newProvider;
      
    } catch (error) {
      console.error('Cloud provider creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create CI/CD pipeline - CI/CD pipeline oluşturma
  const createCiCdPipeline = useCallback(async (
    name: string,
    type: CI_CDPipeline['type']
  ) => {
    setLoading(true);
    
    try {
      // Simulated pipeline creation - Pipeline oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPipeline: CI_CDPipeline = {
        id: `pipeline_${Date.now()}`,
        name,
        type,
        status: 'inactive',
        repository: {
          url: '',
          branch: 'main',
          provider: 'github'
        },
        stages: [],
        triggers: {
          push: false,
          pullRequest: false,
          schedule: false,
          manual: true
        },
        environments: {
          development: false,
          staging: false,
          production: false
        },
        security: {
          secretsManagement: false,
          vulnerabilityScanning: false,
          complianceChecking: false
        },
        monitoring: {
          buildTime: 0,
          successRate: 0,
          failureRate: 0,
          lastBuild: new Date()
        },
        createdBy: 'devops@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCiCdPipelines(prev => [newPipeline, ...prev]);
      
      return newPipeline;
      
    } catch (error) {
      console.error('CI/CD pipeline creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate infrastructure metrics - Altyapı metriklerini hesaplama
  const calculateInfrastructureMetrics = useCallback(() => {
    const totalProviders = cloudProviders.length;
    const activeProviders = cloudProviders.filter(provider => provider.status === 'active').length;
    const totalInfrastructure = infrastructure.length;
    const activeInfrastructure = infrastructure.filter(infra => infra.status === 'active').length;
    const totalOrchestration = containerOrchestration.length;
    const runningOrchestration = containerOrchestration.filter(orch => orch.status === 'running').length;
    const totalPipelines = ciCdPipelines.length;
    const activePipelines = ciCdPipelines.filter(pipeline => pipeline.status === 'active').length;
    const totalIaC = infrastructureAsCode.length;
    const activeIaC = infrastructureAsCode.filter(iac => iac.status === 'active').length;
    const totalMonitoring = monitoringStacks.length;
    const activeMonitoring = monitoringStacks.filter(monitoring => monitoring.status === 'active').length;
    
    return {
      totalProviders,
      activeProviders,
      providerActivationRate: totalProviders > 0 ? Math.round((activeProviders / totalProviders) * 100) : 0,
      totalInfrastructure,
      activeInfrastructure,
      infrastructureActivationRate: totalInfrastructure > 0 ? Math.round((activeInfrastructure / totalInfrastructure) * 100) : 0,
      totalOrchestration,
      runningOrchestration,
      orchestrationActivationRate: totalOrchestration > 0 ? Math.round((runningOrchestration / totalOrchestration) * 100) : 0,
      totalPipelines,
      activePipelines,
      pipelineActivationRate: totalPipelines > 0 ? Math.round((activePipelines / totalPipelines) * 100) : 0,
      totalIaC,
      activeIaC,
      iaCActivationRate: totalIaC > 0 ? Math.round((activeIaC / totalIaC) * 100) : 0,
      totalMonitoring,
      activeMonitoring,
      monitoringActivationRate: totalMonitoring > 0 ? Math.round((activeMonitoring / totalMonitoring) * 100) : 0
    };
  }, [cloudProviders, infrastructure, containerOrchestration, ciCdPipelines, infrastructureAsCode, monitoringStacks]);

  const metrics = calculateInfrastructureMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">☁️ Cloud Infrastructure & DevOps</h2>
          <p className="text-gray-600">Cloud infrastructure management and DevOps automation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Cloud className="h-3 w-3 mr-1" />
            {metrics.activeProviders} Active Providers
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {infrastructureHealth}% Health
          </Badge>
        </div>
      </div>

      {/* Infrastructure Overview - Altyapı Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Cloud Providers</CardTitle>
            <Cloud className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.activeProviders}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalProviders} total providers
            </p>
            <Progress value={metrics.providerActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Infrastructure</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.activeInfrastructure}</div>
            <p className="text-xs text-green-700">
              {metrics.totalInfrastructure} total resources
            </p>
            <Progress value={metrics.infrastructureActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">CI/CD Pipelines</CardTitle>
            <GitBranch className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activePipelines}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalPipelines} total pipelines
            </p>
            <Progress value={metrics.pipelineActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Monitoring</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.activeMonitoring}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalMonitoring} total stacks
            </p>
            <Progress value={metrics.monitoringActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Cloud Providers - Bulut Sağlayıcıları */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Cloud Providers</span>
            </div>
            <Button
              onClick={() => setShowCreateProvider(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage cloud service providers and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {cloudProviders.map((provider) => (
              <div key={provider.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{provider.name.toUpperCase()}</div>
                    <div className="text-sm text-blue-600">{provider.region} • {provider.status}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={provider.status === 'active' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {provider.status}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      ${provider.costs.monthly}/month
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {provider.monitoring.uptime}% uptime
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Services</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Compute: {provider.services.compute ? '✅' : '❌'}</div>
                      <div>Storage: {provider.services.storage ? '✅' : '❌'}</div>
                      <div>Database: {provider.services.database ? '✅' : '❌'}</div>
                      <div>Networking: {provider.services.networking ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Resources</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Instances: {provider.resources.instances}</div>
                      <div>Storage: {provider.resources.storage} GB</div>
                      <div>Databases: {provider.resources.databases}</div>
                      <div>Load Balancers: {provider.resources.loadBalancers}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Compliance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>HIPAA: {provider.compliance.hipaa ? '✅' : '❌'}</div>
                      <div>SOC2: {provider.compliance.soc2 ? '✅' : '❌'}</div>
                      <div>GDPR: {provider.compliance.gdpr ? '✅' : '❌'}</div>
                      <div>PCI: {provider.compliance.pci ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Monitoring</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Uptime: {provider.monitoring.uptime}%</div>
                      <div>Alerts: {provider.monitoring.alerts}</div>
                      <div>Incidents: {provider.monitoring.incidents}</div>
                      <div>Last Check: {provider.monitoring.lastCheck.toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CI/CD Pipelines - CI/CD Pipeline'ları */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GitBranch className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-purple-900">CI/CD Pipelines</span>
            </div>
            <Button
              onClick={() => setShowCreatePipeline(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </Button>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Monitor continuous integration and deployment pipelines
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {ciCdPipelines.map((pipeline) => (
              <div key={pipeline.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{pipeline.name}</div>
                    <div className="text-sm text-purple-600">{pipeline.type} • {pipeline.status}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={pipeline.status === 'active' ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {pipeline.status}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {pipeline.stages.length} stages
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {pipeline.monitoring.successRate}% success
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Repository</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Provider: {pipeline.repository.provider}</div>
                      <div>Branch: {pipeline.repository.branch}</div>
                      <div>URL: {pipeline.repository.url}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Triggers</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Push: {pipeline.triggers.push ? '✅' : '❌'}</div>
                      <div>Pull Request: {pipeline.triggers.pullRequest ? '✅' : '❌'}</div>
                      <div>Schedule: {pipeline.triggers.schedule ? '✅' : '❌'}</div>
                      <div>Manual: {pipeline.triggers.manual ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Monitoring</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Build Time: {pipeline.monitoring.buildTime}s</div>
                      <div>Success Rate: {pipeline.monitoring.successRate}%</div>
                      <div>Failure Rate: {pipeline.monitoring.failureRate}%</div>
                      <div>Last Build: {pipeline.monitoring.lastBuild.toLocaleDateString()}</div>
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
