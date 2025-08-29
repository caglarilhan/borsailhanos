/**
 * Insurance Integration System - US Healthcare için kritik
 * 
 * Bu modül ne işe yarar:
 * - Real-time insurance eligibility verification
 * - Insurance claim submission ve tracking
 * - Coverage information retrieval
 * - Prior authorization management
 * - EDI (Electronic Data Interchange) support
 */

import type { Client, Invoice } from '@/types/domain';

/**
 * Insurance Provider Types - Sigorta sağlayıcı türleri
 * Her tür ne işe yarar:
 * - COMMERCIAL: Private insurance companies (Blue Cross, Aetna, etc.)
 * - MEDICARE: Federal government program for 65+
 * - MEDICAID: State government program for low-income
 * - TRICARE: Military health insurance
 * - WORKERS_COMP: Work-related injury insurance
 * - SELF_PAY: No insurance, patient pays directly
 */
export type InsuranceProviderType = 
  | 'COMMERCIAL'
  | 'MEDICARE'
  | 'MEDICAID'
  | 'TRICARE'
  | 'WORKERS_COMP'
  | 'SELF_PAY';

/**
 * Insurance Coverage Types - Sigorta kapsam türleri
 * Her tür ne işe yarar:
 * - PRIMARY: First insurance to pay
 * - SECONDARY: Pays after primary insurance
 * - TERTIARY: Pays after secondary insurance
 * - SUPPLEMENTAL: Additional coverage (Medigap, etc.)
 */
export type CoverageType = 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'SUPPLEMENTAL';

/**
 * Claim Status Types - Talep durumu türleri
 * Her durum ne işe yarar:
 * - SUBMITTED: Claim sent to insurance
 * - PROCESSING: Insurance is reviewing
 * - APPROVED: Claim approved for payment
 * - DENIED: Claim rejected
 * - PAID: Payment received
 * - APPEALED: Denial being appealed
 */
export type ClaimStatus = 
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'DENIED'
  | 'PAID'
  | 'APPEALED';

/**
 * Insurance Provider Information - Sigorta sağlayıcı bilgileri
 * Bu interface ne işe yarar:
 * - Insurance company details
 * - Contact information
 * - Payer ID for electronic claims
 * - Service area coverage
 */
export interface InsuranceProvider {
  id: string;
  name: string;                    // Insurance company name
  type: InsuranceProviderType;     // Provider type
  payerId: string;                 // Unique identifier for claims
  phone: string;                   // Customer service phone
  website: string;                 // Provider website
  claimsAddress: string;           // Claims mailing address
  electronicClaims: boolean;       // Supports EDI
  clearinghouse: string;           // Preferred clearinghouse
  serviceAreas: string[];          // States/regions covered
  specialties: string[];           // Medical specialties covered
}

/**
 * Insurance Coverage Information - Sigorta kapsam bilgileri
 * Bu interface ne işe yarar:
 * - Patient's specific coverage details
 * - Deductibles, copays, coinsurance
 * - Network status (in-network/out-of-network)
 * - Coverage limits and restrictions
 */
export interface InsuranceCoverage {
  id: string;
  clientId: string;
  providerId: string;
  policyNumber: string;            // Patient's policy number
  groupNumber: string;             // Employer/group number
  subscriberId: string;            // Primary subscriber ID
  relationship: string;            // Relationship to subscriber
  coverageType: CoverageType;     // Primary/Secondary/etc.
  effectiveDate: string;           // Coverage start date
  terminationDate?: string;        // Coverage end date
  
  // Benefits - Kapsam detayları
  deductible: number;              // Annual deductible amount
  deductibleMet: number;           // Amount already paid toward deductible
  copay: number;                   // Office visit copay
  coinsurance: number;             // Percentage patient pays (e.g., 20%)
  outOfPocketMax: number;          // Maximum out-of-pocket cost
  outOfPocketMet: number;          // Amount already paid toward max
  
  // Network Status - Ağ durumu
  inNetwork: boolean;              // Provider in network
  networkDiscount: number;         // Discount for in-network
  
  // Coverage Limits - Kapsam limitleri
  annualVisits: number;            // Maximum visits per year
  visitsUsed: number;              // Visits already used
  lifetimeMax?: number;            // Lifetime maximum benefit
  
  // Prior Authorization - Ön onay
  priorAuthRequired: boolean;      // Prior auth needed
  priorAuthNumber?: string;        // Authorization number
  priorAuthExpiry?: string;        // Authorization expiry date
}

