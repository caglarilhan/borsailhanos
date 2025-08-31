"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare,
  Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, Filter, Search,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Star, Heart, ThumbsUp,
  ThumbsDown, Flag, Bookmark, Tag, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert, Award,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileAwardCircle, FileCrownCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Zap, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc, BarChart3
} from "lucide-react";

// Interfaces
interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  duration: number;
  credits: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'online' | 'in-person' | 'hybrid';
  startDate: string;
  endDate: string;
  status: 'enrolled' | 'completed' | 'in-progress' | 'available';
  description: string;
  instructor: string;
  price: number;
  rating: number;
  reviews: number;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  category: string;
  requirements: string[];
  duration: string;
  cost: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  validUntil: string;
  renewalRequirements: string[];
  description: string;
  benefits: string[];
}

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  lastAssessed: string;
  nextAssessment: string;
  resources: string[];
  progress: number;
}

interface DevelopmentPlan {
  id: string;
  title: string;
  description: string;
  goals: string[];
  timeline: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress: number;
  milestones: { title: string; dueDate: string; completed: boolean }[];
  resources: string[];
  mentor: string;
}

// Mock Data
const mockCourses: Course[] = [
  {
    id: "C001",
    title: "Advanced Psychopharmacology",
    provider: "American Psychiatric Association",
    category: "Psychopharmacology",
    duration: 20,
    credits: 15,
    level: "advanced",
    format: "online",
    startDate: "2024-12-15",
    endDate: "2025-02-15",
    status: "enrolled",
    description: "Advanced course on psychopharmacology for complex cases",
    instructor: "Dr. Sarah Johnson",
    price: 450,
    rating: 4.8,
    reviews: 156
  },
  {
    id: "C002",
    title: "Trauma-Informed Care",
    provider: "National Institute of Mental Health",
    category: "Trauma Therapy",
    duration: 16,
    credits: 12,
    level: "intermediate",
    format: "hybrid",
    startDate: "2025-01-10",
    endDate: "2025-03-10",
    status: "available",
    description: "Comprehensive training in trauma-informed care approaches",
    instructor: "Dr. Michael Chen",
    price: 350,
    rating: 4.9,
    reviews: 89
  },
  {
    id: "C003",
    title: "Child and Adolescent Psychiatry",
    provider: "American Academy of Child and Adolescent Psychiatry",
    category: "Child Psychiatry",
    duration: 24,
    credits: 18,
    level: "advanced",
    format: "in-person",
    startDate: "2025-02-01",
    endDate: "2025-05-01",
    status: "in-progress",
    description: "Specialized training in child and adolescent mental health",
    instructor: "Dr. Emily Rodriguez",
    price: 600,
    rating: 4.7,
    reviews: 234
  }
];

const mockCertifications: Certification[] = [
  {
    id: "CF001",
    name: "Board Certification in Psychiatry",
    organization: "American Board of Psychiatry and Neurology",
    category: "Board Certification",
    requirements: ["Medical degree", "Residency completion", "Exam passing"],
    duration: "Lifetime",
    cost: 2500,
    status: "completed",
    validUntil: "2025-12-31",
    renewalRequirements: ["CME credits", "Practice assessment"],
    description: "Board certification demonstrating expertise in psychiatry",
    benefits: ["Professional recognition", "Insurance panel eligibility", "Career advancement"]
  },
  {
    id: "CF002",
    name: "Addiction Medicine Certification",
    organization: "American Board of Addiction Medicine",
    category: "Subspecialty",
    requirements: ["Board certification", "Addiction training", "Exam completion"],
    duration: "10 years",
    cost: 1800,
    status: "in-progress",
    validUntil: "2034-06-30",
    renewalRequirements: ["CME credits", "Practice hours", "Recertification exam"],
    description: "Specialized certification in addiction medicine",
    benefits: ["Subspecialty recognition", "Treatment expertise", "Patient trust"]
  },
  {
    id: "CF003",
    name: "Telepsychiatry Certification",
    organization: "American Telemedicine Association",
    category: "Technology",
    requirements: ["License", "Technology training", "Assessment completion"],
    duration: "3 years",
    cost: 500,
    status: "not-started",
    validUntil: "N/A",
    renewalRequirements: ["Technology updates", "Practice assessment"],
    description: "Certification for providing psychiatric care via telehealth",
    benefits: ["Technology expertise", "Patient access", "Practice expansion"]
  }
];

