/**
 * Member Onboarding Flow Component - Professional member onboarding experience
 * 
 * Bu component ne işe yarar:
 * - Yeni member'lar için onboarding wizard
 * - Profile completion form
 * - Clinic policies acceptance
 * - Training materials access
 * - Professional first-time user experience
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Shield, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Home,
  Settings,
  BookOpen,
  Video,
  Download,
  ExternalLink,
  Clock,
  Star,
  AlertCircle,
  Info,
  Play,
  SkipForward,
  Lock,
  GraduationCap,
  Award,
  Users,
  Calendar,
  Bell,
  Zap,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";

// Onboarding step types - Bu interface'ler onboarding flow'unu tanımlar
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isRequired: boolean;
  component: React.ReactNode;
}

interface OnboardingData {
  profile: {
    fullName: string;
    title: string;
    bio: string;
    phone: string;
    emergencyContact: string;
    specialties: string[];
    certifications: string[];
    experience: string;
    avatar?: string;
  };
  policies: {
    hipaa: boolean;
    confidentiality: boolean;
    codeOfConduct: boolean;
    emergencyProcedures: boolean;
    dataPrivacy: boolean;
  };
  training: {
    completedModules: string[];
    currentModule: string;
    progress: number;
    certificates: string[];
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsReminders: boolean;
    calendarSync: boolean;
    language: string;
    timezone: string;
  };
}

/**
 * Member Onboarding Props - Component'e gerekli data'ları geçer
 * Bu interface ne işe yarar:
 * - Onboarding data'larını component'e geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface MemberOnboardingProps {
  memberId: string;
  memberRole: string;
  clinicName: string;
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip: () => void;
  loading?: boolean;
}

/**
 * Member Onboarding Component - Ana component
 * Bu component ne işe yarar:
 * - Professional onboarding wizard
 * - Step-by-step guidance
 * - Progress tracking
 * - User experience optimization
 */
