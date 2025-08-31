"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search, BookOpen, FileText, Tag, Filter, Star, Heart, ThumbsUp, ThumbsDown, Share, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  TrendingUp, TrendingDown, MapPin, Phone, Mail, MessageSquare,
  Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Flag, Bookmark, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc, Brain, Lightbulb, Target, Zap, Users, Calendar, Clock,
  Book, Library, GraduationCap, Award, Certificate, Diploma, Scroll, Document, Clipboard,
  ClipboardList, ClipboardCheck, ClipboardX, ClipboardCopy, ClipboardPaste
} from "lucide-react";

// Interfaces
interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: 'clinical' | 'administrative' | 'research' | 'training' | 'compliance' | 'best_practices';
  tags: string[];
  author: string;
  createdDate: string;
  lastModified: string;
  views: number;
  rating: number;
  isPublished: boolean;
  isFeatured: boolean;
  relatedArticles: string[];
  attachments: KnowledgeAttachment[];
}

interface KnowledgeAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'presentation';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
}

interface SearchQuery {
  id: string;
  query: string;
  user: string;
  timestamp: string;
  results: number;
  clickCount: number;
  successRate: number;
}

interface SearchFilter {
  id: string;
  name: string;
  type: 'category' | 'date_range' | 'author' | 'tags' | 'rating' | 'custom';
  value: string;
  isActive: boolean;
}

interface KnowledgeMetrics {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  averageRating: number;
  searchQueries: number;
  successfulSearches: number;
  knowledgeUtilization: number;
}

interface SearchAnalytics {
  popularQueries: string[];
  searchTrends: SearchTrend[];
  categoryDistribution: CategoryDistribution[];
  userEngagement: UserEngagement;
}

interface SearchTrend {
  query: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

interface UserEngagement {
  averageSessionTime: number;
  articlesPerSession: number;
  searchSuccessRate: number;
  returnRate: number;
}

// Mock Data
const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: "KA001",
    title: "Evidence-Based Treatment for Major Depressive Disorder",
    content: "Comprehensive guide to evidence-based treatment approaches for MDD including pharmacological and psychotherapeutic interventions...",
    category: "clinical",
    tags: ["depression", "MDD", "treatment", "evidence-based", "psychotherapy", "medication"],
    author: "Dr. Sarah Johnson",
    createdDate: "2024-01-15",
    lastModified: "2024-12-10",
    views: 1247,
    rating: 4.8,
    isPublished: true,
    isFeatured: true,
    relatedArticles: ["KA002", "KA003"],
    attachments: [
      {
        id: "ATT001",
        name: "MDD_Treatment_Guidelines.pdf",
        type: "pdf",
        size: 2048,
        uploadedBy: "Dr. Sarah Johnson",
        uploadedAt: "2024-01-15T10:30:00Z",
        downloadCount: 156
      }
    ]
  },
  {
    id: "KA002",
    title: "HIPAA Compliance Guidelines for Telehealth",
    content: "Essential guidelines for maintaining HIPAA compliance during telehealth sessions including technical requirements and best practices...",
    category: "compliance",
    tags: ["HIPAA", "telehealth", "compliance", "privacy", "security", "regulations"],
    author: "Dr. Michael Chen",
    createdDate: "2024-02-20",
    lastModified: "2024-11-25",
    views: 892,
    rating: 4.6,
    isPublished: true,
    isFeatured: false,
    relatedArticles: ["KA004"],
    attachments: []
  },
  {
    id: "KA003",
    title: "Cognitive Behavioral Therapy Techniques",
    content: "Practical guide to implementing CBT techniques in clinical practice with case examples and step-by-step instructions...",
    category: "clinical",
    tags: ["CBT", "psychotherapy", "techniques", "cognitive", "behavioral", "therapy"],
    author: "Dr. Emily Rodriguez",
    createdDate: "2024-03-10",
    lastModified: "2024-12-05",
    views: 1567,
    rating: 4.9,
    isPublished: true,
    isFeatured: true,
    relatedArticles: ["KA001"],
    attachments: [
      {
        id: "ATT002",
        name: "CBT_Techniques_Handbook.pdf",
        type: "pdf",
        size: 3072,
        uploadedBy: "Dr. Emily Rodriguez",
        uploadedAt: "2024-03-10T14:20:00Z",
        downloadCount: 234
      }
    ]
  }
];

