"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, Target, AlertTriangle, CheckCircle, XCircle, Clock, Calendar, User, Users,
  Settings, Plus, Download, Upload, RefreshCw, Save, Bell, BellOff, Shield, ShieldCheck,
  ShieldAlert, ShieldX, Lock, Unlock, Key, Eye, EyeOff, Database, Server, Activity,
  BarChart3, TrendingUp, TrendingDown, FileText, MapPin, Phone, Mail, MessageSquare,
  Info, HelpCircle, ExternalLink, Link, LinkBreak, GitBranch, Layers, Filter, Search,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Home, Menu, MoreVertical, X, Check, Star, Heart, ThumbsUp,
  ThumbsDown, Flag, Bookmark, Tag, Archive, Folder, File, FilePlus, FileMinus, FileEdit,
  FileSearch, FileDown, FileUp, FileShare, FileLock, FileUnlock, FileHeart, FileStar,
  FileAward, FileCrown, FileZap, FileTarget, FileShield, FileSettings, FileInfo, FileAlert,
  FileCheckCircle, FileXCircle, FilePlusCircle, FileMinusCircle, FileEditCircle, FileSearchCircle,
  FileDownCircle, FileUpCircle, FileShareCircle, FileLockCircle, FileUnlockCircle, FileHeartCircle,
  FileStarCircle, FileAwardCircle, FileCrownCircle, FileZapCircle, FileTargetCircle, FileShieldCircle,
  FileSettingsCircle, FileInfoCircle, FileAlertCircle, Zap, Globe, Cpu, Memory, HardDrive,
  Wifi, Cloud, BarChart, PieChart, LineChart, ScatterChart, AreaChart, Table, List, Grid,
  Columns, Rows, SortAsc, SortDesc
} from "lucide-react";

// Interfaces
interface Revenue {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  service: string;
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'insurance' | 'check' | 'online';
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  insuranceProvider?: string;
  copay?: number;
  deductible?: number;
  notes?: string;
}

interface Expense {
  id: string;
  date: string;
  category: 'office_supplies' | 'equipment' | 'software' | 'utilities' | 'rent' | 'insurance' | 'marketing' | 'professional_development' | 'other';
  description: string;
  amount: number;
  vendor: string;
  paymentMethod: 'credit_card' | 'check' | 'cash' | 'bank_transfer';
  status: 'paid' | 'pending' | 'approved' | 'rejected';
  receipt?: string;
  notes?: string;
}

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'on_track' | 'over_budget' | 'under_budget';
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  averageRevenuePerPatient: number;
  outstandingReceivables: number;
  cashFlow: number;
  monthlyGrowth: number;
  insuranceRevenue: number;
  selfPayRevenue: number;
  topRevenueSources: { source: string; amount: number; percentage: number }[];
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
}

// Mock Data
const mockRevenue: Revenue[] = [
  {
    id: "R001",
    date: "2024-12-14",
    patientId: "P001",
    patientName: "John Smith",
    service: "Psychiatric Evaluation",
    amount: 250,
    paymentMethod: "insurance",
    status: "paid",
    insuranceProvider: "Blue Cross Blue Shield",
    copay: 25,
    deductible: 0,
    notes: "Initial consultation"
  },
  {
    id: "R002",
    date: "2024-12-14",
    patientId: "P002",
    patientName: "Sarah Johnson",
    service: "Follow-up Session",
    amount: 150,
    paymentMethod: "credit_card",
    status: "paid",
    notes: "Regular follow-up"
  },
  {
    id: "R003",
    date: "2024-12-13",
    patientId: "P003",
    patientName: "Michael Brown",
    service: "Medication Management",
    amount: 200,
    paymentMethod: "insurance",
    status: "pending",
    insuranceProvider: "Aetna",
    copay: 30,
    deductible: 50,
    notes: "Medication adjustment"
  },
  {
    id: "R004",
    date: "2024-12-13",
    patientId: "P004",
    patientName: "Emily Davis",
    service: "Group Therapy Session",
    amount: 75,
    paymentMethod: "cash",
    status: "paid",
    notes: "Anxiety support group"
  },
  {
    id: "R005",
    date: "2024-12-12",
    patientId: "P005",
    patientName: "David Wilson",
    service: "Psychological Testing",
    amount: 500,
    paymentMethod: "check",
    status: "overdue",
    notes: "ADHD assessment"
  }
];

