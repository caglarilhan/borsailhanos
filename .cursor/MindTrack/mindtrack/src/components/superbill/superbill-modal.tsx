/**
 * Superbill Modal Component - Professional superbill generation interface
 * 
 * Bu component ne işe yarar:
 * - Superbill generation ve preview
 * - Professional billing interface
 * - Print ve download functionality
 * - US Healthcare billing support
 * - Insurance claim preparation
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  Receipt,
  Settings,
  Copy,
  Save,
  RefreshCw
} from "lucide-react";

import { generateSuperbillHTML, createSuperbillFromInvoice, type SuperbillData } from "@/lib/superbill-generator";
import type { Invoice, Client, Clinic } from "@/types/domain";

/**
 * Superbill Modal Props - Component props'ları
 * Bu interface ne işe yarar:
 * - Component'e gerekli data'ları geçer
 * - Event handler'ları tanımlar
 * - Configuration options sağlar
 */
interface SuperbillModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  client: Client;
  clinic: Clinic;
  onSuperbillGenerated?: (superbillData: SuperbillData) => void;
  onSuperbillPrinted?: (html: string) => void;
  onSuperbillDownloaded?: (html: string) => void;
}

/**
 * Superbill Form Data - Form state'i
 * Bu interface ne işe yarar:
 * - Superbill form fields'ını yönetir
 * - User input'larını tutar
 * - Data validation için kullanılır
 */
interface SuperbillFormData {
  // Provider Information - Sağlayıcı bilgileri
  providerName: string;
  providerNPI: string;
  providerAddress: string;
  providerPhone: string;
  providerTaxonomy: string;
  
  // Patient Information - Hasta bilgileri
  patientName: string;
  patientDOB: string;
  patientAddress: string;
  patientPhone: string;
  
  // Insurance Information - Sigorta bilgileri
  insurancePayer: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  insurancePayerID: string;
  
  // Service Information - Hizmet bilgileri
  serviceDate: string;
  cptCodes: string[];
  icdCodes: string[];
  modifierCodes: string[];
  posCode: string;
  diagnosisPointers: string[];
  
  // Billing Information - Faturalama bilgileri
  totalAmount: number;
  units: number;
  description: string;
}

/**
 * Superbill Modal Component - Ana component
 * Bu component ne işe yarar:
 * - Professional superbill interface
 * - Form management ve validation
 * - Superbill generation ve preview
 * - Print ve download functionality
 */
