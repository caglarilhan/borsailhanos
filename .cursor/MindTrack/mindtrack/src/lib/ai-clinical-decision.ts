import * as tf from '@tensorflow/tfjs';
import natural from 'natural';
import sentiment from 'sentiment';

// AI Clinical Decision Support System
export interface ClinicalSymptom {
  id: string;
  name: string;
  severity: number; // 1-10 scale
  duration: number; // days
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  impact: 'mild' | 'moderate' | 'severe';
}

export interface PatientProfile {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  currentMedications: string[];
  symptoms: ClinicalSymptom[];
  riskFactors: string[];
  previousDiagnoses: string[];
}

export interface DiagnosticSuggestion {
  diagnosis: string;
  confidence: number; // 0-100
  dsm5Code: string;
  criteria: string[];
  differentialDiagnoses: string[];
  recommendedAssessments: string[];
}

export interface TreatmentRecommendation {
  treatment: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  effectiveness: number; // 0-100
  sideEffects: string[];
  contraindications: string[];
  monitoring: string[];
}

export interface RiskAssessment {
  riskType: 'suicide' | 'self-harm' | 'violence' | 'substance-abuse' | 'medication-interaction';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  score: number; // 0-100
  factors: string[];
  recommendations: string[];
  urgency: 'immediate' | 'within-24h' | 'within-week' | 'routine';
}

// DSM-5 Diagnostic Criteria Database
const DSM5_DIAGNOSES = {
  '296.20': {
    name: 'Major Depressive Disorder',
    criteria: [
      'Depressed mood most of the day',
      'Markedly diminished interest in activities',
      'Significant weight loss or gain',
      'Insomnia or hypersomnia',
      'Psychomotor agitation or retardation',
      'Fatigue or loss of energy',
      'Feelings of worthlessness or guilt',
      'Diminished ability to think or concentrate',
      'Recurrent thoughts of death'
    ],
    symptoms: ['depression', 'sadness', 'hopelessness', 'fatigue', 'sleep problems', 'appetite changes']
  },
  '300.02': {
    name: 'Generalized Anxiety Disorder',
    criteria: [
      'Excessive anxiety and worry',
      'Difficulty controlling worry',
      'Restlessness or feeling keyed up',
      'Being easily fatigued',
      'Difficulty concentrating',
      'Irritability',
      'Muscle tension',
      'Sleep disturbance'
    ],
    symptoms: ['anxiety', 'worry', 'restlessness', 'tension', 'irritability', 'concentration problems']
  },
  '309.81': {
    name: 'Posttraumatic Stress Disorder',
    criteria: [
      'Exposure to traumatic event',
      'Intrusive memories or dreams',
      'Avoidance of trauma-related stimuli',
      'Negative alterations in cognitions and mood',
      'Marked alterations in arousal and reactivity'
    ],
    symptoms: ['flashbacks', 'nightmares', 'avoidance', 'hypervigilance', 'emotional numbness']
  }
};

// Medication Database with Interactions
const MEDICATION_DATABASE = {
  'sertraline': {
    name: 'Sertraline',
    class: 'SSRI',
    interactions: ['warfarin', 'aspirin', 'ibuprofen'],
    sideEffects: ['nausea', 'headache', 'insomnia', 'sexual dysfunction'],
    contraindications: ['MAOI', 'pimozide']
  },
  'fluoxetine': {
    name: 'Fluoxetine',
    class: 'SSRI',
    interactions: ['warfarin', 'digoxin', 'phenytoin'],
    sideEffects: ['nausea', 'headache', 'anxiety', 'sexual dysfunction'],
    contraindications: ['MAOI', 'thioridazine']
  },
  'alprazolam': {
    name: 'Alprazolam',
    class: 'Benzodiazepine',
    interactions: ['alcohol', 'opioids', 'antihistamines'],
    sideEffects: ['drowsiness', 'dizziness', 'confusion', 'dependence'],
    contraindications: ['severe respiratory insufficiency', 'sleep apnea']
  }
};

export class AIClinicalDecisionSupport {
  private model: tf.LayersModel | null = null;
  private sentimentAnalyzer: sentiment;

  constructor() {
    this.sentimentAnalyzer = new sentiment();
  }

