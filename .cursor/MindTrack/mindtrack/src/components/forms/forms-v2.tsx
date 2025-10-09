"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Share,
  History,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Tag,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import FormBuilder from "./form-builder";
import FormRunner from "./form-runner";
import type { FormTemplate, FormSubmission } from "@/types/forms";

interface FormTemplateWithStats extends FormTemplate {
  submissionCount: number;
  lastSubmission?: string;
  averageCompletionTime: number;
  completionRate: number;
  isFavorite: boolean;
  tags: string[];
  category: string;
}

interface FormVersion {
  id: string;
  formTemplateId: string;
  version: number;
  schema: any[];
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  changeLog: string;
  createdAt: string;
}

export default function FormsV2() {
  const { toast } = useToast();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  
  const [templates, setTemplates] = React.useState<FormTemplateWithStats[]>([]);
  const [submissions, setSubmissions] = React.useState<FormSubmission[]>([]);
  const [versions, setVersions] = React.useState<FormVersion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<FormTemplateWithStats | null>(null);
  const [showBuilder, setShowBuilder] = React.useState(false);
  const [showRunner, setShowRunner] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const fetchTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forms/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load templates: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSubmissions = React.useCallback(async (templateId?: string) => {
    setLoading(true);
    try {
      const url = templateId 
        ? `/api/forms/submissions?form_template_id=${templateId}`
        : '/api/forms/submissions';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load submissions: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchVersions = React.useCallback(async (templateId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/versions?form_template_id=${templateId}`);
      if (!res.ok) throw new Error('Failed to fetch versions');
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to load versions: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  React.useEffect(() => {
    if (selectedTemplate) {
      fetchSubmissions(selectedTemplate.id);
      fetchVersions(selectedTemplate.id);
    }
  }, [selectedTemplate, fetchSubmissions, fetchVersions]);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowBuilder(true);
  };

  const handleEditTemplate = (template: FormTemplateWithStats) => {
    setSelectedTemplate(template);
    setShowBuilder(true);
  };

  const handleRunTemplate = (template: FormTemplateWithStats) => {
    setSelectedTemplate(template);
    setShowRunner(true);
  };

  const handlePublishTemplate = async (templateId: string) => {
    try {
      const res = await fetch('/api/forms/templates/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      
      if (!res.ok) throw new Error('Failed to publish template');
      
      toast({
        title: "Success",
        description: "Template published successfully!",
      });
      
      fetchTemplates();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to publish: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUnpublishTemplate = async (templateId: string) => {
    try {
      const res = await fetch('/api/forms/templates/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      
      if (!res.ok) throw new Error('Failed to unpublish template');
      
      toast({
        title: "Success",
        description: "Template unpublished successfully!",
      });
      
      fetchTemplates();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to unpublish: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: FormTemplateWithStats) => {
    try {
      const res = await fetch('/api/forms/templates/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateId: template.id,
          newName: `${template.name} (Copy)`
        })
      });
      
      if (!res.ok) throw new Error('Failed to duplicate template');
      
      toast({
        title: "Success",
        description: "Template duplicated successfully!",
      });
      
      fetchTemplates();
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to duplicate: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const res = await fetch('/api/forms/templates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      
      if (!res.ok) throw new Error('Failed to delete template');
      
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });
      
      fetchTemplates();
      setSelectedTemplate(null);
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to delete: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const handleExportTemplate = async (template: FormTemplateWithStats) => {
    try {
      const res = await fetch(`/api/forms/templates/export?template_id=${template.id}`);
      if (!res.ok) throw new Error('Failed to export template');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Template exported successfully!",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to export: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && template.is_published) ||
                         (filterStatus === 'draft' && !template.is_published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  if (showBuilder) {
    return (
      <FormBuilder
        clinicId="current_clinic_id"
        initialTemplate={selectedTemplate}
        onSave={(template) => {
          setShowBuilder(false);
          fetchTemplates();
        }}
        onCancel={() => setShowBuilder(false)}
      />
    );
  }

  if (showRunner && selectedTemplate) {
    return (
      <FormRunner
        template={selectedTemplate}
        onComplete={(submission) => {
          setShowRunner(false);
          fetchSubmissions(selectedTemplate.id);
        }}
        onCancel={() => setShowRunner(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Forms V2</h2>
          <p className="text-gray-600">Advanced form builder with template gallery and version control</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {template.is_published ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                  {template.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>{template.submissionCount} submissions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{template.completionRate.toFixed(1)}% completion</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>v{template.version}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportTemplate(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {template.is_published ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnpublishTemplate(template.id)}
                    >
                      Unpublish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handlePublishTemplate(template.id)}
                    >
                      Publish
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    Versions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedTemplate.name} - Details</span>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="submissions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
                <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="space-y-4">
                <div className="space-y-2">
                  {submissions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No submissions yet</p>
                  ) : (
                    submissions.map((submission) => (
                      <div key={submission.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Submission #{submission.id.slice(0, 8)}</div>
                            <div className="text-sm text-gray-600">
                              Submitted on {new Date(submission.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {submission.e_signature_data && (
                              <Badge variant="outline">E-signed</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="versions" className="space-y-4">
                <div className="space-y-2">
                  {versions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No versions yet</p>
                  ) : (
                    versions.map((version) => (
                      <div key={version.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Version {version.version}</div>
                            <div className="text-sm text-gray-600">{version.changeLog}</div>
                            <div className="text-xs text-gray-500">
                              Created on {new Date(version.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {version.isPublished && (
                              <Badge variant="default">Published</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedTemplate.submissionCount}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedTemplate.completionRate.toFixed(1)}%</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg. Completion Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedTemplate.averageCompletionTime}m</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
