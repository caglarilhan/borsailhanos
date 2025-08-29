/**
 * Member Groups & Teams Component - Professional team management interface
 * 
 * Bu component ne işe yarar:
 * - Department-based groups
 * - Project teams
 * - Cross-functional teams
 * - Group permissions
 * - Professional team management
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Plus, 
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Target,
  Filter,
  Search,
  MoreVertical,
  ArrowUpDown,
  Clock,
  Calendar,
  Mail,
  Phone,
  Globe,
  Building,
  UserCheck,
  UserX,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  FolderOpen,
  Briefcase,
  Heart,
  Star,
  Award,
  Crown,
  User,
  UserCog,
  UserMinus,
  UserPlus2,
  Users2,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

// Group ve Team types - Bu interface'ler group ve team yapısını tanımlar
interface MemberGroup {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'project' | 'cross_functional' | 'specialty' | 'location';
  category: string;
  memberCount: number;
  maxMembers?: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: GroupMember[];
}

interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: 'leader' | 'member' | 'viewer' | 'admin';
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

interface CreateGroupData {
  name: string;
  description: string;
  type: 'department' | 'project' | 'cross_functional' | 'specialty' | 'location';
  category: string;
  isPublic: boolean;
}

/**
 * Member Groups Props - Component'e gerekli data'ları geçer
 * Bu interface ne işe yarar:
 * - Groups data'larını component'e geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface MemberGroupsProps {
  groups: MemberGroup[];
  onCreateGroup: (data: CreateGroupData) => Promise<void>;
  onUpdateGroup: (id: string, data: Partial<CreateGroupData>) => Promise<void>;
  onDeleteGroup: (id: string) => Promise<void>;
  onAddMember: (groupId: string, memberData: any) => Promise<void>;
  onRemoveMember: (groupId: string, memberId: string) => Promise<void>;
  onUpdateMemberRole: (groupId: string, memberId: string, role: string) => Promise<void>;
  loading?: boolean;
}

/**
 * Member Groups Component - Ana component
 * Bu component ne işe yarar:
 * - Professional team management interface
 * - Group creation ve management
 * - Member management
 * - Permission management
 * - User experience optimization
 */
