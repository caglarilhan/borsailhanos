import { SupabaseClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

interface GeneticVariant {
  id: string;
  gene: string;
  variant: string;
  rsId: string;
  chromosome: string;
  position: number;
  genotype: string;
  phenotype: string;
  clinicalSignificance: 'benign' | 'likely_benign' | 'uncertain' | 'likely_pathogenic' | 'pathogenic';
  alleleFrequency: number;
  population: string;
}

interface DrugGeneInteraction {
  id: string;
  drugName: string;
  gene: string;
  variant: string;
  interactionType: 'metabolizer' | 'transporter' | 'target' | 'enzyme';
  phenotype: string;
  recommendation: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  clinicalAction: string;
  alternativeDrugs?: string[];
  dosageAdjustment?: string;
}

interface PharmacogenomicTest {
  id: string;
  patientId: string;
  testName: string;
  testType: 'panel' | 'single_gene' | 'whole_genome';
  genes: string[];
  variants: GeneticVariant[];
  testDate: string;
  labName: string;
  status: 'ordered' | 'processing' | 'completed' | 'failed';
  results?: any;
  interpretation?: string;
  recommendations?: string[];
}

interface PersonalizedTreatment {
  id: string;
  patientId: string;
  medication: string;
  gene: string;
  variant: string;
  phenotype: string;
  recommendedDosage: string;
  alternativeMedications: string[];
  contraindications: string[];
  monitoringRequirements: string[];
  riskFactors: string[];
  createdDate: string;
}

class PharmacogenomicsIntegration {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = require('@supabase/supabase-js').createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Genetic Variant Management
  async createGeneticVariant(variant: Omit<GeneticVariant, 'id'>): Promise<GeneticVariant> {
    try {
      const { data, error } = await this.supabase
        .from('genetic_variants')
        .insert([variant])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating genetic variant:', error);
      throw error;
    }
  }

  async getGeneticVariants(patientId?: string, gene?: string): Promise<GeneticVariant[]> {
    try {
      let query = this.supabase
        .from('genetic_variants')
        .select('*');

      if (patientId) {
        query = query.eq('patientId', patientId);
      }

      if (gene) {
        query = query.eq('gene', gene);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching genetic variants:', error);
      throw error;
    }
  }

  // Drug-Gene Interaction Analysis
  async analyzeDrugGeneInteraction(drugName: string, patientVariants: GeneticVariant[]): Promise<DrugGeneInteraction[]> {
    try {
      // Get drug-gene interactions from database
      const { data: interactions, error } = await this.supabase
        .from('drug_gene_interactions')
        .select('*')
        .eq('drugName', drugName);

      if (error) throw error;

      // Filter interactions based on patient's genetic variants
      const relevantInteractions = interactions?.filter(interaction => 
        patientVariants.some(variant => 
          variant.gene === interaction.gene && 
          variant.variant === interaction.variant
        )
      ) || [];

      // Generate personalized recommendations
      const personalizedInteractions = relevantInteractions.map(interaction => {
        const patientVariant = patientVariants.find(v => 
          v.gene === interaction.gene && v.variant === interaction.variant
        );

        return {
          ...interaction,
          patientGenotype: patientVariant?.genotype,
          patientPhenotype: patientVariant?.phenotype,
          personalizedRecommendation: this.generatePersonalizedRecommendation(interaction, patientVariant)
        };
      });

      return personalizedInteractions;
    } catch (error) {
      console.error('Error analyzing drug-gene interaction:', error);
      throw error;
    }
  }

  private generatePersonalizedRecommendation(interaction: DrugGeneInteraction, variant?: GeneticVariant): string {
    if (!variant) return interaction.recommendation;

    switch (interaction.interactionType) {
      case 'metabolizer':
        return this.generateMetabolizerRecommendation(interaction, variant);
      case 'transporter':
        return this.generateTransporterRecommendation(interaction, variant);
      case 'target':
        return this.generateTargetRecommendation(interaction, variant);
      case 'enzyme':
        return this.generateEnzymeRecommendation(interaction, variant);
      default:
        return interaction.recommendation;
    }
  }

  private generateMetabolizerRecommendation(interaction: DrugGeneInteraction, variant: GeneticVariant): string {
    const phenotype = variant.phenotype.toLowerCase();
    
    if (phenotype.includes('poor metabolizer')) {
      return `Poor metabolizer phenotype detected. Consider reducing dose by 50-75% or using alternative medication.`;
    } else if (phenotype.includes('intermediate metabolizer')) {
      return `Intermediate metabolizer phenotype. Consider reducing dose by 25-50% or monitor closely.`;
    } else if (phenotype.includes('rapid metabolizer') || phenotype.includes('ultra-rapid metabolizer')) {
      return `Rapid metabolizer phenotype. May require higher doses or more frequent dosing.`;
    } else if (phenotype.includes('extensive metabolizer')) {
      return `Normal metabolizer phenotype. Standard dosing recommended.`;
    }
    
    return interaction.recommendation;
  }

  private generateTransporterRecommendation(interaction: DrugGeneInteraction, variant: GeneticVariant): string {
    const phenotype = variant.phenotype.toLowerCase();
    
    if (phenotype.includes('reduced function')) {
      return `Reduced transporter function. May affect drug absorption or elimination. Monitor drug levels.`;
    } else if (phenotype.includes('increased function')) {
      return `Increased transporter function. May affect drug distribution. Consider dose adjustment.`;
    }
    
    return interaction.recommendation;
  }

  private generateTargetRecommendation(interaction: DrugGeneInteraction, variant: GeneticVariant): string {
    const phenotype = variant.phenotype.toLowerCase();
    
    if (phenotype.includes('reduced response')) {
      return `Reduced drug target response. Consider alternative medications or higher doses.`;
    } else if (phenotype.includes('increased response')) {
      return `Increased drug target response. Consider lower doses to avoid adverse effects.`;
    }
    
    return interaction.recommendation;
  }

  private generateEnzymeRecommendation(interaction: DrugGeneInteraction, variant: GeneticVariant): string {
    const phenotype = variant.phenotype.toLowerCase();
    
    if (phenotype.includes('deficient')) {
      return `Enzyme deficiency detected. Avoid medications metabolized by this enzyme or use alternative pathway.`;
    } else if (phenotype.includes('overactive')) {
      return `Enzyme overactivity detected. May require dose adjustment or alternative medications.`;
    }
    
    return interaction.recommendation;
  }

  // Pharmacogenomic Test Management
  async createPharmacogenomicTest(test: Omit<PharmacogenomicTest, 'id'>): Promise<PharmacogenomicTest> {
    try {
      const { data, error } = await this.supabase
        .from('pharmacogenomic_tests')
        .insert([test])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating pharmacogenomic test:', error);
      throw error;
    }
  }

  async getPharmacogenomicTests(patientId?: string): Promise<PharmacogenomicTest[]> {
    try {
      let query = this.supabase
        .from('pharmacogenomic_tests')
        .select('*')
        .order('testDate', { ascending: false });

      if (patientId) {
        query = query.eq('patientId', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pharmacogenomic tests:', error);
      throw error;
    }
  }

  async updateTestStatus(testId: string, status: string, results?: any): Promise<PharmacogenomicTest> {
    try {
      const updates: any = { status };
      
      if (results) {
        updates.results = results;
        updates.interpretation = await this.interpretTestResults(results);
        updates.recommendations = await this.generateTestRecommendations(results);
      }

      const { data, error } = await this.supabase
        .from('pharmacogenomic_tests')
        .update(updates)
        .eq('id', testId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating test status:', error);
      throw error;
    }
  }

  private async interpretTestResults(results: any): Promise<string> {
    // Basic interpretation logic
    const interpretations: string[] = [];
    
    if (results.variants) {
      for (const variant of results.variants) {
        if (variant.clinicalSignificance === 'pathogenic') {
          interpretations.push(`Pathogenic variant detected in ${variant.gene}: ${variant.variant}`);
        } else if (variant.clinicalSignificance === 'likely_pathogenic') {
          interpretations.push(`Likely pathogenic variant in ${variant.gene}: ${variant.variant}`);
        }
      }
    }

    return interpretations.length > 0 ? interpretations.join('; ') : 'No significant variants detected';
  }

  private async generateTestRecommendations(results: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (results.variants) {
      for (const variant of results.variants) {
        if (variant.clinicalSignificance === 'pathogenic' || variant.clinicalSignificance === 'likely_pathogenic') {
          recommendations.push(`Consider genetic counseling for ${variant.gene} variant`);
          recommendations.push(`Monitor for drug interactions with ${variant.gene} substrates`);
        }
      }
    }

    return recommendations;
  }

  // Personalized Treatment Planning
  async generatePersonalizedTreatment(patientId: string, medication: string): Promise<PersonalizedTreatment> {
    try {
      // Get patient's genetic variants
      const variants = await this.getGeneticVariants(patientId);
      
      // Analyze drug-gene interactions
      const interactions = await this.analyzeDrugGeneInteraction(medication, variants);
      
      // Generate personalized treatment plan
      const treatment: PersonalizedTreatment = {
        id: '',
        patientId,
        medication,
        gene: interactions[0]?.gene || '',
        variant: interactions[0]?.variant || '',
        phenotype: interactions[0]?.patientPhenotype || '',
        recommendedDosage: this.calculateRecommendedDosage(interactions),
        alternativeMedications: this.getAlternativeMedications(interactions),
        contraindications: this.getContraindications(interactions),
        monitoringRequirements: this.getMonitoringRequirements(interactions),
        riskFactors: this.getRiskFactors(interactions),
        createdDate: new Date().toISOString()
      };

      // Save personalized treatment
      const { data, error } = await this.supabase
        .from('personalized_treatments')
        .insert([treatment])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating personalized treatment:', error);
      throw error;
    }
  }

  private calculateRecommendedDosage(interactions: DrugGeneInteraction[]): string {
    if (interactions.length === 0) return 'Standard dosing recommended';

    const interaction = interactions[0];
    const phenotype = interaction.patientPhenotype?.toLowerCase() || '';

    if (phenotype.includes('poor metabolizer')) {
      return 'Reduce dose by 50-75%';
    } else if (phenotype.includes('intermediate metabolizer')) {
      return 'Reduce dose by 25-50%';
    } else if (phenotype.includes('rapid metabolizer')) {
      return 'Consider higher dose or more frequent dosing';
    } else if (phenotype.includes('ultra-rapid metabolizer')) {
      return 'Significantly higher dose may be required';
    }

    return 'Standard dosing recommended';
  }

  private getAlternativeMedications(interactions: DrugGeneInteraction[]): string[] {
    const alternatives: string[] = [];
    
    interactions.forEach(interaction => {
      if (interaction.alternativeDrugs) {
        alternatives.push(...interaction.alternativeDrugs);
      }
    });

    return [...new Set(alternatives)]; // Remove duplicates
  }

  private getContraindications(interactions: DrugGeneInteraction[]): string[] {
    const contraindications: string[] = [];
    
    interactions.forEach(interaction => {
      if (interaction.clinicalAction.toLowerCase().includes('avoid')) {
        contraindications.push(`Avoid ${interaction.drugName} due to ${interaction.gene} variant`);
      }
    });

    return contraindications;
  }

  private getMonitoringRequirements(interactions: DrugGeneInteraction[]): string[] {
    const monitoring: string[] = [];
    
    interactions.forEach(interaction => {
      if (interaction.interactionType === 'metabolizer') {
        monitoring.push('Monitor drug levels and therapeutic response');
      }
      if (interaction.interactionType === 'target') {
        monitoring.push('Monitor clinical response and adverse effects');
      }
    });

    return [...new Set(monitoring)];
  }

  private getRiskFactors(interactions: DrugGeneInteraction[]): string[] {
    const risks: string[] = [];
    
    interactions.forEach(interaction => {
      if (interaction.evidenceLevel === 'A' || interaction.evidenceLevel === 'B') {
        risks.push(`High-risk genetic variant: ${interaction.gene} ${interaction.variant}`);
      }
    });

    return risks;
  }

  // Analytics and Reporting
  async getPharmacogenomicAnalytics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      let query = this.supabase
        .from('pharmacogenomic_tests')
        .select('*');

      if (dateRange) {
        query = query
          .gte('testDate', dateRange.start)
          .lte('testDate', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      const analytics = {
        totalTests: data?.length || 0,
        completedTests: data?.filter(t => t.status === 'completed').length || 0,
        pendingTests: data?.filter(t => t.status === 'processing').length || 0,
        testTypes: data?.reduce((acc: any, test) => {
          acc[test.testType] = (acc[test.testType] || 0) + 1;
          return acc;
        }, {}) || {},
        genesTested: data?.reduce((acc: any, test) => {
          test.genes?.forEach((gene: string) => {
            acc[gene] = (acc[gene] || 0) + 1;
          });
          return acc;
        }, {}) || {},
        averageProcessingTime: this.calculateAverageProcessingTime(data || [])
      };

      return analytics;
    } catch (error) {
      console.error('Error calculating pharmacogenomic analytics:', error);
      throw error;
    }
  }

  private calculateAverageProcessingTime(tests: PharmacogenomicTest[]): number {
    if (tests.length === 0) return 0;

    const completedTests = tests.filter(t => t.status === 'completed');
    if (completedTests.length === 0) return 0;

    const totalTime = completedTests.reduce((sum, test) => {
      const orderedDate = new Date(test.testDate);
      const completedDate = new Date(); // Assuming completion is now
      return sum + (completedDate.getTime() - orderedDate.getTime());
    }, 0);

    return totalTime / completedTests.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  // Drug Database Management
  async getDrugGeneInteractions(drugName?: string, gene?: string): Promise<DrugGeneInteraction[]> {
    try {
      let query = this.supabase
        .from('drug_gene_interactions')
        .select('*');

      if (drugName) {
        query = query.eq('drugName', drugName);
      }

      if (gene) {
        query = query.eq('gene', gene);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching drug-gene interactions:', error);
      throw error;
    }
  }

  async createDrugGeneInteraction(interaction: Omit<DrugGeneInteraction, 'id'>): Promise<DrugGeneInteraction> {
    try {
      const { data, error } = await this.supabase
        .from('drug_gene_interactions')
        .insert([interaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating drug-gene interaction:', error);
      throw error;
    }
  }
}

export default PharmacogenomicsIntegration;

