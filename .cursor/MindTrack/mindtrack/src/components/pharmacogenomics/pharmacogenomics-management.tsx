'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dna, 
  TestTube, 
  Microscope,
  Activity,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Users,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Globe,
  Building,
  Receipt,
  Wallet,
  Database,
  Code,
  Settings,
  BookOpen,
  Award,
  Star,
  Lightbulb,
  Bell,
  Info,
  Key,
  Fingerprint,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  RefreshCw,
  Monitor,
  Server,
  HardDrive,
  Network,
  Wifi,
  WifiOff,
  ClipboardList,
  ChartBar,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  Percent,
  Calculator,
  LineChart,
  PieChart as PieChartIcon,
  BarChart,
  ScatterChart,
  FlaskConical,
  Stethoscope,
  Pill,
  Syringe,
  Heart,
  Brain,
  Eye,
  Shield,
  Lock,
  Eye as EyeIcon,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

// Interfaces
interface GeneticVariant {
  id: string;
  variant_id: string;
  gene_symbol: string;
  gene_name: string;
  variant_name: string;
  rs_id?: string;
  chromosome: string;
  position: number;
  reference_allele: string;
  alternate_allele: string;
  variant_type: string;
  clinical_significance?: string;
  population_frequency?: number;
  functional_impact?: string;
  is_active: boolean;
}

interface DrugGeneInteraction {
  id: string;
  interaction_id: string;
  drug_name: string;
  drug_id?: string;
  gene_symbol: string;
  variant_id?: string;
  interaction_type: string;
  interaction_level: string;
  evidence_level: string;
  clinical_guidance?: string;
  dosing_recommendation?: string;
  alternative_drugs?: string[];
  contraindications?: string[];
  warnings?: string[];
  monitoring_recommendations?: string[];
  is_active: boolean;
}

interface PatientGeneticProfile {
  id: string;
  patient_id: string;
  practitioner_id: string;
  test_order_id?: string;
  test_date: string;
  test_lab?: string;
  test_method?: string;
  test_coverage?: string[];
  quality_score?: number;
  interpretation_date?: string;
  interpreted_by?: string;
  interpretation_notes?: string;
  clinical_relevance?: string;
  is_active: boolean;
}

interface PharmacogenomicTestOrder {
  id: string;
  order_id: string;
  patient_id: string;
  practitioner_id: string;
  test_type: string;
  test_panel?: string[];
  indication: string;
  test_lab?: string;
  lab_order_number?: string;
  order_date: string;
  expected_result_date?: string;
  actual_result_date?: string;
  order_status: string;
  result_status?: string;
  cost?: number;
  insurance_coverage?: boolean;
  prior_authorization_required?: boolean;
  prior_authorization_obtained?: boolean;
  consent_obtained?: boolean;
  consent_date?: string;
  notes?: string;
}

interface PharmacogenomicRecommendation {
  id: string;
  patient_genetic_profile_id: string;
  drug_name: string;
  drug_id?: string;
  gene_symbol: string;
  variant_id?: string;
  interaction_level: string;
  recommendation_type: string;
  recommendation_text: string;
  confidence_level: string;
  evidence_strength: string;
  clinical_guidelines?: string[];
  references?: string[];
  is_applied: boolean;
  applied_date?: string;
  applied_by?: string;
  application_notes?: string;
}

