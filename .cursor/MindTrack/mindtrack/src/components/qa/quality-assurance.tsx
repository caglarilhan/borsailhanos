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
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Bug, 
  Play, 
  Pause, 
  Stop, 
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
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Zap,
  Brain,
  BookOpen,
  Tag,
  MessageSquare,
  FileText
} from "lucide-react";

// Quality Assurance & Testing Hub için gerekli interface'ler
interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  category: string;
  tags: string[];
  steps: {
    step: number;
    action: string;
    expectedResult: string;
    actualResult?: string;
  }[];
  prerequisites: string[];
  testData: {
    input: any;
    expectedOutput: any;
  };
  automation: {
    isAutomated: boolean;
    framework: string;
    scriptPath: string;
    lastRun: Date;
    executionTime: number;
  };
  results: {
    totalRuns: number;
    passed: number;
    failed: number;
    skipped: number;
    successRate: number;
    averageExecutionTime: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestExecution {
  id: string;
  testCaseId: string;
  testRunId: string;
  status: 'passed' | 'failed' | 'skipped' | 'blocked' | 'in-progress';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  executedBy: string;
  environment: string;
  browser?: string;
  device?: string;
  screenshot?: string;
  video?: string;
  logs: {
    timestamp: Date;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
  }[];
  defects: {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    description: string;
  }[];
  notes: string;
}

interface TestRun {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'hybrid';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  environment: string;
  testCases: string[];
  executions: TestExecution[];
  metrics: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    blocked: number;
    successRate: number;
    averageExecutionTime: number;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number;
  createdBy: string;
  assignedTo: string[];
  tags: string[];
}

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'reopened';
  type: 'bug' | 'feature-request' | 'improvement' | 'task';
  category: string;
  component: string;
  version: string;
  environment: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  reporter: string;
  assignee?: string;
  createdDate: Date;
  updatedDate: Date;
  resolvedDate?: Date;
  comments: {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
  }[];
  relatedBugs: string[];
  tags: string[];
}

interface QualityMetrics {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  testCoverage: {
    codeCoverage: number;
    requirementCoverage: number;
    riskCoverage: number;
    featureCoverage: number;
  };
  defectMetrics: {
    totalDefects: number;
    openDefects: number;
    resolvedDefects: number;
    defectDensity: number;
    defectLeakage: number;
    defectResolutionTime: number;
  };
  testMetrics: {
    totalTestCases: number;
    automatedTestCases: number;
    manualTestCases: number;
    testExecutionRate: number;
    testPassRate: number;
    averageTestExecutionTime: number;
  };
  performanceMetrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    loadTestResults: {
      concurrentUsers: number;
      responseTime: number;
      throughput: number;
      errorRate: number;
    };
  };
  securityMetrics: {
    vulnerabilitiesFound: number;
    vulnerabilitiesFixed: number;
    securityScore: number;
    complianceScore: number;
  };
  trends: {
    date: Date;
    testCoverage: number;
    defectDensity: number;
    testPassRate: number;
    responseTime: number;
  }[];
}