const mockSearchQueries: SearchQuery[] = [
  {
    id: "SQ001",
    query: "depression treatment",
    user: "dr.sarah.johnson",
    timestamp: "2024-12-14T10:30:00Z",
    results: 15,
    clickCount: 3,
    successRate: 85
  },
  {
    id: "SQ002",
    query: "HIPAA compliance telehealth",
    user: "dr.michael.chen",
    timestamp: "2024-12-14T09:45:00Z",
    results: 8,
    clickCount: 2,
    successRate: 92
  },
  {
    id: "SQ003",
    query: "CBT techniques",
    user: "dr.emily.rodriguez",
    timestamp: "2024-12-14T08:15:00Z",
    results: 12,
    clickCount: 4,
    successRate: 78
  }
];

const mockSearchAnalytics: SearchAnalytics = {
  popularQueries: [
    "depression treatment",
    "HIPAA compliance",
    "CBT techniques",
    "anxiety management",
    "billing codes"
  ],
  searchTrends: [
    {
      query: "depression treatment",
      frequency: 45,
      trend: "up",
      period: "last 30 days"
    },
    {
      query: "HIPAA compliance",
      frequency: 32,
      trend: "stable",
      period: "last 30 days"
    },
    {
      query: "CBT techniques",
      frequency: 28,
      trend: "up",
      period: "last 30 days"
    }
  ],
  categoryDistribution: [
    { category: "clinical", count: 45, percentage: 45 },
    { category: "compliance", count: 20, percentage: 20 },
    { category: "research", count: 15, percentage: 15 },
    { category: "training", count: 12, percentage: 12 },
    { category: "best_practices", count: 8, percentage: 8 }
  ],
  userEngagement: {
    averageSessionTime: 8.5,
    articlesPerSession: 3.2,
    searchSuccessRate: 87.5,
    returnRate: 92.3
  }
};

const mockKnowledgeMetrics: KnowledgeMetrics = {
  totalArticles: 125,
  publishedArticles: 98,
  totalViews: 15420,
  averageRating: 4.7,
  searchQueries: 456,
  successfulSearches: 398,
  knowledgeUtilization: 87.3
};

