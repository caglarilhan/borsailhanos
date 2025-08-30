/**
 * Superbill Generator UI Component - Profesyonel billing interface
 * 
 * Bu component ne işe yarar:
 * - US Healthcare billing için profesyonel superbill oluşturur
 * - Invoice verilerinden otomatik superbill generation
 * - HTML preview ve print functionality
 * - Professional billing document creation
 * - HIPAA compliant billing information
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  User,
  Shield,
  Calendar,
  Phone,
  MapPin
} from "lucide-react";

import { 
  generateSuperbillHTML, 
  createSuperbillFromInvoice,
  type SuperbillData 
} from "@/lib/superbill-generator";
import type { Invoice, Client, Clinic } from "@/types/domain";

/**
 * Superbill Generator Props - Component prop'ları
 * Bu interface ne işe yarar:
 * - Component'e gerekli verileri geçer
 * - Invoice, client ve clinic bilgilerini sağlar
 * - Callback fonksiyonları tanımlar
 */
interface SuperbillGeneratorProps {
  invoice: Invoice;
  client: Client;
  clinic: Clinic;
  onGenerate?: (superbillData: SuperbillData) => void;
  onPreview?: (html: string) => void;
  onPrint?: (html: string) => void;
  onDownload?: (html: string) => void;
}

/**
 * Superbill Generator State - Component state'i
 * Bu interface ne işe yarar:
 * - Component'in internal state'ini yönetir
 * - Form data ve UI state'ini tutar
 * - User interaction'ları track eder
 */
interface SuperbillGeneratorState {
  // Form Data - Form verileri
  superbillData: SuperbillData;
  
  // UI State - UI durumu
  isGenerating: boolean;
  isPreviewing: boolean;
  isPrinting: boolean;
  isDownloading: boolean;
  
  // Validation State - Doğrulama durumu
  errors: Record<string, string>;
  isValid: boolean;
  
  // Generated Content - Oluşturulan içerik
  generatedHTML: string | null;
  previewMode: 'form' | 'preview' | 'generated';
}

/**
 * Superbill Generator Component - Ana component
 * Bu component ne işe yarar:
 * - Professional superbill generation interface
 * - Form validation ve data management
 * - HTML generation ve preview
 * - Print ve download functionality
 */
