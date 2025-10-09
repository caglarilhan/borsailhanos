"use client";

import * as React from "react";
import { useClientPortal } from "@/hooks/useClientPortal";

interface ClientPortalHookProps {
  patientId: string;
}

export function useClientPortal({ patientId }: ClientPortalHookProps) {
  const [loading, setLoading] = React.useState(false);
  const [patientData, setPatientData] = React.useState<any>(null);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [medications, setMedications] = React.useState<any[]>([]);
  const [labResults, setLabResults] = React.useState<any[]>([]);

  // Fetch patient data
  const fetchPatientData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portal/patient?patientId=${patientId}&type=all`);
      const result = await response.json();
      
      if (result.success) {
        setPatientData(result.data.patient);
        setAppointments(result.data.appointments);
        setMedications(result.data.medications);
        setLabResults(result.data.labResults);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to fetch patient data:', error);
      return { success: false, error: 'Failed to fetch patient data' };
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Update patient profile
  const updateProfile = React.useCallback(async (profileData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/portal/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-profile',
          patientId,
          data: profileData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPatientData(prev => ({ ...prev, ...profileData }));
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Request appointment
  const requestAppointment = React.useCallback(async (appointmentData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/portal/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request-appointment',
          patientId,
          data: appointmentData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh appointments
        await fetchPatientData();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to request appointment:', error);
      return { success: false, error: 'Failed to request appointment' };
    } finally {
      setLoading(false);
    }
  }, [patientId, fetchPatientData]);

  // Update medication adherence
  const updateMedicationAdherence = React.useCallback(async (medicationId: string, adherenceData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/portal/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-medication-adherence',
          patientId,
          data: {
            medicationId,
            ...adherenceData
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh medications
        await fetchPatientData();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update medication adherence:', error);
      return { success: false, error: 'Failed to update medication adherence' };
    } finally {
      setLoading(false);
    }
  }, [patientId, fetchPatientData]);

  // Download document
  const downloadDocument = React.useCallback(async (documentId: string) => {
    try {
      const response = await fetch('/api/portal/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download-document',
          patientId,
          data: { documentId }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Open download URL
        window.open(result.downloadUrl, '_blank');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to download document:', error);
      return { success: false, error: 'Failed to download document' };
    }
  }, [patientId]);

  // Fetch specific data type
  const fetchData = React.useCallback(async (type: 'appointments' | 'medications' | 'lab-results') => {
    try {
      const response = await fetch(`/api/portal/patient?patientId=${patientId}&type=${type}`);
      const result = await response.json();
      
      if (result.success) {
        switch (type) {
          case 'appointments':
            setAppointments(result.data);
            break;
          case 'medications':
            setMedications(result.data);
            break;
          case 'lab-results':
            setLabResults(result.data);
            break;
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      return { success: false, error: `Failed to fetch ${type}` };
    }
  }, [patientId]);

  // Load data on mount
  React.useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, fetchPatientData]);

  return {
    loading,
    patientData,
    appointments,
    medications,
    labResults,
    fetchPatientData,
    updateProfile,
    requestAppointment,
    updateMedicationAdherence,
    downloadDocument,
    fetchData
  };
}










