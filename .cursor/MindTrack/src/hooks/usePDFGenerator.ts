"use client";

import * as React from "react";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";

interface PDFGeneratorHookProps {
  userId: string;
}

export function usePDFGenerator({ userId }: PDFGeneratorHookProps) {
  const [generating, setGenerating] = React.useState(false);
  const [lastGenerated, setLastGenerated] = React.useState<any>(null);

  // Generate PDF client-side
  const generatePDFClientSide = React.useCallback(async (
    type: string,
    data: any,
    filename?: string
  ) => {
    setGenerating(true);
    try {
      const { generatePDFFromHTML, generateMedicalReportPDF, generateLabResultsPDF, generatePrescriptionPDF } = await import('@/lib/pdf-generator');
      
      let result;
      switch (type) {
        case 'medical_report':
          result = await generateMedicalReportPDF(data.patient, data.medicalReport, filename);
          break;
        case 'lab_results':
          result = await generateLabResultsPDF(data.patient, data.labResults, filename);
          break;
        case 'prescription':
          result = await generatePrescriptionPDF(data.patient, data.prescription, filename);
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (result.success) {
        setLastGenerated({
          type,
          timestamp: new Date(),
          filename: filename || `${type}-${Date.now()}.pdf`
        });
      }

      return result;
    } catch (error) {
      console.error('Client-side PDF generation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setGenerating(false);
    }
  }, []);

  // Generate PDF server-side
  const generatePDFServerSide = React.useCallback(async (
    type: string,
    data: any,
    filename?: string
  ) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          filename: filename || `${type}-${Date.now()}`
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `${type}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setLastGenerated({
          type,
          timestamp: new Date(),
          filename: filename || `${type}-${Date.now()}.pdf`
        });

        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Server-side PDF generation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setGenerating(false);
    }
  }, []);

  // Generate PDF from HTML element
  const generatePDFFromElement = React.useCallback(async (
    elementId: string,
    filename: string,
    options?: any
  ) => {
    setGenerating(true);
    try {
      const { generatePDFFromHTML } = await import('@/lib/pdf-generator');
      const result = await generatePDFFromHTML(elementId, filename, options);
      
      if (result.success) {
        setLastGenerated({
          type: 'html_element',
          timestamp: new Date(),
          filename: `${filename}.pdf`
        });
      }

      return result;
    } catch (error) {
      console.error('HTML element PDF generation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setGenerating(false);
    }
  }, []);

  // Get available report types
  const getReportTypes = React.useCallback(() => {
    return [
      {
        id: 'medical_report',
        name: 'Medical Report',
        description: 'Comprehensive medical report with diagnosis and treatment'
      },
      {
        id: 'lab_results',
        name: 'Lab Results',
        description: 'Laboratory test results and analysis'
      },
      {
        id: 'prescription',
        name: 'Prescription',
        description: 'Medication prescription with dosage instructions'
      },
      {
        id: 'appointment_summary',
        name: 'Appointment Summary',
        description: 'Summary of appointment details and notes'
      },
      {
        id: 'patient_summary',
        name: 'Patient Summary',
        description: 'Complete patient medical summary'
      }
    ];
  }, []);

  // Validate report data
  const validateReportData = React.useCallback((type: string, data: any) => {
    const errors: string[] = [];

    if (!data) {
      errors.push('Report data is required');
      return errors;
    }

    switch (type) {
      case 'medical_report':
        if (!data.patient) errors.push('Patient data is required');
        if (!data.medicalReport) errors.push('Medical report data is required');
        break;
      case 'lab_results':
        if (!data.patient) errors.push('Patient data is required');
        if (!data.labResults || !Array.isArray(data.labResults)) {
          errors.push('Lab results array is required');
        }
        break;
      case 'prescription':
        if (!data.patient) errors.push('Patient data is required');
        if (!data.prescription) errors.push('Prescription data is required');
        if (!data.prescription.medications || !Array.isArray(data.prescription.medications)) {
          errors.push('Medications array is required');
        }
        break;
      case 'appointment_summary':
        if (!data.patient) errors.push('Patient data is required');
        if (!data.appointment) errors.push('Appointment data is required');
        break;
      case 'patient_summary':
        if (!data.patient) errors.push('Patient data is required');
        break;
      default:
        errors.push('Invalid report type');
    }

    return errors;
  }, []);

  return {
    generating,
    lastGenerated,
    generatePDFClientSide,
    generatePDFServerSide,
    generatePDFFromElement,
    getReportTypes,
    validateReportData
  };
}