export default function SuperbillGenerator({
  invoice,
  client,
  clinic,
  onGenerate,
  onPreview,
  onPrint,
  onDownload
}: SuperbillGeneratorProps) {
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - Form data'yı tutar
   * - UI interactions'ı track eder
   * - Validation state'ini yönetir
   */
  const [state, setState] = React.useState<SuperbillGeneratorState>(() => {
    // Invoice verilerinden initial superbill data oluştur
    const initialData = createSuperbillFromInvoice(invoice, client, clinic);
    
    return {
      superbillData: initialData,
      isGenerating: false,
      isPreviewing: false,
      isPrinting: false,
      isDownloading: false,
      errors: {},
      isValid: true,
      generatedHTML: null,
      previewMode: 'form'
    };
  });

  /**
   * Form validation yapar
   * Bu fonksiyon ne işe yarar:
   * - Required field'ları kontrol eder
   * - Data format'ını validate eder
   * - Error messages'ları set eder
   * - Form submission'ı enable/disable eder
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { superbillData } = state;

    // Required fields validation
    if (!superbillData.providerName.trim()) {
      newErrors.providerName = "Provider name is required";
    }
    
    if (!superbillData.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }
    
    if (!superbillData.serviceDate) {
      newErrors.serviceDate = "Service date is required";
    }
    
    if (superbillData.cptCodes.length === 0) {
      newErrors.cptCodes = "At least one CPT code is required";
    }
    
    if (superbillData.icdCodes.length === 0) {
      newErrors.icdCodes = "At least one ICD code is required";
    }
    
    if (superbillData.totalAmount <= 0) {
      newErrors.totalAmount = "Total amount must be greater than 0";
    }

    // NPI validation (10 digits)
    if (superbillData.providerNPI && superbillData.providerNPI !== 'N/A') {
      if (!/^\d{10}$/.test(superbillData.providerNPI)) {
        newErrors.providerNPI = "NPI must be exactly 10 digits";
      }
    }

    // EIN validation (XX-XXXXXXX format)
    if (superbillData.providerNPI && superbillData.providerNPI !== 'N/A') {
      if (!/^\d{2}-\d{7}$/.test(superbillData.providerNPI)) {
        newErrors.providerNPI = "EIN must be in format XX-XXXXXXX";
      }
    }

    setState(prev => ({
      ...prev,
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0
    }));

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Form field değişikliklerini handle eder
   * Bu fonksiyon ne işe yarar:
   * - Input field değişikliklerini yakalar
   * - State'i günceller
   * - Field-specific validation'ı tetikler
   * - Real-time form validation
   */
  const handleFieldChange = (field: keyof SuperbillData, value: string | number | string[] | boolean) => {
    setState(prev => ({
      ...prev,
      superbillData: {
        ...prev.superbillData,
        [field]: value
      }
    }));

    // Clear error for this field when user starts typing
    if (state.errors[field]) {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: ""
        }
      }));
    }
  };

  /**
   * Array field'ları için özel handler
   * Bu fonksiyon ne işe yarar:
   * - CPT codes, ICD codes gibi array field'ları yönetir
   * - Comma-separated input'ları parse eder
   * - Array validation'ı sağlar
   */
  const handleArrayFieldChange = (field: 'cptCodes' | 'icdCodes' | 'modifierCodes' | 'diagnosisPointers', value: string) => {
    const arrayValue = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    handleFieldChange(field, arrayValue);
  };

  /**
   * Superbill HTML'ini generate eder
   * Bu fonksiyon ne işe yarar:
   * - Form data'dan HTML superbill oluşturur
   * - Professional billing document üretir
   * - Preview mode'u aktif eder
   * - Callback fonksiyonlarını tetikler
   */
  const handleGenerateSuperbill = async () => {
    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      // HTML superbill generate et
      const html = generateSuperbillHTML(state.superbillData);
      
      setState(prev => ({
        ...prev,
        generatedHTML: html,
        previewMode: 'generated',
        isGenerating: false
      }));

      // Callback fonksiyonlarını çağır
      onGenerate?.(state.superbillData);
      onPreview?.(html);

    } catch (error) {
      console.error('Failed to generate superbill:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  /**
   * Preview mode'u toggle eder
   * Bu fonksiyon ne işe yarar:
   * - Form ve preview arasında geçiş yapar
   * - Generated HTML'i gösterir
   * - User experience'i iyileştirir
   */
  const togglePreview = () => {
    if (state.generatedHTML) {
      setState(prev => ({
        ...prev,
        previewMode: prev.previewMode === 'form' ? 'generated' : 'form'
      }));
    }
  };

  /**
   * Superbill'i print eder
   * Bu fonksiyon ne işe yarar:
   * - Generated HTML'i print window'da açar
   * - Print-friendly formatting sağlar
   * - Professional billing document çıktısı
   */
  const handlePrint = () => {
    if (state.generatedHTML) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(state.generatedHTML);
        printWindow.document.close();
        printWindow.print();
      }
      onPrint?.(state.generatedHTML);
    }
  };

  /**
   * Superbill'i download eder
   * Bu fonksiyon ne işe yarar:
   * - HTML superbill'i .html dosyası olarak indirir
   * - Professional billing document arşivleme
   * - Offline viewing ve sharing
   */
  const handleDownload = () => {
    if (state.generatedHTML) {
      const blob = new Blob([state.generatedHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `superbill-${client.name}-${invoice.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onDownload?.(state.generatedHTML);
    }
  };

  /**
   * Form'a geri dön
   * Bu fonksiyon ne işe yarar:
   * - Preview'dan form'a geri dönüş
   * - Edit mode'u aktif eder
   * - User experience'i iyileştirir
   */
  const handleBackToForm = () => {
    setState(prev => ({ ...prev, previewMode: 'form' }));
  };

  /**
   * Error message'ı render eder
   * Bu fonksiyon ne işe yarar:
   * - Field-specific error'ları gösterir
   * - User feedback sağlar
   * - Form validation'ı görselleştirir
   */
  const renderError = (field: string) => {
    const error = state.errors[field];
    if (!error) return null;

    return (
      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  };

  /**
   * Form UI'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Professional form interface
   * - Organized field grouping
   * - Clear visual hierarchy
   * - User-friendly input controls
   */
  const renderForm = () => (
    <div className="space-y-6">
      {/* Header Section - Başlık bölümü */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Generate Superbill</h2>
        <p className="text-gray-600">
          Create professional billing documents for insurance claims
        </p>
      </div>

      {/* Provider Information Section - Sağlayıcı bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Provider Information
          </CardTitle>
          <CardDescription>
            Healthcare provider details for billing purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="providerName">Provider Name *</Label>
              <Input
                id="providerName"
                value={state.superbillData.providerName}
                onChange={(e) => handleFieldChange('providerName', e.target.value)}
                placeholder="Enter provider name"
                className={state.errors.providerName ? 'border-red-500' : ''}
              />
              {renderError('providerName')}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="providerNPI">NPI Number</Label>
              <Input
                id="providerNPI"
                value={state.superbillData.providerNPI}
                onChange={(e) => handleFieldChange('providerNPI', e.target.value)}
                placeholder="10-digit NPI"
                maxLength={10}
                className={state.errors.providerNPI ? 'border-red-500' : ''}
              />
              {renderError('providerNPI')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="providerPhone">Phone</Label>
              <Input
                id="providerPhone"
                value={state.superbillData.providerPhone}
                onChange={(e) => handleFieldChange('providerPhone', e.target.value)}
                placeholder="Provider phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="providerTaxonomy">Taxonomy Code</Label>
              <Input
                id="providerTaxonomy"
                value={state.superbillData.providerTaxonomy}
                onChange={(e) => handleFieldChange('providerTaxonomy', e.target.value)}
                placeholder="Healthcare taxonomy code"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="providerAddress">Address</Label>
            <Textarea
              id="providerAddress"
              value={state.superbillData.providerAddress}
              onChange={(e) => handleFieldChange('providerAddress', e.target.value)}
              placeholder="Provider address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Information Section - Hasta bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Patient Information
          </CardTitle>
          <CardDescription>
            Patient details for billing and insurance purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={state.superbillData.patientName}
                onChange={(e) => handleFieldChange('patientName', e.target.value)}
                placeholder="Enter patient name"
                className={state.errors.patientName ? 'border-red-500' : ''}
              />
              {renderError('patientName')}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientDOB">Date of Birth</Label>
              <Input
                id="patientDOB"
                type="date"
                value={state.superbillData.patientDOB}
                onChange={(e) => handleFieldChange('patientDOB', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Phone</Label>
              <Input
                id="patientPhone"
                value={state.superbillData.patientPhone}
                onChange={(e) => handleFieldChange('patientPhone', e.target.value)}
                placeholder="Patient phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date *</Label>
              <Input
                id="serviceDate"
                type="date"
                value={state.superbillData.serviceDate}
                onChange={(e) => handleFieldChange('serviceDate', e.target.value)}
                className={state.errors.serviceDate ? 'border-red-500' : ''}
              />
              {renderError('serviceDate')}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patientAddress">Address</Label>
            <Textarea
              id="patientAddress"
              value={state.superbillData.patientAddress}
              onChange={(e) => handleFieldChange('patientAddress', e.target.value)}
              placeholder="Patient address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Codes Section - Hizmet kodları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Service Codes & Diagnosis
          </CardTitle>
          <CardDescription>
            CPT, ICD, and modifier codes for billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cptCodes">CPT Codes *</Label>
              <Input
                id="cptCodes"
                value={state.superbillData.cptCodes.join(', ')}
                onChange={(e) => handleArrayFieldChange('cptCodes', e.target.value)}
                placeholder="90834, 90837"
                className={state.errors.cptCodes ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">Separate multiple codes with commas</p>
              {renderError('cptCodes')}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icdCodes">ICD-10 Codes *</Label>
              <Input
                id="icdCodes"
                value={state.superbillData.icdCodes.join(', ')}
                onChange={(e) => handleArrayFieldChange('icdCodes', e.target.value)}
                placeholder="F32.9, F41.9"
                className={state.errors.icdCodes ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">Separate multiple codes with commas</p>
              {renderError('icdCodes')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modifierCodes">Modifier Codes</Label>
              <Input
                id="modifierCodes"
                value={state.superbillData.modifierCodes.join(', ')}
                onChange={(e) => handleArrayFieldChange('modifierCodes', e.target.value)}
                placeholder="95, 59"
              />
              <p className="text-xs text-gray-500">Separate multiple codes with commas</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="posCode">Place of Service</Label>
              <Select
                value={state.superbillData.posCode}
                onValueChange={(value) => handleFieldChange('posCode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select POS code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="02">02 - Telehealth (Patient&apos;s Home)</SelectItem>
                  <SelectItem value="11">11 - Office</SelectItem>
                  <SelectItem value="12">12 - Home</SelectItem>
                  <SelectItem value="20">20 - Urgent Care Facility</SelectItem>
                  <SelectItem value="99">99 - Other Place of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information Section - Faturalama bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Billing Information
          </CardTitle>
          <CardDescription>
            Service details and billing amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Input
                id="units"
                type="number"
                value={state.superbillData.units}
                onChange={(e) => handleFieldChange('units', parseInt(e.target.value) || 1)}
                min="1"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount *</Label>
              <Input
                id="totalAmount"
                type="number"
                value={state.superbillData.totalAmount}
                onChange={(e) => handleFieldChange('totalAmount', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                className={state.errors.totalAmount ? 'border-red-500' : ''}
              />
              {renderError('totalAmount')}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate">Rate per Unit</Label>
              <Input
                id="rate"
                type="number"
                value={state.superbillData.units > 0 ? (state.superbillData.totalAmount / state.superbillData.units).toFixed(2) : '0.00'}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Service Description</Label>
            <Textarea
              id="description"
              value={state.superbillData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Describe the service provided"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Aksiyon butonları */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleGenerateSuperbill}
          disabled={!state.isValid || state.isGenerating}
          size="lg"
          className="px-8"
        >
          {state.isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Superbill
            </>
          )}
        </Button>
        
        {state.generatedHTML && (
          <>
            <Button
              onClick={togglePreview}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <Eye className="h-4 w-4 mr-2" />
              {state.previewMode === 'form' ? 'Preview' : 'Edit'}
            </Button>
            
            <Button
              onClick={handlePrint}
              variant="outline"
              size="lg"
              className="px-8"
              disabled={state.isPrinting}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              size="lg"
              className="px-8"
              disabled={state.isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </>
        )}
      </div>
    </div>
  );

  /**
   * Generated Superbill Preview'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Generated HTML'i iframe'de gösterir
   * - Professional preview experience
   * - Print ve download options
   * - Back to form navigation
   */
  const renderPreview = () => (
    <div className="space-y-6">
      {/* Preview Header - Önizleme başlığı */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Superbill Preview</h2>
          <p className="text-gray-600">
            Generated superbill for {client.name} - {invoice.id}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleBackToForm}
            variant="outline"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            disabled={state.isPrinting}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            disabled={state.isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Preview Content - Önizleme içeriği */}
      <Card>
        <CardContent className="p-0">
          {state.generatedHTML && (
            <iframe
              srcDoc={state.generatedHTML}
              className="w-full h-[800px] border-0"
              title="Superbill Preview"
            />
          )}
        </CardContent>
      </Card>

      {/* Preview Actions - Önizleme aksiyonları */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleBackToForm}
          variant="outline"
          size="lg"
          className="px-8"
        >
          <FileText className="h-4 w-4 mr-2" />
          Back to Form
        </Button>
        
        <Button
          onClick={handlePrint}
          size="lg"
          className="px-8"
          disabled={state.isPrinting}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Superbill
        </Button>
      </div>
    </div>
  );

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Conditional rendering based on preview mode
   * - Professional layout structure
   * - Responsive design
   * - User experience optimization
   */
  return (
    <div className="max-w-6xl mx-auto p-6">
      {state.previewMode === 'form' ? renderForm() : renderPreview()}
    </div>
  );
}
