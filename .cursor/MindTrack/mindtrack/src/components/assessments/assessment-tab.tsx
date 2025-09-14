"use client";

import * as React from "react";
import AssessmentForm from "@/components/assessments/assessment-form";

export default function AssessmentTab() {
  const handleAssessmentComplete = async (assessment: {
    client_id: string;
    type: string;
    score: number;
    max_score: number;
    severity: string;
    answers: any[];
    notes: string;
  }) => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save assessment');
      }

      const result = await response.json();
      console.log('Assessment saved successfully:', result);
      
      // Show success message or redirect
      alert('Assessment completed and saved successfully!');
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment. Please try again.');
    }
  };

  return (
    <AssessmentForm
      clientId="demo-client"
      clientName="Demo Client"
      onComplete={handleAssessmentComplete}
      onCancel={() => {}}
    />
  );
}
