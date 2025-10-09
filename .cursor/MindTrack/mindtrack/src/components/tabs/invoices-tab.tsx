/**
 * Enhanced Invoices Tab - Professional billing management interface
 * 
 * Bu component ne işe yarar:
 * - Invoice management ve tracking
 * - Superbill generation integration
 * - Professional billing interface
 * - US Healthcare billing support
 * - Advanced billing features
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
import { 
  Plus, 
  DollarSign, 
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
  TrendingUp,
  Filter,
  Search
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import SuperbillModal from "@/components/superbill/superbill-modal";
import type { Invoice, Client, Clinic } from "@/types/domain";
import { createSuperbillFromInvoice, type SuperbillData } from "@/lib/superbill-generator";

/**
 * Invoice Tab State - Component state'i
 * Bu interface ne işe yarar:
 * - Component'in internal state'ini yönetir
 * - Data ve UI state'ini tutar
 * - User interaction'ları track eder
 */
interface InvoicesTabState {
  // Data State - Veri durumu
  invoices: Invoice[];
  clients: Client[];
  clinic: Clinic | null;
  
  // Form State - Form durumu
  clientId: string;
  amount: string;
  cptCode: string;
  description: string;
  
  // UI State - UI durumu
  loading: boolean;
  error: string | null;
  success: string | null;
  
  // Modal State - Modal durumu
  isSuperbillModalOpen: boolean;
  selectedInvoice: Invoice | null;
  
  // Filter State - Filtre durumu
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
}

/**
 * Enhanced Invoices Tab Component - Ana component
 * Bu component ne işe yarar:
 * - Professional invoice management
 * - Superbill generation integration
 * - Advanced billing features
 * - User experience optimization
 */
