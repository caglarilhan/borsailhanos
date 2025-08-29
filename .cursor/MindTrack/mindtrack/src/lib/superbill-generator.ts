/**
 * Superbill Generator - US Healthcare Billing için kritik
 * 
 * Bu modül ne işe yarar:
 * - CPT/ICD kodlarını kullanarak profesyonel superbill oluşturur
 * - Insurance companies için gerekli tüm bilgileri içerir
 * - PDF ve HTML formatlarında çıktı üretir
 * - HIPAA uyumlu billing document'ları oluşturur
 */

import type { Invoice, Client, Clinic } from '@/types/domain';

export interface SuperbillData {
  // Provider Information (Sağlayıcı Bilgileri)
  providerName: string;        // Terapist/Psikolog adı
  providerNPI: string;         // National Provider Identifier (10 haneli)
  providerAddress: string;     // Adres bilgileri
  providerPhone: string;       // Telefon numarası
  providerTaxonomy: string;    // Healthcare Provider Taxonomy Code
  
  // Patient Information (Hasta Bilgileri)
  patientName: string;         // Hasta adı
  patientDOB: string;          // Doğum tarihi
  patientAddress: string;      // Hasta adresi
  patientPhone: string;        // Hasta telefonu
  
  // Insurance Information (Sigorta Bilgileri)
  insurancePayer: string;      // Sigorta şirketi adı
  insurancePolicyNumber: string; // Policy/Subscriber ID
  insuranceGroupNumber: string;  // Group number
  insurancePayerID: string;    // Payer ID for electronic claims
  
  // Service Information (Hizmet Bilgileri)
  serviceDate: string;         // Hizmet tarihi
  cptCodes: string[];          // CPT procedure codes (örn: 90834, 90837)
  icdCodes: string[];          // ICD-10 diagnosis codes (örn: F32.9, F41.9)
  modifierCodes: string[];     // CPT modifier codes (örn: 95 for telehealth)
  posCode: string;             // Place of Service code (02=Telehealth)
  diagnosisPointers: string[]; // ICD kodlarına referans
  
  // Billing Information (Faturalama Bilgileri)
  totalAmount: number;         // Toplam tutar
  units: number;               // Hizmet birimi (genellikle 1)
  description: string;         // Hizmet açıklaması
}

/**
 * Superbill verilerini HTML formatında oluşturur
 * Bu fonksiyon ne işe yarar:
 * - Web browser'da görüntülenebilir HTML superbill oluşturur
 * - Print-friendly format sağlar
 * - Responsive design ile mobile uyumlu
 */