const mockExpenses: Expense[] = [
  {
    id: "E001",
    date: "2024-12-14",
    category: "software",
    description: "Practice Management Software License",
    amount: 299,
    vendor: "MindTrack Pro",
    paymentMethod: "credit_card",
    status: "paid",
    notes: "Monthly subscription"
  },
  {
    id: "E002",
    date: "2024-12-13",
    category: "office_supplies",
    description: "Office Supplies",
    amount: 85.50,
    vendor: "Staples",
    paymentMethod: "credit_card",
    status: "paid",
    notes: "Paper, pens, folders"
  },
  {
    id: "E003",
    date: "2024-12-12",
    category: "utilities",
    description: "Electricity Bill",
    amount: 245.75,
    vendor: "Local Power Company",
    paymentMethod: "bank_transfer",
    status: "paid",
    notes: "December electricity"
  },
  {
    id: "E004",
    date: "2024-12-11",
    category: "marketing",
    description: "Google Ads Campaign",
    amount: 150,
    vendor: "Google",
    paymentMethod: "credit_card",
    status: "pending",
    notes: "Online advertising"
  },
  {
    id: "E005",
    date: "2024-12-10",
    category: "professional_development",
    description: "CME Conference Registration",
    amount: 450,
    vendor: "American Psychiatric Association",
    paymentMethod: "credit_card",
    status: "approved",
    notes: "Annual conference"
  }
];

const mockBudgets: Budget[] = [
  {
    id: "B001",
    category: "Office Supplies",
    allocated: 500,
    spent: 385.50,
    remaining: 114.50,
    period: "monthly",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "on_track"
  },
  {
    id: "B002",
    category: "Software & Technology",
    allocated: 1000,
    spent: 899,
    remaining: 101,
    period: "monthly",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "on_track"
  },
  {
    id: "B003",
    category: "Marketing",
    allocated: 800,
    spent: 950,
    remaining: -150,
    period: "monthly",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "over_budget"
  },
  {
    id: "B004",
    category: "Professional Development",
    allocated: 600,
    spent: 450,
    remaining: 150,
    period: "monthly",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "under_budget"
  }
];

const mockFinancialMetrics: FinancialMetrics = {
  totalRevenue: 1175,
  totalExpenses: 1230.25,
  netIncome: -55.25,
  profitMargin: -4.7,
  averageRevenuePerPatient: 235,
  outstandingReceivables: 700,
  cashFlow: 944.75,
  monthlyGrowth: 12.5,
  insuranceRevenue: 450,
  selfPayRevenue: 725,
  topRevenueSources: [
    { source: "Insurance", amount: 450, percentage: 38.3 },
    { source: "Self-Pay", amount: 725, percentage: 61.7 }
  ],
  expenseBreakdown: [
    { category: "Software & Technology", amount: 299, percentage: 24.3 },
    { category: "Office Supplies", amount: 85.50, percentage: 6.9 },
    { category: "Utilities", amount: 245.75, percentage: 20.0 },
    { category: "Marketing", amount: 150, percentage: 12.2 },
    { category: "Professional Development", amount: 450, percentage: 36.6 }
  ]
};