export default function MemberOnboarding({
  memberId,
  memberRole,
  clinicName,
  onComplete,
  onSkip,
  loading = false
}: MemberOnboardingProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - Current step tracking
   * - Form data management
   * - Progress calculation
   * - UI state management
   */
  const [currentStep, setCurrentStep] = React.useState(0);
  const [onboardingData, setOnboardingData] = React.useState<OnboardingData>({
    profile: {
      fullName: '',
      title: '',
      bio: '',
      phone: '',
      emergencyContact: '',
      specialties: [],
      certifications: [],
      experience: ''
    },
    policies: {
      hipaa: false,
      confidentiality: false,
      codeOfConduct: false,
      emergencyProcedures: false,
      dataPrivacy: false
    },
    training: {
      completedModules: [],
      currentModule: '',
      progress: 0,
      certificates: []
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsReminders: false,
      calendarSync: true,
      language: 'en',
      timezone: 'UTC'
    }
  });

  /**
   * Form validation state'ini yönetir
   * Bu state ne işe yarar:
   * - Field validation errors
   * - Form completion status
   * - User feedback
   * - Error handling
   */
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});

  /**
   * Onboarding steps'lerini tanımlar
   * Bu array ne işe yarar:
   * - Step-by-step flow definition
   * - Component mapping
   * - Progress tracking
   * - User guidance
   */
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to the Team',
      description: 'Get started with your clinic onboarding',
      icon: <User className="h-5 w-5" />,
      isCompleted: false,
      isRequired: true,
      component: renderWelcomeStep()
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your experience',
      icon: <User className="h-5 w-5" />,
      isCompleted: false,
      isRequired: true,
      component: renderProfileStep()
    },
    {
      id: 'policies',
      title: 'Review & Accept Policies',
      description: 'Important clinic policies and procedures',
      icon: <Shield className="h-5 w-5" />,
      isCompleted: false,
      isRequired: true,
      component: renderPoliciesStep()
    },
    {
      id: 'training',
      title: 'Complete Training Modules',
      description: 'Essential training for your role',
      icon: <GraduationCap className="h-5 w-5" />,
      isCompleted: false,
      isRequired: true,
      component: renderTrainingStep()
    },
    {
      id: 'preferences',
      title: 'Set Your Preferences',
      description: 'Customize your experience',
      icon: <Settings className="h-5 w-5" />,
      isCompleted: false,
      isRequired: false,
      component: renderPreferencesStep()
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Welcome to the team',
      icon: <Award className="h-5 w-5" />,
      isCompleted: false,
      isRequired: true,
      component: renderCompletionStep()
    }
  ];

  /**
   * Progress percentage'ini hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Visual progress indication
   * - User motivation
   * - Completion tracking
   * - Experience optimization
   */
  const calculateProgress = (): number => {
    const completedSteps = onboardingSteps.filter(step => step.isCompleted).length;
    return Math.round((completedSteps / onboardingSteps.length) * 100);
  };

  /**
   * Form validation yapar
   * Bu fonksiyon ne işe yarar:
   * - Required field validation
   * - Data format validation
   * - Business rule validation
   * - User feedback
   */
  const validateCurrentStep = (): boolean => {
    const currentStepData = onboardingSteps[currentStep];
    const errors: { [key: string]: string } = {};

    switch (currentStepData.id) {
      case 'profile':
        if (!onboardingData.profile.fullName.trim()) {
          errors.fullName = 'Full name is required';
        }
        if (!onboardingData.profile.title.trim()) {
          errors.title = 'Professional title is required';
        }
        if (!onboardingData.profile.phone.trim()) {
          errors.phone = 'Phone number is required';
        }
        break;

      case 'policies':
        const requiredPolicies = ['hipaa', 'confidentiality', 'codeOfConduct'];
        for (const policy of requiredPolicies) {
          if (!onboardingData.policies[policy as keyof typeof onboardingData.policies]) {
            errors[policy] = `You must accept the ${policy} policy`;
          }
        }
        break;

      case 'training':
        if (onboardingData.training.progress < 100) {
          errors.training = 'Please complete all required training modules';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Next step'e geçer
   * Bu fonksiyon ne işe yarar:
   * - Step validation
   * - Progress tracking
   * - State management
   * - User experience
   */
  const goToNextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Mark current step as completed
    const updatedSteps = [...onboardingSteps];
    updatedSteps[currentStep].isCompleted = true;

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Previous step'e geri döner
   * Bu fonksiyon ne işe yarar:
   * - Navigation control
   * - User flexibility
   * - Experience optimization
   * - State management
   */
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Onboarding'i tamamlar
   * Bu fonksiyon ne işe yarar:
   * - Final validation
   * - API call
   * - Success handling
   * - User feedback
   */
  const completeOnboarding = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      // API'ye kaydet
      const res = await fetch('/api/clinics/members/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, onboarding: onboardingData })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to complete onboarding');
      }

      await onComplete(onboardingData);
      // Mark final step as completed
      const updatedSteps = [...onboardingSteps];
      updatedSteps[currentStep].isCompleted = true;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  /**
   * Welcome step'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - First impression
   * - User motivation
   * - Clear expectations
   * - Professional welcome
   */
  function renderWelcomeStep() {
    return (
      <div className="text-center space-y-8">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl -m-8"></div>
          <div className="relative p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to {clinicName}! 🎉
            </h3>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              We're thrilled to have you join our team as a <span className="font-semibold text-blue-600">{memberRole}</span>. 
              Let's get you set up for success.
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>~15-20 minutes to complete</span>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            What to expect during onboarding:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Complete Profile</p>
                <p className="text-sm text-gray-600">Share your experience and credentials</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Policies</p>
                <p className="text-sm text-gray-600">Understand clinic procedures</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Complete Training</p>
                <p className="text-sm text-gray-600">Essential role-based modules</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Set Preferences</p>
                <p className="text-sm text-gray-600">Customize your experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">6</div>
            <div className="text-sm text-gray-600">Total Steps</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Required</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Profile step'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - User information collection
   * - Professional profile setup
   * - Data validation
   * - User experience
   */
  function renderProfileStep() {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Professional Profile
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help your colleagues and clients get to know you better. This information will be displayed 
            on your profile and can be updated anytime.
          </p>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={onboardingData.profile.fullName}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, fullName: e.target.value }
                    }))}
                    placeholder="Dr. Jane Smith"
                    className={`h-11 ${validationErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Professional Title *
                  </Label>
                  <Input
                    id="title"
                    value={onboardingData.profile.title}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, title: e.target.value }
                    }))}
                    placeholder="Licensed Clinical Psychologist"
                    className={`h-11 ${validationErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Professional Bio
                </Label>
                <Textarea
                  id="bio"
                  value={onboardingData.profile.bio}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, bio: e.target.value }
                  }))}
                  placeholder="Tell us about your background, specialties, therapeutic approach, and what makes you passionate about helping others..."
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-500">
                  This will be visible to clients and colleagues. Keep it professional and engaging.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={onboardingData.profile.phone}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, phone: e.target.value }
                    }))}
                    placeholder="+1 (555) 123-4567"
                    className={`h-11 ${validationErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">
                    Emergency Contact
                  </Label>
                  <Input
                    id="emergencyContact"
                    value={onboardingData.profile.emergencyContact}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      profile: { ...prev.profile, emergencyContact: e.target.value }
                    }))}
                    placeholder="Emergency contact name & number"
                    className="h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500">
                    For safety purposes only. Will not be shared publicly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  value={onboardingData.profile.experience}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, experience: e.target.value }
                  }))}
                  placeholder="e.g., 5+ years in clinical practice"
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">
                  This helps clients understand your expertise level.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * Policies step'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Policy acceptance
   * - Legal compliance
   * - User education
   * - Risk management
   */
  function renderPoliciesStep() {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Clinic Policies & Procedures
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please review and accept these important policies. These are essential for maintaining 
            clinic standards and ensuring compliance with healthcare regulations.
          </p>
        </div>

        {/* Policies Grid */}
        <div className="space-y-6">
          {/* HIPAA Policy */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-900 mb-2">HIPAA Compliance</CardTitle>
                    <CardDescription className="text-blue-700 text-base">
                      Health Insurance Portability and Accountability Act - Patient privacy and data protection
                    </CardDescription>
                  </div>
                </div>
                <Checkbox
                  checked={onboardingData.policies.hipaa}
                  onCheckedChange={(checked) => setOnboardingData(prev => ({
                    ...prev,
                    policies: { ...prev.policies, hipaa: checked as boolean }
                  }))}
                  className={`w-6 h-6 ${validationErrors.hipaa ? 'border-red-300' : 'border-blue-300'}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  I understand and agree to maintain patient confidentiality and comply with all HIPAA regulations. 
                  This includes protecting patient information, using secure communication methods, and following 
                  proper data handling procedures.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Full Policy
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-50">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
                {validationErrors.hipaa && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">{validationErrors.hipaa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Confidentiality Policy */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-green-900 mb-2">Confidentiality Agreement</CardTitle>
                    <CardDescription className="text-green-700 text-base">
                      Client privacy and information protection standards
                    </CardDescription>
                  </div>
                </div>
                <Checkbox
                  checked={onboardingData.policies.confidentiality}
                  onCheckedChange={(checked) => setOnboardingData(prev => ({
                    ...prev,
                    policies: { ...prev.policies, confidentiality: checked as boolean }
                  }))}
                  className={`w-6 h-6 ${validationErrors.confidentiality ? 'border-red-300' : 'border-green-300'}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-green-800 leading-relaxed">
                  I agree to maintain strict confidentiality of all client information and communications. 
                  This includes session notes, personal details, and any other sensitive information shared 
                  during therapy sessions.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Full Policy
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
                {validationErrors.confidentiality && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">{validationErrors.confidentiality}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Code of Conduct */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-purple-900 mb-2">Code of Conduct</CardTitle>
                    <CardDescription className="text-purple-700 text-base">
                      Professional behavior and ethical standards
                    </CardDescription>
                  </div>
                </div>
                <Checkbox
                  checked={onboardingData.policies.codeOfConduct}
                  onCheckedChange={(checked) => setOnboardingData(prev => ({
                    ...prev,
                    policies: { ...prev.policies, codeOfConduct: checked as boolean }
                  }))}
                  className={`w-6 h-6 ${validationErrors.codeOfConduct ? 'border-red-300' : 'border-purple-300'}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-purple-800 leading-relaxed">
                  I agree to uphold the highest standards of professional conduct and ethical behavior. 
                  This includes treating all clients with respect, maintaining professional boundaries, 
                  and following therapeutic best practices.
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Full Policy
                  </Button>
                  <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-50">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
                {validationErrors.codeOfConduct && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">{validationErrors.codeOfConduct}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Why These Policies Matter</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• <strong>Legal Compliance:</strong> Ensures adherence to healthcare regulations</p>
                <p>• <strong>Client Trust:</strong> Builds confidence in our professional standards</p>
                <p>• <strong>Risk Management:</strong> Protects both clients and practitioners</p>
                <p>• <strong>Professional Standards:</strong> Maintains high-quality care delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Training step'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Training module completion
   * - Progress tracking
   * - User education
   * - Compliance verification
   */
  function renderTrainingStep() {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Required Training Modules
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete these essential training modules for your role. Each module is designed to ensure 
            you have the knowledge and skills needed to provide excellent care.
          </p>
        </div>

        {/* Training Modules */}
        <div className="space-y-6">
          {/* HIPAA Training */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-900 mb-2">HIPAA Training</CardTitle>
                    <CardDescription className="text-blue-700 text-base">
                      Understanding patient privacy and data protection
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Duration: 45 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-800">Score: 95%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-50">
                    <Play className="h-4 w-4 mr-2" />
                    Review Module
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Procedures */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-orange-900 mb-2">Safety Procedures</CardTitle>
                    <CardDescription className="text-orange-700 text-base">
                      Emergency protocols and safety guidelines
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-800">Duration: 30 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-800">Score: 100%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-50">
                    <Play className="h-4 w-4 mr-2" />
                    Review Module
                  </Button>
                  <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Training */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-purple-900 mb-2">System Training</CardTitle>
                    <CardDescription className="text-purple-700 text-base">
                      Using clinic management software effectively
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Play className="h-4 w-4 mr-1" />
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-800">Duration: 60 minutes</span>
                    <span className="text-purple-800 font-medium">Progress: 75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div className="flex items-center gap-3">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Module
                  </Button>
                  <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-50">
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip to End
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-3">Training Progress Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-blue-800">Completed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-sm text-purple-800">In Progress</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-green-600">75%</div>
                  <div className="text-sm text-green-800">Overall Progress</div>
                </div>
              </div>
              <p className="text-sm text-blue-800 mt-3">
                You've completed 2 of 3 required modules. Complete the System Training module to continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Preferences step'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - User preference setup
   * - Notification settings
   * - Personalization options
   * - User experience customization
   */
  function renderPreferencesStep() {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Personalize Your Experience
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your settings and preferences to make the most of your clinic experience. 
            These settings can be changed anytime from your profile.
          </p>
        </div>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Preferences */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-blue-700">
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Push Notifications</div>
                      <div className="text-sm text-gray-600">Real-time updates in your browser</div>
                    </div>
                  </div>
                  <Checkbox
                    id="notifications"
                    checked={onboardingData.preferences.notifications}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, notifications: checked as boolean }
                    }))}
                    className="w-5 h-5 border-blue-300"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Email Updates</div>
                      <div className="text-sm text-gray-600">Weekly summaries and reports</div>
                    </div>
                  </div>
                  <Checkbox
                    id="emailUpdates"
                    checked={onboardingData.preferences.emailUpdates}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailUpdates: checked as boolean }
                    }))}
                    className="w-5 h-5 border-blue-300"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">SMS Reminders</div>
                      <div className="text-sm text-gray-600">Appointment and task reminders</div>
                    </div>
                  </div>
                  <Checkbox
                    id="smsReminders"
                    checked={onboardingData.preferences.smsReminders}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, smsReminders: checked as boolean }
                    }))}
                    className="w-5 h-5 border-blue-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription className="text-green-700">
                Configure your workspace and system preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Calendar Sync</div>
                      <div className="text-sm text-gray-600">Sync with external calendars</div>
                    </div>
                  </div>
                  <Checkbox
                    id="calendarSync"
                    checked={onboardingData.preferences.calendarSync}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, calendarSync: checked as boolean }
                    }))}
                    className="w-5 h-5 border-green-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                    Language
                  </Label>
                  <select
                    id="language"
                    value={onboardingData.preferences.language}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="tr">Türkçe</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
                    Timezone
                  </Label>
                  <select
                    id="timezone"
                    value={onboardingData.preferences.timezone}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-gray-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">About These Preferences</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• <strong>Notifications:</strong> Stay informed about important updates and reminders</p>
                <p>• <strong>Calendar Sync:</strong> Integrate with your existing calendar systems</p>
                <p>• <strong>Language & Timezone:</strong> Customize for your location and preferences</p>
                <p>• <strong>Changes:</strong> All settings can be modified later from your profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Completion step'ini render eder
   * Bu fonksiyon ne işe yarar:
   * - Success celebration
   * - Next steps guidance
   * - Resource access
   * - User motivation
   */
  function renderCompletionStep() {
    return (
      <div className="text-center space-y-8">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl -m-8"></div>
          <div className="relative p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome to the Team! 🎉
            </h3>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              You've successfully completed your onboarding and are now ready to start making a difference 
              in our clinic. We're excited to have you on board!
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Award className="h-4 w-4" />
              <span>Onboarding Complete</span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            What's Next?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Home className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Access Your Dashboard</p>
                <p className="text-sm text-gray-600">Start managing clients and appointments</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <BookOpen className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Review Resources</p>
                <p className="text-sm text-gray-600">Access training materials and guides</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Settings className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Customize Settings</p>
                <p className="text-sm text-gray-600">Adjust preferences anytime</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Users className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Meet the Team</p>
                <p className="text-sm text-gray-600">Connect with your colleagues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="lg" className="border-green-300 text-green-700 hover:bg-green-50">
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          <Button 
            size="lg" 
            onClick={completeOnboarding}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            Get Started
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Quick Tips for Success
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• <strong>Explore:</strong> Take time to familiarize yourself with the system</p>
            <p>• <strong>Ask Questions:</strong> Don't hesitate to reach out to your team lead</p>
            <p>• <strong>Stay Updated:</strong> Check for new training materials regularly</p>
            <p>• <strong>Feedback:</strong> Share your experience to help improve the system</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Professional layout structure
   * - Step navigation
   * - Progress indication
   * - User experience optimization
   */
  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Header - İlerleme başlığı */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Member Onboarding</h2>
            <p className="text-gray-600">Complete your setup to access the clinic system</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">Step {currentStep + 1} of {onboardingSteps.length}</div>
              <div className="text-lg font-semibold text-gray-900">{calculateProgress()}% Complete</div>
            </div>
            <Badge variant="secondary" className="px-3 py-2 text-sm">
              {onboardingSteps[currentStep].title}
            </Badge>
          </div>
        </div>
        
        {/* Progress Bar - İlerleme çubuğu */}
        <div className="relative">
          <Progress value={calculateProgress()} className="h-3" />
          <div className="absolute inset-0 flex items-center justify-between px-2">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Step Indicators - Adım göstergeleri */}
        <div className="flex items-center justify-between mt-6">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                index <= currentStep ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index < currentStep ? 'bg-green-100 text-green-600 scale-110' :
                index === currentStep ? 'bg-blue-100 text-blue-600 scale-110 ring-4 ring-blue-200' :
                'bg-gray-100 text-gray-400'
              }`}>
                {index < currentStep ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>
              <div className="text-center">
                <div className={`text-xs font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs ${
                  index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content - Mevcut adım içeriği */}
      <Card className="mb-8 border-0 shadow-lg bg-white">
        <CardContent className="p-8">
          {onboardingSteps[currentStep].component}
        </CardContent>
      </Card>

      {/* Navigation Buttons - Navigasyon butonları */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              className="h-11 px-6 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="h-11 px-6 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Skip for Now
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {currentStep < onboardingSteps.length - 1 ? (
            <Button 
              onClick={goToNextStep}
              className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={completeOnboarding} 
              disabled={loading}
              className="h-11 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
            >
              {loading ? 'Completing...' : 'Complete Onboarding'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