// Utility Functions
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'clinical': return 'bg-blue-500 text-white';
    case 'administrative': return 'bg-green-500 text-white';
    case 'research': return 'bg-purple-500 text-white';
    case 'training': return 'bg-orange-500 text-white';
    case 'compliance': return 'bg-red-500 text-white';
    case 'best_practices': return 'bg-teal-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return 'bg-green-100 text-green-800';
  if (rating >= 4.0) return 'bg-yellow-100 text-yellow-800';
  if (rating >= 3.5) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return 'bg-green-100 text-green-800';
    case 'down': return 'bg-red-100 text-red-800';
    case 'stable': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'pdf': return 'bg-red-100 text-red-800';
    case 'doc': return 'bg-blue-100 text-blue-800';
    case 'image': return 'bg-green-100 text-green-800';
    case 'video': return 'bg-purple-100 text-purple-800';
    case 'audio': return 'bg-orange-100 text-orange-800';
    case 'presentation': return 'bg-teal-100 text-teal-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdvancedSearchKnowledgeManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  
  const filteredArticles = mockKnowledgeArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesRating = selectedRating === "all" || 
                         (selectedRating === "high" && article.rating >= 4.5) ||
                         (selectedRating === "medium" && article.rating >= 4.0 && article.rating < 4.5) ||
                         (selectedRating === "low" && article.rating < 4.0);
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 via-white to-teal-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Search className="h-8 w-8 text-green-600" />
            Advanced Search & Knowledge Management
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced search capabilities and knowledge management for American psychiatrists
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Search className="h-4 w-4 mr-1" />
            Search
          </Badge>
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            <BookOpen className="h-4 w-4 mr-1" />
            Knowledge
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKnowledgeMetrics.totalArticles}</div>
            <p className="text-xs opacity-75 mt-1">{mockKnowledgeMetrics.publishedArticles} published</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKnowledgeMetrics.totalViews.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">Knowledge engagement</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKnowledgeMetrics.averageRating}/5</div>
            <p className="text-xs opacity-75 mt-1">Content quality</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Search Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKnowledgeMetrics.knowledgeUtilization}%</div>
            <p className="text-xs opacity-75 mt-1">Knowledge utilization</p>
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
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Knowledge Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Knowledge Overview
                </CardTitle>
                <CardDescription>
                  Key knowledge base metrics and content statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Articles</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockKnowledgeMetrics.publishedArticles / mockKnowledgeMetrics.totalArticles) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.totalArticles}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Published Articles</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockKnowledgeMetrics.publishedArticles / mockKnowledgeMetrics.totalArticles) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.publishedArticles}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Views</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockKnowledgeMetrics.totalViews / 20000) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.totalViews.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Rating</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockKnowledgeMetrics.averageRating / 5) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.averageRating}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Performance
                </CardTitle>
                <CardDescription>
                  Search effectiveness and user engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Search Queries</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockKnowledgeMetrics.searchQueries / 600) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.searchQueries}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Successful Searches</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(mockKnowledgeMetrics.successfulSearches / mockKnowledgeMetrics.searchQueries) * 100} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.successfulSearches}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Knowledge Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={mockKnowledgeMetrics.knowledgeUtilization} className="w-20" />
                      <span className="text-sm font-medium">{mockKnowledgeMetrics.knowledgeUtilization}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Engagement</span>
                    <span className="text-sm font-medium text-green-600">{mockSearchAnalytics.userEngagement.returnRate}% return rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Popular Articles
              </CardTitle>
              <CardDescription>
                Most viewed and highly rated knowledge articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockKnowledgeArticles.map((article) => (
                  <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{article.title}</h3>
                      <p className="text-xs text-gray-600">{article.author} • {new Date(article.createdDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(article.category)}>
                        {article.category}
                      </Badge>
                      <Badge className={getRatingColor(article.rating)}>
                        {article.rating}/5
                      </Badge>
                      <Badge variant="outline">
                        {article.views} views
                      </Badge>
                      {article.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Search across knowledge base with advanced filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Search Knowledge Base</label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search articles, tags, authors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-32 mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="clinical">Clinical</option>
                        <option value="administrative">Administrative</option>
                        <option value="research">Research</option>
                        <option value="training">Training</option>
                        <option value="compliance">Compliance</option>
                        <option value="best_practices">Best Practices</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <select 
                        value={selectedRating} 
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="w-32 mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value="all">All Ratings</option>
                        <option value="high">High (4.5+)</option>
                        <option value="medium">Medium (4.0-4.4)</option>
                        <option value="low">Low (&lt;4.0)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Advanced Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                          <Badge className={getCategoryColor(article.category)}>
                            {article.category}
                          </Badge>
                          <Badge className={getRatingColor(article.rating)}>
                            {article.rating}/5
                          </Badge>
                          {article.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                        <p className="text-gray-600">{article.content.substring(0, 150)}...</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Author:</span>
                            <p className="text-gray-600">{article.author}</p>
                          </div>
                          <div>
                            <span className="font-medium">Views:</span>
                            <p className="text-gray-600">{article.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>
                            <p className="text-gray-600">{new Date(article.createdDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Attachments:</span>
                            <p className="text-gray-600">{article.attachments.length}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {article.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
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
                        <Bookmark className="h-4 w-4 mr-1" />
                        Bookmark
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Knowledge Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base Management
              </CardTitle>
              <CardDescription>
                Manage and organize knowledge articles and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockKnowledgeArticles.map((article) => (
                  <div key={article.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{article.title}</h3>
                          <p className="text-gray-600">{article.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                        <Badge className={getRatingColor(article.rating)}>
                          {article.rating}/5
                        </Badge>
                        {article.isPublished ? (
                          <Badge className="bg-green-500 text-white">Published</Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-white">Draft</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{article.views.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{article.rating}</div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{article.tags.length}</div>
                        <div className="text-sm text-gray-600">Tags</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{article.attachments.length}</div>
                        <div className="text-sm text-gray-600">Attachments</div>
                      </div>
                    </div>
                    
                    {article.attachments.length > 0 && (
                      <div className="mb-4">
                        <span className="font-medium">Attachments:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {article.attachments.map((attachment) => (
                            <Badge key={attachment.id} variant="outline" className={`text-xs ${getFileTypeColor(attachment.type)}`}>
                              {attachment.name} ({attachment.size} KB)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit Article
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-1" />
                        Share
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Analytics
                </CardTitle>
                <CardDescription>
                  Search behavior and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Popular Search Queries</h4>
                    <div className="space-y-2">
                      {mockSearchAnalytics.popularQueries.map((query, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{query}</span>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Search Trends</h4>
                    <div className="space-y-2">
                      {mockSearchAnalytics.searchTrends.map((trend, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{trend.query}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getTrendColor(trend.trend)}>
                              {trend.trend}
                            </Badge>
                            <span className="text-xs text-gray-600">{trend.frequency} searches</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Engagement
                </CardTitle>
                <CardDescription>
                  User behavior and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Session Time</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(mockSearchAnalytics.userEngagement.averageSessionTime / 15) * 100} className="w-20" />
                        <span className="text-sm font-medium">{mockSearchAnalytics.userEngagement.averageSessionTime} min</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Articles Per Session</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(mockSearchAnalytics.userEngagement.articlesPerSession / 5) * 100} className="w-20" />
                        <span className="text-sm font-medium">{mockSearchAnalytics.userEngagement.articlesPerSession}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Search Success Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={mockSearchAnalytics.userEngagement.searchSuccessRate} className="w-20" />
                        <span className="text-sm font-medium">{mockSearchAnalytics.userEngagement.searchSuccessRate}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Return Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={mockSearchAnalytics.userEngagement.returnRate} className="w-20" />
                        <span className="text-sm font-medium">{mockSearchAnalytics.userEngagement.returnRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Distribution
              </CardTitle>
              <CardDescription>
                Distribution of articles across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {mockSearchAnalytics.categoryDistribution.map((category, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: getCategoryColor(category.category).split(' ')[1] }}>
                      {category.count}
                    </div>
                    <div className="text-sm text-gray-600">{category.category}</div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                AI-generated insights and recommendations for knowledge management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">📈 Content Performance Insights</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Clinical articles are performing 23% better than administrative content. Consider expanding clinical knowledge base.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">High Priority</Badge>
                    <Badge variant="outline">AI Generated</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🔍 Search Optimization</h4>
                  <p className="text-sm text-green-700 mb-2">
                    "HIPAA compliance" searches increased by 45% this month. Consider creating more compliance-related content.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Medium Priority</Badge>
                    <Badge variant="outline">AI Generated</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">📚 Content Gaps</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    Limited content on "telehealth best practices" despite high search volume. Recommended: Create comprehensive guide.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800">Medium Priority</Badge>
                    <Badge variant="outline">AI Generated</Badge>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">👥 User Behavior Analysis</h4>
                  <p className="text-sm text-orange-700 mb-2">
                    Users spend 40% more time on articles with video attachments. Consider adding multimedia content to popular articles.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-800">Low Priority</Badge>
                    <Badge variant="outline">AI Generated</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