// Utility Functions
const getPaymentMethodColor = (method: string) => {
  switch (method) {
    case 'cash': return 'bg-green-500 text-white';
    case 'credit_card': return 'bg-blue-500 text-white';
    case 'insurance': return 'bg-purple-500 text-white';
    case 'check': return 'bg-orange-500 text-white';
    case 'online': return 'bg-indigo-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-500 text-white';
    case 'pending': return 'bg-yellow-500 text-black';
    case 'overdue': return 'bg-red-500 text-white';
    case 'cancelled': return 'bg-gray-500 text-white';
    case 'approved': return 'bg-green-500 text-white';
    case 'rejected': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getBudgetStatusColor = (status: string) => {
  switch (status) {
    case 'on_track': return 'bg-green-500 text-white';
    case 'over_budget': return 'bg-red-500 text-white';
    case 'under_budget': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getExpenseCategoryColor = (category: string) => {
  switch (category) {
    case 'office_supplies': return 'bg-blue-500 text-white';
    case 'equipment': return 'bg-purple-500 text-white';
    case 'software': return 'bg-indigo-500 text-white';
    case 'utilities': return 'bg-orange-500 text-white';
    case 'rent': return 'bg-red-500 text-white';
    case 'insurance': return 'bg-green-500 text-white';
    case 'marketing': return 'bg-pink-500 text-white';
    case 'professional_development': return 'bg-teal-500 text-white';
    case 'other': return 'bg-gray-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const filteredRevenue = mockRevenue.filter(revenue => {
    const matchesSearch = revenue.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revenue.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPaymentMethod = selectedPaymentMethod === "all" || revenue.paymentMethod === selectedPaymentMethod;
    const matchesStatus = selectedStatus === "all" || revenue.status === selectedStatus;
    
    return matchesSearch && matchesPaymentMethod && matchesStatus;
  });

  const totalRevenue = mockFinancialMetrics.totalRevenue;
  const totalExpenses = mockFinancialMetrics.totalExpenses;
  const netIncome = mockFinancialMetrics.netIncome;
  const profitMargin = mockFinancialMetrics.profitMargin;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 via-white to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            Financial Management
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive financial management and reporting for psychiatric practice
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Secure
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            HIPAA Compliant
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">+{mockFinancialMetrics.monthlyGrowth}% this month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">Monthly expenses</p>
          </CardContent>
        </Card>
        
        <Card className={`${netIncome >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${netIncome.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">{profitMargin}% margin</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockFinancialMetrics.cashFlow.toLocaleString()}</div>
            <p className="text-xs opacity-75 mt-1">Available cash</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue vs Expenses
                </CardTitle>
                <CardDescription>
                  Monthly financial comparison
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue</span>
                    <div className="flex items-center gap-2">
                      <Progress value={100} className="w-20" />
                      <span className="text-sm font-medium">${totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expenses</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(totalExpenses / totalRevenue) * 100} className="w-20" />
                      <span className="text-sm font-medium">${totalExpenses.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net Income</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${netIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Sources
                </CardTitle>
                <CardDescription>
                  Breakdown by payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mockFinancialMetrics.topRevenueSources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={source.percentage} className="w-20" />
                        <span className="text-sm font-medium">${source.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Expense Breakdown
              </CardTitle>
              <CardDescription>
                Monthly expense categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFinancialMetrics.expenseBreakdown.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{expense.category}</h3>
                        <p className="text-xs text-gray-600">{expense.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${expense.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">{expense.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Management</CardTitle>
              <CardDescription>
                Track and manage patient payments and insurance claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Search Revenue</label>
                  <Input
                    placeholder="Search by patient name or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <select 
                      value={selectedPaymentMethod} 
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="insurance">Insurance</option>
                      <option value="check">Check</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-32 mt-1 p-2 border rounded-md text-sm"
                    >
                      <option value="all">All</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue List */}
          <div className="grid gap-4">
            {filteredRevenue.map((revenue) => (
              <Card key={revenue.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{revenue.patientName}</h3>
                          <Badge className={getPaymentMethodColor(revenue.paymentMethod)}>
                            {revenue.paymentMethod.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(revenue.status)}>
                            {revenue.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">Service: {revenue.service}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Amount:</span>
                            <p className="text-gray-600">${revenue.amount}</p>
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>
                            <p className="text-gray-600">{revenue.date}</p>
                          </div>
                          {revenue.insuranceProvider && (
                            <div>
                              <span className="font-medium">Insurance:</span>
                              <p className="text-gray-600">{revenue.insuranceProvider}</p>
                            </div>
                          )}
                          {revenue.copay && (
                            <div>
                              <span className="font-medium">Copay:</span>
                              <p className="text-gray-600">${revenue.copay}</p>
                            </div>
                          )}
                        </div>
                        {revenue.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span>
                            <p className="text-gray-600">{revenue.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Expense Management
              </CardTitle>
              <CardDescription>
                Track and categorize practice expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockExpenses.map((expense) => (
                  <div key={expense.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{expense.description}</h3>
                          <p className="text-gray-600">{expense.vendor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getExpenseCategoryColor(expense.category)}>
                          {expense.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-gray-600">${expense.amount}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-gray-600">{expense.date}</p>
                      </div>
                      <div>
                        <span className="font-medium">Payment Method:</span>
                        <p className="text-gray-600">{expense.paymentMethod.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    {expense.notes && (
                      <div className="mb-4">
                        <span className="font-medium">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Budget Management
              </CardTitle>
              <CardDescription>
                Monitor budget allocation and spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockBudgets.map((budget) => (
                  <div key={budget.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">{budget.category}</h3>
                          <p className="text-gray-600">{budget.period} budget</p>
                        </div>
                      </div>
                      <Badge className={getBudgetStatusColor(budget.status)}>
                        {budget.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">${budget.allocated.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Allocated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">${budget.spent.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Spent</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${budget.remaining.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Budget Progress</span>
                        <span className="text-sm text-gray-600">{((budget.spent / budget.allocated) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(budget.spent / budget.allocated) * 100} className="w-full" />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span>Period: {budget.startDate} to {budget.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
                <CardDescription>
                  Key financial metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Revenue per Patient</span>
                    <span className="text-sm font-medium">${mockFinancialMetrics.averageRevenuePerPatient}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Outstanding Receivables</span>
                    <span className="text-sm font-medium">${mockFinancialMetrics.outstandingReceivables}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Growth</span>
                    <span className="text-sm font-medium text-green-600">+{mockFinancialMetrics.monthlyGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className={`text-sm font-medium ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitMargin}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common financial tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Add Revenue</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <TrendingDown className="h-5 w-5" />
                    <span className="text-sm">Add Expense</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <FileDown className="h-5 w-5" />
                    <span className="text-sm">Export Report</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <Target className="h-5 w-5" />
                    <span className="text-sm">Set Budget</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




