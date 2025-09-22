import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testCode: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  labName: string;
  orderedBy: string;
  orderedDate: string;
  resultDate: string;
  notes?: string;
  interpretation?: string;
  recommendations?: string[];
}

interface LabIntegration {
  id: string;
  name: string;
  type: 'hl7' | 'api' | 'file' | 'manual';
  endpoint?: string;
  credentials?: any;
  isActive: boolean;
  lastSync?: string;
  syncFrequency: number; // minutes
}

class AdvancedLaboratoryIntegration {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = require('@supabase/supabase-js').createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Lab Integration Management
  async createLabIntegration(integration: Omit<LabIntegration, 'id'>): Promise<LabIntegration> {
    try {
      const { data, error } = await this.supabase
        .from('lab_integrations')
        .insert([integration])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating lab integration:', error);
      throw error;
    }
  }

  async getLabIntegrations(): Promise<LabIntegration[]> {
    try {
      const { data, error } = await this.supabase
        .from('lab_integrations')
        .select('*')
        .eq('isActive', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lab integrations:', error);
      throw error;
    }
  }

  async updateLabIntegration(id: string, updates: Partial<LabIntegration>): Promise<LabIntegration> {
    try {
      const { data, error } = await this.supabase
        .from('lab_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating lab integration:', error);
      throw error;
    }
  }

  // Lab Results Processing
  async processLabResults(results: LabResult[]): Promise<LabResult[]> {
    try {
      const processedResults = await Promise.all(
        results.map(async (result) => {
          // Auto-interpretation based on reference ranges
          const interpretation = await this.interpretLabResult(result);
          
          // Generate recommendations
          const recommendations = await this.generateRecommendations(result, interpretation);
          
          return {
            ...result,
            interpretation,
            recommendations,
            status: this.determineStatus(result, interpretation)
          };
        })
      );

      // Save processed results
      await this.saveLabResults(processedResults);
      
      return processedResults;
    } catch (error) {
      console.error('Error processing lab results:', error);
      throw error;
    }
  }

  private async interpretLabResult(result: LabResult): Promise<string> {
    try {
      // Basic interpretation logic based on reference ranges
      const numericResult = parseFloat(result.result);
      const referenceRange = result.referenceRange;
      
      if (!referenceRange || isNaN(numericResult)) {
        return 'Result requires manual interpretation';
      }

      // Parse reference range (e.g., "3.5-5.0", "< 1.0", "> 10.0")
      const rangeMatch = referenceRange.match(/([<>=]?)\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)|([<>=])\s*(\d+\.?\d*)/);
      
      if (!rangeMatch) {
        return 'Unable to interpret reference range';
      }

      let interpretation = '';
      
      if (rangeMatch[1] === '<' || rangeMatch[4] === '<') {
        const threshold = parseFloat(rangeMatch[2] || rangeMatch[5]);
        interpretation = numericResult < threshold ? 'Normal' : 'Elevated';
      } else if (rangeMatch[1] === '>' || rangeMatch[4] === '>') {
        const threshold = parseFloat(rangeMatch[2] || rangeMatch[5]);
        interpretation = numericResult > threshold ? 'Elevated' : 'Normal';
      } else if (rangeMatch[2] && rangeMatch[3]) {
        const min = parseFloat(rangeMatch[2]);
        const max = parseFloat(rangeMatch[3]);
        if (numericResult < min) {
          interpretation = 'Below normal range';
        } else if (numericResult > max) {
          interpretation = 'Above normal range';
        } else {
          interpretation = 'Within normal range';
        }
      }

      return interpretation;
    } catch (error) {
      console.error('Error interpreting lab result:', error);
      return 'Interpretation error';
    }
  }

  private async generateRecommendations(result: LabResult, interpretation: string): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Basic recommendation logic
    if (interpretation.includes('Above normal') || interpretation.includes('Elevated')) {
      recommendations.push('Consider follow-up testing');
      recommendations.push('Monitor patient symptoms');
      
      // Specific recommendations based on test type
      if (result.testName.toLowerCase().includes('glucose')) {
        recommendations.push('Consider diabetes management');
        recommendations.push('Dietary counseling recommended');
      } else if (result.testName.toLowerCase().includes('cholesterol')) {
        recommendations.push('Cardiovascular risk assessment');
        recommendations.push('Lifestyle modifications');
      }
    } else if (interpretation.includes('Below normal')) {
      recommendations.push('Investigate underlying cause');
      recommendations.push('Consider nutritional assessment');
    }

