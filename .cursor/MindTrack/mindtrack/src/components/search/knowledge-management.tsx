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
  Search, 
  FileText, 
  BookOpen, 
  Tag, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  Download, 
  Share2, 
  Bookmark, 
  Star, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  Edit, 
  Trash2, 
  Copy, 
  Plus, 
  Minus, 
  MoreHorizontal,
  Bell,
  Settings,
  Database,
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Clock,
  Calendar,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
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
  Archive,
  RefreshCw,
  Save,
  Printer,
  Upload,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Stop,
  RotateCcw,
  GitBranch,
  Layers,
  Grid,
  List,
  Columns,
  Rows,
  FilterIcon,
  Search as SearchIcon,
  BookOpen as BookOpenIcon,
  Tag as TagIcon,
  FileText as FileTextIcon,
  Database as DatabaseIcon,
  BarChart,
  PieChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Table,
  SortAsc as SortAscIcon,
  SortDesc as SortDescIcon,
  MoreHorizontal as MoreHorizontalIcon
} from "lucide-react";

// Advanced Search & Knowledge Management için gerekli interface'ler
interface SearchQuery {
  id: string;
  query: string;
  filters: {
    category: string[];
    dateRange: { start: Date; end: Date };
    author: string[];
    tags: string[];
    contentType: string[];
  };
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  timestamp: Date;
  userId: string;
  isSaved: boolean;
  analytics: {
    clickThroughRate: number;
    averageTimeOnPage: number;
    bounceRate: number;
  };
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url: string;
  type: 'document' | 'article' | 'case-study' | 'protocol' | 'guideline' | 'research' | 'video' | 'image';
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  downloads: number;
  rating: number;
  relevance: number;
  metadata: {
    fileSize?: number;
    language: string;
    format: string;
    version: string;
    keywords: string[];
  };
  permissions: {
    view: string[];
    edit: string[];
    download: string[];
  };
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'administrative' | 'research' | 'training' | 'compliance' | 'general';
  articles: KnowledgeArticle[];
  categories: KnowledgeCategory[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  rating: number;
  contributors: string[];
  settings: {
    allowComments: boolean;
    requireApproval: boolean;
    versionControl: boolean;
    searchEnabled: boolean;
  };
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived' | 'review';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  comments: {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
    isApproved: boolean;
  }[];
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  relatedArticles: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  articles: string[];
  subcategories: string[];
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface ContentTag {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  synonyms: string[];
  relatedTags: string[];
  isSystem: boolean;
  isActive: boolean;
}

interface Document {
  id: string;
  name: string;
  title: string;
  description: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'html' | 'markdown';
  category: string;
  tags: string[];
  author: string;
  fileSize: number;
  url: string;
  thumbnail?: string;
  version: number;
  status: 'draft' | 'published' | 'archived' | 'review';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  downloads: number;
  permissions: {
    view: string[];
    edit: string[];
    download: string[];
    share: string[];
  };
  metadata: {
    language: string;
    keywords: string[];
    abstract: string;
    references: string[];
    doi?: string;
  };
  versionHistory: {
    version: number;
    changes: string;
    author: string;
    timestamp: Date;
  }[];
}

interface AIPoweredInsight {
  id: string;
  type: 'trend' | 'pattern' | 'recommendation' | 'anomaly' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  data: any;
  source: string;
  timestamp: Date;
  isActionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'content' | 'user-behavior' | 'performance' | 'business';
  actions: {
    type: 'create' | 'update' | 'delete' | 'notify' | 'analyze';
    label: string;
    description: string;
    url?: string;
  }[];
  relatedItems: {
    type: string;
    id: string;
    name: string;
  }[];
}

interface SearchAnalytics {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalSearches: number;
    uniqueSearches: number;
    averageSearchTime: number;
    clickThroughRate: number;
    bounceRate: number;
    searchSuccessRate: number;
    popularQueries: {
      query: string;
      count: number;
      successRate: number;
    }[];
    topResults: {
      resultId: string;
      title: string;
      clicks: number;
      impressions: number;
      ctr: number;
    }[];
  };
  userBehavior: {
    searchPatterns: {
      timeOfDay: { [hour: string]: number };
      dayOfWeek: { [day: string]: number };
      deviceType: { [device: string]: number };
    };
    searchJourney: {
      step: number;
      action: string;
      count: number;
      dropoffRate: number;
    }[];
  };
  insights: {
    type: 'improvement' | 'optimization' | 'trend' | 'issue';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    recommendations: string[];
  }[];
}