const mockSkills: Skill[] = [
  {
    id: "S001",
    name: "Cognitive Behavioral Therapy",
    category: "Psychotherapy",
    currentLevel: 8,
    targetLevel: 10,
    importance: "high",
    lastAssessed: "2024-11-15",
    nextAssessment: "2025-02-15",
    resources: ["CBT workshops", "Supervision", "Case studies"],
    progress: 80
  },
  {
    id: "S002",
    name: "Psychopharmacology",
    category: "Medication Management",
    currentLevel: 9,
    targetLevel: 10,
    importance: "critical",
    lastAssessed: "2024-12-01",
    nextAssessment: "2025-03-01",
    resources: ["Advanced courses", "Research updates", "Peer consultation"],
    progress: 90
  },
  {
    id: "S003",
    name: "Telehealth Technology",
    category: "Technology",
    currentLevel: 6,
    targetLevel: 9,
    importance: "high",
    lastAssessed: "2024-10-20",
    nextAssessment: "2025-01-20",
    resources: ["Technology training", "Platform certification", "Best practices"],
    progress: 67
  }
];

const mockDevelopmentPlans: DevelopmentPlan[] = [
  {
    id: "DP001",
    title: "Addiction Medicine Specialization",
    description: "Develop expertise in addiction medicine and treatment",
    goals: ["Complete addiction medicine certification", "Attend specialized training", "Build patient caseload"],
    timeline: "12 months",
    status: "active",
    progress: 45,
    milestones: [
      { title: "Enroll in certification program", dueDate: "2024-12-31", completed: true },
      { title: "Complete core training", dueDate: "2025-03-31", completed: false },
      { title: "Pass certification exam", dueDate: "2025-06-30", completed: false }
    ],
    resources: ["Certification program", "Mentor guidance", "Clinical supervision"],
    mentor: "Dr. Robert Smith"
  }
];

