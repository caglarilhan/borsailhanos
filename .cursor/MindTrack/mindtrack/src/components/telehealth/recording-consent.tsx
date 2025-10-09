"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Mic, 
  Shield, 
  Clock, 
  Users, 
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import SignaturePad from "@/components/forms/signature-pad";
import type { RecordingConsent } from "./telehealth-video-conferencing";

interface RecordingConsentProps {
  sessionId: string;
  clientId: string;
  onConsent: (consent: RecordingConsent) => void;
  onCancel: () => void;
}

export default function RecordingConsent({ sessionId, clientId, onConsent, onCancel }: RecordingConsentProps) {
  const { toast } = useToast();
  const [consent, setConsent] = React.useState<Partial<RecordingConsent>>({
    sessionId,
    clientId,
    consentType: 'both',
    purpose: 'treatment',
    retentionPeriod: 365,
    sharedWith: [],
    clientSignature: '',
    signedAt: '',
    ipAddress: '',
    userAgent: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [signatureData, setSignatureData] = React.useState<{ dataUrl: string | null, typedSignature: string | null }>({ dataUrl: null, typedSignature: null });

  React.useEffect(() => {
    // Get client IP and user agent
    setConsent(prev => ({
      ...prev,
      ipAddress: window.location.hostname,
      userAgent: navigator.userAgent,
      signedAt: new Date().toISOString()
    }));
  }, []);

  const handleConsentChange = (field: keyof RecordingConsent, value: any) => {
    setConsent(prev => ({ ...prev, [field]: value }));
  };

  const handleSharedWithChange = (value: string, checked: boolean) => {
    setConsent(prev => ({
      ...prev,
      sharedWith: checked 
        ? [...(prev.sharedWith || []), value]
        : (prev.sharedWith || []).filter(item => item !== value)
    }));
  };

  const handleSignatureSave = (dataUrl: string | null, typedSignature: string | null) => {
    setSignatureData({ dataUrl, typedSignature });
    setConsent(prev => ({
      ...prev,
      clientSignature: dataUrl || typedSignature || ''
    }));
  };

  const handleSubmit = async () => {
    if (!consent.clientSignature) {
      toast({
        title: "Error",
        description: "Please provide your signature to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fullConsent: RecordingConsent = {
        id: `consent_${Date.now()}`,
        sessionId: consent.sessionId!,
        clientId: consent.clientId!,
        consentType: consent.consentType!,
        purpose: consent.purpose!,
        retentionPeriod: consent.retentionPeriod!,
        sharedWith: consent.sharedWith!,
        clientSignature: consent.clientSignature,
        signedAt: consent.signedAt!,
        ipAddress: consent.ipAddress!,
        userAgent: consent.userAgent!
      };

      // Save to database
      const res = await fetch('/api/telehealth/recording-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullConsent)
      });
      
      if (!res.ok) throw new Error('Failed to save recording consent');
      
      onConsent(fullConsent);
      toast({
        title: "Success",
        description: "Recording consent saved successfully!",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to save consent: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConsentTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'both': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPurposeDescription = (purpose: string) => {
    switch (purpose) {
      case 'treatment': return 'For treatment planning and progress monitoring';
      case 'training': return 'For staff training and education purposes';
      case 'research': return 'For research and quality improvement';
      case 'quality_assurance': return 'For quality assurance and compliance';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Recording Consent Form
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Important Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                This session may be recorded for the purposes specified below. Your consent is required to proceed.
              </p>
            </div>
          </div>
        </div>

        {/* Consent Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium">What will be recorded?</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'audio', label: 'Audio Only', icon: <Mic className="h-4 w-4" /> },
              { value: 'video', label: 'Video Only', icon: <Video className="h-4 w-4" /> },
              { value: 'both', label: 'Audio & Video', icon: <Video className="h-4 w-4" /> }
            ].map((option) => (
              <div
                key={option.value}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  consent.consentType === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleConsentChange('consentType', option.value)}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Purpose of Recording</Label>
          <Select
            value={consent.purpose}
            onValueChange={(value) => handleConsentChange('purpose', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="treatment">Treatment Planning</SelectItem>
              <SelectItem value="training">Staff Training</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="quality_assurance">Quality Assurance</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600">
            {getPurposeDescription(consent.purpose || '')}
          </p>
        </div>

        {/* Retention Period */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Retention Period</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={consent.retentionPeriod}
              onChange={(e) => handleConsentChange('retentionPeriod', parseInt(e.target.value) || 365)}
              className="w-24"
              min="1"
              max="2555" // 7 years
            />
            <span className="text-sm text-gray-600">days</span>
          </div>
          <p className="text-sm text-gray-600">
            Recordings will be securely stored and automatically deleted after this period.
          </p>
        </div>

        {/* Shared With */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Who may access recordings?</Label>
          <div className="space-y-2">
            {[
              { value: 'provider', label: 'Your healthcare provider' },
              { value: 'supervisor', label: 'Clinical supervisor' },
              { value: 'quality_team', label: 'Quality assurance team' },
              { value: 'research_team', label: 'Research team (if applicable)' }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={consent.sharedWith?.includes(option.value) || false}
                  onCheckedChange={(checked) => handleSharedWithChange(option.value, !!checked)}
                />
                <Label htmlFor={option.value} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Terms */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Additional Terms</Label>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Recordings are encrypted and stored securely</p>
            <p>• You may withdraw consent at any time</p>
            <p>• Recordings will not be shared without your explicit consent</p>
            <p>• You have the right to request copies of recordings</p>
          </div>
        </div>

        {/* Signature */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Digital Signature</Label>
          <p className="text-sm text-gray-600">
            Please sign below to confirm your consent to recording.
          </p>
          <SignaturePad onSave={handleSignatureSave} />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !consent.clientSignature}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Saving...' : 'Give Consent'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
