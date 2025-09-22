import { NextRequest, NextResponse } from 'next/server';
import { aiClinicalDecision, PatientProfile, ClinicalSymptom } from '@/lib/ai-clinical-decision';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, patientData, notes } = body;

    switch (action) {
      case 'diagnostic-suggestions':
        const diagnosticSuggestions = aiClinicalDecision.generateDiagnosticSuggestions(patientData);
        return NextResponse.json({ 
          success: true, 
          suggestions: diagnosticSuggestions 
        });

      case 'treatment-recommendations':
        const { diagnosis } = body;
        const treatmentRecommendations = aiClinicalDecision.generateTreatmentRecommendations(diagnosis, patientData);
        return NextResponse.json({ 
          success: true, 
          recommendations: treatmentRecommendations 
        });

      case 'risk-assessment':
        const riskAssessments = aiClinicalDecision.assessRiskFactors(patientData);
        return NextResponse.json({ 
          success: true, 
          assessments: riskAssessments 
        });

      case 'analyze-notes':
        const analysis = aiClinicalDecision.analyzeSessionNotes(notes);
        return NextResponse.json({ 
          success: true, 
          analysis 
        });

      case 'medication-interactions':
        const interactions = aiClinicalDecision.checkMedicationInteractions(patientData.currentMedications);
        return NextResponse.json({ 
          success: true, 
          interactions 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('AI Clinical Decision Support Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Initialize AI model
    await aiClinicalDecision.initializeModel();
    
    return NextResponse.json({ 
      success: true, 
      message: 'AI Clinical Decision Support System initialized' 
    });
  } catch (error) {
    console.error('AI Initialization Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize AI system' 
    }, { status: 500 });
  }
}



