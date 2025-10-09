"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  WifiOff, 
  Wifi, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Database,
  FileText,
  Users,
  Calendar,
  Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { FormTemplate, FormSubmission } from "@/types/forms";

interface OfflineData {
  forms: FormTemplate[];
  submissions: FormSubmission[];
  clients: any[];
  appointments: any[];
  lastSync: string;
  pendingChanges: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  pendingUploads: number;
  pendingDownloads: number;
  errorCount: number;
}

export default function OfflineForms() {
  const { toast } = useToast();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  
  const [offlineData, setOfflineData] = React.useState<OfflineData | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: '',
    pendingUploads: 0,
    pendingDownloads: 0,
    errorCount: 0
  });
  const [loading, setLoading] = React.useState(false);

  // Check online status
  React.useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Auto-sync when coming back online
      if (offlineData && offlineData.pendingChanges > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineData]);

  // Load offline data from IndexedDB
  const loadOfflineData = React.useCallback(async () => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['forms', 'submissions', 'clients', 'appointments'], 'readonly');
      
      const forms = await transaction.objectStore('forms').getAll();
      const submissions = await transaction.objectStore('submissions').getAll();
      const clients = await transaction.objectStore('clients').getAll();
      const appointments = await transaction.objectStore('appointments').getAll();
      
      const lastSync = localStorage.getItem('lastSync') || '';
      
      setOfflineData({
        forms: forms || [],
        submissions: submissions || [],
        clients: clients || [],
        appointments: appointments || [],
        lastSync,
        pendingChanges: submissions.filter((s: any) => !s.synced).length
      });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, []);

  // Initialize IndexedDB
  const openIndexedDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MindTrackOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('forms')) {
          const formsStore = db.createObjectStore('forms', { keyPath: 'id' });
          formsStore.createIndex('clinic_id', 'clinic_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('submissions')) {
          const submissionsStore = db.createObjectStore('submissions', { keyPath: 'id' });
          submissionsStore.createIndex('form_template_id', 'form_template_id', { unique: false });
          submissionsStore.createIndex('client_id', 'client_id', { unique: false });
          submissionsStore.createIndex('synced', 'synced', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('clients')) {
          const clientsStore = db.createObjectStore('clients', { keyPath: 'id' });
          clientsStore.createIndex('clinic_id', 'clinic_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' });
          appointmentsStore.createIndex('client_id', 'client_id', { unique: false });
          appointmentsStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  };

  // Download data for offline use
  const downloadOfflineData = async () => {
    setLoading(true);
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['forms', 'clients', 'appointments'], 'readwrite');
      
      // Download forms
      const formsRes = await fetch('/api/forms/templates');
      if (formsRes.ok) {
        const formsData = await formsRes.json();
        const formsStore = transaction.objectStore('forms');
        for (const form of formsData.templates || []) {
          await formsStore.put(form);
        }
      }
      
      // Download clients
      const clientsRes = await fetch('/api/clients');
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        const clientsStore = transaction.objectStore('clients');
        for (const client of clientsData.clients || []) {
          await clientsStore.put(client);
        }
      }
      
      // Download appointments
      const appointmentsRes = await fetch('/api/appointments');
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        const appointmentsStore = transaction.objectStore('appointments');
        for (const appointment of appointmentsData.appointments || []) {
          await appointmentsStore.put(appointment);
        }
      }
      
      await transaction.complete;
      
      // Update last sync time
      localStorage.setItem('lastSync', new Date().toISOString());
      
      toast({
        title: "Success",
        description: "Offline data downloaded successfully!",
      });
      
      loadOfflineData();
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Error",
        description: "Failed to download offline data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync offline data with server
  const handleSync = async () => {
    if (!syncStatus.isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline. Please check your internet connection.",
        variant: "destructive",
      });
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['submissions'], 'readwrite');
      const submissionsStore = transaction.objectStore('submissions');
      const index = submissionsStore.index('synced');
      const pendingSubmissions = await index.getAll(false);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Upload pending submissions
      for (const submission of pendingSubmissions) {
        try {
          const res = await fetch('/api/forms/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission)
          });
          
          if (res.ok) {
            // Mark as synced
            submission.synced = true;
            await submissionsStore.put(submission);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Sync error for submission:', submission.id, error);
          errorCount++;
        }
      }
      
      await transaction.complete;
      
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        pendingUploads: 0,
        errorCount: prev.errorCount + errorCount
      }));
      
      // Update last sync time
      localStorage.setItem('lastSync', new Date().toISOString());
      
      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${successCount} submissions.`,
        });
      }
      
      if (errorCount > 0) {
        toast({
          title: "Sync Issues",
          description: `${errorCount} submissions failed to sync. They will be retried later.`,
          variant: "destructive",
        });
      }
      
      loadOfflineData();
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save form submission offline
  const saveSubmissionOffline = async (submission: FormSubmission) => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['submissions'], 'readwrite');
      const submissionsStore = transaction.objectStore('submissions');
      
      const offlineSubmission = {
        ...submission,
        id: submission.id || `offline_${Date.now()}`,
        synced: false,
        created_at: new Date().toISOString()
      };
      
      await submissionsStore.put(offlineSubmission);
      await transaction.complete;
      
      toast({
        title: "Saved Offline",
        description: "Form submission saved offline. It will sync when you're back online.",
      });
      
      loadOfflineData();
    } catch (error) {
      console.error('Failed to save offline:', error);
      toast({
        title: "Error",
        description: "Failed to save submission offline.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offline Forms</h2>
          <p className="text-gray-600">Work with forms even when offline</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={syncStatus.isOnline ? 'default' : 'secondary'}>
            {syncStatus.isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </Badge>
          {syncStatus.isSyncing && (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Syncing
            </Badge>
          )}
        </div>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{offlineData?.pendingChanges || 0}</div>
              <div className="text-sm text-gray-600">Pending Changes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{syncStatus.errorCount}</div>
              <div className="text-sm text-gray-600">Sync Errors</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 'Never'}
              </div>
              <div className="text-sm text-gray-600">Last Sync</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={downloadOfflineData} disabled={loading || !syncStatus.isOnline}>
                <Download className="h-4 w-4 mr-2" />
                Download Data
              </Button>
              <Button 
                onClick={handleSync} 
                disabled={loading || !syncStatus.isOnline || syncStatus.isSyncing}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
            
            {syncStatus.isSyncing && (
              <div className="flex items-center space-x-2">
                <Progress value={50} className="w-32" />
                <span className="text-sm text-gray-600">Syncing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Offline Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="forms" className="space-y-4">
            <TabsList>
              <TabsTrigger value="forms">Forms ({offlineData?.forms.length || 0})</TabsTrigger>
              <TabsTrigger value="submissions">Submissions ({offlineData?.submissions.length || 0})</TabsTrigger>
              <TabsTrigger value="clients">Clients ({offlineData?.clients.length || 0})</TabsTrigger>
              <TabsTrigger value="appointments">Appointments ({offlineData?.appointments.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="forms" className="space-y-2">
              {offlineData?.forms.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No forms available offline</p>
              ) : (
                offlineData?.forms.map((form) => (
                  <div key={form.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{form.name}</div>
                        <div className="text-sm text-gray-600">{form.description}</div>
                      </div>
                      <Badge variant={form.is_published ? 'default' : 'secondary'}>
                        {form.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="submissions" className="space-y-2">
              {offlineData?.submissions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No submissions offline</p>
              ) : (
                offlineData?.submissions.map((submission) => (
                  <div key={submission.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Submission #{submission.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(submission.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {submission.synced ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="clients" className="space-y-2">
              {offlineData?.clients.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No clients available offline</p>
              ) : (
                offlineData?.clients.map((client) => (
                  <div key={client.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.email}</div>
                      </div>
                      <Badge variant="outline">{client.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-2">
              {offlineData?.appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No appointments available offline</p>
              ) : (
                offlineData?.appointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{appointment.client_name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </div>
                      </div>
                      <Badge variant="outline">{appointment.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Offline Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Offline Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">How to Use Offline Forms</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Download data while online using the "Download Data" button</li>
                <li>Forms will be available offline for viewing and filling</li>
                <li>Submissions are saved locally when offline</li>
                <li>Data automatically syncs when you come back online</li>
                <li>Manual sync is available using the "Sync Now" button</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Offline Limitations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>New forms cannot be created offline</li>
                <li>Form templates cannot be modified offline</li>
                <li>Client data cannot be updated offline</li>
                <li>Appointments cannot be scheduled offline</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Storage Information</h4>
              <div className="text-sm text-gray-600">
                <p>Offline data is stored locally in your browser using IndexedDB.</p>
                <p>Data persists between browser sessions and app updates.</p>
                <p>You can clear offline data by clearing your browser's storage.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