/**
 * Insurance Claim - Sigorta talebi
 * Bu interface ne işe yarar:
 * - Claim submission details
 * - Service information
 * - Billing codes
 * - Claim status tracking
 */
export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  clientId: string;
  providerId: string;
  coverageId: string;
  
  // Claim Details - Talep detayları
  claimNumber: string;             // Unique claim identifier
  submissionDate: string;          // Date submitted
  serviceDate: string;             // Date of service
  status: ClaimStatus;             // Current claim status
  
  // Service Information - Hizmet bilgileri
  cptCodes: string[];              // Procedure codes
  icdCodes: string[];              // Diagnosis codes
  modifierCodes: string[];         // CPT modifiers
  posCode: string;                 // Place of service
  units: number;                   // Service units
  
  // Billing Information - Faturalama bilgileri
  billedAmount: number;            // Amount billed to insurance
  allowedAmount?: number;          // Amount insurance allows
  paidAmount?: number;             // Amount insurance paid
  patientResponsibility?: number;  // Amount patient owes
  
  // Claim Processing - Talep işleme
  submittedBy: string;             // User who submitted claim
  notes?: string;                  // Additional notes
  denialReason?: string;           // Reason for denial (if denied)
  appealDeadline?: string;         // Deadline to appeal denial
  
  // EDI Information - Elektronik veri değişimi bilgileri
  ediTransactionId?: string;       // EDI transaction ID
  clearinghouseResponse?: string;  // Response from clearinghouse
  insuranceResponse?: string;      // Response from insurance
}

/**
 * Eligibility Verification Request - Uygunluk doğrulama talebi
 * Bu interface ne işe yarar:
 * - Real-time eligibility check
 * - Coverage verification
 * - Benefit information retrieval
 */
export interface EligibilityRequest {
  clientId: string;
  coverageId: string;
  serviceDate: string;
  cptCode: string;
  icdCode: string;
  posCode: string;
  providerNpi: string;
}

/**
 * Eligibility Response - Uygunluk doğrulama yanıtı
 * Bu interface ne işe yarar:
 * - Coverage confirmation
 * - Benefit details
 * - Prior authorization requirements
 */
export interface EligibilityResponse {
  eligible: boolean;               // Coverage confirmed
  coverageType: CoverageType;      // Primary/Secondary/etc.
  deductible: number;              // Remaining deductible
  copay: number;                   // Office visit copay
  coinsurance: number;             // Patient responsibility %
  inNetwork: boolean;              // Network status
  priorAuthRequired: boolean;      // Prior auth needed
  priorAuthNumber?: string;        // Existing auth number
  coverageNotes?: string;          // Additional coverage info
  effectiveDate: string;           // Coverage start date
  terminationDate?: string;        // Coverage end date
}

/**
 * Insurance Integration Service - Ana sigorta entegrasyon servisi
 * Bu sınıf ne işe yarar:
 * - Insurance provider management
 * - Coverage verification
 * - Claim submission
 * - Status tracking
 */
export class InsuranceIntegrationService {
  private providers: Map<string, InsuranceProvider> = new Map();
  private coverages: Map<string, InsuranceCoverage> = new Map();
  private claims: Map<string, InsuranceClaim> = new Map();
  
  constructor() {
    this.initializeDefaultProviders();
  }
  
  /**
   * Default insurance providers'ı yükler
   * Bu fonksiyon ne işe yarar:
   * - Common insurance companies'ı sisteme ekler
   * - Payer ID'leri ve contact bilgilerini sağlar
   * - Development ve testing için sample data
   */
  private initializeDefaultProviders() {
    const defaultProviders: InsuranceProvider[] = [
      {
        id: 'bcbs',
        name: 'Blue Cross Blue Shield',
        type: 'COMMERCIAL',
        payerId: '00003',
        phone: '1-800-521-2227',
        website: 'https://www.bcbs.com',
        claimsAddress: 'PO Box 105247, Atlanta, GA 30348',
        electronicClaims: true,
        clearinghouse: 'Change Healthcare',
        serviceAreas: ['All States'],
        specialties: ['Mental Health', 'Behavioral Health']
      },
      {
        id: 'aetna',
        name: 'Aetna',
        type: 'COMMERCIAL',
        payerId: '60054',
        phone: '1-800-872-3862',
        website: 'https://www.aetna.com',
        claimsAddress: 'PO Box 14079, Lexington, KY 40512',
        electronicClaims: true,
        clearinghouse: 'Change Healthcare',
        serviceAreas: ['All States'],
        specialties: ['Mental Health', 'Behavioral Health']
      },
      {
        id: 'cigna',
        name: 'Cigna',
        type: 'COMMERCIAL',
        payerId: '00162',
        phone: '1-800-244-6224',
        website: 'https://www.cigna.com',
        claimsAddress: 'PO Box 188061, Chattanooga, TN 37422',
        electronicClaims: true,
        clearinghouse: 'Change Healthcare',
        serviceAreas: ['All States'],
        specialties: ['Mental Health', 'Behavioral Health']
      },
      {
        id: 'medicare',
        name: 'Medicare',
        type: 'MEDICARE',
        payerId: '00182',
        phone: '1-800-633-4227',
        website: 'https://www.medicare.gov',
        claimsAddress: 'Medicare Claims Processing, PO Box 1000, Hingham, MA 02043',
        electronicClaims: true,
        clearinghouse: 'Change Healthcare',
        serviceAreas: ['All States'],
        specialties: ['Mental Health', 'Behavioral Health']
      }
    ];
    
    defaultProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }
  
