'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Brain, 
  Pill, 
  MessageSquare, 
  Activity, 
  Users, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Info, 
  AlertCircle
} from 'lucide-react';

interface ProviderTypeSelectorProps {
  onTypeSelect: (type: 'psychiatrist' | 'psychologist') => void;
  currentType?: 'psychiatrist' | 'psychologist';
}

export default function ProviderTypeSelector({ onTypeSelect, currentType }: ProviderTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'psychiatrist' | 'psychologist' | null>(currentType || null);

  const handleTypeSelect = (type: 'psychiatrist' | 'psychologist') => {
    setSelectedType(type);
    onTypeSelect(type);
  };

  const psychiatristFeatures = [
    'Medication Management & Prescriptions',
    'Drug Interaction Checking',
    'Laboratory Monitoring',
    'Psychiatric Assessments (PHQ-9, GAD-7, etc.)',
    'Crisis Intervention Protocols',
    'Medical Decision Support',
    'E-prescribing with E-signature',
    'Side Effect Monitoring',
    'Dosage Calculations',
    'Emergency Medication Protocols'
  ];

  const psychologistFeatures = [
    'Therapy Session Documentation',
    'CBT, DBT, EMDR Tools',
    'Psychological Assessments',
    'Treatment Planning',
    'Homework Assignments',
    'Progress Tracking',
    'Mindfulness & Meditation Tools',
    'Group Therapy Management',
    'Family Therapy Sessions',
    'Behavioral Interventions'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Select Your Provider Type</h1>
        <p className="text-muted-foreground">
          Choose your specialization to access relevant features and tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Psychiatrist Card */}
        <Card className={`cursor-pointer transition-all duration-200 ${
          selectedType === 'psychiatrist' 
            ? 'ring-2 ring-blue-500 shadow-lg' 
            : 'hover:shadow-md'
        }`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Psychiatrist</CardTitle>
            <CardDescription>
              Medical doctor specializing in mental health, medication management, and psychiatric treatment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Key Features:</h4>
              <ul className="space-y-1">
                {psychiatristFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Medical Focus:</strong> Can prescribe medications, manage psychiatric conditions, 
                  and provide medical treatment for mental health disorders.
                </div>
              </div>
            </div>

            <Button 
              className={`w-full ${
                selectedType === 'psychiatrist' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
              onClick={() => handleTypeSelect('psychiatrist')}
            >
              {selectedType === 'psychiatrist' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  Select Psychiatrist
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Psychologist Card */}
        <Card className={`cursor-pointer transition-all duration-200 ${
          selectedType === 'psychologist' 
            ? 'ring-2 ring-green-500 shadow-lg' 
            : 'hover:shadow-md'
        }`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <Brain className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Psychologist</CardTitle>
            <CardDescription>
              Mental health professional specializing in therapy, psychological assessment, and behavioral interventions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Key Features:</h4>
              <ul className="space-y-1">
                {psychologistFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <strong>Therapy Focus:</strong> Provides psychological therapy, counseling, 
                  and behavioral interventions without prescribing medications.
                </div>
              </div>
            </div>

            <Button 
              className={`w-full ${
                selectedType === 'psychologist' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              onClick={() => handleTypeSelect('psychologist')}
            >
              {selectedType === 'psychologist' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  Select Psychologist
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedType && (
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Important Note</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your provider type determines which features and tools are available to you. 
                  You can change this setting later in your profile, but it will affect your access to certain functionalities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