export function PharmacogenomicsManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [geneticVariants, setGeneticVariants] = useState<GeneticVariant[]>([]);
  const [drugGeneInteractions, setDrugGeneInteractions] = useState<DrugGeneInteraction[]>([]);
  const [patientGeneticProfiles, setPatientGeneticProfiles] = useState<PatientGeneticProfile[]>([]);
  const [testOrders, setTestOrders] = useState<PharmacogenomicTestOrder[]>([]);
  const [recommendations, setRecommendations] = useState<PharmacogenomicRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  useEffect(() => {
    setGeneticVariants([
      {
        id: '1',
        variant_id: 'CYP2D6*4',
        gene_symbol: 'CYP2D6',
        gene_name: 'Cytochrome P450 2D6',
        variant_name: 'CYP2D6*4',
        rs_id: 'rs3892097',
        chromosome: '22',
        position: 42128940,
        reference_allele: 'G',
        alternate_allele: 'A',
        variant_type: 'snp',
        clinical_significance: 'pathogenic',
        population_frequency: 0.15,
        functional_impact: 'high',
        is_active: true
      },
      {
        id: '2',
        variant_id: 'CYP2C19*2',
        gene_symbol: 'CYP2C19',
        gene_name: 'Cytochrome P450 2C19',
        variant_name: 'CYP2C19*2',
        rs_id: 'rs4244285',
        chromosome: '10',
        position: 96541615,
        reference_allele: 'G',
        alternate_allele: 'A',
        variant_type: 'snp',
        clinical_significance: 'pathogenic',
        population_frequency: 0.12,
        functional_impact: 'high',
        is_active: true
      }
    ]);

    setDrugGeneInteractions([
      {
        id: '1',
        interaction_id: 'INT-001',
        drug_name: 'Fluoxetine',
        drug_id: 'fluoxetine',
        gene_symbol: 'CYP2D6',
        variant_id: '1',
        interaction_type: 'metabolizer',
        interaction_level: 'level_1a',
        evidence_level: 'strong',
        clinical_guidance: 'Poor metabolizers may require dose reduction',
        dosing_recommendation: 'Reduce dose by 50% in poor metabolizers',
        alternative_drugs: ['Sertraline', 'Escitalopram'],
        contraindications: [],
        warnings: ['Monitor for increased side effects'],
        monitoring_recommendations: ['Monitor plasma levels', 'Watch for side effects'],
        is_active: true
      },
      {
        id: '2',
        interaction_id: 'INT-002',
        drug_name: 'Clopidogrel',
        drug_id: 'clopidogrel',
        gene_symbol: 'CYP2C19',
        variant_id: '2',
        interaction_type: 'metabolizer',
        interaction_level: 'level_1a',
        evidence_level: 'strong',
        clinical_guidance: 'Poor metabolizers have reduced efficacy',
        dosing_recommendation: 'Consider alternative antiplatelet therapy',
        alternative_drugs: ['Prasugrel', 'Ticagrelor'],
        contraindications: [],
        warnings: ['Reduced antiplatelet effect'],
        monitoring_recommendations: ['Monitor platelet function', 'Consider alternative therapy'],
        is_active: true
      }
    ]);

    setPatientGeneticProfiles([
      {
        id: '1',
        patient_id: 'patient-1',
        practitioner_id: 'practitioner-1',
        test_order_id: 'order-1',
        test_date: '2024-01-15',
        test_lab: 'LabCorp',
        test_method: 'sequencing',
        test_coverage: ['CYP2D6', 'CYP2C19', 'CYP3A4'],
        quality_score: 95.0,
        interpretation_date: '2024-01-20',
        interpreted_by: 'geneticist-1',
        interpretation_notes: 'Comprehensive pharmacogenomic analysis completed',
        clinical_relevance: 'high',
        is_active: true
      },
      {
        id: '2',
        patient_id: 'patient-2',
        practitioner_id: 'practitioner-1',
        test_order_id: 'order-2',
        test_date: '2024-01-20',
        test_lab: 'Quest Diagnostics',
        test_method: 'targeted_panel',
        test_coverage: ['CYP2D6', 'CYP2C19'],
        quality_score: 92.0,
        interpretation_date: '2024-01-25',
        interpreted_by: 'geneticist-1',
        interpretation_notes: 'Targeted pharmacogenomic panel completed',
        clinical_relevance: 'moderate',
        is_active: true
      }
    ]);

    setTestOrders([
      {
        id: '1',
        order_id: 'PGX-2024-001',
        patient_id: 'patient-1',
        practitioner_id: 'practitioner-1',
        test_type: 'comprehensive',
        test_panel: ['CYP2D6', 'CYP2C19', 'CYP3A4', 'UGT1A1'],
        indication: 'Depression treatment optimization',
        test_lab: 'LabCorp',
        lab_order_number: 'LC-123456',
        order_date: '2024-01-10',
        expected_result_date: '2024-01-20',
        actual_result_date: '2024-01-18',
        order_status: 'completed',
        result_status: 'interpreted',
        cost: 500.0,
        insurance_coverage: true,
        prior_authorization_required: true,
        prior_authorization_obtained: true,
        consent_obtained: true,
        consent_date: '2024-01-09',
        notes: 'Patient consented to comprehensive pharmacogenomic testing'
      },
      {
        id: '2',
        order_id: 'PGX-2024-002',
        patient_id: 'patient-2',
        practitioner_id: 'practitioner-1',
        test_type: 'targeted',
        test_panel: ['CYP2D6', 'CYP2C19'],
        indication: 'Antidepressant selection',
        test_lab: 'Quest Diagnostics',
        lab_order_number: 'QD-789012',
        order_date: '2024-01-15',
        expected_result_date: '2024-01-25',
        actual_result_date: '2024-01-23',
        order_status: 'completed',
        result_status: 'interpreted',
        cost: 300.0,
        insurance_coverage: true,
        prior_authorization_required: false,
        prior_authorization_obtained: false,
        consent_obtained: true,
        consent_date: '2024-01-14',
        notes: 'Targeted testing for antidepressant selection'
      }
    ]);

    setRecommendations([
      {
        id: '1',
        patient_genetic_profile_id: '1',
        drug_name: 'Fluoxetine',
        gene_symbol: 'CYP2D6',
        variant_id: '1',
        interaction_level: 'level_1a',
        recommendation_type: 'dose_adjustment',
        recommendation_text: 'Reduce fluoxetine dose by 50% due to poor metabolizer status',
        confidence_level: 'high',
        evidence_strength: 'strong',
        clinical_guidelines: ['CPIC Guidelines'],
        references: ['PMID: 12345678'],
        is_applied: true,
        applied_date: '2024-01-25',
        applied_by: 'practitioner-1',
        application_notes: 'Dose reduced from 20mg to 10mg daily'
      },
      {
        id: '2',
        patient_genetic_profile_id: '2',
        drug_name: 'Sertraline',
        gene_symbol: 'CYP2D6',
        interaction_level: 'level_2a',
        recommendation_type: 'drug_selection',
        recommendation_text: 'Consider sertraline as alternative due to better metabolizer profile',
        confidence_level: 'moderate',
        evidence_strength: 'moderate',
        clinical_guidelines: ['CPIC Guidelines'],
        references: ['PMID: 87654321'],
        is_applied: false,
        application_notes: 'Patient prefers current medication'
      }
    ]);
  }, []);

  const getInteractionLevelColor = (level: string) => {
    switch (level) {
      case 'level_1a':
      case 'level_1b':
        return 'destructive';
      case 'level_2a':
      case 'level_2b':
        return 'secondary';
      case 'level_3':
        return 'outline';
      case 'level_4':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'strong':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'weak':
        return 'outline';
      case 'insufficient':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'secondary';
      case 'sent_to_lab':
        return 'secondary';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getRecommendationTypeColor = (type: string) => {
    switch (type) {
      case 'dose_adjustment':
        return 'default';
      case 'drug_selection':
        return 'secondary';
      case 'monitoring':
        return 'outline';
      case 'contraindication':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getConfidenceLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pharmacogenomics</h2>
          <p className="text-muted-foreground">
            Genetic testing for personalized medication therapy and drug-gene interactions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Order Test
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Genetic Variants</TabsTrigger>
          <TabsTrigger value="interactions">Drug-Gene Interactions</TabsTrigger>
          <TabsTrigger value="profiles">Patient Profiles</TabsTrigger>
          <TabsTrigger value="orders">Test Orders</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Genetic Variants</CardTitle>
                <Dna className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{geneticVariants.length}</div>
                <p className="text-xs text-muted-foreground">
                  {geneticVariants.filter(v => v.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drug Interactions</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drugGeneInteractions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {drugGeneInteractions.filter(i => i.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Orders</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  {testOrders.filter(o => o.order_status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {recommendations.filter(r => r.is_applied).length} applied
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Orders</CardTitle>
                <CardDescription>Latest pharmacogenomic test orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.order_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.test_type} - {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getOrderStatusColor(order.order_status)}>
                        {order.order_status}
                      </Badge>
                      <Badge variant="outline">{order.test_type}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Recommendations</CardTitle>
                <CardDescription>Current pharmacogenomic recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.slice(0, 3).map((recommendation) => (
                  <div key={recommendation.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{recommendation.drug_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {recommendation.gene_symbol} - {recommendation.recommendation_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getRecommendationTypeColor(recommendation.recommendation_type)}>
                        {recommendation.recommendation_type}
                      </Badge>
                      <Badge variant={recommendation.is_applied ? 'default' : 'secondary'}>
                        {recommendation.is_applied ? 'Applied' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Genetic Variants</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </div>

          <div className="grid gap-4">
            {geneticVariants.map((variant) => (
              <Card key={variant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{variant.variant_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{variant.gene_symbol}</Badge>
                      <Badge variant="outline">{variant.variant_type}</Badge>
                      <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                        {variant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{variant.gene_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Chromosome</p>
                        <p className="text-sm text-muted-foreground">{variant.chromosome}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Position</p>
                        <p className="text-sm text-muted-foreground">{variant.position.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reference Allele</p>
                        <p className="text-sm text-muted-foreground">{variant.reference_allele}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Alternate Allele</p>
                        <p className="text-sm text-muted-foreground">{variant.alternate_allele}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Clinical Significance</p>
                        <p className="text-sm text-muted-foreground">{variant.clinical_significance || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Population Frequency</p>
                        <p className="text-sm text-muted-foreground">
                          {variant.population_frequency ? (variant.population_frequency * 100).toFixed(1) + '%' : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {variant.rs_id && (
                      <div>
                        <p className="text-sm font-medium">dbSNP ID</p>
                        <p className="text-sm text-muted-foreground">{variant.rs_id}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Drug-Gene Interactions</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Interaction
            </Button>
          </div>

          <div className="grid gap-4">
            {drugGeneInteractions.map((interaction) => (
              <Card key={interaction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{interaction.drug_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getInteractionLevelColor(interaction.interaction_level)}>
                        {interaction.interaction_level}
                      </Badge>
                      <Badge variant={getEvidenceLevelColor(interaction.evidence_level)}>
                        {interaction.evidence_level}
                      </Badge>
                      <Badge variant="outline">{interaction.gene_symbol}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {interaction.interaction_type} - {interaction.gene_symbol}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Interaction Type</p>
                        <p className="text-sm text-muted-foreground">{interaction.interaction_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Evidence Level</p>
                        <p className="text-sm text-muted-foreground">{interaction.evidence_level}</p>
                      </div>
                    </div>
                    {interaction.clinical_guidance && (
                      <div>
                        <p className="text-sm font-medium">Clinical Guidance</p>
                        <p className="text-sm text-muted-foreground">{interaction.clinical_guidance}</p>
                      </div>
                    )}
                    {interaction.dosing_recommendation && (
                      <div>
                        <p className="text-sm font-medium">Dosing Recommendation</p>
                        <p className="text-sm text-muted-foreground">{interaction.dosing_recommendation}</p>
                      </div>
                    )}
                    {interaction.alternative_drugs && interaction.alternative_drugs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Alternative Drugs</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {interaction.alternative_drugs.map((drug, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {drug}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {interaction.monitoring_recommendations && interaction.monitoring_recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Monitoring Recommendations</p>
                        <ul className="text-sm text-muted-foreground mt-2">
                          {interaction.monitoring_recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Patient Genetic Profiles</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {patientGeneticProfiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Patient {profile.patient_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{profile.test_method}</Badge>
                      <Badge variant={profile.clinical_relevance === 'high' ? 'default' : 'secondary'}>
                        {profile.clinical_relevance}
                      </Badge>
                      <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {profile.test_lab} - {new Date(profile.test_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Test Method</p>
                        <p className="text-sm text-muted-foreground">{profile.test_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Quality Score</p>
                        <p className="text-sm text-muted-foreground">{profile.quality_score || 'N/A'}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Interpretation Date</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.interpretation_date ? new Date(profile.interpretation_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Interpreted By</p>
                        <p className="text-sm text-muted-foreground">{profile.interpreted_by || 'N/A'}</p>
                      </div>
                    </div>
                    {profile.test_coverage && profile.test_coverage.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Test Coverage</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.test_coverage.map((gene, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {gene}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.interpretation_notes && (
                      <div>
                        <p className="text-sm font-medium">Interpretation Notes</p>
                        <p className="text-sm text-muted-foreground">{profile.interpretation_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pharmacogenomic Test Orders</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>

          <div className="grid gap-4">
            {testOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.order_id}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getOrderStatusColor(order.order_status)}>
                        {order.order_status}
                      </Badge>
                      <Badge variant="outline">{order.test_type}</Badge>
                      <Badge variant={order.insurance_coverage ? 'default' : 'secondary'}>
                        {order.insurance_coverage ? 'Covered' : 'Not Covered'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Patient {order.patient_id} - {new Date(order.order_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Indication</p>
                        <p className="text-sm text-muted-foreground">{order.indication}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Test Lab</p>
                        <p className="text-sm text-muted-foreground">{order.test_lab || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cost</p>
                        <p className="text-sm text-muted-foreground">
                          {order.cost ? `$${order.cost}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Expected Result Date</p>
                        <p className="text-sm text-muted-foreground">
                          {order.expected_result_date ? new Date(order.expected_result_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Prior Authorization</p>
                        <p className="text-sm text-muted-foreground">
                          {order.prior_authorization_required ? (order.prior_authorization_obtained ? 'Obtained' : 'Required') : 'Not Required'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Consent</p>
                        <p className="text-sm text-muted-foreground">
                          {order.consent_obtained ? 'Obtained' : 'Not Obtained'}
                        </p>
                      </div>
                    </div>
                    {order.test_panel && order.test_panel.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Test Panel</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {order.test_panel.map((gene, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {gene}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {order.notes && (
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pharmacogenomic Recommendations</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Recommendations
            </Button>
          </div>

          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{recommendation.drug_name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getRecommendationTypeColor(recommendation.recommendation_type)}>
                        {recommendation.recommendation_type}
                      </Badge>
                      <Badge variant={getConfidenceLevelColor(recommendation.confidence_level)}>
                        {recommendation.confidence_level}
                      </Badge>
                      <Badge variant={recommendation.is_applied ? 'default' : 'secondary'}>
                        {recommendation.is_applied ? 'Applied' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {recommendation.gene_symbol} - {recommendation.interaction_level}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Gene</p>
                        <p className="text-sm text-muted-foreground">{recommendation.gene_symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Evidence Strength</p>
                        <p className="text-sm text-muted-foreground">{recommendation.evidence_strength}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Applied Date</p>
                        <p className="text-sm text-muted-foreground">
                          {recommendation.applied_date ? new Date(recommendation.applied_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Applied By</p>
                        <p className="text-sm text-muted-foreground">{recommendation.applied_by || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recommendation</p>
                      <p className="text-sm text-muted-foreground">{recommendation.recommendation_text}</p>
                    </div>
                    {recommendation.clinical_guidelines && recommendation.clinical_guidelines.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Clinical Guidelines</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {recommendation.clinical_guidelines.map((guideline, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {guideline}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {recommendation.application_notes && (
                      <div>
                        <p className="text-sm font-medium">Application Notes</p>
                        <p className="text-sm text-muted-foreground">{recommendation.application_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CPIC Guidelines</CardTitle>
                <CardDescription>Clinical Pharmacogenomics Implementation Consortium</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BookOpen className="h-8 w-8" />
                  <span className="ml-2">CPIC guidelines will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FDA Guidelines</CardTitle>
                <CardDescription>Food and Drug Administration pharmacogenomic guidelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Building className="h-8 w-8" />
                  <span className="ml-2">FDA guidelines will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Analytics</CardTitle>
                <CardDescription>Pharmacogenomic testing metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8" />
                  <span className="ml-2">Test analytics chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendation Impact</CardTitle>
                <CardDescription>Clinical outcomes and cost-effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                  <span className="ml-2">Recommendation impact chart will be displayed here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