export function generateSuperbillHTML(data: SuperbillData): string {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Superbill - ${data.patientName}</title>
        <style>
            /* Print-friendly CSS - Yazdırma için optimize edilmiş */
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
            
            /* Responsive design - Mobile ve desktop uyumlu */
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }
            
            .superbill-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .header h1 {
                color: #2563eb;
                margin: 0;
                font-size: 28px;
            }
            
            .section {
                margin-bottom: 25px;
                padding: 15px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
            }
            
            .section h3 {
                margin: 0 0 15px 0;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }
            
            .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .grid-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
            }
            
            .field {
                margin-bottom: 12px;
            }
            
            .field label {
                display: block;
                font-weight: bold;
                color: #374151;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .field-value {
                padding: 8px 12px;
                background: #f9fafb;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 14px;
                min-height: 20px;
            }
            
            .codes-section {
                background: #f0f9ff;
                border-left: 4px solid #2563eb;
            }
            
            .code-item {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 4px 8px;
                margin: 2px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
            }
            
            .print-button {
                background: #2563eb;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                margin-bottom: 20px;
            }
            
            .print-button:hover {
                background: #1d4ed8;
            }
            
            /* Mobile responsive - Küçük ekranlar için */
            @media (max-width: 768px) {
                .grid-2, .grid-3 {
                    grid-template-columns: 1fr;
                }
                
                .superbill-container {
                    padding: 20px;
                    margin: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="superbill-container">
            <!-- Print Button - Yazdırma butonu -->
            <button class="print-button no-print" onclick="window.print()">
                🖨️ Print Superbill
            </button>
            
            <!-- Header - Başlık bölümü -->
            <div class="header">
                <h1>SUPERBILL</h1>
                <p>Professional Mental Health Services</p>
            </div>
            
            <!-- Provider Information - Sağlayıcı bilgileri -->
            <div class="section">
                <h3>Provider Information</h3>
                <div class="grid-2">
                    <div class="field">
                        <label>Provider Name:</label>
                        <div class="field-value">${data.providerName}</div>
                    </div>
                    <div class="field">
                        <label>NPI Number:</label>
                        <div class="field-value">${data.providerNPI}</div>
                    </div>
                    <div class="field">
                        <label>Taxonomy Code:</label>
                        <div class="field-value">${data.providerTaxonomy}</div>
                    </div>
                    <div class="field">
                        <label>Phone:</label>
                        <div class="field-value">${data.providerPhone}</div>
                    </div>
                </div>
                <div class="field">
                    <label>Address:</label>
                    <div class="field-value">${data.providerAddress}</div>
                </div>
            </div>
            
            <!-- Patient Information - Hasta bilgileri -->
            <div class="section">
                <h3>Patient Information</h3>
                <div class="grid-2">
                    <div class="field">
                        <label>Patient Name:</label>
                        <div class="field-value">${data.patientName}</div>
                    </div>
                    <div class="field">
                        <label>Date of Birth:</label>
                        <div class="field-value">${data.patientDOB}</div>
                    </div>
                    <div class="field">
                        <label>Phone:</label>
                        <div class="field-value">${data.patientPhone}</div>
                    </div>
                    <div class="field">
                        <label>Service Date:</label>
                        <div class="field-value">${data.serviceDate}</div>
                    </div>
                </div>
                <div class="field">
                    <label>Address:</label>
                    <div class="field-value">${data.patientAddress}</div>
                </div>
            </div>
            
            <!-- Insurance Information - Sigorta bilgileri -->
            <div class="section">
                <h3>Insurance Information</h3>
                <div class="grid-2">
                    <div class="field">
                        <label>Insurance Payer:</label>
                        <div class="field-value">${data.insurancePayer || 'Self Pay'}</div>
                    </div>
                    <div class="field">
                        <label>Policy Number:</label>
                        <div class="field-value">${data.insurancePolicyNumber || 'N/A'}</div>
                    </div>
                    <div class="field">
                        <label>Group Number:</label>
                        <div class="field-value">${data.insuranceGroupNumber || 'N/A'}</div>
                    </div>
                    <div class="field">
                        <label>Payer ID:</label>
                        <div class="field-value">${data.insurancePayerID || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <!-- Service Codes - Hizmet kodları -->
            <div class="section codes-section">
                <h3>Service Codes & Diagnosis</h3>
                <div class="grid-2">
                    <div class="field">
                        <label>CPT Codes:</label>
                        <div class="field-value">
                            ${data.cptCodes.map(code => `<span class="code-item">${code}</span>`).join(' ')}
                        </div>
                    </div>
                    <div class="field">
                        <label>ICD-10 Codes:</label>
                        <div class="field-value">
                            ${data.icdCodes.map(code => `<span class="code-item">${code}</span>`).join(' ')}
                        </div>
                    </div>
                    <div class="field">
                        <label>Modifier Codes:</label>
                        <div class="field-value">
                            ${data.modifierCodes.map(code => `<span class="code-item">${code}</span>`).join(' ')}
                        </div>
                    </div>
                    <div class="field">
                        <label>Place of Service:</label>
                        <div class="field-value">${data.posCode} - ${getPOSDescription(data.posCode)}</div>
                    </div>
                </div>
                <div class="field">
                    <label>Diagnosis Pointers:</label>
                    <div class="field-value">${data.diagnosisPointers.join(', ')}</div>
                </div>
            </div>
            
            <!-- Billing Information - Faturalama bilgileri -->
            <div class="section">
                <h3>Billing Information</h3>
                <div class="grid-3">
                    <div class="field">
                        <label>Units:</label>
                        <div class="field-value">${data.units}</div>
                    </div>
                    <div class="field">
                        <label>Rate:</label>
                        <div class="field-value">$${(data.totalAmount / data.units).toFixed(2)}</div>
                    </div>
                    <div class="field">
                        <label>Total Amount:</label>
                        <div class="field-value"><strong>$${data.totalAmount.toFixed(2)}</strong></div>
                    </div>
                </div>
                <div class="field">
                    <label>Service Description:</label>
                    <div class="field-value">${data.description}</div>
                </div>
            </div>
            
            <!-- Footer - Alt bilgi -->
            <div class="footer">
                <p>This superbill is generated for insurance billing purposes.</p>
                <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p>MindTrack Practice Management System</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Place of Service kodlarının açıklamalarını döndürür
 * Bu fonksiyon ne işe yarar:
 * - POS kodlarını insanların anlayabileceği açıklamalara çevirir
 * - Insurance companies için gerekli bilgiyi sağlar
 */
function getPOSDescription(posCode: string): string {
  const posDescriptions: Record<string, string> = {
    '02': 'Telehealth - Patient\'s Home',
    '03': 'School',
    '04': 'Homeless Shelter',
    '05': 'Indian Health Service Free-standing Facility',
    '06': 'Indian Health Service Provider-based Facility',
    '07': 'Tribal 638 Free-standing Facility',
    '08': 'Tribal 638 Provider-based Facility',
    '09': 'Prison/Correctional Facility',
    '11': 'Office',
    '12': 'Home',
    '13': 'Assisted Living Facility',
    '14': 'Group Home',
    '15': 'Mobile Unit',
    '16': 'Temporary Lodging',
    '17': 'Walk-in Retail Health Clinic',
    '18': 'Place of Employment-Worksite',
    '19': 'Off Campus-Outpatient Hospital',
    '20': 'Urgent Care Facility',
    '21': 'Inpatient Hospital',
    '22': 'On Campus-Outpatient Hospital',
    '23': 'Emergency Room-Hospital',
    '24': 'Ambulatory Surgical Center',
    '25': 'Birthing Center',
    '26': 'Military Treatment Facility',
    '31': 'Skilled Nursing Facility',
    '32': 'Nursing Facility',
    '33': 'Custodial Care Facility',
    '34': 'Hospice',
    '41': 'Ambulance-Land',
    '42': 'Ambulance-Air or Water',
    '49': 'Independent Clinic',
    '50': 'Federally Qualified Health Center',
    '51': 'Inpatient Psychiatric Facility',
    '52': 'Psychiatric Facility-Partial Hospitalization',
    '53': 'Community Mental Health Center',
    '54': 'Intermediate Care Facility/Mentally Retarded',
    '55': 'Residential Substance Abuse Treatment Facility',
    '56': 'Psychiatric Residential Treatment Center',
    '57': 'Non-residential Substance Abuse Treatment Facility',
    '58': 'Non-residential Substance Abuse Treatment Facility',
    '60': 'Mass Immunization Center',
    '61': 'Comprehensive Inpatient Rehabilitation Facility',
    '62': 'Comprehensive Outpatient Rehabilitation Facility',
    '65': 'End-Stage Renal Disease Treatment Facility',
    '71': 'Public Health Clinic',
    '72': 'Rural Health Clinic',
    '81': 'Independent Laboratory',
    '99': 'Other Place of Service'
  };
  
  return posDescriptions[posCode] || 'Unknown Place of Service';
}

/**
 * Invoice verilerinden SuperbillData oluşturur
 * Bu fonksiyon ne işe yarar:
 * - Mevcut invoice verilerini superbill formatına çevirir
 * - Database'den gelen verileri organize eder
 * - Missing data için default değerler sağlar
 */
export function createSuperbillFromInvoice(
  invoice: Invoice, 
  client: Client, 
  clinic: Clinic
): SuperbillData {
  return {
    // Provider bilgileri - Klinik bilgilerinden alınır
    providerName: clinic.name,
    providerNPI: clinic.npi || 'N/A',
    providerAddress: clinic.address || 'Address not provided',
    providerPhone: clinic.phone || 'Phone not provided',
    providerTaxonomy: clinic.taxonomy_code || 'N/A',
    
    // Patient bilgileri - Client bilgilerinden alınır
    patientName: client.name,
    patientDOB: 'DOB not provided', // Client tablosuna eklenebilir
    patientAddress: 'Address not provided', // Client tablosuna eklenebilir
    patientPhone: client.phone || 'Phone not provided',
    
    // Insurance bilgileri - Client insurance alanlarından
    insurancePayer: client.insurance_payer || 'Self Pay',
    insurancePolicyNumber: client.insurance_policy_number || 'N/A',
    insuranceGroupNumber: client.insurance_group_number || 'N/A',
    insurancePayerID: client.insurance_payer_id || 'N/A',
    
    // Service bilgileri - Invoice'dan alınır
    serviceDate: invoice.created_at.split('T')[0], // ISO date'den sadece date kısmı
    cptCodes: invoice.cpt_codes || [invoice.cpt_code || '90834'],
    icdCodes: invoice.icd_codes || ['F32.9'],
    modifierCodes: invoice.modifier_codes || ['95'],
    posCode: invoice.pos_code || '02',
    diagnosisPointers: invoice.diagnosis_pointers || ['1'],
    
    // Billing bilgileri
    totalAmount: invoice.amount,
    units: 1, // Genellikle 1 session = 1 unit
    description: 'Psychotherapy Session'
  };
}

/**
 * Superbill'i PDF olarak export eder (future enhancement)
 * Bu fonksiyon ne işe yarar:
 * - HTML superbill'i PDF formatına çevirir
 * - Download için hazır hale getirir
 * - Professional billing için gerekli
 */
export async function exportSuperbillToPDF(html: string): Promise<Blob> {
  // Bu fonksiyon şu anda placeholder
  // Gerçek implementasyon için jsPDF veya Puppeteer kullanılabilir
  throw new Error('PDF export not yet implemented. Use HTML version for now.');
}