export default function SuperbillModal({
  isOpen,
  onClose,
  invoice,
  client,
  clinic,
  onSuperbillGenerated,
  onSuperbillPrinted,
  onSuperbillDownloaded
}: SuperbillModalProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - Form data'yı yönetir
   * - UI state'ini tutar
   * - User interactions'ı track eder
   */
  const [formData, setFormData] = React.useState<SuperbillFormData>({
    // Provider bilgileri - Clinic'ten alınır
    providerName: clinic.name,
    providerNPI: clinic.npi || '',
    providerAddress: clinic.address || '',
    providerPhone: clinic.phone || '',
    providerTaxonomy: clinic.taxonomy_code || '',
    
    // Patient bilgileri - Client'tan alınır
    patientName: client.name,
    patientDOB: '', // Client tablosuna eklenebilir
    patientAddress: '', // Client tablosuna eklenebilir
    patientPhone: client.phone || '',
    
    // Insurance bilgileri - Client insurance alanlarından
    insurancePayer: client.insurance_payer || 'Self Pay',
    insurancePolicyNumber: client.insurance_policy_number || '',
    insuranceGroupNumber: client.insurance_group_number || '',
    insurancePayerID: client.insurance_payer_id || '',
    
    // Service bilgileri - Invoice'dan alınır
    serviceDate: invoice.created_at.split('T')[0],
    cptCodes: invoice.cpt_codes || [invoice.cpt_code || '90834'],
    icdCodes: invoice.icd_codes || ['F32.9'],
    modifierCodes: invoice.modifier_codes || ['95'],
    posCode: invoice.pos_code || '02',
    diagnosisPointers: invoice.diagnosis_pointers || ['1'],
    
    // Billing bilgileri
    totalAmount: Number(invoice.amount),
    units: 1,
    description: 'Psychotherapy Session'
  });

  /**
   * UI state'ini yönetir
   * Bu state ne işe yarar:
   * - Loading states
   * - Error handling
   * - Success messages
   * - Preview mode
   */
  const [uiState, setUiState] = React.useState({
    loading: false,
    error: null as string | null,
    success: null as string | null,
    showPreview: false,
    generatedHTML: ''
  });

  /**
   * Form field'larını günceller
   * Bu fonksiyon ne işe yarar:
   * - Form input changes
   * - State synchronization
   * - Data validation
   */
  const handleInputChange = (field: keyof SuperbillFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Array field'larını günceller (CPT codes, ICD codes, etc.)
   * Bu fonksiyon ne işe yarar:
   * - Comma-separated string'leri array'e çevirir
   * - User input'larını parse eder
   * - Data format'ını standardize eder
   */
  const handleArrayInputChange = (field: 'cptCodes' | 'icdCodes' | 'modifierCodes' | 'diagnosisPointers', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, array);
  };

  /**
   * Form validation yapar
   * Bu fonksiyon ne işe yarar:
   * - Required field validation
   * - Format validation
   * - Business rule validation
   */
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Required fields
    if (!formData.providerName.trim()) errors.push('Provider name is required');
    if (!formData.patientName.trim()) errors.push('Patient name is required');
    if (!formData.serviceDate) errors.push('Service date is required');
    if (formData.totalAmount <= 0) errors.push('Total amount must be greater than 0');
    
    // Format validation
    if (formData.providerNPI && !/^\d{10}$/.test(formData.providerNPI)) {
      errors.push('Provider NPI must be exactly 10 digits');
    }
    
    if (formData.cptCodes.length === 0) errors.push('At least one CPT code is required');
    if (formData.icdCodes.length === 0) errors.push('At least one ICD code is required');
    
    return errors;
  };

  /**
   * Superbill'i generate eder
   * Bu fonksiyon ne işe yarar:
   * - Form data'dan superbill oluşturur
   * - HTML generation
   * - Preview mode'u açar
   */
  const handleGenerateSuperbill = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setUiState(prev => ({ ...prev, error: errors.join(', ') }));
      return;
    }

    setUiState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // SuperbillData format'ına çevir
      const superbillData: SuperbillData = {
        providerName: formData.providerName,
        providerNPI: formData.providerNPI,
        providerAddress: formData.providerAddress,
        providerPhone: formData.providerPhone,
        providerTaxonomy: formData.providerTaxonomy,
        patientName: formData.patientName,
        patientDOB: formData.patientDOB,
        patientAddress: formData.patientAddress,
        patientPhone: formData.patientPhone,
        insurancePayer: formData.insurancePayer,
        insurancePolicyNumber: formData.insurancePolicyNumber,
        insuranceGroupNumber: formData.insuranceGroupNumber,
        insurancePayerID: formData.insurancePayerID,
        serviceDate: formData.serviceDate,
        cptCodes: formData.cptCodes,
        icdCodes: formData.icdCodes,
        modifierCodes: formData.modifierCodes,
        posCode: formData.posCode,
        diagnosisPointers: formData.diagnosisPointers,
        totalAmount: formData.totalAmount,
        units: formData.units,
        description: formData.description
      };

      // HTML generate et
      const html = generateSuperbillHTML(superbillData);
      
      setUiState(prev => ({
        ...prev,
        loading: false,
        showPreview: true,
        generatedHTML: html
      }));

      // Callback'i çağır
      onSuperbillGenerated?.(superbillData);

      setUiState(prev => ({ ...prev, success: 'Superbill generated successfully!' }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate superbill';
      setUiState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  /**
   * Superbill'i print eder
   * Bu fonksiyon ne işe yarar:
   * - Print functionality
   * - Browser print dialog'u açar
   * - Print-optimized layout
   */
  const handlePrint = () => {
    if (!uiState.generatedHTML) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(uiState.generatedHTML);
      printWindow.document.close();
      printWindow.print();
      
      onSuperbillPrinted?.(uiState.generatedHTML);
      setUiState(prev => ({ ...prev, success: 'Superbill sent to printer!' }));
    }
  };

  /**
   * Superbill'i download eder
   * Bu fonksiyon ne işe yarar:
   * - HTML file download
   * - Local storage
   * - File sharing
   */
  const handleDownload = () => {
    if (!uiState.generatedHTML) return;

    const blob = new Blob([uiState.generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superbill-${client.name}-${formData.serviceDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onSuperbillDownloaded?.(uiState.generatedHTML);
    setUiState(prev => ({ ...prev, success: 'Superbill downloaded successfully!' }));
  };

  /**
   * Form'u reset eder
   * Bu fonksiyon ne işe yarar:
   * - Form fields'ını temizler
   * - Default values'ları restore eder
   * - User experience'i iyileştirir
   */
  const handleReset = () => {
    setFormData({
      providerName: clinic.name,
      providerNPI: clinic.npi || '',
      providerAddress: clinic.address || '',
      providerPhone: clinic.phone || '',
      providerTaxonomy: clinic.taxonomy_code || '',
      patientName: client.name,
      patientDOB: '',
      patientAddress: '',
      patientPhone: client.phone || '',
      insurancePayer: client.insurance_payer || 'Self Pay',
      insurancePolicyNumber: client.insurance_policy_number || '',
      insuranceGroupNumber: client.insurance_group_number || '',
      insurancePayerID: client.insurance_payer_id || '',
      serviceDate: invoice.created_at.split('T')[0],
      cptCodes: invoice.cpt_codes || [invoice.cpt_code || '90834'],
      icdCodes: invoice.icd_codes || ['F32.9'],
      modifierCodes: invoice.modifier_codes || ['95'],
      posCode: invoice.pos_code || '02',
      diagnosisPointers: invoice.diagnosis_pointers || ['1'],
      totalAmount: Number(invoice.amount),
      units: 1,
      description: 'Psychotherapy Session'
    });
    
    setUiState(prev => ({
      ...prev,
      showPreview: false,
      generatedHTML: '',
      error: null,
      success: null
    }));
  };

  /**
   * Success message'ı temizler
   * Bu fonksiyon ne işe yarar:
   * - Auto-clear success messages
   * - Clean UI state
   * - User experience optimization
   */
  React.useEffect(() => {
    if (uiState.success) {
      const timer = setTimeout(() => {
        setUiState(prev => ({ ...prev, success: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uiState.success]);

  /**
   * Form UI'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Professional form interface
   * - User input controls
   * - Form validation display
   */
  const renderForm = () => (
    <div className="space-y-6">
      {/* Provider Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Provider Information
          </CardTitle>
          <CardDescription>
            Healthcare provider details for insurance claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="providerName">Provider Name *</Label>
              <Input
                id="providerName"
                value={formData.providerName}
                onChange={(e) => handleInputChange('providerName', e.target.value)}
                placeholder="Provider name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="providerNPI">NPI Number</Label>
              <Input
                id="providerNPI"
                value={formData.providerNPI}
                onChange={(e) => handleInputChange('providerNPI', e.target.value)}
                placeholder="10-digit NPI"
                maxLength={10}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="providerTaxonomy">Taxonomy Code</Label>
              <Input
                id="providerTaxonomy"
                value={formData.providerTaxonomy}
                onChange={(e) => handleInputChange('providerTaxonomy', e.target.value)}
                placeholder="Taxonomy code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="providerPhone">Phone</Label>
              <Input
                id="providerPhone"
                value={formData.providerPhone}
                onChange={(e) => handleInputChange('providerPhone', e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="providerAddress">Address</Label>
            <Textarea
              id="providerAddress"
              value={formData.providerAddress}
              onChange={(e) => handleInputChange('providerAddress', e.target.value)}
              placeholder="Provider address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-green-600" />
            Patient Information
          </CardTitle>
          <CardDescription>
            Patient details for insurance billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Patient name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientDOB">Date of Birth</Label>
              <Input
                id="patientDOB"
                type="date"
                value={formData.patientDOB}
                onChange={(e) => handleInputChange('patientDOB', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Phone</Label>
              <Input
                id="patientPhone"
                value={formData.patientPhone}
                onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                placeholder="Patient phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date *</Label>
              <Input
                id="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => handleInputChange('serviceDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patientAddress">Address</Label>
            <Textarea
              id="patientAddress"
              value={formData.patientAddress}
              onChange={(e) => handleInputChange('patientAddress', e.target.value)}
              placeholder="Patient address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Insurance Information
          </CardTitle>
          <CardDescription>
            Insurance details for claim submission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurancePayer">Insurance Payer</Label>
              <Input
                id="insurancePayer"
                value={formData.insurancePayer}
                onChange={(e) => handleInputChange('insurancePayer', e.target.value)}
                placeholder="Insurance company"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                placeholder="Policy/subscriber ID"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceGroupNumber">Group Number</Label>
              <Input
                id="insuranceGroupNumber"
                value={formData.insuranceGroupNumber}
                onChange={(e) => handleInputChange('insuranceGroupNumber', e.target.value)}
                placeholder="Group number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurancePayerID">Payer ID</Label>
              <Input
                id="insurancePayerID"
                value={formData.insurancePayerID}
                onChange={(e) => handleInputChange('insurancePayerID', e.target.value)}
                placeholder="Payer ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Codes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-orange-600" />
            Service Codes & Billing
          </CardTitle>
          <CardDescription>
            CPT, ICD codes and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cptCodes">CPT Codes *</Label>
              <Input
                id="cptCodes"
                value={formData.cptCodes.join(', ')}
                onChange={(e) => handleArrayInputChange('cptCodes', e.target.value)}
                placeholder="e.g. 90834, 90837"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icdCodes">ICD-10 Codes *</Label>
              <Input
                id="icdCodes"
                value={formData.icdCodes.join(', ')}
                onChange={(e) => handleArrayInputChange('icdCodes', e.target.value)}
                placeholder="e.g. F32.9, F41.9"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modifierCodes">Modifier Codes</Label>
              <Input
                id="modifierCodes"
                value={formData.modifierCodes.join(', ')}
                onChange={(e) => handleArrayInputChange('modifierCodes', e.target.value)}
                placeholder="e.g. 95 (telehealth)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="posCode">Place of Service</Label>
              <Select
                value={formData.posCode}
                onValueChange={(value) => handleInputChange('posCode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="02">02 - Telehealth (Patient&apos;s Home)</SelectItem>
                  <SelectItem value="11">11 - Office</SelectItem>
                  <SelectItem value="12">12 - Home</SelectItem>
                  <SelectItem value="13">13 - Assisted Living Facility</SelectItem>
                  <SelectItem value="14">14 - Group Home</SelectItem>
                  <SelectItem value="15">15 - Mobile Unit</SelectItem>
                  <SelectItem value="16">16 - Temporary Lodging</SelectItem>
                  <SelectItem value="17">17 - Walk-in Retail Health Clinic</SelectItem>
                  <SelectItem value="18">18 - Place of Employment-Worksite</SelectItem>
                  <SelectItem value="19">19 - Off Campus-Outpatient Hospital</SelectItem>
                  <SelectItem value="20">20 - Urgent Care Facility</SelectItem>
                  <SelectItem value="21">21 - Inpatient Hospital</SelectItem>
                  <SelectItem value="22">22 - On Campus-Outpatient Hospital</SelectItem>
                  <SelectItem value="23">23 - Emergency Room-Hospital</SelectItem>
                  <SelectItem value="24">24 - Ambulatory Surgical Center</SelectItem>
                  <SelectItem value="25">25 - Birthing Center</SelectItem>
                  <SelectItem value="26">26 - Military Treatment Facility</SelectItem>
                  <SelectItem value="31">31 - Skilled Nursing Facility</SelectItem>
                  <SelectItem value="32">32 - Nursing Facility</SelectItem>
                  <SelectItem value="33">33 - Custodial Care Facility</SelectItem>
                  <SelectItem value="34">34 - Hospice</SelectItem>
                  <SelectItem value="41">41 - Ambulance-Land</SelectItem>
                  <SelectItem value="42">42 - Ambulance-Air or Water</SelectItem>
                  <SelectItem value="49">49 - Independent Clinic</SelectItem>
                  <SelectItem value="50">50 - Federally Qualified Health Center</SelectItem>
                  <SelectItem value="51">51 - Inpatient Psychiatric Facility</SelectItem>
                  <SelectItem value="52">52 - Psychiatric Facility-Partial Hospitalization</SelectItem>
                  <SelectItem value="53">53 - Community Mental Health Center</SelectItem>
                  <SelectItem value="54">54 - Intermediate Care Facility/Mentally Retarded</SelectItem>
                  <SelectItem value="55">55 - Residential Substance Abuse Treatment Facility</SelectItem>
                  <SelectItem value="56">56 - Psychiatric Residential Treatment Center</SelectItem>
                  <SelectItem value="57">57 - Non-residential Substance Abuse Treatment Facility</SelectItem>
                  <SelectItem value="58">58 - Non-residential Substance Abuse Treatment Facility</SelectItem>
                  <SelectItem value="60">60 - Mass Immunization Center</SelectItem>
                  <SelectItem value="61">61 - Comprehensive Inpatient Rehabilitation Facility</SelectItem>
                  <SelectItem value="62">62 - Comprehensive Outpatient Rehabilitation Facility</SelectItem>
                  <SelectItem value="65">65 - End-Stage Renal Disease Treatment Facility</SelectItem>
                  <SelectItem value="71">71 - Public Health Clinic</SelectItem>
                  <SelectItem value="72">72 - Rural Health Clinic</SelectItem>
                  <SelectItem value="81">81 - Independent Laboratory</SelectItem>
                  <SelectItem value="99">99 - Other Place of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount *</Label>
              <Input
                id="totalAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange('totalAmount', Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={(e) => handleInputChange('units', Number(e.target.value))}
                placeholder="1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Service description"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Form
        </Button>
        
        <Button
          onClick={handleGenerateSuperbill}
          disabled={uiState.loading}
          className="flex items-center gap-2"
        >
          {uiState.loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Superbill
            </>
          )}
        </Button>
      </div>
    </div>
  );

  /**
   * Preview UI'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Generated superbill preview
   * - Print ve download buttons
   * - Professional layout
   */
  const renderPreview = () => (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Superbill Preview</h3>
          <p className="text-gray-600">Review your superbill before printing or downloading</p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setUiState(prev => ({ ...prev, showPreview: false }))}
        >
          <Eye className="h-4 w-4 mr-2" />
          Edit Form
        </Button>
      </div>

      {/* Preview Content */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          className="p-6 bg-white"
          dangerouslySetInnerHTML={{ __html: uiState.generatedHTML }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Print Superbill
        </Button>
        
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download HTML
        </Button>
      </div>
    </div>
  );

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Modal structure
   * - Content switching
   * - Error handling
   */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Generate Superbill
          </DialogTitle>
          <DialogDescription>
            Create a professional superbill for insurance claims and billing purposes
          </DialogDescription>
        </DialogHeader>

        {/* Error & Success Messages */}
        {uiState.error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5" />
            {uiState.error}
          </div>
        )}

        {uiState.success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="h-5 w-5" />
            {uiState.success}
          </div>
        )}

        {/* Content */}
        {uiState.showPreview ? renderPreview() : renderForm()}
      </DialogContent>
    </Dialog>
  );
}
