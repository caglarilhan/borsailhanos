"use client";

import * as React from "react";
// import { useTranslations } from "next-intl"; // Temporarily disabled
import type { Clinic, ClinicSettings, ClinicMember } from "@/types/clinic";
import ClinicMembers from "./clinic-members";

interface ClinicSettingsProps {
  clinic?: Clinic;
  onSave: (settings: ClinicSettings) => Promise<void>;
  loading?: boolean;
  members?: ClinicMember[];
  onInviteMember?: (email: string, role: 'admin' | 'therapist' | 'assistant') => Promise<void>;
  onUpdateMemberRole?: (memberId: string, role: 'admin' | 'therapist' | 'assistant') => Promise<void>;
  membersLoading?: boolean;
}

export default function ClinicSettings({ 
  clinic, 
  onSave, 
  loading = false, 
  members = [], 
  onInviteMember, 
  onUpdateMemberRole, 
  membersLoading = false 
}: ClinicSettingsProps) {
  // const t = useTranslations("clinic"); // Temporarily disabled
  const [formData, setFormData] = React.useState<ClinicSettings>({
    name: clinic?.name || "",
    description: clinic?.description || "",
    logo_url: clinic?.logo_url || "",
    primary_color: clinic?.primary_color || "#3B82F6",
    secondary_color: clinic?.secondary_color || "#1F2937",
    website_url: clinic?.website_url || "",
    phone: clinic?.phone || "",
    email: clinic?.email || "",
    address: clinic?.address || "",
    timezone: clinic?.timezone || "UTC",
    currency: clinic?.currency || "USD",
    // US Healthcare System fields
    npi: clinic?.npi || "",
    ein: clinic?.ein || "",
    taxonomy_code: clinic?.taxonomy_code || "",
    facility_npi: clinic?.facility_npi || "",
    license_number: clinic?.license_number || "",
    license_state: clinic?.license_state || "",
    license_expiry: clinic?.license_expiry || "",
    default_pos_code: clinic?.default_pos_code || "02",
    default_telehealth_modifier: clinic?.default_telehealth_modifier || "95",
    default_cpt_codes: clinic?.default_cpt_codes || ["90834", "90837"],
    default_icd_codes: clinic?.default_icd_codes || ["F32.9", "F41.9"],
    hipaa_notice_consent: clinic?.hipaa_notice_consent || false,
    tpo_consent: clinic?.tpo_consent || false,
    telehealth_consent: clinic?.telehealth_consent || false,
    sms_consent: clinic?.sms_consent || false,
    email_consent: clinic?.email_consent || false
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Clinic name is required";
    }
    if (!formData.primary_color) {
      newErrors.primary_color = "Primary color is required";
    }
    if (formData.npi && !/^\d{10}$/.test(formData.npi)) {
      newErrors.npi = "NPI must be exactly 10 digits";
    }
    if (formData.ein && !/^\d{2}-\d{7}$/.test(formData.ein)) {
      newErrors.ein = "EIN must be in format XX-XXXXXXX";
    }
    if (formData.license_state && formData.license_state.length !== 2) {
      newErrors.license_state = "State code must be 2 letters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Failed to save clinic settings:", error);
    }
  };

  const handleInputChange = (field: keyof ClinicSettings, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayInputChange = (field: 'default_cpt_codes' | 'default_icd_codes', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, array);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clinic Settings</h1>
        <p className="text-gray-600 mt-2">Manage your clinic information and US healthcare system requirements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Enter clinic name"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Brief description of your clinic"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => handleInputChange("website_url", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="clinic@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Full clinic address"
                  />
                </div>
              </div>
            </div>

            {/* US Healthcare System */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">US Healthcare System</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NPI (National Provider Identifier)
                    </label>
                    <input
                      type="text"
                      value={formData.npi}
                      onChange={(e) => handleInputChange("npi", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.npi ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="1234567890"
                      maxLength={10}
                    />
                    {errors.npi && <p className="text-red-600 text-sm mt-1">{errors.npi}</p>}
                    <p className="text-gray-500 text-xs mt-1">10-digit provider identifier</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EIN (Employer Identification Number)
                    </label>
                    <input
                      type="text"
                      value={formData.ein}
                      onChange={(e) => handleInputChange("ein", e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.ein ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="12-3456789"
                      maxLength={10}
                    />
                    {errors.ein && <p className="text-red-600 text-sm mt-1">{errors.ein}</p>}
                    <p className="text-gray-500 text-xs mt-1">Format: XX-XXXXXXX</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxonomy Code
                    </label>
                    <input
                      type="text"
                      value={formData.taxonomy_code}
                      onChange={(e) => handleInputChange("taxonomy_code", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="101Y00000X"
                    />
                    <p className="text-gray-500 text-xs mt-1">Healthcare provider taxonomy</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facility NPI
                    </label>
                    <input
                      type="text"
                      value={formData.facility_npi}
                      onChange={(e) => handleInputChange("facility_npi", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="1234567890"
                      maxLength={10}
                    />
                    <p className="text-gray-500 text-xs mt-1">For group practices</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange("license_number", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License State
                    </label>
                    <input
                      type="text"
                      value={formData.license_state}
                      onChange={(e) => handleInputChange("license_state", e.target.value.toUpperCase())}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.license_state ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="CA"
                      maxLength={2}
                    />
                    {errors.license_state && <p className="text-red-600 text-sm mt-1">{errors.license_state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => handleInputChange("license_expiry", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Billing & Preferences */}
          <div className="space-y-6">
            {/* Billing Defaults */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Billing Defaults</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default POS Code
                    </label>
                    <select
                      value={formData.default_pos_code}
                      onChange={(e) => handleInputChange("default_pos_code", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="02">02 - Telehealth</option>
                      <option value="11">11 - Office</option>
                      <option value="12">12 - Home</option>
                      <option value="13">13 - Assisted Living</option>
                    </select>
                    <p className="text-gray-500 text-xs mt-1">Place of Service code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telehealth Modifier
                    </label>
                    <select
                      value={formData.default_telehealth_modifier}
                      onChange={(e) => handleInputChange("default_telehealth_modifier", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="95">95 - Interactive</option>
                      <option value="GT">GT - Interactive</option>
                      <option value="GQ">GQ - Store and Forward</option>
                    </select>
                    <p className="text-gray-500 text-xs mt-1">CPT modifier for telehealth</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default CPT Codes
                  </label>
                  <input
                    type="text"
                    value={formData.default_cpt_codes.join(', ')}
                    onChange={(e) => handleArrayInputChange("default_cpt_codes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="90834, 90837"
                  />
                  <p className="text-gray-500 text-xs mt-1">Comma-separated CPT codes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default ICD-10 Codes
                  </label>
                  <input
                    type="text"
                    value={formData.default_icd_codes.join(', ')}
                    onChange={(e) => handleArrayInputChange("default_icd_codes", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="F32.9, F41.9"
                  />
                  <p className="text-gray-500 text-xs mt-1">Comma-separated ICD-10 codes</p>
                </div>
              </div>
            </div>

            {/* Consent Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Consent Settings</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'hipaa_notice_consent', label: 'HIPAA Notice of Privacy Practices', description: 'Required for all clients' },
                  { key: 'tpo_consent', label: 'Treatment/Payment/Operations Consent', description: 'For billing and treatment coordination' },
                  { key: 'telehealth_consent', label: 'Telehealth Services Consent', description: 'Required for virtual appointments' },
                  { key: 'sms_consent', label: 'SMS Communication Consent', description: 'For appointment reminders via text' },
                  { key: 'email_consent', label: 'Email Communication Consent', description: 'For appointment reminders via email' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={key}
                      checked={formData[key as keyof ClinicSettings] as boolean}
                      onChange={(e) => handleInputChange(key as keyof ClinicSettings, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor={key} className="text-sm font-medium text-gray-700 cursor-pointer">
                        {label}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Branding & Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Branding & Preferences</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange("logo_url", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange("primary_color", e.target.value)}
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange("primary_color", e.target.value)}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.primary_color ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="#3B82F6"
                      />
                    </div>
                    {errors.primary_color && <p className="text-red-600 text-sm mt-1">{errors.primary_color}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange("secondary_color", e.target.value)}
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange("secondary_color", e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="#1F2937"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange("timezone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Europe/Berlin">Berlin</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Members */}
        {clinic && onInviteMember && onUpdateMemberRole && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ClinicMembers
              members={members}
              onInviteMember={onInviteMember}
              onUpdateRole={onUpdateMemberRole}
              loading={membersLoading}
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