// Advanced Search & Knowledge Management Component - Gelişmiş arama ve bilgi yönetimi
export function KnowledgeManagement() {
  // State management - Durum yönetimi
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [contentTags, setContentTags] = useState<ContentTag[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [aiInsights, setAiInsights] = useState<AIPoweredInsight[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalytics | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [searchAccuracy, setSearchAccuracy] = useState(94.7);

  // Mock data initialization - Test verilerini yükleme
  useEffect(() => {
    // Simulated data loading - Test verisi simülasyonu
    const mockSearchQueries: SearchQuery[] = [
      {
        id: '1',
        query: 'cognitive behavioral therapy techniques',
        filters: {
          category: ['clinical', 'therapy'],
          dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
          author: ['Dr. Sarah Johnson'],
          tags: ['CBT', 'therapy', 'techniques'],
          contentType: ['article', 'protocol']
        },
        results: [],
        totalResults: 15,
        searchTime: 0.8,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: 'user1',
        isSaved: true,
        analytics: {
          clickThroughRate: 78.5,
          averageTimeOnPage: 4.2,
          bounceRate: 12.3
        }
      }
    ];

    const mockSearchResults: SearchResult[] = [
      {
        id: '1',
        title: 'Cognitive Behavioral Therapy: Core Techniques and Applications',
        content: 'Comprehensive guide to CBT techniques including cognitive restructuring, behavioral activation, and exposure therapy...',
        excerpt: 'Learn about the fundamental techniques of Cognitive Behavioral Therapy and their practical applications in clinical settings.',
        url: '/articles/cbt-techniques',
        type: 'article',
        category: 'clinical',
        tags: ['CBT', 'therapy', 'techniques', 'cognitive', 'behavioral'],
        author: 'Dr. Sarah Johnson',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        views: 1247,
        downloads: 89,
        rating: 4.8,
        relevance: 0.95,
        metadata: {
          fileSize: 2048576,
          language: 'en',
          format: 'pdf',
          version: '2.1',
          keywords: ['CBT', 'therapy', 'psychology', 'treatment']
        },
        permissions: {
          view: ['therapist', 'student'],
          edit: ['admin'],
          download: ['therapist']
        }
      }
    ];

    const mockKnowledgeBases: KnowledgeBase[] = [
      {
        id: '1',
        name: 'Clinical Protocols Database',
        description: 'Comprehensive collection of clinical protocols and treatment guidelines',
        category: 'clinical',
        articles: [],
        categories: [],
        tags: ['clinical', 'protocols', 'treatment', 'guidelines'],
        isPublic: false,
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        accessCount: 3456,
        rating: 4.7,
        contributors: ['Dr. Sarah Johnson', 'Dr. Mike Chen'],
        settings: {
          allowComments: true,
          requireApproval: true,
          versionControl: true,
          searchEnabled: true
        }
      }
    ];

    const mockContentTags: ContentTag[] = [
      {
        id: '1',
        name: 'CBT',
        description: 'Cognitive Behavioral Therapy',
        category: 'therapy',
        color: '#3B82F6',
        usageCount: 156,
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        synonyms: ['Cognitive Behavioral Therapy', 'Cognitive Therapy'],
        relatedTags: ['therapy', 'psychology', 'treatment'],
        isSystem: false,
        isActive: true
      },
      {
        id: '2',
        name: 'Anxiety',
        description: 'Anxiety disorders and treatment',
        category: 'disorder',
        color: '#EF4444',
        usageCount: 89,
        createdBy: 'admin@mindtrack.com',
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        synonyms: ['Anxiety Disorder', 'GAD'],
        relatedTags: ['disorder', 'treatment', 'CBT'],
        isSystem: false,
        isActive: true
      }
    ];

    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'CBT_Techniques_Guide.pdf',
        title: 'Cognitive Behavioral Therapy Techniques Guide',
        description: 'Comprehensive guide to CBT techniques and their applications',
        type: 'pdf',
        category: 'clinical',
        tags: ['CBT', 'therapy', 'techniques'],
        author: 'Dr. Sarah Johnson',
        fileSize: 2048576,
        url: '/documents/cbt-techniques-guide.pdf',
        version: 2,
        status: 'published',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        views: 1247,
        downloads: 89,
        permissions: {
          view: ['therapist', 'student'],
          edit: ['admin'],
          download: ['therapist'],
          share: ['therapist']
        },
        metadata: {
          language: 'en',
          keywords: ['CBT', 'therapy', 'psychology', 'treatment'],
          abstract: 'This guide provides comprehensive information about CBT techniques...',
          references: ['Beck, J.S. (2011). Cognitive Behavior Therapy', 'Hofmann, S.G. (2013). The Wiley Handbook of Cognitive Behavioral Therapy']
        },
        versionHistory: [
          {
            version: 2,
            changes: 'Updated techniques section and added new case studies',
            author: 'Dr. Sarah Johnson',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    const mockAiInsights: AIPoweredInsight[] = [
      {
        id: '1',
        type: 'trend',
        title: 'Growing Interest in CBT Techniques',
        description: 'Search queries for CBT techniques have increased by 45% in the last month',
        confidence: 0.92,
        data: { increase: 45, period: 'last_month', queries: ['CBT techniques', 'cognitive therapy', 'behavioral activation'] },
        source: 'search_analytics',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isActionable: true,
        priority: 'medium',
        category: 'content',
        actions: [
          {
            type: 'create',
            label: 'Create CBT Techniques Article',
            description: 'Create a new article focusing on CBT techniques',
            url: '/create-article'
          }
        ],
        relatedItems: [
          {
            type: 'article',
            id: '1',
            name: 'CBT Techniques Guide'
          }
        ]
      }
    ];

    const mockSearchAnalytics: SearchAnalytics = {
      id: '1',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      metrics: {
        totalSearches: 12456,
        uniqueSearches: 8923,
        averageSearchTime: 1.2,
        clickThroughRate: 78.5,
        bounceRate: 12.3,
        searchSuccessRate: 94.7,
        popularQueries: [
          {
            query: 'CBT techniques',
            count: 156,
            successRate: 92.3
          },
          {
            query: 'anxiety treatment',
            count: 134,
            successRate: 88.7
          }
        ],
        topResults: [
          {
            resultId: '1',
            title: 'CBT Techniques Guide',
            clicks: 89,
            impressions: 156,
            ctr: 57.1
          }
        ]
      },
      userBehavior: {
        searchPatterns: {
          timeOfDay: { '9': 15, '10': 25, '11': 20, '14': 18, '15': 22 },
          dayOfWeek: { 'Monday': 20, 'Tuesday': 18, 'Wednesday': 22, 'Thursday': 19, 'Friday': 21 },
          deviceType: { 'desktop': 65, 'mobile': 30, 'tablet': 5 }
        },
        searchJourney: [
          { step: 1, action: 'Search', count: 12456, dropoffRate: 0 },
          { step: 2, action: 'View Results', count: 11892, dropoffRate: 4.5 },
          { step: 3, action: 'Click Result', count: 9321, dropoffRate: 21.6 },
          { step: 4, action: 'Read Content', count: 8234, dropoffRate: 11.7 }
        ]
      },
      insights: [
        {
          type: 'optimization',
          title: 'Improve Search Relevance',
          description: 'Consider adding more specific tags to improve search accuracy',
          impact: 'positive',
          recommendations: ['Add more specific tags', 'Improve content categorization', 'Enhance search algorithm']
        }
      ]
    };

    setSearchQueries(mockSearchQueries);
    setSearchResults(mockSearchResults);
    setKnowledgeBases(mockKnowledgeBases);
    setContentTags(mockContentTags);
    setDocuments(mockDocuments);
    setAiInsights(mockAiInsights);
    setSearchAnalytics(mockSearchAnalytics);
  }, []);

  // Perform search - Arama yapma
  const performSearch = useCallback(async (
    query: string,
    filters: any = {}
  ) => {
    setLoading(true);
    
    try {
      // Simulated search - Arama simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const searchQuery: SearchQuery = {
        id: `search_${Date.now()}`,
        query,
        filters,
        results: searchResults,
        totalResults: searchResults.length,
        searchTime: Math.random() * 2 + 0.5,
        timestamp: new Date(),
        userId: 'current_user',
        isSaved: false,
        analytics: {
          clickThroughRate: Math.random() * 30 + 60,
          averageTimeOnPage: Math.random() * 5 + 2,
          bounceRate: Math.random() * 20 + 5
        }
      };
      
      setSearchQueries(prev => [searchQuery, ...prev]);
      
      return searchQuery;
      
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [searchResults]);

  // Create knowledge article - Bilgi makalesi oluşturma
  const createKnowledgeArticle = useCallback(async (
    title: string,
    content: string,
    category: string,
    tags: string[]
  ) => {
    setLoading(true);
    
    try {
      // Simulated article creation - Makale oluşturma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newArticle: KnowledgeArticle = {
        id: `article_${Date.now()}`,
        title,
        content,
        summary: content.substring(0, 200) + '...',
        category,
        tags,
        author: 'current_user',
        status: 'draft',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        helpful: 0,
        notHelpful: 0,
        comments: [],
        attachments: [],
        relatedArticles: [],
        seo: {
          metaTitle: title,
          metaDescription: content.substring(0, 160),
          keywords: tags
        }
      };
      
      // Update knowledge base with new article
      setKnowledgeBases(prev => prev.map(kb => 
        kb.id === '1' 
          ? { ...kb, articles: [...kb.articles, newArticle] }
          : kb
      ));
      
      return newArticle;
      
    } catch (error) {
      console.error('Article creation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate search metrics - Arama metriklerini hesaplama
  const calculateSearchMetrics = useCallback(() => {
    const totalSearches = searchQueries.length;
    const savedSearches = searchQueries.filter(s => s.isSaved).length;
    const totalArticles = knowledgeBases.reduce((sum, kb) => sum + kb.articles.length, 0);
    const totalTags = contentTags.length;
    const totalDocuments = documents.length;
    const totalInsights = aiInsights.length;
    
    return {
      totalSearches,
      savedSearches,
      searchSaveRate: totalSearches > 0 ? Math.round((savedSearches / totalSearches) * 100) : 0,
      totalArticles,
      totalTags,
      totalDocuments,
      totalInsights
    };
  }, [searchQueries, knowledgeBases, contentTags, documents, aiInsights]);

  const metrics = calculateSearchMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔍 Advanced Search & Knowledge Management</h2>
          <p className="text-gray-600">Intelligent search and comprehensive knowledge management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Search className="h-3 w-3 mr-1" />
            {metrics.totalSearches} Searches
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {searchAccuracy}% Accuracy
          </Badge>
        </div>
      </div>

      {/* Search Interface - Arama Arayüzü */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-blue-900">Advanced Search</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Search across all knowledge bases and documents
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search for articles, documents, protocols..."
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => performSearch(currentQuery, selectedFilters)}
                disabled={loading || !currentQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                <Bookmark className="h-4 w-4 mr-2" />
                Save Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Overview - Arama Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.totalSearches}</div>
            <p className="text-xs text-blue-700">
              {metrics.savedSearches} saved searches
            </p>
            <Progress value={metrics.searchSaveRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Knowledge Articles</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.totalArticles}</div>
            <p className="text-xs text-green-700">
              Published articles
            </p>
            <Progress value={85} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Content Tags</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.totalTags}</div>
            <p className="text-xs text-purple-700">
              Active tags
            </p>
            <Progress value={92} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">AI Insights</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.totalInsights}</div>
            <p className="text-xs text-orange-700">
              Generated insights
            </p>
            <Progress value={78} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base - Bilgi Tabanı */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Knowledge Base</span>
            </div>
            <Button
              onClick={() => setShowCreateArticle(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Article
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Manage knowledge articles and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {knowledgeBases.map((kb) => (
              <div key={kb.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{kb.name}</div>
                    <div className="text-sm text-green-600">{kb.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={kb.isPublic ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {kb.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {kb.category}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      ⭐ {kb.rating}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Statistics</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Articles: {kb.articles.length}</div>
                      <div>Access Count: {kb.accessCount}</div>
                      <div>Contributors: {kb.contributors.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Settings</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Comments: {kb.settings.allowComments ? 'On' : 'Off'}</div>
                      <div>Approval: {kb.settings.requireApproval ? 'Required' : 'Optional'}</div>
                      <div>Version Control: {kb.settings.versionControl ? 'On' : 'Off'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {kb.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tags - İçerik Etiketleri */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-purple-900">Content Tags</span>
            </div>
            <Button
              onClick={() => setShowCreateTag(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Manage content tags and categorization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {contentTags.map((tag) => (
              <div key={tag.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <div>
                      <div className="font-semibold text-purple-900">{tag.name}</div>
                      <div className="text-sm text-purple-600">{tag.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {tag.category}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {tag.usageCount} uses
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Synonyms</h4>
                    <div className="flex flex-wrap gap-1">
                      {tag.synonyms.slice(0, 3).map((synonym, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                          {synonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Related Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {tag.relatedTags.slice(0, 3).map((relatedTag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-300 text-purple-700">
                          {relatedTag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Insights - AI Destekli İçgörüler */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-orange-900">AI-Powered Insights</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Intelligent insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-orange-900">{insight.title}</div>
                    <div className="text-sm text-orange-600">{insight.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={insight.priority === 'high' ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                      {insight.priority}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {insight.type}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Actions</h4>
                    <div className="space-y-2">
                      {insight.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full border-orange-300 text-orange-700"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Related Items</h4>
                    <div className="space-y-1 text-sm text-orange-600">
                      {insight.relatedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-orange-500">•</span>
                          <span>{item.name}</span>
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                            {item.type}
                          </Badge>
                        </div>
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