  /**
   * Insurance provider ekler
   * Bu fonksiyon ne işe yarar:
   * - New insurance companies'ı sisteme ekler
   * - Custom provider configuration
   * - Local/regional insurance companies
   */
  addProvider(provider: InsuranceProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  /**
   * Insurance provider'ı getirir
   * Bu fonksiyon ne işe yarar:
   * - Provider information retrieval
   * - Claims submission için gerekli bilgiler
   * - Contact information display
   */
  getProvider(providerId: string): InsuranceProvider | undefined {
    return this.providers.get(providerId);
  }
  
  /**
   * Tüm insurance providers'ı listeler
   * Bu fonksiyon ne işe yarar:
   * - Provider selection dropdown
   * - Insurance company management
   * - Coverage setup assistance
   */
  getAllProviders(): InsuranceProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * Client için insurance coverage ekler
   * Bu fonksiyon ne işe yarar:
   * - Patient insurance setup
   * - Coverage information management
   * - Benefit tracking
   */
  addCoverage(coverage: InsuranceCoverage): void {
    this.coverages.set(coverage.id, coverage);
  }
  
  /**
   * Client'ın insurance coverage'ını getirir
   * Bu fonksiyon ne işe yarar:
   * - Patient benefit verification
   * - Claims submission preparation
   * - Coverage status display
   */
  getClientCoverage(clientId: string): InsuranceCoverage[] {
    return Array.from(this.coverages.values())
      .filter(coverage => coverage.clientId === clientId);
  }
  
  /**
   * Real-time eligibility verification
   * Bu fonksiyon ne işe yarar:
   * - Coverage confirmation before service
   * - Benefit information retrieval
   * - Prior authorization requirements
   * - Patient cost estimation
   */
  async verifyEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
    // Bu fonksiyon şu anda mock implementation
    // Gerçek implementasyon için insurance API'leri kullanılır
    
    const coverage = this.coverages.get(request.coverageId);
    if (!coverage) {
      throw new Error('Coverage not found');
    }
    
    // Mock eligibility check
    const eligible = coverage.effectiveDate <= request.serviceDate && 
                    (!coverage.terminationDate || coverage.terminationDate >= request.serviceDate);
    
    return {
      eligible,
      coverageType: coverage.coverageType,
      deductible: Math.max(0, coverage.deductible - coverage.deductibleMet),
      copay: coverage.copay,
      coinsurance: coverage.coinsurance,
      inNetwork: coverage.inNetwork,
      priorAuthRequired: coverage.priorAuthRequired,
      priorAuthNumber: coverage.priorAuthNumber,
      coverageNotes: coverage.inNetwork ? 'In-network benefits apply' : 'Out-of-network benefits apply',
      effectiveDate: coverage.effectiveDate,
      terminationDate: coverage.terminationDate
    };
  }
  