interface TestAutomation {
  id: string;
  name: string;
  description: string;
  framework: 'selenium' | 'cypress' | 'playwright' | 'jest' | 'pytest' | 'custom';
  language: 'javascript' | 'python' | 'java' | 'csharp' | 'typescript';
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  scripts: {
    id: string;
    name: string;
    path: string;
    description: string;
    executionTime: number;
    lastRun: Date;
    status: 'passed' | 'failed' | 'skipped';
  }[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    time: string;
    timezone: string;
    isEnabled: boolean;
  };
  environment: {
    name: string;
    url: string;
    credentials: {
      username: string;
      password: string;
    };
  };
  reporting: {
    enabled: boolean;
    format: 'html' | 'json' | 'xml' | 'pdf';
    recipients: string[];
  };
  performance: {
    totalScripts: number;
    executedScripts: number;
    passedScripts: number;
    failedScripts: number;
    successRate: number;
    averageExecutionTime: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Quality Assurance & Testing Hub Component - Kalite güvencesi ve test merkezi
export function QualityAssurance() {
  // State management - Durum yönetimi
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [testAutomation, setTestAutomation] = useState<TestAutomation[]>([]);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateTestCase, setShowCreateTestCase] = useState(false);
  const [showCreateBug, setShowCreateBug] = useState(false);
  const [testCoverage, setTestCoverage] = useState(87.5);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockTestCases: TestCase[] = [
      {
        id: '1',
        name: 'User Authentication Flow',
        description: 'Test user login and authentication process',
        type: 'e2e',
        priority: 'high',
        status: 'active',
        category: 'Authentication',
        tags: ['login', 'security', 'user-flow'],
        steps: [
          {
            step: 1,
            action: 'Navigate to login page',
            expectedResult: 'Login form is displayed'
          },
          {
            step: 2,
            action: 'Enter valid credentials',
            expectedResult: 'User is authenticated successfully'
          }
        ],
        prerequisites: ['User account exists', 'Database is accessible'],
        testData: {
          input: { username: 'testuser', password: 'testpass' },
          expectedOutput: { status: 'success', token: 'valid' }
        },
        automation: {
          isAutomated: true,
          framework: 'Cypress',
          scriptPath: '/tests/e2e/auth.spec.js',
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
          executionTime: 15
        },
        results: {
          totalRuns: 45,
          passed: 42,
          failed: 2,
          skipped: 1,
          successRate: 93.3,
          averageExecutionTime: 12.5
        },
        createdBy: 'qa_team@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockTestExecutions: TestExecution[] = [
      {
        id: '1',
        testCaseId: '1',
        testRunId: 'run1',
        status: 'passed',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 1000),
        duration: 15,
        executedBy: 'qa_engineer@mindtrack.com',
        environment: 'staging',
        browser: 'Chrome 120.0',
        logs: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            level: 'info',
            message: 'Test execution started'
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 1000),
            level: 'info',
            message: 'Test execution completed successfully'
          }
        ],
        defects: [],
        notes: 'All steps passed as expected'
      }
    ];

    const mockTestRuns: TestRun[] = [
      {
        id: '1',
        name: 'Sprint 15 Regression Test',
        description: 'Comprehensive regression testing for Sprint 15 features',
        type: 'hybrid',
        status: 'completed',
        environment: 'staging',
        testCases: ['1', '2', '3', '4', '5'],
        executions: [],
        metrics: {
          total: 25,
          passed: 23,
          failed: 1,
          skipped: 1,
          blocked: 0,
          successRate: 92.0,
          averageExecutionTime: 18.5
        },
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
        duration: 3600,
        createdBy: 'qa_lead@mindtrack.com',
        assignedTo: ['qa_engineer1@mindtrack.com', 'qa_engineer2@mindtrack.com'],
        tags: ['regression', 'sprint15', 'critical']
      }
    ];

    const mockBugReports: BugReport[] = [
      {
        id: '1',
        title: 'Login button not responsive on mobile devices',
        description: 'The login button becomes unresponsive when clicked on mobile devices running iOS 17',
        severity: 'high',
        priority: 'high',
        status: 'in-progress',
        type: 'bug',
        category: 'UI/UX',
        component: 'Authentication',
        version: '2.1.0',
        environment: 'production',
        steps: [
          'Open the app on iOS device',
          'Navigate to login page',
          'Enter credentials',
          'Tap login button'
        ],
        expectedResult: 'User should be logged in successfully',
        actualResult: 'Login button becomes unresponsive',
        attachments: [
          {
            name: 'screenshot.png',
            url: '/attachments/bug1_screenshot.png',
            type: 'image/png',
            size: 2048576
          }
        ],
        reporter: 'user@example.com',
        assignee: 'dev_team@mindtrack.com',
        createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        comments: [
          {
            id: 'comment1',
            author: 'dev_team@mindtrack.com',
            content: 'Investigating the issue. Will provide update soon.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        relatedBugs: [],
        tags: ['mobile', 'ios', 'login', 'ui']
      }
    ];

    const mockQualityMetrics: QualityMetrics = {
      id: '1',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      testCoverage: {
        codeCoverage: 87.5,
        requirementCoverage: 92.3,
        riskCoverage: 89.7,
        featureCoverage: 94.1
      },
      defectMetrics: {
        totalDefects: 156,
        openDefects: 23,
        resolvedDefects: 133,
        defectDensity: 2.1,
        defectLeakage: 0.8,
        defectResolutionTime: 3.2
      },
      testMetrics: {
        totalTestCases: 1245,
        automatedTestCases: 892,
        manualTestCases: 353,
        testExecutionRate: 94.7,
        testPassRate: 91.3,
        averageTestExecutionTime: 18.5
      },
      performanceMetrics: {
        responseTime: 245,
        throughput: 1250,
        errorRate: 0.12,
        availability: 99.8,
        loadTestResults: {
          concurrentUsers: 500,
          responseTime: 320,
          throughput: 980,
          errorRate: 0.08
        }
      },
      securityMetrics: {
        vulnerabilitiesFound: 8,
        vulnerabilitiesFixed: 7,
        securityScore: 94.2,
        complianceScore: 96.8
      },
      trends: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          testCoverage: 85.2,
          defectDensity: 2.3,
          testPassRate: 89.7,
          responseTime: 280
        }
      ]
    };

    const mockTestAutomation: TestAutomation[] = [
      {
        id: '1',
        name: 'E2E Test Suite',
        description: 'End-to-end test automation for critical user flows',
        framework: 'cypress',
        language: 'typescript',
        status: 'active',
        scripts: [
          {
            id: 'script1',
            name: 'User Authentication Test',
            path: '/tests/e2e/auth.spec.ts',
            description: 'Tests user login and logout flows',
            executionTime: 15,
            lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'passed'
          }
        ],
        schedule: {
          frequency: 'daily',
          time: '02:00',
          timezone: 'UTC',
          isEnabled: true
        },
        environment: {
          name: 'staging',
          url: 'https://staging.mindtrack.com',
          credentials: {
            username: 'testuser',
            password: 'testpass'
          }
        },
        reporting: {
          enabled: true,
          format: 'html',
          recipients: ['qa_team@mindtrack.com', 'dev_team@mindtrack.com']
        },
        performance: {
          totalScripts: 45,
          executedScripts: 45,
          passedScripts: 42,
          failedScripts: 3,
          successRate: 93.3,
          averageExecutionTime: 18.5
        },
        createdBy: 'qa_lead@mindtrack.com',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    setTestCases(mockTestCases);
    setTestExecutions(mockTestExecutions);
    setTestRuns(mockTestRuns);
    setBugReports(mockBugReports);
    setQualityMetrics(mockQualityMetrics);
    setTestAutomation(mockTestAutomation);
  }, []);

  // Execute test case - Test senaryosu çalıştırma
  const executeTestCase = useCallback(async (
    testCaseId: string,
    environment: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated test execution - Test çalıştırma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const execution: TestExecution = {
        id: `execution_${Date.now()}`,
        testCaseId,
        testRunId: `run_${Date.now()}`,
        status: Math.random() > 0.1 ? 'passed' : 'failed',
        startTime: new Date(),
        endTime: new Date(Date.now() + 15000),
        duration: 15,
        executedBy: 'current_user',
        environment,
        browser: 'Chrome 120.0',
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: 'Test execution started'
          },
          {
            timestamp: new Date(Date.now() + 15000),
            level: 'info',
            message: 'Test execution completed'
          }
        ],
        defects: [],
        notes: 'Test executed successfully'
      };
      
      setTestExecutions(prev => [execution, ...prev]);
      
      return execution;
      
    } catch (error) {
      console.error('Test execution failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create bug report - Hata raporu oluşturma
  const createBugReport = useCallback(async (
    title: string,
    description: string,
    severity: BugReport['severity'],
    priority: BugReport['priority']
  ) => {
    setLoading(true);
    
    try {
      // Simulated bug creation - Hata oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bugReport: BugReport = {
        id: `bug_${Date.now()}`,
        title,
        description,
        severity,
        priority,
        status: 'open',
        type: 'bug',
        category: 'General',
        component: 'Unknown',
        version: '2.1.0',
        environment: 'production',
        steps: [],
        expectedResult: '',
        actualResult: '',
        attachments: [],
        reporter: 'current_user',
        createdDate: new Date(),
        updatedDate: new Date(),
        comments: [],
        relatedBugs: [],
        tags: []
      };
      
      setBugReports(prev => [bugReport, ...prev]);
      
      return bugReport;
      
    } catch (error) {
      console.error('Bug report creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate QA metrics - QA metriklerini hesaplama
  const calculateQAMetrics = useCallback(() => {
    const totalTestCases = testCases.length;
    const automatedTestCases = testCases.filter(t => t.automation.isAutomated).length;
    const totalExecutions = testExecutions.length;
    const passedExecutions = testExecutions.filter(e => e.status === 'passed').length;
    const totalBugs = bugReports.length;
    const openBugs = bugReports.filter(b => b.status === 'open').length;
    const totalTestRuns = testRuns.length;
    const completedTestRuns = testRuns.filter(r => r.status === 'completed').length;
    
    return {
      totalTestCases,
      automatedTestCases,
      automationRate: totalTestCases > 0 ? Math.round((automatedTestCases / totalTestCases) * 100) : 0,
      totalExecutions,
      passedExecutions,
      executionSuccessRate: totalExecutions > 0 ? Math.round((passedExecutions / totalExecutions) * 100) : 0,
      totalBugs,
      openBugs,
      bugResolutionRate: totalBugs > 0 ? Math.round(((totalBugs - openBugs) / totalBugs) * 100) : 0,
      totalTestRuns,
      completedTestRuns,
      testRunCompletionRate: totalTestRuns > 0 ? Math.round((completedTestRuns / totalTestRuns) * 100) : 0
    };
  }, [testCases, testExecutions, bugReports, testRuns]);

  const metrics = calculateQAMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🧪 Quality Assurance & Testing Hub</h2>
          <p className="text-gray-600">Comprehensive testing and quality assurance management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <TestTube className="h-3 w-3 mr-1" />
            {metrics.totalTestCases} Test Cases
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {testCoverage}% Coverage
          </Badge>
        </div>
      </div>

      {/* QA Overview - QA Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Test Cases</CardTitle>
            <TestTube className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.totalTestCases}</div>
            <p className="text-xs text-blue-700">
              {metrics.automatedTestCases} automated
            </p>
            <Progress value={metrics.automationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Test Executions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.passedExecutions}</div>
            <p className="text-xs text-green-700">
              {metrics.totalExecutions} total executions
            </p>
            <Progress value={metrics.executionSuccessRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Bug Reports</CardTitle>
            <Bug className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{metrics.openBugs}</div>
            <p className="text-xs text-red-700">
              {metrics.totalBugs} total bugs
            </p>
            <Progress value={metrics.bugResolutionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Test Runs</CardTitle>
            <Play className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.completedTestRuns}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalTestRuns} total runs
            </p>
            <Progress value={metrics.testRunCompletionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Test Cases - Test Senaryoları */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TestTube className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">Test Cases</span>
            </div>
            <Button
              onClick={() => setShowCreateTestCase(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Test Case
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Manage test cases and their execution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {testCases.map((testCase) => (
              <div key={testCase.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{testCase.name}</div>
                    <div className="text-sm text-blue-600">{testCase.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={testCase.priority === 'critical' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {testCase.priority}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {testCase.type}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {testCase.automation.isAutomated ? 'Automated' : 'Manual'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Results</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Success Rate: {testCase.results.successRate}%</div>
                      <div>Total Runs: {testCase.results.totalRuns}</div>
                      <div>Passed: {testCase.results.passed}</div>
                      <div>Failed: {testCase.results.failed}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Automation</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Framework: {testCase.automation.framework}</div>
                      <div>Last Run: {testCase.automation.lastRun.toLocaleDateString()}</div>
                      <div>Execution Time: {testCase.automation.executionTime}s</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Steps</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Total Steps: {testCase.steps.length}</div>
                      <div>Category: {testCase.category}</div>
                      <div>Tags: {testCase.tags.join(', ')}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Info</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Created: {testCase.createdAt.toLocaleDateString()}</div>
                      <div>Updated: {testCase.updatedAt.toLocaleDateString()}</div>
                      <div>Created By: {testCase.createdBy}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports - Hata Raporları */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="h-5 w-5 mr-2 text-red-600" />
              <span className="text-red-900">Bug Reports</span>
            </div>
            <Button
              onClick={() => setShowCreateBug(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Bug
            </Button>
          </CardTitle>
          <CardDescription className="text-red-700">
            Track and manage bug reports
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {bugReports.map((bug) => (
              <div key={bug.id} className="border border-red-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-red-900">{bug.title}</div>
                    <div className="text-sm text-red-600">{bug.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={bug.severity === 'critical' ? 'default' : 'secondary'} className="bg-red-100 text-red-800">
                      {bug.severity}
                    </Badge>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {bug.status}
                    </Badge>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {bug.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-800">Details</h4>
                    <div className="space-y-1 text-sm text-red-600">
                      <div>Component: {bug.component}</div>
                      <div>Version: {bug.version}</div>
                      <div>Environment: {bug.environment}</div>
                      <div>Priority: {bug.priority}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-800">Assignment</h4>
                    <div className="space-y-1 text-sm text-red-600">
                      <div>Reporter: {bug.reporter}</div>
                      <div>Assignee: {bug.assignee || 'Unassigned'}</div>
                      <div>Created: {bug.createdDate.toLocaleDateString()}</div>
                      <div>Updated: {bug.updatedDate.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-800">Activity</h4>
                    <div className="space-y-1 text-sm text-red-600">
                      <div>Comments: {bug.comments.length}</div>
                      <div>Attachments: {bug.attachments.length}</div>
                      <div>Related Bugs: {bug.relatedBugs.length}</div>
                      <div>Tags: {bug.tags.join(', ')}</div>
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
