"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  BookOpen, 
  Award,
  Clock,
  Calendar,
  User,
  Users,
  Settings,
  Plus,
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
  Database,
  Server,
  Network,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  FileText,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  LinkBreak,
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
  FileAlertCircle,
  Zap,
  Globe,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  Cloud,
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
  SortDesc
} from "lucide-react";

// Continuing Medical Education (CME) için interface'ler
interface CMECourse {
  id: string;
  title: string;
  category: 'psychiatry' | 'psychology' | 'neuroscience' | 'pharmacology' | 'ethics' | 'research';
  type: 'online' | 'live' | 'hybrid' | 'self-paced';
  credits: number;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  instructor: string;
  institution: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  materials: string[];
  status: 'active' | 'inactive' | 'archived' | 'pending';
  startDate: Date;
  endDate: Date;
  enrollmentDeadline: Date;
  maxEnrollment: number;
  currentEnrollment: number;
  price: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CMEEvent {
  id: string;
  title: string;
  type: 'conference' | 'workshop' | 'seminar' | 'webinar' | 'symposium';
  category: string;
  credits: number;
  date: Date;
  duration: number;
  location: {
    venue: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    virtual: boolean;
    platform: string;
  };
  speakers: {
    name: string;
    title: string;
    institution: string;
    bio: string;
  }[];
  agenda: {
    time: string;
    session: string;
    speaker: string;
    duration: number;
  }[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationDeadline: Date;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CMETracking {
  id: string;
  psychiatristId: string;
  year: number;
  requiredCredits: number;
  earnedCredits: number;
  remainingCredits: number;
  completionRate: number;
  activities: {
    courseId: string;
    eventId: string;
    title: string;
    type: 'course' | 'event' | 'conference' | 'publication';
    credits: number;
    date: Date;
    status: 'completed' | 'in-progress' | 'registered' | 'cancelled';
    certificate: string;
  }[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate: Date;
    status: 'active' | 'expired' | 'pending';
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CMECertification {
  id: string;
  name: string;
  type: 'board-certification' | 'specialty-certification' | 'continuing-education' | 'professional-development';
  organization: string;
  requirements: {
    credits: number;
    years: number;
    exams: string[];
    experience: string;
  };
  benefits: string[];
  validity: number;
  renewalRequirements: string[];
  status: 'active' | 'expired' | 'pending' | 'suspended';
  issueDate: Date;
  expiryDate: Date;
  renewalDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CMEReport {
  id: string;
  psychiatristId: string;
  period: 'quarterly' | 'annual';
  year: number;
  quarter?: number;
  totalCredits: number;
  requiredCredits: number;
  completionRate: number;
  activities: {
    category: string;
    credits: number;
    count: number;
  }[];
  recommendations: string[];
  status: 'draft' | 'final' | 'submitted' | 'approved';
  generatedAt: Date;
  submittedAt: Date;
  approvedAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Continuing Medical Education (CME) Component
export function ContinuingMedicalEducation() {
  const [cmeCourses, setCmeCourses] = useState<CMECourse[]>([]);
  const [cmeEvents, setCmeEvents] = useState<CMEEvent[]>([]);
  const [cmeTracking, setCmeTracking] = useState<CMETracking[]>([]);
  const [cmeCertifications, setCmeCertifications] = useState<CMECertification[]>([]);
  const [cmeReports, setCmeReports] = useState<CMEReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallCMEProgress, setOverallCMEProgress] = useState(87.3);

  // Mock data initialization
  useEffect(() => {
    const mockCMECourses: CMECourse[] = [
      {
        id: '1',
        title: 'Advanced Psychopharmacology in Depression Treatment',
        category: 'pharmacology',
        type: 'online',
        credits: 15,
        duration: 20,
        difficulty: 'advanced',
        instructor: 'Dr. Sarah Johnson',
        institution: 'American Psychiatric Association',
        description: 'Comprehensive course on modern antidepressant medications and treatment strategies',
        objectives: [
          'Understand mechanism of action of new antidepressants',
          'Learn evidence-based treatment algorithms',
          'Master medication selection and dosing strategies'
        ],
        prerequisites: ['Basic psychopharmacology', 'Clinical experience with depression'],
        materials: ['course-materials.pdf', 'video-lectures.zip', 'case-studies.pdf'],
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        enrollmentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxEnrollment: 100,
        currentEnrollment: 75,
        price: 299,
        createdBy: 'cme-admin@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCMEEvents: CMEEvent[] = [
      {
        id: '1',
        title: 'Annual Psychiatry Conference 2024',
        type: 'conference',
        category: 'psychiatry',
        credits: 25,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 3,
        location: {
          venue: 'Marriott Marquis',
          address: '1535 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10036',
          country: 'USA',
          virtual: true,
          platform: 'Zoom'
        },
        speakers: [
          {
            name: 'Dr. Michael Chen',
            title: 'Chief of Psychiatry',
            institution: 'Harvard Medical School',
            bio: 'Leading expert in mood disorders and treatment-resistant depression'
          }
        ],
        agenda: [
          {
            time: '09:00 AM',
            session: 'Opening Keynote',
            speaker: 'Dr. Michael Chen',
            duration: 60
          }
        ],
        status: 'upcoming',
        registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        maxAttendees: 500,
        currentAttendees: 350,
        price: 599,
        createdBy: 'conference-organizer@mindtrack.com',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCMETracking: CMETracking[] = [
      {
        id: '1',
        psychiatristId: 'dr_smith',
        year: 2024,
        requiredCredits: 50,
        earnedCredits: 43.5,
        remainingCredits: 6.5,
        completionRate: 87,
        activities: [
          {
            courseId: '1',
            eventId: '',
            title: 'Advanced Psychopharmacology',
            type: 'course',
            credits: 15,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: 'completed',
            certificate: 'certificate_123.pdf'
          }
        ],
        certifications: [
          {
            name: 'Board Certified in Psychiatry',
            issuingOrganization: 'American Board of Psychiatry and Neurology',
            issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active'
          }
        ],
        createdBy: 'cme-system@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCMECertifications: CMECertification[] = [
      {
        id: '1',
        name: 'Board Certification in Psychiatry',
        type: 'board-certification',
        organization: 'American Board of Psychiatry and Neurology',
        requirements: {
          credits: 50,
          years: 4,
          exams: ['Written Exam', 'Oral Exam'],
          experience: '4 years of residency training'
        },
        benefits: [
          'Professional recognition',
          'Higher reimbursement rates',
          'Career advancement opportunities'
        ],
        validity: 10,
        renewalRequirements: ['Maintain CME credits', 'Pass recertification exam'],
        status: 'active',
        issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 9 * 365 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 8 * 365 * 24 * 60 * 60 * 1000),
        createdBy: 'certification-board@mindtrack.com',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCMEReports: CMEReport[] = [
      {
        id: '1',
        psychiatristId: 'dr_smith',
        period: 'annual',
        year: 2024,
        totalCredits: 43.5,
        requiredCredits: 50,
        completionRate: 87,
        activities: [
          {
            category: 'pharmacology',
            credits: 15,
            count: 1
          },
          {
            category: 'psychiatry',
            credits: 25,
            count: 1
          }
        ],
        recommendations: [
          'Complete remaining 6.5 credits',
          'Focus on ethics and research categories',
          'Consider attending upcoming conferences'
        ],
        status: 'final',
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: 'cme-system@mindtrack.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    setCmeCourses(mockCMECourses);
    setCmeEvents(mockCMEEvents);
    setCmeTracking(mockCMETracking);
    setCmeCertifications(mockCMECertifications);
    setCmeReports(mockCMEReports);
  }, []);

  // Calculate CME metrics
  const calculateCMEMetrics = useCallback(() => {
    const totalCourses = cmeCourses.length;
    const activeCourses = cmeCourses.filter(course => course.status === 'active').length;
    const totalEvents = cmeEvents.length;
    const upcomingEvents = cmeEvents.filter(event => event.status === 'upcoming').length;
    const totalTracking = cmeTracking.length;
    const completedTracking = cmeTracking.filter(tracking => tracking.completionRate >= 100).length;
    
    return {
      totalCourses,
      activeCourses,
      courseActivationRate: totalCourses > 0 ? Math.round((activeCourses / totalCourses) * 100) : 0,
      totalEvents,
      upcomingEvents,
      eventRate: totalEvents > 0 ? Math.round((upcomingEvents / totalEvents) * 100) : 0,
      totalTracking,
      completedTracking,
      trackingCompletionRate: totalTracking > 0 ? Math.round((completedTracking / totalTracking) * 100) : 0
    };
  }, [cmeCourses, cmeEvents, cmeTracking]);

  const metrics = calculateCMEMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎓 Continuing Medical Education (CME)</h2>
          <p className="text-gray-600">Comprehensive CME tracking and professional development for American psychiatrists</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <GraduationCap className="h-3 w-3 mr-1" />
            {metrics.completedTracking} Completed
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Award className="h-3 w-3 mr-1" />
            {overallCMEProgress}% Progress
          </Badge>
        </div>
      </div>

      {/* CME Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">CME Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.activeCourses}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalCourses} total courses
            </p>
            <Progress value={metrics.courseActivationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">CME Events</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.upcomingEvents}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalEvents} total events
            </p>
            <Progress value={metrics.eventRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">CME Tracking</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.completedTracking}</div>
            <p className="text-xs text-green-700">
              {metrics.totalTracking} total tracking
            </p>
            <Progress value={metrics.trackingCompletionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Certifications</CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{cmeCertifications.length}</div>
            <p className="text-xs text-orange-700">
              active certifications
            </p>
            <Progress value={100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* CME Courses */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-purple-900">CME Courses</span>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Enroll Course
            </Button>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Online and live continuing medical education courses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {cmeCourses.map((course) => (
              <div key={course.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{course.title}</div>
                    <div className="text-sm text-purple-600">{course.category} • {course.type} • {course.difficulty}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {course.status}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {course.credits} Credits
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      ${course.price}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Course Details</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Instructor: {course.instructor}</div>
                      <div>Institution: {course.institution}</div>
                      <div>Duration: {course.duration} hours</div>
                      <div>Credits: {course.credits}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Enrollment</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Current: {course.currentEnrollment}</div>
                      <div>Maximum: {course.maxEnrollment}</div>
                      <div>Deadline: {course.enrollmentDeadline.toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Schedule</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Start: {course.startDate.toLocaleDateString()}</div>
                      <div>End: {course.endDate.toLocaleDateString()}</div>
                      <div>Status: {course.status}</div>
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
