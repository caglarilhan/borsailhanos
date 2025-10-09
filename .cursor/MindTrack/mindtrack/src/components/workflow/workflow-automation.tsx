'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Workflow, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Send, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Settings,
  Users,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Zap,
  Timer,
  Repeat,
  Target
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'appointment_reminder' | 'payment_followup' | 'intake_automation' | 'custom';
  triggerConditions: any;
  actions: WorkflowAction[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'send_sms' | 'send_notification' | 'create_task' | 'update_status' | 'schedule_followup';
  config: any;
  delay?: number; // in minutes
  order: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggerData: any;
  executionLog: WorkflowExecutionLog[];
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

interface WorkflowExecutionLog {
  id: string;
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  timestamp: string;
  errorMessage?: string;
}

interface WorkflowAutomationProps {
  userId: string;
}

export default function WorkflowAutomation({ userId }: WorkflowAutomationProps) {
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'templates'>('rules');

  useEffect(() => {
    loadWorkflowRules();
    loadWorkflowExecutions();
  }, [userId]);

  const loadWorkflowRules = async () => {
    try {
      const response = await fetch('/api/workflow/rules');
      if (response.ok) {
        const data = await response.json();
        setWorkflowRules(data.rules || []);
      }
    } catch (error) {
      console.error('Error loading workflow rules:', error);
    }
  };

  const loadWorkflowExecutions = async () => {
    try {
      const response = await fetch('/api/workflow/executions');
      if (response.ok) {
        const data = await response.json();
        setWorkflowExecutions(data.executions || []);
      }
    } catch (error) {
      console.error('Error loading workflow executions:', error);
    }
  };

  const createWorkflowRule = async (rule: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>) => {
    try {
      const response = await fetch('/api/workflow/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });

      if (response.ok) {
        await loadWorkflowRules();
        return true;
      }
    } catch (error) {
      console.error('Error creating workflow rule:', error);
    }
    return false;
  };

  const updateWorkflowRule = async (id: string, updates: Partial<WorkflowRule>) => {
    try {
      const response = await fetch(`/api/workflow/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadWorkflowRules();
        return true;
      }
    } catch (error) {
      console.error('Error updating workflow rule:', error);
    }
    return false;
  };

  const deleteWorkflowRule = async (id: string) => {
    try {
      const response = await fetch(`/api/workflow/rules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadWorkflowRules();
        return true;
      }
    } catch (error) {
      console.error('Error deleting workflow rule:', error);
    }
    return false;
  };

  const toggleWorkflowRule = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/workflow/rules/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await loadWorkflowRules();
        return true;
      }
    } catch (error) {
      console.error('Error toggling workflow rule:', error);
    }
    return false;
  };

  const executeWorkflowRule = async (id: string, triggerData: any) => {
    try {
      const response = await fetch(`/api/workflow/rules/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerData }),
      });

      if (response.ok) {
        await loadWorkflowExecutions();
        return true;
      }
    } catch (error) {
      console.error('Error executing workflow rule:', error);
    }
    return false;
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'appointment_reminder': return <Calendar className="h-4 w-4" />;
      case 'payment_followup': return <DollarSign className="h-4 w-4" />;
      case 'intake_automation': return <FileText className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return <Mail className="h-4 w-4" />;
      case 'send_sms': return <MessageSquare className="h-4 w-4" />;
      case 'send_notification': return <AlertCircle className="h-4 w-4" />;
      case 'create_task': return <Target className="h-4 w-4" />;
      case 'update_status': return <CheckCircle className="h-4 w-4" />;
      case 'schedule_followup': return <Timer className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderWorkflowRule = (rule: WorkflowRule) => (
    <Card key={rule.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTriggerIcon(rule.triggerType)}
            <div>
              <CardTitle className="text-lg">{rule.name}</CardTitle>
              <CardDescription>{rule.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
              {rule.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline">
              {rule.executionCount} runs
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWorkflowRule(rule.id, !rule.isActive)}
            >
              {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedWorkflow(rule)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Trigger Type</Label>
            <div className="text-sm text-muted-foreground capitalize">
              {rule.triggerType.replace('_', ' ')}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Actions ({rule.actions.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {rule.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-1 bg-muted px-2 py-1 rounded">
                  {getActionIcon(action.type)}
                  <span className="text-xs">{action.type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          {rule.lastExecuted && (
            <div>
              <Label className="text-sm font-medium">Last Executed</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(rule.lastExecuted).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkflowExecution = (execution: WorkflowExecution) => (
    <Card key={execution.id} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Execution #{execution.id.slice(-8)}</CardTitle>
            <CardDescription>
              Started {new Date(execution.startedAt).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(execution.status)}>
              {execution.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedExecution(execution)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Workflow ID</Label>
            <div className="text-sm text-muted-foreground font-mono">
              {execution.workflowId}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Execution Log ({execution.executionLog.length})</Label>
            <div className="space-y-2 mt-2">
              {execution.executionLog.slice(0, 3).map((log, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Badge className={getStatusColor(log.status)}>
                    {log.status}
                  </Badge>
                  <span className="text-muted-foreground">{log.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {execution.executionLog.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{execution.executionLog.length - 3} more logs
                </div>
              )}
            </div>
          </div>
          {execution.errorMessage && (
            <div>
              <Label className="text-sm font-medium text-red-600">Error</Label>
              <div className="text-sm text-red-600">{execution.errorMessage}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const workflowTemplates = [
    {
      name: 'Appointment Reminder',
      description: 'Send reminder 24 hours before appointment',
      triggerType: 'appointment_reminder' as const,
      actions: [
        { type: 'send_email' as const, config: { template: 'appointment_reminder' }, delay: 0, order: 1 },
        { type: 'send_sms' as const, config: { template: 'appointment_reminder_sms' }, delay: 0, order: 2 }
      ]
    },
    {
      name: 'Payment Follow-up',
      description: 'Follow up on overdue payments',
      triggerType: 'payment_followup' as const,
      actions: [
        { type: 'send_email' as const, config: { template: 'payment_reminder' }, delay: 0, order: 1 },
        { type: 'create_task' as const, config: { title: 'Follow up on payment' }, delay: 1440, order: 2 }
      ]
    },
    {
      name: 'Intake Automation',
      description: 'Automate intake process for new patients',
      triggerType: 'intake_automation' as const,
      actions: [
        { type: 'send_email' as const, config: { template: 'welcome_email' }, delay: 0, order: 1 },
        { type: 'create_task' as const, config: { title: 'Review intake forms' }, delay: 60, order: 2 },
        { type: 'schedule_followup' as const, config: { days: 7 }, delay: 10080, order: 3 }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-muted-foreground">
            Automate appointment reminders, payment follow-ups, and intake processes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setSelectedWorkflow({} as WorkflowRule)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'rules' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rules')}
          className="flex-1"
        >
          <Workflow className="h-4 w-4 mr-2" />
          Workflow Rules
        </Button>
        <Button
          variant={activeTab === 'executions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('executions')}
          className="flex-1"
        >
          <Clock className="h-4 w-4 mr-2" />
          Executions
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('templates')}
          className="flex-1"
        >
          <Repeat className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workflow Rules</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {workflowRules.filter(r => r.isActive).length} Active
              </Badge>
              <Badge variant="outline">
                {workflowRules.length} Total
              </Badge>
            </div>
          </div>

          {workflowRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Workflow Rules</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create automation rules to streamline your practice
                </p>
                <Button onClick={() => setSelectedWorkflow({} as WorkflowRule)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflowRules.map(renderWorkflowRule)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'executions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workflow Executions</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {workflowExecutions.filter(e => e.status === 'completed').length} Completed
              </Badge>
              <Badge variant="outline">
                {workflowExecutions.filter(e => e.status === 'failed').length} Failed
              </Badge>
            </div>
          </div>

          {workflowExecutions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Executions</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Workflow executions will appear here when rules are triggered
                </p>
          </CardContent>
        </Card>
          ) : (
            <div className="space-y-4">
              {workflowExecutions.map(renderWorkflowExecution)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Workflow Templates</h2>
            <p className="text-sm text-muted-foreground">
              Use these templates to quickly create common workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {getTriggerIcon(template.triggerType)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Actions ({template.actions.length})</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.actions.map((action, actionIndex) => (
                          <Badge key={actionIndex} variant="outline" className="text-xs">
                            {action.type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedWorkflow({
                        ...template,
                        id: '',
                        triggerConditions: {},
                        isActive: true,
                        executionCount: 0,
                        createdAt: '',
                        updatedAt: ''
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
          </CardContent>
        </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Configuration Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedWorkflow.id ? 'Edit Workflow Rule' : 'Create Workflow Rule'}
              </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workflow-name">Name</Label>
                    <Input
                      id="workflow-name"
                      value={selectedWorkflow.name || ''}
                      onChange={(e) => setSelectedWorkflow({
                        ...selectedWorkflow,
                        name: e.target.value
                      })}
                      placeholder="Workflow name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-trigger">Trigger Type</Label>
                    <select
                      id="workflow-trigger"
                      value={selectedWorkflow.triggerType || 'appointment_reminder'}
                      onChange={(e) => setSelectedWorkflow({
                        ...selectedWorkflow,
                        triggerType: e.target.value as any
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="appointment_reminder">Appointment Reminder</option>
                      <option value="payment_followup">Payment Follow-up</option>
                      <option value="intake_automation">Intake Automation</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    value={selectedWorkflow.description || ''}
                    onChange={(e) => setSelectedWorkflow({
                      ...selectedWorkflow,
                      description: e.target.value
                    })}
                    placeholder="Workflow description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-conditions">Trigger Conditions (JSON)</Label>
                  <Textarea
                    id="workflow-conditions"
                    value={JSON.stringify(selectedWorkflow.triggerConditions || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const conditions = JSON.parse(e.target.value);
                        setSelectedWorkflow({
                          ...selectedWorkflow,
                          triggerConditions: conditions
                        });
                      } catch (error) {
                        // Invalid JSON, keep the text
                      }
                    }}
                    placeholder="Trigger conditions"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Actions</Label>
                  <div className="space-y-2 mt-2">
                    {selectedWorkflow.actions?.map((action, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        {getActionIcon(action.type)}
                        <span className="text-sm">{action.type.replace('_', ' ')}</span>
                        {action.delay && (
                          <Badge variant="outline" className="text-xs">
                            {action.delay}min delay
                          </Badge>
                        )}
                      </div>
                    )) || []}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedWorkflow(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedWorkflow.id) {
                        await updateWorkflowRule(selectedWorkflow.id, selectedWorkflow);
                      } else {
                        await createWorkflowRule(selectedWorkflow);
                      }
                      setSelectedWorkflow(null);
                    }}
                  >
                    {selectedWorkflow.id ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Execution Details Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Execution Details</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedExecution.status)}>
                        {selectedExecution.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Started At</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedExecution.startedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Execution Log</Label>
                  <div className="space-y-2 mt-2">
                    {selectedExecution.executionLog.map((log, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm">{log.message}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedExecution.errorMessage && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Error Message</Label>
                    <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
                      {selectedExecution.errorMessage}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedExecution(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}