// Utility Functions
const getLevelColor = (level: string) => {
  switch (level) {
    case 'beginner': return 'bg-green-500 text-white';
    case 'intermediate': return 'bg-yellow-500 text-black';
    case 'advanced': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'enrolled': return 'bg-blue-500 text-white';
    case 'completed': return 'bg-green-500 text-white';
    case 'in-progress': return 'bg-yellow-500 text-black';
    case 'available': return 'bg-gray-500 text-white';
    case 'not-started': return 'bg-gray-500 text-white';
    case 'expired': return 'bg-red-500 text-white';
    case 'draft': return 'bg-gray-500 text-white';
    case 'active': return 'bg-green-500 text-white';
    case 'archived': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getImportanceColor = (importance: string) => {
  switch (importance) {
    case 'low': return 'bg-gray-500 text-white';
    case 'medium': return 'bg-yellow-500 text-black';
    case 'high': return 'bg-orange-500 text-white';
    case 'critical': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function ProfessionalDevelopment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || course.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Professional Development
          </h1>
          <p className="text-gray-600 mt-2">
            Continuing education, certifications, and career advancement for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Accredited
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <TrendingUp className="h-4 w-4 mr-1" />
            Growing
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCourses.filter(c => c.status === 'enrolled').length}</div>
            <p className="text-xs opacity-75 mt-1">Active enrollments</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCertifications.filter(c => c.status === 'completed').length}</div>
            <p className="text-xs opacity-75 mt-1">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Skills Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(mockSkills.reduce((acc, skill) => acc + skill.progress, 0) / mockSkills.length)}%</div>
            <p className="text-xs opacity-75 mt-1">Average progress</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Development Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDevelopmentPlans.filter(p => p.status === 'active').length}</div>
            <p className="text-xs opacity-75 mt-1">Active plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Plans
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Course Progress
                </CardTitle>
                <CardDescription>
                  Current course enrollments and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mockCourses.filter(c => c.status === 'enrolled' || c.status === 'in-progress').map((course) => (
                    <div key={course.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{course.title}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={course.status === 'completed' ? 100 : 60} className="w-20" />
                        <span className="text-sm font-medium">{course.credits} credits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Development */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skill Development
                </CardTitle>
                <CardDescription>
                  Current skill levels and targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mockSkills.map((skill) => (
                    <div key={skill.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={skill.progress} className="w-20" />
                        <span className="text-sm font-medium">{skill.currentLevel}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>
                Latest professional development activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Completed Advanced Psychopharmacology Course</h3>
                    <p className="text-xs text-gray-600">Earned 15 CME credits</p>
                  </div>
                  <div className="text-xs text-gray-600">2 days ago</div>
                </div>
                                 <div className="flex items-center gap-4 p-4 border rounded-lg">
                   <div className="p-2 bg-blue-100 rounded-lg">
                     <Award className="h-5 w-5 text-blue-600" />
                   </div>
                  <div>
                    <h3 className="font-medium text-sm">Started Addiction Medicine Certification</h3>
                    <p className="text-xs text-gray-600">Enrolled in certification program</p>
                  </div>
                  <div className="text-xs text-gray-600">1 week ago</div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Updated Skill Assessment</h3>
                    <p className="text-xs text-gray-600">CBT skills improved to level 8</p>
                  </div>
                  <div className="text-xs text-gray-600">2 weeks ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Continuing Education Courses</CardTitle>
              <CardDescription>
                Browse and enroll in professional development courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Courses</label>
                  <Input
                    placeholder="Search by title or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-40 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="Psychopharmacology">Psychopharmacology</option>
                      <option value="Trauma Therapy">Trauma Therapy</option>
                      <option value="Child Psychiatry">Child Psychiatry</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="available">Available</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <div className="grid gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">Provider: {course.provider}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p className="text-gray-600">{course.duration} hours</p>
                          </div>
                          <div>
                            <span className="font-medium">Credits:</span>
                            <p className="text-gray-600">{course.credits} CME</p>
                          </div>
                          <div>
                            <span className="font-medium">Format:</span>
                            <p className="text-gray-600">{course.format}</p>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>
                            <p className="text-gray-600">${course.price}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Instructor:</span>
                          <p className="text-gray-600">{course.instructor}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Description:</span>
                          <p className="text-gray-600">{course.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{course.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">({course.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-1" />
                        Enroll
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <Award className="h-5 w-5" />
                 Professional Certifications
               </CardTitle>
              <CardDescription>
                Track certification progress and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCertifications.map((certification) => (
                  <div key={certification.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                                             <div className="flex items-center gap-3">
                         <Award className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{certification.name}</h3>
                          <p className="text-gray-600">{certification.organization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {certification.category}
                        </Badge>
                        <Badge className={getStatusColor(certification.status)}>
                          {certification.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p className="text-gray-600">{certification.duration}</p>
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span>
                        <p className="text-gray-600">${certification.cost}</p>
                      </div>
                      <div>
                        <span className="font-medium">Valid Until:</span>
                        <p className="text-gray-600">{certification.validUntil}</p>
                      </div>
                      <div>
                        <span className="font-medium">Requirements:</span>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {certification.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Description:</span>
                      <p className="text-sm text-gray-600 mt-1">{certification.description}</p>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Benefits:</span>
                      <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                        {certification.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skill Development
              </CardTitle>
              <CardDescription>
                Track and develop professional skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockSkills.map((skill) => (
                  <div key={skill.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{skill.name}</h3>
                          <p className="text-gray-600">{skill.category}</p>
                        </div>
                      </div>
                      <Badge className={getImportanceColor(skill.importance)}>
                        {skill.importance}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{skill.currentLevel}/10</div>
                        <div className="text-sm text-gray-600">Current Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{skill.targetLevel}/10</div>
                        <div className="text-sm text-gray-600">Target Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{skill.progress}%</div>
                        <div className="text-sm text-gray-600">Progress</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Skill Progress</span>
                        <span className="text-sm text-gray-600">{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="w-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Last Assessed:</span>
                        <p className="text-sm text-gray-600">{skill.lastAssessed}</p>
                      </div>
                      <div>
                        <span className="font-medium">Next Assessment:</span>
                        <p className="text-sm text-gray-600">{skill.nextAssessment}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Resources:</span>
                      <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                        {skill.resources.map((resource, index) => (
                          <li key={index}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Update Assessment
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Resources
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Development Plans
              </CardTitle>
              <CardDescription>
                Professional development plans and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockDevelopmentPlans.map((plan) => (
                  <div key={plan.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-indigo-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{plan.title}</h3>
                          <p className="text-gray-600">{plan.description}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Goals:</span>
                      <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                        {plan.goals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Timeline:</span>
                        <p className="text-gray-600">{plan.timeline}</p>
                      </div>
                      <div>
                        <span className="font-medium">Mentor:</span>
                        <p className="text-gray-600">{plan.mentor}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Plan Progress</span>
                        <span className="text-sm text-gray-600">{plan.progress}%</span>
                      </div>
                      <Progress value={plan.progress} className="w-full" />
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium">Milestones:</span>
                      <div className="space-y-2 mt-2">
                        {plan.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className={`h-4 w-4 ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-sm">{milestone.title}</span>
                            <span className="text-xs text-gray-600">({milestone.dueDate})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Resources
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
