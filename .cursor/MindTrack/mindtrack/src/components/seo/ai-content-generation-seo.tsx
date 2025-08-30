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
  Search, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  BookOpen, 
  FileText, 
  Edit, 
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
  Activity, 
  Clock, 
  Calendar, 
  User, 
  Users, 
  Settings, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  LinkBreak, 
  LinkBreak2, 
  GitBranch, 
  Layers, 
  Filter, 
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
  Globe,
  Zap,
  Lightbulb,
  PenTool,
  Type
} from "lucide-react";

// AI-Powered Content Generation & SEO için gerekli interface'ler
interface ContentArticle {
  id: string;
  title: string;
  content: string;
  type: 'blog' | 'article' | 'case-study' | 'research' | 'newsletter' | 'social-media';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    focusKeyword: string;
    readabilityScore: number;
    seoScore: number;
    wordCount: number;
    readingTime: number;
  };
  targetAudience: {
    primary: 'psychiatrists' | 'psychologists' | 'therapists' | 'patients' | 'general';
    secondary: string[];
    demographics: {
      age: string;
      location: string;
      profession: string;
      interests: string[];
    };
  };
  aiGeneration: {
    model: string;
    prompt: string;
    generatedAt: Date;
    humanEdited: boolean;
    editHistory: {
      timestamp: Date;
      changes: string;
      editor: string;
    }[];
  };
  performance: {
    views: number;
    shares: number;
    comments: number;
    backlinks: number;
    organicTraffic: number;
    conversionRate: number;
    bounceRate: number;
    timeOnPage: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface SEOKeyword {
  id: string;
  keyword: string;
  type: 'primary' | 'secondary' | 'long-tail' | 'local' | 'branded';
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  searchVolume: number;
  cpc: number;
  competition: number;
  position: number;
  targetPosition: number;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  relatedKeywords: string[];
  contentIdeas: string[];
  seoMetrics: {
    clickThroughRate: number;
    impressions: number;
    averagePosition: number;
    organicClicks: number;
    conversionRate: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentCalendar {
  id: string;
  title: string;
  description: string;
  type: 'blog' | 'article' | 'video' | 'podcast' | 'social-media' | 'newsletter';
  status: 'planned' | 'in-progress' | 'review' | 'published' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate: Date;
  publishDate: Date;
  targetAudience: string[];
  keywords: string[];
  contentBrief: {
    mainTopic: string;
    subtopics: string[];
    keyPoints: string[];
    callToAction: string;
    tone: 'professional' | 'conversational' | 'academic' | 'casual';
  };
  seoRequirements: {
    targetKeyword: string;
    wordCount: number;
    internalLinks: string[];
    externalLinks: string[];
    metaDescription: string;
  };
  progress: {
    research: number;
    writing: number;
    editing: number;
    seo: number;
    publishing: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CompetitorAnalysis {
  id: string;
  competitorName: string;
  website: string;
  domain: string;
  industry: 'psychiatry' | 'psychology' | 'mental-health' | 'healthcare' | 'general';
  analysisDate: Date;
  metrics: {
    domainAuthority: number;
    pageAuthority: number;
    backlinks: number;
    organicTraffic: number;
    organicKeywords: number;
    trafficValue: number;
  };
  contentAnalysis: {
    totalArticles: number;
    averageWordCount: number;
    publishingFrequency: string;
    topKeywords: string[];
    contentGaps: string[];
    opportunities: string[];
  };
  seoStrengths: string[];
  seoWeaknesses: string[];
  contentStrategy: {
    topics: string[];
    tone: string;
    format: string[];
    frequency: string;
  };
  socialMedia: {
    platforms: string[];
    followers: number;
    engagement: number;
    postingFrequency: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SEOMetrics {
  id: string;
  date: Date;
  organicTraffic: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  keywords: {
    total: number;
    ranking: number;
    top10: number;
    top3: number;
    position1: number;
  };
  backlinks: {
    total: number;
    dofollow: number;
    nofollow: number;
    referringDomains: number;
    domainAuthority: number;
  };
  content: {
    indexedPages: number;
    crawlErrors: number;
    loadSpeed: number;
    mobileUsability: number;
  };
  conversions: {
    goalCompletions: number;
    conversionRate: number;
    revenue: number;
    costPerAcquisition: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentOptimization {
  id: string;
  contentId: string;
  type: 'title' | 'meta-description' | 'content' | 'headings' | 'images' | 'links';
  currentValue: string;
  suggestedValue: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    seoScore: number;
    readabilityScore: number;
    userExperience: number;
  };
  implementation: {
    status: 'pending' | 'in-progress' | 'completed' | 'rejected';
    implementedAt?: Date;
    implementedBy?: string;
    notes?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI-Powered Content Generation & SEO Component - AI destekli içerik üretimi ve SEO
export function AIContentGenerationSEO() {
  // State management - Durum yönetimi
  const [contentArticles, setContentArticles] = useState<ContentArticle[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<SEOKeyword[]>([]);
  const [contentCalendar, setContentCalendar] = useState<ContentCalendar[]>([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics[]>([]);
  const [contentOptimizations, setContentOptimizations] = useState<ContentOptimization[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ContentArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [showKeywordResearch, setShowKeywordResearch] = useState(false);
  const [overallSEOScore, setOverallSEOScore] = useState(87.5);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockContentArticles: ContentArticle[] = [
      {
        id: '1',
        title: 'Understanding Depression: A Comprehensive Guide for Mental Health Professionals',
        content: 'Depression is a complex mental health condition that affects millions of Americans...',
        type: 'article',
        status: 'published',
        seo: {
          metaTitle: 'Depression Guide for Mental Health Professionals | MindTrack',
          metaDescription: 'Comprehensive guide on depression diagnosis, treatment, and management for mental health professionals.',
          keywords: ['depression', 'mental health', 'psychiatry', 'treatment', 'diagnosis', 'therapy'],
          focusKeyword: 'depression treatment',
          readabilityScore: 85,
          seoScore: 92,
          wordCount: 2500,
          readingTime: 10
        },
        targetAudience: {
          primary: 'psychiatrists',
          secondary: ['psychologists', 'therapists'],
          demographics: {
            age: '30-60',
            location: 'United States',
            profession: 'Mental Health Professionals',
            interests: ['psychiatry', 'mental health', 'treatment', 'research']
          }
        },
        aiGeneration: {
          model: 'GPT-4',
          prompt: 'Write a comprehensive article about depression treatment for mental health professionals',
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          humanEdited: true,
          editHistory: [
            {
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              changes: 'Added clinical guidelines and updated treatment protocols',
              editor: 'Dr. Sarah Johnson'
            }
          ]
        },
        performance: {
          views: 12500,
          shares: 450,
          comments: 89,
          backlinks: 23,
          organicTraffic: 8900,
          conversionRate: 3.2,
          bounceRate: 28,
          timeOnPage: 4.5
        },
        createdBy: 'content-team@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSeoKeywords: SEOKeyword[] = [
      {
        id: '1',
        keyword: 'depression treatment',
        type: 'primary',
        difficulty: 'medium',
        searchVolume: 12000,
        cpc: 15.50,
        competition: 0.65,
        position: 3,
        targetPosition: 1,
        intent: 'informational',
        relatedKeywords: ['depression therapy', 'depression medication', 'depression help'],
        contentIdeas: [
          'Complete Guide to Depression Treatment Options',
          'Evidence-Based Depression Treatment Methods',
          'Depression Treatment Success Stories'
        ],
        seoMetrics: {
          clickThroughRate: 8.5,
          impressions: 45000,
          averagePosition: 3.2,
          organicClicks: 3825,
          conversionRate: 4.2
        },
        createdBy: 'seo-team@mindtrack.com',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockContentCalendar: ContentCalendar[] = [
      {
        id: '1',
        title: 'Anxiety Disorders: Modern Treatment Approaches',
        description: 'Comprehensive guide on anxiety disorder treatments for mental health professionals',
        type: 'article',
        status: 'in-progress',
        priority: 'high',
        assignedTo: 'Dr. Michael Chen',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        publishDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        targetAudience: ['psychiatrists', 'psychologists'],
        keywords: ['anxiety disorders', 'anxiety treatment', 'mental health'],
        contentBrief: {
          mainTopic: 'Anxiety Disorder Treatment',
          subtopics: ['Diagnosis', 'Treatment Options', 'Medication', 'Therapy'],
          keyPoints: [
            'Evidence-based treatment approaches',
            'Latest research findings',
            'Clinical guidelines'
          ],
          callToAction: 'Schedule consultation for anxiety treatment',
          tone: 'professional'
        },
        seoRequirements: {
          targetKeyword: 'anxiety disorder treatment',
          wordCount: 3000,
          internalLinks: ['/depression-treatment', '/mental-health-resources'],
          externalLinks: ['https://www.psychiatry.org', 'https://www.nimh.nih.gov'],
          metaDescription: 'Expert guide on anxiety disorder treatment for mental health professionals'
        },
        progress: {
          research: 100,
          writing: 75,
          editing: 50,
          seo: 25,
          publishing: 0
        },
        createdBy: 'content-manager@mindtrack.com',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockCompetitorAnalysis: CompetitorAnalysis[] = [
      {
        id: '1',
        competitorName: 'American Psychiatric Association',
        website: 'https://www.psychiatry.org',
        domain: 'psychiatry.org',
        industry: 'psychiatry',
        analysisDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        metrics: {
          domainAuthority: 85,
          pageAuthority: 78,
          backlinks: 45000,
          organicTraffic: 250000,
          organicKeywords: 15000,
          trafficValue: 450000
        },
        contentAnalysis: {
          totalArticles: 500,
          averageWordCount: 1800,
          publishingFrequency: 'Weekly',
          topKeywords: ['psychiatry', 'mental health', 'depression', 'anxiety'],
          contentGaps: ['Telehealth psychiatry', 'Digital mental health tools'],
          opportunities: ['AI in psychiatry', 'Remote patient monitoring']
        },
        seoStrengths: [
          'High domain authority',
          'Strong backlink profile',
          'Comprehensive content library'
        ],
        seoWeaknesses: [
          'Slow website speed',
          'Limited mobile optimization',
          'Outdated content'
        ],
        contentStrategy: {
          topics: ['Clinical guidelines', 'Research updates', 'Professional development'],
          tone: 'Academic and professional',
          format: ['Articles', 'Guidelines', 'Research papers'],
          frequency: 'Weekly'
        },
        socialMedia: {
          platforms: ['LinkedIn', 'Twitter', 'Facebook'],
          followers: 50000,
          engagement: 3.2,
          postingFrequency: 'Daily'
        },
        createdBy: 'seo-analyst@mindtrack.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockSeoMetrics: SEOMetrics[] = [
      {
        id: '1',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        organicTraffic: {
          sessions: 45000,
          users: 38000,
          pageviews: 125000,
          bounceRate: 32,
          avgSessionDuration: 3.5
        },
        keywords: {
          total: 2500,
          ranking: 1800,
          top10: 450,
          top3: 120,
          position1: 45
        },
        backlinks: {
          total: 850,
          dofollow: 720,
          nofollow: 130,
          referringDomains: 320,
          domainAuthority: 65
        },
        content: {
          indexedPages: 450,
          crawlErrors: 12,
          loadSpeed: 2.8,
          mobileUsability: 95
        },
        conversions: {
          goalCompletions: 1250,
          conversionRate: 2.8,
          revenue: 45000,
          costPerAcquisition: 35
        },
        createdBy: 'analytics-team@mindtrack.com',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockContentOptimizations: ContentOptimization[] = [
      {
        id: '1',
        contentId: '1',
        type: 'title',
        currentValue: 'Understanding Depression: A Guide',
        suggestedValue: 'Depression Treatment Guide for Mental Health Professionals | MindTrack',
        reason: 'Include target keyword and brand name for better SEO',
        priority: 'high',
        impact: {
          seoScore: 15,
          readabilityScore: 5,
          userExperience: 10
        },
        implementation: {
          status: 'completed',
          implementedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          implementedBy: 'seo-specialist@mindtrack.com',
          notes: 'Title updated successfully'
        },
        createdBy: 'seo-optimizer@mindtrack.com',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    setContentArticles(mockContentArticles);
    setSeoKeywords(mockSeoKeywords);
    setContentCalendar(mockContentCalendar);
    setCompetitorAnalysis(mockCompetitorAnalysis);
    setSeoMetrics(mockSeoMetrics);
    setContentOptimizations(mockContentOptimizations);
  }, []);

  // Generate AI content - AI içerik üretimi
  const generateAIContent = useCallback(async (
    topic: string,
    targetAudience: string,
    contentType: ContentArticle['type']
  ) => {
    setLoading(true);
    
    try {
      // Simulated AI content generation - AI içerik üretimi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newArticle: ContentArticle = {
        id: `article_${Date.now()}`,
        title: `AI-Generated: ${topic}`,
        content: `This is an AI-generated article about ${topic} targeting ${targetAudience}...`,
        type: contentType,
        status: 'draft',
        seo: {
          metaTitle: `${topic} | MindTrack`,
          metaDescription: `Comprehensive guide on ${topic} for mental health professionals`,
          keywords: [topic.toLowerCase(), 'mental health', 'psychiatry'],
          focusKeyword: topic.toLowerCase(),
          readabilityScore: 80,
          seoScore: 75,
          wordCount: 1500,
          readingTime: 6
        },
        targetAudience: {
          primary: 'psychiatrists',
          secondary: ['psychologists', 'therapists'],
          demographics: {
            age: '30-60',
            location: 'United States',
            profession: 'Mental Health Professionals',
            interests: ['psychiatry', 'mental health', 'treatment']
          }
        },
        aiGeneration: {
          model: 'GPT-4',
          prompt: `Write a professional article about ${topic} for ${targetAudience}`,
          generatedAt: new Date(),
          humanEdited: false,
          editHistory: []
        },
        performance: {
          views: 0,
          shares: 0,
          comments: 0,
          backlinks: 0,
          organicTraffic: 0,
          conversionRate: 0,
          bounceRate: 0,
          timeOnPage: 0
        },
        createdBy: 'ai-content-generator@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setContentArticles(prev => [newArticle, ...prev]);
      
      return newArticle;
      
    } catch (error) {
      console.error('AI content generation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Research keywords - Anahtar kelime araştırması
  const researchKeywords = useCallback(async (
    seedKeyword: string,
    targetLocation: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated keyword research - Anahtar kelime araştırması simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newKeyword: SEOKeyword = {
        id: `keyword_${Date.now()}`,
        keyword: seedKeyword,
        type: 'primary',
        difficulty: 'medium',
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        cpc: Math.random() * 20 + 5,
        competition: Math.random() * 0.8 + 0.2,
        position: 0,
        targetPosition: 1,
        intent: 'informational',
        relatedKeywords: [`${seedKeyword} treatment`, `${seedKeyword} therapy`, `${seedKeyword} help`],
        contentIdeas: [
          `Complete Guide to ${seedKeyword}`,
          `${seedKeyword} Treatment Options`,
          `${seedKeyword} Success Stories`
        ],
        seoMetrics: {
          clickThroughRate: 0,
          impressions: 0,
          averagePosition: 0,
          organicClicks: 0,
          conversionRate: 0
        },
        createdBy: 'keyword-researcher@mindtrack.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSeoKeywords(prev => [newKeyword, ...prev]);
      
      return newKeyword;
      
    } catch (error) {
      console.error('Keyword research failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate SEO metrics - SEO metriklerini hesaplama
  const calculateSEOMetrics = useCallback(() => {
    const totalArticles = contentArticles.length;
    const publishedArticles = contentArticles.filter(article => article.status === 'published').length;
    const totalKeywords = seoKeywords.length;
    const rankingKeywords = seoKeywords.filter(keyword => keyword.position > 0).length;
    const top10Keywords = seoKeywords.filter(keyword => keyword.position <= 10).length;
    const totalOptimizations = contentOptimizations.length;
    const completedOptimizations = contentOptimizations.filter(opt => opt.implementation.status === 'completed').length;
    
    return {
      totalArticles,
      publishedArticles,
      publicationRate: totalArticles > 0 ? Math.round((publishedArticles / totalArticles) * 100) : 0,
      totalKeywords,
      rankingKeywords,
      keywordRankingRate: totalKeywords > 0 ? Math.round((rankingKeywords / totalKeywords) * 100) : 0,
      top10Keywords,
      top10Rate: totalKeywords > 0 ? Math.round((top10Keywords / totalKeywords) * 100) : 0,
      totalOptimizations,
      completedOptimizations,
      optimizationRate: totalOptimizations > 0 ? Math.round((completedOptimizations / totalOptimizations) * 100) : 0
    };
  }, [contentArticles, seoKeywords, contentOptimizations]);

  const metrics = calculateSEOMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 AI-Powered Content Generation & SEO</h2>
          <p className="text-gray-600">AI-driven content creation and SEO optimization for mental health professionals</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Brain className="h-3 w-3 mr-1" />
            {metrics.publishedArticles} Published Articles
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            {overallSEOScore}% SEO Score
          </Badge>
        </div>
      </div>

      {/* SEO Overview - SEO Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Content Articles</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.publishedArticles}</div>
            <p className="text-xs text-purple-700">
              {metrics.totalArticles} total articles
            </p>
            <Progress value={metrics.publicationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">SEO Keywords</CardTitle>
            <Search className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.rankingKeywords}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalKeywords} total keywords
            </p>
            <Progress value={metrics.keywordRankingRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Top 10 Rankings</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.top10Keywords}</div>
            <p className="text-xs text-green-700">
              {metrics.totalKeywords} total keywords
            </p>
            <Progress value={metrics.top10Rate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Content Optimization</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.completedOptimizations}</div>
            <p className="text-xs text-orange-700">
              {metrics.totalOptimizations} total optimizations
            </p>
            <Progress value={metrics.optimizationRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Content Articles - İçerik Makaleleri */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-purple-900">Content Articles</span>
            </div>
            <Button
              onClick={() => setShowCreateArticle(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate AI Content
            </Button>
          </CardTitle>
          <CardDescription className="text-purple-700">
            AI-generated content optimized for mental health professionals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {contentArticles.map((article) => (
              <div key={article.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-purple-900">{article.title}</div>
                    <div className="text-sm text-purple-600">{article.type} • {article.status}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {article.status}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {article.seo.wordCount} words
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {article.seo.readingTime} min read
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">SEO Performance</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>SEO Score: {article.seo.seoScore}/100</div>
                      <div>Readability: {article.seo.readabilityScore}/100</div>
                      <div>Focus Keyword: {article.seo.focusKeyword}</div>
                      <div>Organic Traffic: {article.performance.organicTraffic.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Target Audience</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Primary: {article.targetAudience.primary}</div>
                      <div>Location: {article.targetAudience.demographics.location}</div>
                      <div>Profession: {article.targetAudience.demographics.profession}</div>
                      <div>Age: {article.targetAudience.demographics.age}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">AI Generation</h4>
                    <div className="space-y-1 text-sm text-purple-600">
                      <div>Model: {article.aiGeneration.model}</div>
                      <div>Generated: {article.aiGeneration.generatedAt.toLocaleDateString()}</div>
                      <div>Human Edited: {article.aiGeneration.humanEdited ? '✅' : '❌'}</div>
                      <div>Edits: {article.aiGeneration.editHistory.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Keywords - SEO Anahtar Kelimeleri */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-blue-900">SEO Keywords</span>
            </div>
            <Button
              onClick={() => setShowKeywordResearch(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Research Keywords
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Keyword research and optimization for mental health professionals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {seoKeywords.map((keyword) => (
              <div key={keyword.id} className="border border-blue-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-blue-900">{keyword.keyword}</div>
                    <div className="text-sm text-blue-600">{keyword.type} • {keyword.intent}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={keyword.difficulty === 'easy' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                      {keyword.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      Vol: {keyword.searchVolume.toLocaleString()}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      CPC: ${keyword.cpc}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Ranking</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Current: #{keyword.position}</div>
                      <div>Target: #{keyword.targetPosition}</div>
                      <div>Competition: {(keyword.competition * 100).toFixed(1)}%</div>
                      <div>CTR: {keyword.seoMetrics.clickThroughRate}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Performance</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      <div>Impressions: {keyword.seoMetrics.impressions.toLocaleString()}</div>
                      <div>Clicks: {keyword.seoMetrics.organicClicks.toLocaleString()}</div>
                      <div>Avg Position: {keyword.seoMetrics.averagePosition}</div>
                      <div>Conversion: {keyword.seoMetrics.conversionRate}%</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-800">Content Ideas</h4>
                    <div className="space-y-1 text-sm text-blue-600">
                      {keyword.contentIdeas.slice(0, 3).map((idea, index) => (
                        <div key={index}>• {idea}</div>
                      ))}
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