    return recommendations;
  }

  private determineStatus(result: LabResult, interpretation: string): 'normal' | 'abnormal' | 'critical' {
    if (interpretation.includes('Within normal') || interpretation === 'Normal') {
      return 'normal';
    } else if (interpretation.includes('critical') || interpretation.includes('urgent')) {
      return 'critical';
    } else {
      return 'abnormal';
    }
  }

  // Data Synchronization
  async syncLabData(integrationId: string): Promise<LabResult[]> {
    try {
      const integration = await this.getLabIntegration(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      let results: LabResult[] = [];

      switch (integration.type) {
        case 'hl7':
          results = await this.syncHL7Data(integration);
          break;
        case 'api':
          results = await this.syncAPIData(integration);
          break;
        case 'file':
          results = await this.syncFileData(integration);
          break;
        default:
          throw new Error('Unsupported integration type');
      }

      // Process and save results
      const processedResults = await this.processLabResults(results);
      
      // Update last sync time
      await this.updateLabIntegration(integrationId, { lastSync: new Date().toISOString() });
      
      return processedResults;
    } catch (error) {
      console.error('Error syncing lab data:', error);
      throw error;
    }
  }

  private async getLabIntegration(id: string): Promise<LabIntegration | null> {
    try {
      const { data, error } = await this.supabase
        .from('lab_integrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lab integration:', error);
      return null;
    }
  }

  private async syncHL7Data(integration: LabIntegration): Promise<LabResult[]> {
    // HL7 integration logic would go here
    // This is a simplified example
    return [];
  }

  private async syncAPIData(integration: LabIntegration): Promise<LabResult[]> {
    try {
      if (!integration.endpoint) {
        throw new Error('API endpoint not configured');
      }

      const response = await axios.get(integration.endpoint, {
        headers: {
          'Authorization': `Bearer ${integration.credentials?.token}`,
          'Content-Type': 'application/json'
        }
      });

      // Transform API response to LabResult format
      return this.transformAPIData(response.data);
    } catch (error) {
      console.error('Error syncing API data:', error);
      throw error;
    }
  }

  private async syncFileData(integration: LabIntegration): Promise<LabResult[]> {
    // File processing logic would go here
    // This could handle CSV, Excel, PDF files
    return [];
  }

  private transformAPIData(apiData: any): LabResult[] {
    // Transform API response to LabResult format
    // This would be specific to the lab's API structure
    return [];
  }

  // Lab Results Management
  async saveLabResults(results: LabResult[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('lab_results')
        .upsert(results);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving lab results:', error);
      throw error;
    }
  }

  async getLabResults(patientId?: string, dateRange?: { start: string; end: string }): Promise<LabResult[]> {
    try {
      let query = this.supabase
        .from('lab_results')
        .select('*')
        .order('resultDate', { ascending: false });

      if (patientId) {
        query = query.eq('patientId', patientId);
      }

      if (dateRange) {
        query = query
          .gte('resultDate', dateRange.start)
          .lte('resultDate', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  }

  // Lab Analytics
  async getLabAnalytics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      let query = this.supabase
        .from('lab_results')
        .select('*');

      if (dateRange) {
        query = query
          .gte('resultDate', dateRange.start)
          .lte('resultDate', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const totalTests = data?.length || 0;
      const abnormalResults = data?.filter(r => r.status === 'abnormal').length || 0;
      const criticalResults = data?.filter(r => r.status === 'critical').length || 0;

      const testTypes = data?.reduce((acc: any, result) => {
        acc[result.testName] = (acc[result.testName] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        totalTests,
        abnormalResults,
        criticalResults,
        normalResults: totalTests - abnormalResults - criticalResults,
        abnormalRate: totalTests > 0 ? (abnormalResults / totalTests) * 100 : 0,
        criticalRate: totalTests > 0 ? (criticalResults / totalTests) * 100 : 0,
        testTypes,
        averageProcessingTime: this.calculateAverageProcessingTime(data || [])
      };
    } catch (error) {
      console.error('Error calculating lab analytics:', error);
      throw error;
    }
  }

  private calculateAverageProcessingTime(results: LabResult[]): number {
    if (results.length === 0) return 0;

    const totalTime = results.reduce((sum, result) => {
      const orderedDate = new Date(result.orderedDate);
      const resultDate = new Date(result.resultDate);
      return sum + (resultDate.getTime() - orderedDate.getTime());
    }, 0);

    return totalTime / results.length / (1000 * 60 * 60); // Convert to hours
  }

  // Alert System
  async createLabAlert(patientId: string, resultId: string, alertType: 'critical' | 'abnormal' | 'followup'): Promise<void> {
    try {
      const alert = {
        patientId,
        resultId,
        alertType,
        message: this.generateAlertMessage(alertType),
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('lab_alerts')
        .insert([alert]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating lab alert:', error);
      throw error;
    }
  }

  private generateAlertMessage(alertType: string): string {
    switch (alertType) {
      case 'critical':
        return 'Critical lab result requires immediate attention';
      case 'abnormal':
        return 'Abnormal lab result detected';
      case 'followup':
        return 'Follow-up testing recommended';
      default:
        return 'Lab result alert';
    }
  }

  // Quality Control
  async performQualityControl(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('lab_results')
        .select('*')
        .gte('resultDate', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) throw error;

      const qualityMetrics = {
        totalResults: data?.length || 0,
        missingInterpretations: data?.filter(r => !r.interpretation).length || 0,
        missingRecommendations: data?.filter(r => !r.recommendations || r.recommendations.length === 0).length || 0,
        incompleteResults: data?.filter(r => !r.result || !r.unit).length || 0,
        qualityScore: 0
      };

      // Calculate quality score
      const totalIssues = qualityMetrics.missingInterpretations + 
                         qualityMetrics.missingRecommendations + 
                         qualityMetrics.incompleteResults;
      
      qualityMetrics.qualityScore = qualityMetrics.totalResults > 0 ? 
        ((qualityMetrics.totalResults - totalIssues) / qualityMetrics.totalResults) * 100 : 100;

      return qualityMetrics;
    } catch (error) {
      console.error('Error performing quality control:', error);
      throw error;
    }
  }
}

export default AdvancedLaboratoryIntegration;