  // Initialize AI model for diagnostic predictions
  async initializeModel(): Promise<void> {
    try {
      // Create a simple neural network for diagnostic predictions
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [20], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 10, activation: 'softmax' })
        ]
      });

      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.model = model;
    } catch (error) {
      console.error('Error initializing AI model:', error);
    }
  }

  // Generate diagnostic suggestions based on symptoms
  generateDiagnosticSuggestions(patient: PatientProfile): DiagnosticSuggestion[] {
    const suggestions: DiagnosticSuggestion[] = [];
    
    // Analyze symptoms using natural language processing
    const symptomText = patient.symptoms.map(s => s.name).join(' ');
    const sentimentScore = this.sentimentAnalyzer.analyze(symptomText);
    
    // Match symptoms to DSM-5 criteria
    for (const [code, diagnosis] of Object.entries(DSM5_DIAGNOSES)) {
      const matchingSymptoms = diagnosis.symptoms.filter(symptom => 
        patient.symptoms.some(s => 
          natural.JaroWinklerDistance(s.name.toLowerCase(), symptom.toLowerCase()) > 0.7
        )
      );

      if (matchingSymptoms.length >= 3) {
        const confidence = Math.min(95, (matchingSymptoms.length / diagnosis.symptoms.length) * 100);
        
        suggestions.push({
          diagnosis: diagnosis.name,
          confidence: Math.round(confidence),
          dsm5Code: code,
          criteria: diagnosis.criteria,
          differentialDiagnoses: this.getDifferentialDiagnoses(code),
          recommendedAssessments: this.getRecommendedAssessments(code)
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Generate treatment recommendations
  generateTreatmentRecommendations(diagnosis: string, patient: PatientProfile): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];
    
    // Evidence-based treatment recommendations
    const treatmentDatabase = {
      'Major Depressive Disorder': [
        {
          treatment: 'Cognitive Behavioral Therapy (CBT)',
          evidenceLevel: 'A' as const,
          effectiveness: 85,
          sideEffects: ['emotional discomfort'],
          contraindications: ['severe cognitive impairment'],
          monitoring: ['mood tracking', 'homework compliance']
        },
        {
          treatment: 'Sertraline 50-200mg daily',
          evidenceLevel: 'A' as const,
          effectiveness: 70,
          sideEffects: ['nausea', 'headache', 'sexual dysfunction'],
          contraindications: ['MAOI use', 'severe liver disease'],
          monitoring: ['mood', 'side effects', 'suicidal ideation']
        }
      ],
      'Generalized Anxiety Disorder': [
        {
          treatment: 'Cognitive Behavioral Therapy (CBT)',
          evidenceLevel: 'A' as const,
          effectiveness: 80,
          sideEffects: ['temporary anxiety increase'],
          contraindications: ['severe cognitive impairment'],
          monitoring: ['anxiety levels', 'coping strategies']
        },
        {
          treatment: 'Sertraline 25-200mg daily',
          evidenceLevel: 'A' as const,
          effectiveness: 65,
          sideEffects: ['nausea', 'headache', 'insomnia'],
          contraindications: ['MAOI use'],
          monitoring: ['anxiety symptoms', 'side effects']
        }
      ]
    };

    const treatments = treatmentDatabase[diagnosis as keyof typeof treatmentDatabase] || [];
    
    for (const treatment of treatments) {
      // Check for contraindications
      const hasContraindications = treatment.contraindications.some(contraindication =>
        patient.currentMedications.some(med => 
          med.toLowerCase().includes(contraindication.toLowerCase())
        ) || patient.medicalHistory.some(history =>
          history.toLowerCase().includes(contraindication.toLowerCase())
        )
      );

      if (!hasContraindications) {
        recommendations.push(treatment);
      }
    }

    return recommendations.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  // Assess risk factors
  assessRiskFactors(patient: PatientProfile): RiskAssessment[] {
    const assessments: RiskAssessment[] = [];
    
    // Suicide risk assessment
    const suicideRiskFactors = [
      'previous suicide attempts',
      'family history of suicide',
      'substance abuse',
      'hopelessness',
      'isolation',
      'access to means'
    ];

    const suicideFactors = patient.riskFactors.filter(factor =>
      suicideRiskFactors.some(riskFactor =>
        natural.JaroWinklerDistance(factor.toLowerCase(), riskFactor.toLowerCase()) > 0.7
      )
    );

    if (suicideFactors.length > 0) {
      const suicideScore = Math.min(100, suicideFactors.length * 20);
      assessments.push({
        riskType: 'suicide',
        riskLevel: suicideScore > 60 ? 'high' : suicideScore > 30 ? 'moderate' : 'low',
        score: suicideScore,
        factors: suicideFactors,
        recommendations: this.getSuicideRiskRecommendations(suicideScore),
        urgency: suicideScore > 60 ? 'immediate' : suicideScore > 30 ? 'within-24h' : 'routine'
      });
    }

    // Medication interaction risk
    const interactionRisk = this.checkMedicationInteractions(patient.currentMedications);
    if (interactionRisk.length > 0) {
      assessments.push({
        riskType: 'medication-interaction',
        riskLevel: 'moderate',
        score: 50,
        factors: interactionRisk,
        recommendations: ['Review medication list', 'Consider alternative medications'],
        urgency: 'within-week'
      });
    }

    return assessments;
  }

  // Check for medication interactions
  private checkMedicationInteractions(medications: string[]): string[] {
    const interactions: string[] = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();
        
        // Check known interactions
        for (const [medName, medData] of Object.entries(MEDICATION_DATABASE)) {
          if (med1.includes(medName) && medData.interactions.some(int => med2.includes(int))) {
            interactions.push(`${medications[i]} + ${medications[j]}: Potential interaction`);
          }
        }
      }
    }
    
    return interactions;
  }

  // Get differential diagnoses
  private getDifferentialDiagnoses(code: string): string[] {
    const differentials: { [key: string]: string[] } = {
      '296.20': ['Bipolar Disorder', 'Adjustment Disorder', 'Grief', 'Substance-Induced Mood Disorder'],
      '300.02': ['Panic Disorder', 'Social Anxiety Disorder', 'Obsessive-Compulsive Disorder'],
      '309.81': ['Acute Stress Disorder', 'Adjustment Disorder', 'Major Depressive Disorder']
    };
    
    return differentials[code] || [];
  }

  // Get recommended assessments
  private getRecommendedAssessments(code: string): string[] {
    const assessments: { [key: string]: string[] } = {
      '296.20': ['PHQ-9', 'Beck Depression Inventory', 'Hamilton Rating Scale'],
      '300.02': ['GAD-7', 'Beck Anxiety Inventory', 'State-Trait Anxiety Inventory'],
      '309.81': ['PCL-5', 'Impact of Event Scale', 'Trauma Symptom Inventory']
    };
    
    return assessments[code] || [];
  }

  // Get suicide risk recommendations
  private getSuicideRiskRecommendations(score: number): string[] {
    if (score > 60) {
      return [
        'Immediate safety planning',
        'Consider hospitalization',
        'Remove access to lethal means',
        'Increase session frequency',
        'Involve family/support system'
      ];
    } else if (score > 30) {
      return [
        'Develop safety plan',
        'Increase monitoring',
        'Consider crisis intervention',
        'Review treatment plan'
      ];
    } else {
      return [
        'Continue routine monitoring',
        'Assess protective factors',
        'Maintain regular sessions'
      ];
    }
  }

  // Analyze session notes for sentiment and risk
  analyzeSessionNotes(notes: string): {
    sentiment: 'positive' | 'neutral' | 'negative';
    riskIndicators: string[];
    recommendations: string[];
  } {
    const sentimentResult = this.sentimentAnalyzer.analyze(notes);
    
    const riskKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'hopeless', 'helpless', 'worthless', 'burden',
      'self-harm', 'cutting', 'burning', 'overdose'
    ];
    
    const riskIndicators = riskKeywords.filter(keyword =>
      notes.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const recommendations: string[] = [];
    
    if (riskIndicators.length > 0) {
      recommendations.push('Assess immediate safety risk');
      recommendations.push('Consider crisis intervention');
      recommendations.push('Increase monitoring frequency');
    }
    
    if (sentimentResult.score < -2) {
      recommendations.push('Focus on coping strategies');
      recommendations.push('Consider medication review');
    }
    
    return {
      sentiment: sentimentResult.score > 1 ? 'positive' : sentimentResult.score < -1 ? 'negative' : 'neutral',
      riskIndicators,
      recommendations
    };
  }
}

// Export singleton instance
export const aiClinicalDecision = new AIClinicalDecisionSupport();