export default function InvoicesTab() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  
  /**
   * Component state'ini initialize eder
   * Bu state ne işe yarar:
   * - Invoice ve client verilerini tutar
   * - Form data'yı yönetir
   * - UI interactions'ı track eder
   */
  const [state, setState] = React.useState<InvoicesTabState>({
    invoices: [],
    clients: [],
    clinic: null,
    clientId: "",
    amount: "",
    cptCode: "",
    description: "",
    loading: false,
    error: null,
    success: null,
    isSuperbillModalOpen: false,
    selectedInvoice: null,
    searchTerm: "",
    statusFilter: "all",
    dateFilter: "all"
  });

  /**
   * Tüm verileri fetch eder
   * Bu fonksiyon ne işe yarar:
   * - Invoices ve clients'ı database'den çeker
   * - Clinic bilgilerini alır
   * - Data synchronization sağlar
   */
  const fetchAll = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [invoicesResult, clientsResult, clinicResult] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, owner_id, client_id, amount, cpt_code, pdf_url, status, created_at, cpt_codes, icd_codes, modifier_codes, pos_code, diagnosis_pointers")
          .order("created_at", { ascending: false }),
        
        supabase
          .from("clients")
          .select("id, name, email, phone, insurance_payer, insurance_policy_number")
          .order("name", { ascending: true }),
        
        supabase
          .from("clinics")
          .select("*")
          .eq("id", (await supabase.auth.getUser()).data.user?.id)
          .single()
      ]);

      if (invoicesResult.error) throw invoicesResult.error;
      if (clientsResult.error) throw clientsResult.error;

      setState(prev => ({
        ...prev,
        invoices: (invoicesResult.data as unknown as Invoice[]) ?? [],
        clients: (clientsResult.data as unknown as Client[]) ?? [],
        clinic: clinicResult.data as Clinic,
        loading: false
      }));

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load data";
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [supabase]);

  /**
   * Component mount'ta verileri yükler
   * Bu useEffect ne işe yarar:
   * - Initial data loading
   * - Component lifecycle management
   * - Data synchronization
   */
  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /**
   * Yeni invoice ekler
   * Bu fonksiyon ne işe yarar:
   * - Invoice creation
   * - Form validation
   * - Database insertion
   * - User feedback
   */
  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(state.amount);
    if (!state.clientId || !amount || amount <= 0) {
      setState(prev => ({ ...prev, error: "Please fill all required fields with valid values" }));
      return;
    }

    try {
      const { error: err } = await supabase
        .from("invoices")
        .insert({ 
          client_id: state.clientId, 
          amount: amount, 
          cpt_code: state.cptCode || null,
          description: state.description || null
        });

      if (err) throw err;

      // Form'u reset et ve success message göster
      setState(prev => ({
        ...prev,
        clientId: "",
        amount: "",
        cptCode: "",
        description: "",
        success: "Invoice created successfully!"
      }));

      // Verileri yeniden yükle
      fetchAll();

      // Success message'ı 3 saniye sonra kaldır
      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to create invoice";
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  /**
   * Invoice status'unu günceller
   * Bu fonksiyon ne işe yarar:
   * - Status updates (paid, void)
   * - Database synchronization
   * - User feedback
   */
  const handleUpdateStatus = async (invoiceId: string, newStatus: 'paid' | 'void') => {
    try {
      const { error: err } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", invoiceId);

      if (err) throw err;

      setState(prev => ({
        ...prev,
        success: `Invoice marked as ${newStatus}!`
      }));

      fetchAll();

      setTimeout(() => {
        setState(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to update status";
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  /**
   * Superbill modal'ını açar
   * Bu fonksiyon ne işe yarar:
   * - Superbill generation modal'ını açar
   * - Selected invoice'u set eder
   * - User experience'i iyileştirir
   */
  const handleOpenSuperbillModal = (invoice: Invoice) => {
    setState(prev => ({
      ...prev,
      isSuperbillModalOpen: true,
      selectedInvoice: invoice
    }));
  };

  /**
   * Seçili invoice için Superbill PDF indirir
   * - SuperbillData oluşturup /api/superbill'a gönderir
   * - Dönen PDF'i indirir
   */
  const handleDownloadSuperbillPdf = async (invoice: Invoice) => {
    try {
      const client = state.clients.find(c => c.id === invoice.client_id);
      if (!client || !state.clinic) {
        setState(prev => ({ ...prev, error: "Client veya clinic bilgisi eksik" }));
        return;
      }
      const data: SuperbillData = createSuperbillFromInvoice(
        invoice as unknown as any,
        client as unknown as any,
        state.clinic as unknown as any
      );
      const response = await fetch('/api/superbill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'data', superbill: data })
      });
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `superbill-${client.name}-${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setState(prev => ({ ...prev, success: 'Superbill PDF indirildi!' }));
      setTimeout(() => setState(prev => ({ ...prev, success: null })), 3000);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'PDF indirilemedi';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  /**
   * Superbill modal'ını kapatır
   * Bu fonksiyon ne işe yarar:
   * - Modal'ı kapatır
   * - State'i reset eder
   * - Clean up yapar
   */
  const handleCloseSuperbillModal = () => {
    setState(prev => ({
      ...prev,
      isSuperbillModalOpen: false,
      selectedInvoice: null
    }));
  };

  /**
   * Filtered invoices'ları hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Search ve filter functionality
   * - Dynamic data filtering
   * - User experience optimization
   */
  const getFilteredInvoices = () => {
    let filtered = state.invoices;

    // Search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => {
        const client = state.clients.find(c => c.id === invoice.client_id);
        return client?.name.toLowerCase().includes(searchLower) ||
               invoice.id.toLowerCase().includes(searchLower) ||
               invoice.cpt_code?.toLowerCase().includes(searchLower);
      });
    }

    // Status filter
    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === state.statusFilter);
    }

    // Date filter
    if (state.dateFilter !== 'all') {
      const now = new Date();
      const invoiceDate = new Date();
      
      switch (state.dateFilter) {
        case 'today':
          filtered = filtered.filter(invoice => {
            const invDate = new Date(invoice.created_at);
            return invDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(invoice => {
            const invDate = new Date(invoice.created_at);
            return invDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(invoice => {
            const invDate = new Date(invoice.created_at);
            return invDate >= monthAgo;
          });
          break;
      }
    }

    return filtered;
  };

  /**
   * Invoice statistics'lerini hesaplar
   * Bu fonksiyon ne işe yarar:
   * - Business metrics calculation
   * - Financial overview
   * - Dashboard insights
   */
  const getInvoiceStats = () => {
    const totalInvoices = state.invoices.length;
    const totalAmount = state.invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const paidInvoices = state.invoices.filter(inv => inv.status === 'paid').length;
    const paidAmount = state.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    const pendingAmount = totalAmount - paidAmount;

    return {
      totalInvoices,
      totalAmount,
      paidInvoices,
      paidAmount,
      pendingAmount,
      paidPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  };

  /**
   * Form UI'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Professional form interface
   * - User input controls
   * - Form validation
   */
  const renderAddInvoiceForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          Add New Invoice
        </CardTitle>
        <CardDescription>
          Create a new invoice for billing purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select
                value={state.clientId}
                onValueChange={(value) => setState(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {state.clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={state.amount}
                onChange={(e) => setState(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cptCode">CPT Code</Label>
              <Input
                id="cptCode"
                value={state.cptCode}
                onChange={(e) => setState(prev => ({ ...prev, cptCode: e.target.value }))}
                placeholder="e.g. 90834"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={state.description}
                onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Service description"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  /**
   * Statistics cards'larını render eder
   * Bu fonksiyon ne işe yarar:
   * - Business metrics display
   * - Financial overview
   * - Visual data representation
   */
  const renderStatisticsCards = () => {
    const stats = getInvoiceStats();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-blue-600">${stats.paidAmount.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">${stats.pendingAmount.toFixed(2)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /**
   * Filters UI'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Search ve filter controls
   * - Data filtering functionality
   * - User experience optimization
   */
  const renderFilters = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search invoices..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <Label htmlFor="statusFilter" className="text-sm font-medium">Status</Label>
            <Select
              value={state.statusFilter}
              onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Label htmlFor="dateFilter" className="text-sm font-medium">Date Range</Label>
            <Select
              value={state.dateFilter}
              onValueChange={(value) => setState(prev => ({ ...prev, dateFilter: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Invoices table'ını render eder
   * Bu fonksiyon ne işe yarar:
   * - Invoice data display
   * - Action buttons
   * - Professional table interface
   */
  const renderInvoicesTable = () => {
    const filteredInvoices = getFilteredInvoices();
    
    if (filteredInvoices.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">
              {state.searchTerm || state.statusFilter !== 'all' || state.dateFilter !== 'all'
                ? "Try adjusting your filters or search terms"
                : "Create your first invoice to get started"
              }
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">Client</th>
                  <th className="text-left p-3 font-medium text-gray-700">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-700">CPT Code</th>
                  <th className="text-left p-3 font-medium text-gray-700">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700">Created</th>
                  <th className="text-right p-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const client = state.clients.find(c => c.id === invoice.client_id);
                  return (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{client?.name ?? 'Unknown Client'}</span>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <span className="font-medium text-green-600">
                          ${Number(invoice.amount).toFixed(2)}
                        </span>
                      </td>
                      
                      <td className="p-3">
                        {invoice.cpt_code ? (
                          <Badge variant="outline" className="text-xs">
                            {invoice.cpt_code}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td className="p-3">
                        <Badge 
                          variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'void' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      
                      <td className="p-3 text-gray-600">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleOpenSuperbillModal(invoice)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Superbill
                          </Button>

                          <Button
                            onClick={() => handleDownloadSuperbillPdf(invoice)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                          
                          {invoice.status === 'unpaid' && (
                            <>
                              <Button
                                onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </Button>
                              
                              <Button
                                onClick={() => handleUpdateStatus(invoice.id, 'void')}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Void
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Main component render
   * Bu render ne işe yarar:
   * - Professional layout structure
   * - Component organization
   * - User experience optimization
   */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
          <p className="text-gray-600">
            Manage invoices and generate superbills for insurance claims
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Add Invoice Form */}
      {renderAddInvoiceForm()}

      {/* Filters */}
      {renderFilters()}

      {/* Error & Success Messages */}
      {state.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5" />
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-5 w-5" />
          {state.success}
        </div>
      )}

      {/* Loading State */}
      {state.loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </CardContent>
        </Card>
      ) : (
        /* Invoices Table */
        renderInvoicesTable()
      )}

      {/* Superbill Modal */}
      {state.selectedInvoice && state.clinic && (
        <SuperbillModal
          isOpen={state.isSuperbillModalOpen}
          onClose={handleCloseSuperbillModal}
          invoice={state.selectedInvoice}
          client={state.clients.find(c => c.id === state.selectedInvoice?.client_id)!}
          clinic={state.clinic}
          onSuperbillGenerated={(superbillData) => {
            console.log('Superbill generated:', superbillData);
            setState(prev => ({ ...prev, success: 'Superbill generated successfully!' }));
          }}
          onSuperbillPrinted={(html) => {
            console.log('Superbill printed:', html);
            setState(prev => ({ ...prev, success: 'Superbill sent to printer!' }));
          }}
          onSuperbillDownloaded={(html) => {
            console.log('Superbill downloaded:', html);
            setState(prev => ({ ...prev, success: 'Superbill downloaded successfully!' }));
          }}
        />
      )}
    </div>
  );
}


