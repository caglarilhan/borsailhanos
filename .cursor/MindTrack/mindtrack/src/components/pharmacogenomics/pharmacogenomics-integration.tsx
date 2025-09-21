"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dna, 
  TestTube, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Activity,
  Microscope,
  Shield,
  Zap
} from 'lucide-react';
import { usePharmacogenomics } from '@/hooks/usePharmacogenomics';

export default function PharmacogenomicsIntegration() {
  const {
    loading,
    error,
    getGeneticVariants,
    createGeneticVariant,
    getPharmacogenomicTests,
    createPharmacogenomicTest,
    updateTestStatus,
    getDrugGeneInteractions,
    analyzeDrugGeneInteraction,
    generatePersonalizedTreatment,
    getPharmacogenomicAnalytics,
    getSignificanceColor,
    getSignificanceBadgeVariant,
    getEvidenceLevelColor,
    getTestStatusColor,
    getTestStatusBadgeVariant,
    formatGenotype,
    formatPhenotype,
  } = usePharmacogenomics();

  const [variants, setVariants] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [selectedGene, setSelectedGene] = useState<string>('');

  const [newVariant, setNewVariant] = useState({
    gene: '',
    variant: '',
    rsId: '',
    chromosome: '',
    position: 0,
    genotype: '',
    phenotype: '',
    clinicalSignificance: 'uncertain' as 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic',
    alleleFrequency: 0,
    population: ''
  });

  const [newTest, setNewTest] = useState({
    testName: '',
    testType: 'panel' as 'panel' | 'single_gene' | 'whole_genome',
    genes: [] as string[],
    labName: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [variantsData, testsData, analyticsData] = await Promise.all([
        getGeneticVariants(selectedPatient),
        getPharmacogenomicTests(selectedPatient),
        getPharmacogenomicAnalytics()
      ]);
      
      setVariants(variantsData);
      setTests(testsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateVariant = async () => {
    try {
      await createGeneticVariant({
        ...newVariant,
        patientId: selectedPatient || 'default-patient'
      });
      setNewVariant({
        gene: '',
        variant: '',
        rsId: '',
        chromosome: '',
        position: 0,
        genotype: '',
        phenotype: '',
        clinicalSignificance: 'uncertain',
        alleleFrequency: 0,
        population: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating variant:', error);
    }
  };

  const handleCreateTest = async () => {
    try {
      await createPharmacogenomicTest({
        ...newTest,
        patientId: selectedPatient || 'default-patient',
        variants: [],
        testDate: new Date().toISOString(),
        status: 'ordered'
      });
      setNewTest({
        testName: '',
        testType: 'panel',
        genes: [],
        labName: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const handleAnalyzeInteraction = async () => {
    if (!selectedDrug || variants.length === 0) return;
    
    try {
      const analysis = await analyzeDrugGeneInteraction(selectedDrug, variants);
      setInteractions(analysis);
    } catch (error) {
      console.error('Error analyzing interaction:', error);
    }
  };

  const handleGenerateTreatment = async () => {
    if (!selectedPatient || !selectedDrug) return;
    
    try {
      await generatePersonalizedTreatment(selectedPatient, selectedDrug);
      alert('Personalized treatment plan generated successfully!');
    } catch (error) {
      console.error('Error generating treatment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Dna className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Pharmacogenomics Integration</h1>
          <p className="text-gray-600">Genetic testing integration for personalized treatment</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Genetic Variants</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dna className="h-5 w-5" />
                  <span>Total Variants</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{variants.length}</div>
                <p className="text-sm text-gray-600">Genetic variants</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Tests Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.completedTests || 0}</div>
                <p className="text-sm text-gray-600">Pharmacogenomic tests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5" />
                  <span>Drug Interactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{interactions.length}</div>
                <p className="text-sm text-gray-600">Analyzed interactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Avg Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.averageProcessingTime?.toFixed(1) || 0}d</div>
                <p className="text-sm text-gray-600">Test turnaround</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pharmacogenomics Features</CardTitle>
              <CardDescription>Comprehensive genetic testing and personalized medicine capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Genetic Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Variant Detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Phenotype Prediction</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Clinical Significance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Population Frequency</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personalized Medicine</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Drug-Gene Interactions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Dosage Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Alternative Medications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Risk Assessment</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dna className="h-5 w-5" />
                <span>Genetic Variants</span>
              </CardTitle>
              <CardDescription>Manage patient genetic variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient-id">Patient ID</Label>
                  <Input
                    id="patient-id"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="gene-filter">Gene Filter</Label>
                  <Input
                    id="gene-filter"
                    value={selectedGene}
                    onChange={(e) => setSelectedGene(e.target.value)}
                    placeholder="Filter by gene"
                  />
                </div>
              </div>
              <Button onClick={loadData} disabled={loading}>
                <Microscope className="h-4 w-4 mr-2" />
                Load Variants
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Variant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gene">Gene</Label>
                  <Input
                    id="gene"
                    value={newVariant.gene}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, gene: e.target.value }))}
                    placeholder="e.g., CYP2D6"
                  />
                </div>
                <div>
                  <Label htmlFor="variant">Variant</Label>
                  <Input
                    id="variant"
                    value={newVariant.variant}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, variant: e.target.value }))}
                    placeholder="e.g., *4"
                  />
                </div>
                <div>
                  <Label htmlFor="rs-id">RS ID</Label>
                  <Input
                    id="rs-id"
                    value={newVariant.rsId}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, rsId: e.target.value }))}
                    placeholder="e.g., rs1065852"
                  />
                </div>
                <div>
                  <Label htmlFor="genotype">Genotype</Label>
                  <Input
                    id="genotype"
                    value={newVariant.genotype}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, genotype: e.target.value }))}
                    placeholder="e.g., *1/*4"
                  />
                </div>
                <div>
                  <Label htmlFor="phenotype">Phenotype</Label>
                  <Input
                    id="phenotype"
                    value={newVariant.phenotype}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, phenotype: e.target.value }))}
                    placeholder="e.g., intermediate_metabolizer"
                  />
                </div>
                <div>
                  <Label htmlFor="significance">Clinical Significance</Label>
                  <Select value={newVariant.clinicalSignificance} onValueChange={(value: any) => setNewVariant(prev => ({ ...prev, clinicalSignificance: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="benign">Benign</SelectItem>
                      <SelectItem value="likely_benign">Likely Benign</SelectItem>
                      <SelectItem value="uncertain">Uncertain</SelectItem>
                      <SelectItem value="likely_pathogenic">Likely Pathogenic</SelectItem>
                      <SelectItem value="pathogenic">Pathogenic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateVariant} disabled={loading}>
                <Dna className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {variants.map((variant) => (
              <Card key={variant.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{variant.gene} - {variant.variant}</span>
                    <Badge variant={getSignificanceBadgeVariant(variant.clinicalSignificance)}>
                      {variant.clinicalSignificance.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    RS ID: {variant.rsId} • Chromosome: {variant.chromosome}:{variant.position}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Genotype</Label>
                      <div className="text-lg font-semibold">{formatGenotype(variant.genotype)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phenotype</Label>
                      <div className="text-lg font-semibold">{formatPhenotype(variant.phenotype)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Allele Frequency</Label>
                      <div className="text-lg font-semibold">{(variant.alleleFrequency * 100).toFixed(2)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Pharmacogenomic Tests</span>
              </CardTitle>
              <CardDescription>Order and manage genetic tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-name">Test Name</Label>
                  <Input
                    id="test-name"
                    value={newTest.testName}
                    onChange={(e) => setNewTest(prev => ({ ...prev, testName: e.target.value }))}
                    placeholder="e.g., CYP2D6 Panel"
                  />
                </div>
                <div>
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select value={newTest.testType} onValueChange={(value: any) => setNewTest(prev => ({ ...prev, testType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panel">Panel</SelectItem>
                      <SelectItem value="single_gene">Single Gene</SelectItem>
                      <SelectItem value="whole_genome">Whole Genome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lab-name">Lab Name</Label>
                  <Input
                    id="lab-name"
                    value={newTest.labName}
                    onChange={(e) => setNewTest(prev => ({ ...prev, labName: e.target.value }))}
                    placeholder="e.g., LabCorp"
                  />
                </div>
              </div>
              <Button onClick={handleCreateTest} disabled={loading}>
                <TestTube className="h-4 w-4 mr-2" />
                Order Test
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{test.testName}</span>
                    <Badge variant={getTestStatusBadgeVariant(test.status)}>
                      {test.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {test.labName} • {new Date(test.testDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Test Type</Label>
                      <div className="text-sm">{test.testType.replace('_', ' ').toUpperCase()}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Genes Tested</Label>
                      <div className="text-sm">{test.genes?.join(', ') || 'N/A'}</div>
                    </div>
                  </div>
                  {test.interpretation && (
                    <div>
                      <Label className="text-sm font-medium">Interpretation</Label>
                      <div className="text-sm text-gray-600">{test.interpretation}</div>
                    </div>
                  )}
                  {test.recommendations && test.recommendations.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Recommendations</Label>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {test.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>Drug-Gene Interaction Analysis</span>
              </CardTitle>
              <CardDescription>Analyze drug interactions with patient genetics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drug-name">Drug Name</Label>
                  <Input
                    id="drug-name"
                    value={selectedDrug}
                    onChange={(e) => setSelectedDrug(e.target.value)}
                    placeholder="e.g., Warfarin"
                  />
                </div>
              </div>
              <Button onClick={handleAnalyzeInteraction} disabled={loading || !selectedDrug}>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Interaction
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{interaction.drugName} - {interaction.gene}</span>
                    <Badge variant="outline">
                      Evidence Level: {interaction.evidenceLevel}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {interaction.interactionType.replace('_', ' ').toUpperCase()} Interaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Patient Genotype</Label>
                      <div className="text-sm">{interaction.patientGenotype || 'N/A'}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Patient Phenotype</Label>
                      <div className="text-sm">{interaction.patientPhenotype || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Personalized Recommendation</Label>
                    <div className="text-sm text-gray-600">{interaction.personalizedRecommendation || interaction.recommendation}</div>
                  </div>
                  {interaction.alternativeDrugs && interaction.alternativeDrugs.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Alternative Drugs</Label>
                      <div className="text-sm text-gray-600">{interaction.alternativeDrugs.join(', ')}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Personalized Treatment Planning</span>
              </CardTitle>
              <CardDescription>Generate personalized treatment plans based on genetics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatment-patient">Patient ID</Label>
                  <Input
                    id="treatment-patient"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="treatment-drug">Medication</Label>
                  <Input
                    id="treatment-drug"
                    value={selectedDrug}
                    onChange={(e) => setSelectedDrug(e.target.value)}
                    placeholder="Enter medication name"
                  />
                </div>
              </div>
              <Button onClick={handleGenerateTreatment} disabled={loading || !selectedPatient || !selectedDrug}>
                <Shield className="h-4 w-4 mr-2" />
                Generate Treatment Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Pharmacogenomics Analytics</span>
              </CardTitle>
              <CardDescription>Comprehensive analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{analytics.totalTests}</div>
                      <div className="text-sm text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{analytics.completedTests}</div>
                      <div className="text-sm text-gray-600">Completed Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{analytics.pendingTests}</div>
                      <div className="text-sm text-gray-600">Pending Tests</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Test Types Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.testTypes).map(([testType, count]) => (
                        <div key={testType} className="flex justify-between items-center">
                          <span className="text-sm">{testType.replace('_', ' ').toUpperCase()}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Most Tested Genes</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.genesTested)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 10)
                        .map(([gene, count]) => (
                        <div key={gene} className="flex justify-between items-center">
                          <span className="text-sm">{gene}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