  /**
   * Insurance claim oluşturur ve submit eder
   * Bu fonksiyon ne işe yarar:
   * - Claim generation from invoice
   * - Electronic submission to insurance
   * - Claim tracking setup
   * - Payment processing initiation
   */
  async submitClaim(invoice: Invoice, client: Client, coverage: InsuranceCoverage): Promise<InsuranceClaim> {
    // Claim oluştur
    const claim: InsuranceClaim = {
      id: `claim_${Date.now()}`,
      invoiceId: invoice.id,
      clientId: client.id,
      providerId: coverage.providerId,
      coverageId: coverage.id,
      claimNumber: `CLM${Date.now()}`,
      submissionDate: new Date().toISOString(),
      serviceDate: invoice.created_at.split('T')[0],
      status: 'SUBMITTED',
      cptCodes: invoice.cpt_codes || [invoice.cpt_code || '90834'],
      icdCodes: invoice.icd_codes || ['F32.9'],
      modifierCodes: invoice.modifier_codes || ['95'],
      posCode: invoice.pos_code || '02',
      units: 1,
      billedAmount: invoice.amount,
      submittedBy: 'system', // Gerçek implementasyonda user ID
      notes: 'Claim submitted via MindTrack system'
    };
    
    // Claim'i sisteme ekle
    this.claims.set(claim.id, claim);
    
    // Mock claim submission to insurance
    console.log(`Submitting claim ${claim.claimNumber} to insurance...`);
    
    // Gerçek implementasyonda:
    // 1. EDI claim format'ına çevir
    // 2. Clearinghouse'a gönder
    // 3. Insurance response'u al
    // 4. Claim status'u güncelle
    
    return claim;
  }
  
  /**
   * Claim status'u günceller
   * Bu fonksiyon ne işe yarar:
   * - Insurance response processing
   * - Claim status tracking
   * - Payment information updates
   * - Denial handling
   */
  async updateClaimStatus(claimId: string, status: ClaimStatus, additionalInfo?: Record<string, unknown>): Promise<void> {
    const claim = this.claims.get(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }
    
    claim.status = status;
    
    // Status-specific updates
    switch (status) {
      case 'APPROVED':
        claim.allowedAmount = additionalInfo?.allowedAmount;
        claim.patientResponsibility = additionalInfo?.patientResponsibility;
        break;
      case 'DENIED':
        claim.denialReason = additionalInfo?.denialReason;
        claim.appealDeadline = additionalInfo?.appealDeadline;
        break;
      case 'PAID':
        claim.paidAmount = additionalInfo?.paidAmount;
        claim.patientResponsibility = additionalInfo?.patientResponsibility;
        break;
    }
    
    this.claims.set(claimId, claim);
  }
  
  /**
   * Client'ın tüm claims'ini getirir
   * Bu fonksiyon ne işe yarar:
   * - Claim history display
   * - Payment tracking
   * - Denial management
   * - Financial reporting
   */
  getClientClaims(clientId: string): InsuranceClaim[] {
    return Array.from(this.claims.values())
      .filter(claim => claim.clientId === clientId)
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }
  
  /**
   * Claim'i getirir
   * Bu fonksiyon ne işe yarar:
   * - Individual claim details
   * - Status updates
   * - Payment information
   * - Appeal processing
   */
  getClaim(claimId: string): InsuranceClaim | undefined {
    return this.claims.get(claimId);
  }
  
  /**
   * Insurance claim'leri export eder
   * Bu fonksiyon ne işe yarar:
   * - Financial reporting
   * - Insurance reconciliation
   * - Audit preparation
   * - Data analysis
   */
  exportClaims(filters?: {
    status?: ClaimStatus;
    startDate?: string;
    endDate?: string;
    providerId?: string;
  }): InsuranceClaim[] {
    let claims = Array.from(this.claims.values());
    
    if (filters?.status) {
      claims = claims.filter(claim => claim.status === filters.status);
    }
    
    if (filters?.startDate) {
      claims = claims.filter(claim => claim.submissionDate >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      claims = claims.filter(claim => claim.submissionDate <= filters.endDate!);
    }
    
    if (filters?.providerId) {
      claims = claims.filter(claim => claim.providerId === filters.providerId);
    }
    
    return claims;
  }
}

/**
 * Insurance Integration Hook - React hook'u
 * Bu hook ne işe yarar:
 * - Component'lerde insurance integration
 * - Real-time eligibility checks
 * - Claim management
 * - Coverage information display
 */
export function useInsuranceIntegration() {
  const [service] = React.useState(() => new InsuranceIntegrationService());
  
  return {
    service,
    verifyEligibility: service.verifyEligibility.bind(service),
    submitClaim: service.submitClaim.bind(service),
    updateClaimStatus: service.updateClaimStatus.bind(service),
    getClientCoverage: service.getClientCoverage.bind(service),
    getClientClaims: service.getClientClaims.bind(service),
    getClaim: service.getClaim.bind(service),
    exportClaims: service.exportClaims.bind(service)
  };
}

// React import'u en üstte olmalı
import * as React from 'react';
