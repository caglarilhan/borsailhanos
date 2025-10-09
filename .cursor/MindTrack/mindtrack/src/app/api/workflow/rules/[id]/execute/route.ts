import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { triggerData } = body;

    // Get the workflow rule
    const { data: rule, error: ruleError } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (ruleError || !rule) {
      return NextResponse.json({ error: 'Workflow rule not found' }, { status: 404 });
    }

    if (!rule.is_active) {
      return NextResponse.json({ error: 'Workflow rule is not active' }, { status: 400 });
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        user_id: user.id,
        workflow_id: id,
        status: 'pending',
        trigger_data: triggerData || {},
        execution_log: [],
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (executionError) {
      console.error('Error creating workflow execution:', executionError);
      return NextResponse.json({ error: 'Failed to create workflow execution' }, { status: 500 });
    }

    // Update execution count
    await supabase
      .from('workflow_rules')
      .update({
        execution_count: rule.execution_count + 1,
        last_executed: new Date().toISOString()
      })
      .eq('id', id);

    // Start executing the workflow (in a real implementation, this would be queued)
    try {
      await executeWorkflowActions(supabase, execution.id, rule.actions, triggerData);
    } catch (error) {
      console.error('Error executing workflow actions:', error);
      // Update execution status to failed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', execution.id);
    }

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Error in workflow execution API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function executeWorkflowActions(supabase: any, executionId: string, actions: any[], triggerData: any) {
  const executionLog = [];

  // Update execution status to running
  await supabase
    .from('workflow_executions')
    .update({ status: 'running' })
    .eq('id', executionId);

  // Sort actions by order
  const sortedActions = actions.sort((a, b) => a.order - b.order);

  for (const action of sortedActions) {
    try {
      // Add log entry for action start
      const logEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        action_id: action.id,
        status: 'running',
        message: `Executing ${action.type}`,
        timestamp: new Date().toISOString()
      };

      executionLog.push(logEntry);

      // Simulate action execution (in a real implementation, this would call actual services)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update log entry to completed
      logEntry.status = 'completed';
      logEntry.message = `Completed ${action.type}`;

      // Handle different action types
      switch (action.type) {
        case 'send_email':
          // In a real implementation, this would send an email
          console.log('Sending email:', action.config);
          break;
        case 'send_sms':
          // In a real implementation, this would send an SMS
          console.log('Sending SMS:', action.config);
          break;
        case 'send_notification':
          // In a real implementation, this would send a notification
          console.log('Sending notification:', action.config);
          break;
        case 'create_task':
          // In a real implementation, this would create a task
          console.log('Creating task:', action.config);
          break;
        case 'update_status':
          // In a real implementation, this would update a status
          console.log('Updating status:', action.config);
          break;
        case 'schedule_followup':
          // In a real implementation, this would schedule a follow-up
          console.log('Scheduling follow-up:', action.config);
          break;
      }

    } catch (error) {
      // Add failed log entry
      const logEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        action_id: action.id,
        status: 'failed',
        message: `Failed to execute ${action.type}`,
        timestamp: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };

      executionLog.push(logEntry);
    }
  }

  // Update execution with final log and status
  await supabase
    .from('workflow_executions')
    .update({
      status: 'completed',
      execution_log: executionLog,
      completed_at: new Date().toISOString()
    })
    .eq('id', executionId);
}