export default function MemberGroups({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  loading = false
}: MemberGroupsProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - UI state management
   * - Form data management
   * - Group selection
   * - User interactions
   */
  const [uiState, setUiState] = React.useState({
    activeTab: 'overview' as 'overview' | 'groups' | 'teams' | 'departments' | 'projects' | 'analytics',
    showCreateDialog: false,
    showEditDialog: false,
    showMemberDialog: false,
    selectedGroup: null as MemberGroup | null,
    searchTerm: '',
    filterType: 'all' as 'all' | string,
    sortBy: 'name' as 'name' | 'memberCount' | 'createdAt' | 'type',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  /**
   * Form state'lerini yönetir
   * Bu state ne işe yarar:
   * - Form data storage
   * - Validation state
   * - User input tracking
   * - Form submission state
   */
  const [groupForm, setGroupForm] = React.useState<CreateGroupData>({
    name: '',
    description: '',
    type: 'department',
    category: '',
    isPublic: true
  });

  /**
   * Form submission state'ini yönetir
   * Bu state ne işe yarar:
   * - Loading states
   * - Error handling
   * - Success feedback
   * - Progress tracking
   */
  const [formState, setFormState] = React.useState({
    loading: false,
    error: null as string | null,
    success: null as string | null
  });

  /**
   * Groups'ları filter eder
   * Bu fonksiyon ne işe yarar:
   * - Search functionality
   * - Type filtering
   * - Sorting
   * - Data organization
   */
  const getFilteredGroups = () => {
    let filtered = groups;

    // Search filter
    if (uiState.searchTerm) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(uiState.searchTerm.toLowerCase()) ||
        group.category.toLowerCase().includes(uiState.searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (uiState.filterType !== 'all') {
      filtered = filtered.filter(group => group.type === uiState.filterType);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[uiState.sortBy];
      let bValue: any = b[uiState.sortBy];

      if (uiState.sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (uiState.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  /**
   * Group type badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Visual type indication
   * - Color coding
   * - User experience
   * - Type clarity
   */
  const renderGroupTypeBadge = (type: string) => {
    const typeConfig = {
      department: { color: 'bg-blue-100 text-blue-800', icon: Building, label: 'Department' },
      project: { color: 'bg-green-100 text-green-800', icon: Briefcase, label: 'Project' },
      cross_functional: { color: 'bg-purple-100 text-purple-800', icon: GitBranch, label: 'Cross-Functional' },
      specialty: { color: 'bg-orange-100 text-orange-800', icon: Star, label: 'Specialty' },
      location: { color: 'bg-indigo-100 text-indigo-800', icon: Globe, label: 'Location' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.department;
    const Icon = config.icon;

    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  /**
   * Group privacy badge'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Visual privacy indication
   * - Color coding
   * - User experience
   * - Privacy clarity
   */
  const renderPrivacyBadge = (isPublic: boolean) => {
    if (isPublic) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Eye className="h-3 w-3 mr-1" />
          Public
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <EyeOff className="h-3 w-3 mr-1" />
          Private
        </Badge>
      );
    }
  };

  /**
   * Group form'u submit eder
   * Bu fonksiyon ne işe yarar:
   * - Form validation
   * - API call
   * - Success/error handling
   * - Form reset
   */
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupForm.name.trim() || !groupForm.description.trim()) {
      setFormState(prev => ({ ...prev, error: 'Please provide name and description' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await onCreateGroup(groupForm);
      
      setFormState(prev => ({ ...prev, loading: false, success: 'Group created successfully!' }));
      setGroupForm({
        name: '',
        description: '',
        type: 'department',
        category: '',
        isPublic: true
      });
      setUiState(prev => ({ ...prev, showCreateDialog: false }));
      
      setTimeout(() => {
        setFormState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
      setFormState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Groups overview'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Dashboard view
   * - Statistics display
   * - Quick actions
   * - User experience
   */
  const renderOverview = () => {
    const totalGroups = groups.length;
    const activeGroups = groups.filter(g => g.isActive).length;
    const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);
    const avgGroupSize = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0;

    return (
      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">{totalGroups}</div>
                  <div className="text-sm text-blue-700">Total Groups</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">{activeGroups}</div>
                  <div className="text-sm text-green-700">Active Groups</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">{totalMembers}</div>
                  <div className="text-sm text-purple-700">Total Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-900">{avgGroupSize}</div>
                  <div className="text-sm text-orange-700">Avg Group Size</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your groups and teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: true }))}
                className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Create Group</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="h-20 border-green-300 text-green-700 hover:bg-green-50"
              >
                <div className="text-center">
                  <UserPlus className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Add Members</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="h-20 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Manage Permissions</div>
                </div>
              </Button>

              <Button 
                variant="outline"
                className="h-20 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">View Analytics</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Groups list'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Groups display
   * - Search ve filtering
   * - Group management
   * - User experience
   */
  const renderGroupsList = () => {
    const filteredGroups = getFilteredGroups();

    return (
      <div className="space-y-6">
        {/* Groups Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">All Groups</h3>
            <p className="text-gray-600">
              Manage your organization's groups and teams
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button 
              onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: true }))}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={uiState.searchTerm}
                onChange={(e) => setUiState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={uiState.filterType}
            onChange={(e) => setUiState(prev => ({ ...prev, filterType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="department">Department</option>
            <option value="project">Project</option>
            <option value="cross_functional">Cross-Functional</option>
            <option value="specialty">Specialty</option>
            <option value="location">Location</option>
          </select>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {renderGroupTypeBadge(group.type)}
                      {renderPrivacyBadge(group.isPublic)}
                    </div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {group.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Group Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{group.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium text-gray-900">
                      {group.memberCount}
                      {group.maxMembers && ` / ${group.maxMembers}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-3 w-3 mr-1" />
                    Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600">
              Create your first group to get started
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Professional layout structure
   * - Tab navigation
   * - Component organization
   * - User experience optimization
   */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Groups & Teams</h2>
          <p className="text-gray-600">
            Organize your team members into groups and manage permissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {formState.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {formState.error}
        </div>
      )}

      {formState.success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-5 w-5" />
          {formState.success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'overview' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'groups' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'groups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'teams' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'teams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'departments' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'departments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'projects' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setUiState(prev => ({ ...prev, activeTab: 'analytics' }))}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              uiState.activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {uiState.activeTab === 'overview' && renderOverview()}
      {uiState.activeTab === 'groups' && renderGroupsList()}
      {uiState.activeTab === 'teams' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users2 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
          <p className="text-gray-600 mb-4">
            Manage cross-functional teams and project groups
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: true }))}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Users2 className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      )}
      {uiState.activeTab === 'departments' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Department Management</h3>
          <p className="text-gray-600 mb-4">
            Organize team members by department and function
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: true }))}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Building className="h-4 w-4 mr-2" />
            Create Department
          </Button>
        </div>
      )}
      {uiState.activeTab === 'projects' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project Teams</h3>
          <p className="text-gray-600 mb-4">
            Create and manage project-specific teams
          </p>
          <Button 
            onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: true }))}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Create Project Team
          </Button>
        </div>
      )}
      {uiState.activeTab === 'analytics' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Group Analytics</h3>
          <p className="text-gray-600 mb-4">
            View insights and metrics about your groups and teams
          </p>
          <Button 
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={uiState.showCreateDialog} onOpenChange={(open) => setUiState(prev => ({ ...prev, showCreateDialog: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a new group or team to organize your members
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateGroup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Marketing Team"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Group Type *</Label>
                <select
                  id="type"
                  value={groupForm.type}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="department">Department</option>
                  <option value="project">Project</option>
                  <option value="cross_functional">Cross-Functional</option>
                  <option value="specialty">Specialty</option>
                  <option value="location">Location</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={groupForm.category}
                onChange={(e) => setGroupForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Sales, Development, Support"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this group..."
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={groupForm.isPublic}
                onChange={(e) => setGroupForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isPublic">Make this group public</Label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUiState(prev => ({ ...prev, showCreateDialog: false }))}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formState.loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {formState.loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}