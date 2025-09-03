"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  User, 
  Heart, 
  Brain, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  Zap,
  Pill,
  TestTube,
  Stethoscope,
  Microscope,
  Database,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Shield,
  Target,
  Gauge,
  Scale,
  Baby,
  Users,
  Calendar,
  FileText,
  ActivitySquare,
  TrendingDown,
  AlertOctagon
} from "lucide-react";

interface PatientVitals {
  height_cm: number;
  weight_kg: number;
  age_years: number;
  gender: 'male' | 'female' | 'other';
  creatinine_mg_dl: number;
  egfr_ml_min: number;
  alt_u_l: number;
  ast_u_l: number;
  bilirubin_mg_dl: number;
  albumin_g_dl: number;
}

interface DosageCalculation {
  drugName: string;
  indication: string;
  baseDose: number;
  adjustedDose: number;
  frequency: string;
  adjustments: string[];
  monitoringRequired: boolean;
  monitoringFrequency: string;
  bsa: number;
  egfr: number;
  childPughScore: number;
}

interface DrugLevelMonitoring {
  drugName: string;
  monitoringType: 'trough' | 'peak' | 'random';
  targetRange: string;
  lastResult: number;
  lastResultDate: string;
  nextDrawDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

const DrugDosageCalculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDrug, setSelectedDrug] = useState<string>("");
  const [indication, setIndication] = useState<string>("");
  const [calculationResult, setCalculationResult] = useState<DosageCalculation | null>(null);

  // Mock patient vitals
  const mockPatientVitals: PatientVitals = {
    height_cm: 170,
    weight_kg: 75,
    age_years: 45,
    gender: 'male',
    creatinine_mg_dl: 1.2,
    egfr_ml_min: 85,
    alt_u_l: 35,
    ast_u_l: 30,
    bilirubin_mg_dl: 0.8,
    albumin_g_dl: 4.2
  };

  // Mock dosage calculation result
  const mockCalculationResult: DosageCalculation = {
    drugName: "Sertraline",
    indication: "Major Depressive Disorder",
    baseDose: 50,
    adjustedDose: 50,
    frequency: "daily",
    adjustments: ["Standard dosing"],
    monitoringRequired: false,
    monitoringFrequency: "None required",
    bsa: 1.85,
    egfr: 85,
    childPughScore: 5
  };

  // Mock drug level monitoring
  const mockDrugLevelMonitoring: DrugLevelMonitoring[] = [
    {
      drugName: "Lithium",
      monitoringType: "trough",
      targetRange: "0.6-1.2 mEq/L",
      lastResult: 0.8,
      lastResultDate: "2024-01-10",
      nextDrawDate: "2024-01-24",
      status: "active"
    },
    {
      drugName: "Valproic Acid",
      monitoringType: "trough",
      targetRange: "50-100 mcg/mL",
      lastResult: 75,
      lastResultDate: "2024-01-08",
      nextDrawDate: "2024-01-22",
      status: "active"
    }
  ];

  const calculateBSA = (height: number, weight: number): number => {
    return 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
  };

  const calculateEGFR = (age: number, gender: string, creatinine: number): number => {
    const k = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.329 : -0.411;
    return 141 * Math.pow(Math.min(creatinine / k, 1), alpha) * 
           Math.pow(Math.max(creatinine / k, 1), -1.209) * 
           Math.pow(0.993, age);
  };

  const getEGFRCategory = (egfr: number): string => {
    if (egfr >= 90) return "Normal";
    if (egfr >= 60) return "Mild reduction";
    if (egfr >= 30) return "Moderate reduction";
    if (egfr >= 15) return "Severe reduction";
    return "Kidney failure";
  };

  const getChildPughScore = (bilirubin: number, albumin: number, alt: number, ast: number): number => {
    let score = 0;
    
    // Bilirubin scoring
    if (bilirubin < 2) score += 1;
    else if (bilirubin <= 3) score += 2;
    else score += 3;
    
    // Albumin scoring
    if (albumin > 3.5) score += 1;
    else if (albumin >= 2.8) score += 2;
    else score += 3;
    
    // ALT/AST scoring (simplified)
    if (alt <= 40 && ast <= 40) score += 1;
    else if (alt <= 80 && ast <= 80) score += 2;
    else score += 3;
    
    return score;
  };

  const getChildPughClass = (score: number): string => {
    if (score <= 6) return "Class A (Mild)";
    if (score <= 9) return "Class B (Moderate)";
    return "Class C (Severe)";
  };

  const bsa = calculateBSA(mockPatientVitals.height_cm, mockPatientVitals.weight_kg);
  const egfr = calculateEGFR(mockPatientVitals.age_years, mockPatientVitals.gender, mockPatientVitals.creatinine_mg_dl);
  const childPughScore = getChildPughScore(
    mockPatientVitals.bilirubin_mg_dl,
    mockPatientVitals.albumin_g_dl,
    mockPatientVitals.alt_u_l,
    mockPatientVitals.ast_u_l
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drug Dosage Calculators</h1>
          <p className="text-muted-foreground">
            Advanced dosage calculations based on age, weight, kidney/liver function, and genetic factors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Dose
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BSA</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bsa.toFixed(2)} m²</div>
            <p className="text-xs text-muted-foreground">
              Body Surface Area
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">eGFR</CardTitle>
            <Kidney className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{egfr.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {getEGFRCategory(egfr)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Child-Pugh</CardTitle>
            <Liver className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{childPughScore}</div>
            <p className="text-xs text-muted-foreground">
              {getChildPughClass(childPughScore)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Monitoring</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDrugLevelMonitoring.length}</div>
            <p className="text-xs text-muted-foreground">
              Drug levels being tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calculator">Dosage Calculator</TabsTrigger>
          <TabsTrigger value="patient-vitals">Patient Vitals</TabsTrigger>
          <TabsTrigger value="monitoring">Drug Monitoring</TabsTrigger>
          <TabsTrigger value="history">Calculation History</TabsTrigger>
          <TabsTrigger value="guidelines">Dosing Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dosage Calculator</CardTitle>
                <CardDescription>
                  Calculate optimal drug dosage based on patient factors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="patient">Select Patient</Label>
                  <Input
                    id="patient"
                    placeholder="Search patients..."
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="drug">Select Drug</Label>
                  <Input
                    id="drug"
                    placeholder="Search drugs..."
                    value={selectedDrug}
                    onChange={(e) => setSelectedDrug(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="indication">Indication</Label>
                  <Input
                    id="indication"
                    placeholder="e.g., Major Depressive Disorder"
                    value={indication}
                    onChange={(e) => setIndication(e.target.value)}
                  />
                </div>
                <Button className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Dosage
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Result</CardTitle>
                <CardDescription>
                  Recommended dosage with adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calculationResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Drug:</span>
                      <span>{calculationResult.drugName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Indication:</span>
                      <span>{calculationResult.indication}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Base Dose:</span>
                      <span>{calculationResult.baseDose} mg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Adjusted Dose:</span>
                      <span className="font-bold text-lg">{calculationResult.adjustedDose} mg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Frequency:</span>
                      <span>{calculationResult.frequency}</span>
                    </div>
                    <div>
                      <span className="font-medium">Adjustments Applied:</span>
                      <div className="mt-2 space-y-1">
                        {calculationResult.adjustments.map((adjustment, index) => (
                          <Badge key={index} variant="secondary" className="mr-1">
                            {adjustment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {calculationResult.monitoringRequired && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Monitoring Required</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          {calculationResult.monitoringFrequency}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter patient and drug information to calculate dosage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patient-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Vital Signs & Lab Values</CardTitle>
              <CardDescription>
                Current patient demographics and laboratory values for dosage calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Demographics</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span>{mockPatientVitals.age_years} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gender:</span>
                      <span className="capitalize">{mockPatientVitals.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Height:</span>
                      <span>{mockPatientVitals.height_cm} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span>{mockPatientVitals.weight_kg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BSA:</span>
                      <span>{bsa.toFixed(2)} m²</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Renal Function</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Creatinine:</span>
                      <span>{mockPatientVitals.creatinine_mg_dl} mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>eGFR:</span>
                      <span>{egfr.toFixed(0)} mL/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <Badge variant={egfr >= 60 ? "default" : "destructive"}>
                        {getEGFRCategory(egfr)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hepatic Function</Label>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>ALT:</span>
                      <span>{mockPatientVitals.alt_u_l} U/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AST:</span>
                      <span>{mockPatientVitals.ast_u_l} U/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bilirubin:</span>
                      <span>{mockPatientVitals.bilirubin_mg_dl} mg/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Albumin:</span>
                      <span>{mockPatientVitals.albumin_g_dl} g/dL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Child-Pugh:</span>
                      <Badge variant={childPughScore <= 6 ? "default" : "destructive"}>
                        {getChildPughClass(childPughScore)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drug Level Monitoring</CardTitle>
              <CardDescription>
                Therapeutic drug monitoring schedule and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDrugLevelMonitoring.map((monitoring, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        <span className="font-medium">{monitoring.drugName}</span>
                      </div>
                      <Badge variant={monitoring.status === 'active' ? 'default' : 'secondary'}>
                        {monitoring.status}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="font-medium">Monitoring Type:</span> {monitoring.monitoringType}
                      </div>
                      <div>
                        <span className="font-medium">Target Range:</span> {monitoring.targetRange}
                      </div>
                      <div>
                        <span className="font-medium">Last Result:</span> {monitoring.lastResult}
                      </div>
                      <div>
                        <span className="font-medium">Last Draw:</span> {monitoring.lastResultDate}
                      </div>
                      <div>
                        <span className="font-medium">Next Draw:</span> {monitoring.nextDrawDate}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress 
                        value={monitoring.lastResult / 100 * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Target Range</span>
                        <span>{monitoring.targetRange}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dosage Calculation History</CardTitle>
              <CardDescription>
                Historical record of all dosage calculations performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="font-medium">Sertraline - MDD</span>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div>Calculated Dose: 50 mg daily</div>
                    <div>Method: Standard dosing</div>
                    <div>Adjustments: None required</div>
                    <div>Patient Factors: Age 45, eGFR 85, Child-Pugh Class A</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dosing Guidelines</CardTitle>
              <CardDescription>
                Evidence-based dosing guidelines and adjustment factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Renal Function Adjustments</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>eGFR ≥ 90:</span>
                      <span>No adjustment</span>
                    </div>
                    <div className="flex justify-between">
                      <span>eGFR 60-89:</span>
                      <span>Monitor closely</span>
                    </div>
                    <div className="flex justify-between">
                      <span>eGFR 30-59:</span>
                      <span>25-50% dose reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span>eGFR 15-29:</span>
                      <span>50-75% dose reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span>eGFR < 15:</span>
                      <span>Contraindicated or 75% reduction</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Hepatic Function Adjustments</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Child-Pugh Class A:</span>
                      <span>No adjustment</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Child-Pugh Class B:</span>
                      <span>25-50% dose reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Child-Pugh Class C:</span>
                      <span>50-75% dose reduction</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Placeholder icons for kidney and liver
const Kidney = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364l-7.682-7.682a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Liver = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

export default DrugDosageCalculators;
