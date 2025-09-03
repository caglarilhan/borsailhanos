import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enhanced HIPAA Compliance Service
class HIPAAComplianceService {
  private encryptionKey: string;
  private algorithm: string;

  constructor() {
    this.encryptionKey = process.env.HIPAA_ENCRYPTION_KEY || 'default-encryption-key-32-chars-long';
    this.algorithm = 'aes-256-gcm';
  }

  // Encrypt sensitive data
  async encryptData(data: string): Promise<{ encryptedData: string; iv: string; tag: string }> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('hipaa-protected', 'utf8'));
    
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encryptedData,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Decrypt sensitive data
  async decryptData(encryptedData: string, iv: string, tag: string): Promise<string> {
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('hipaa-protected', 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    
    return decryptedData;
  }

  // Log HIPAA audit events
  async logAuditEvent(eventData: any) {
    try {
      const { data, error } = await supabase
        .from('hipaa_audit_logs')
        .insert([{
          event_type: eventData.eventType,
          user_id: eventData.userId,
          client_id: eventData.clientId,
          action: eventData.action,
          resource_type: eventData.resourceType,
          resource_id: eventData.resourceId,
          ip_address: eventData.ipAddress,
          user_agent: eventData.userAgent,
          timestamp: new Date().toISOString(),
          details: eventData.details
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }
  }

  // Check PHI access permissions
  async checkPHIAccess(userId: string, clientId: string, action: string): Promise<boolean> {
    try {
      // Check if user has access to this client's data
      const { data: clientAccess, error: clientError } = await supabase
        .from('clients')
        .select('owner_id')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Check if user is the owner or has explicit permissions
      if (clientAccess.owner_id === userId) {
        return true;
      }

      // Check for explicit permissions
      const { data: permissions, error: permError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', clientId)
        .eq('action', action)
        .eq('status', 'active');

      if (permError) throw permError;

      return permissions && permissions.length > 0;
    } catch (error) {
      console.error('Error checking PHI access:', error);
      return false;
    }
  }

  // Validate data retention policies
  async validateDataRetention(resourceType: string, resourceId: string): Promise<boolean> {
    try {
      const retentionPolicies = {
        'clinical_notes': 7 * 365, // 7 years
        'medication_records': 7 * 365, // 7 years
        'lab_results': 7 * 365, // 7 years
        'genetic_data': 10 * 365, // 10 years
        'telepsychiatry_sessions': 7 * 365, // 7 years
        'research_data': 10 * 365 // 10 years
      };

      const { data: resource, error } = await supabase
        .from(resourceType)
        .select('created_at')
        .eq('id', resourceId)
        .single();

      if (error) throw error;

      const createdDate = new Date(resource.created_at);
      const currentDate = new Date();
      const daysSinceCreation = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      const maxRetentionDays = retentionPolicies[resourceType as keyof typeof retentionPolicies] || 7 * 365;

      return daysSinceCreation <= maxRetentionDays;
    } catch (error) {
      console.error('Error validating data retention:', error);
      return false;
    }
  }

  // Detect suspicious activity
  async detectSuspiciousActivity(userId: string, action: string, resourceId: string): Promise<boolean> {
    try {
      // Check for unusual access patterns
      const { data: recentActivity, error } = await supabase
        .from('hipaa_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Check for multiple failed access attempts
      const failedAttempts = recentActivity.filter(
        (activity) => activity.action === 'access_denied'
      ).length;

      // Check for unusual access times (outside business hours)
      const currentHour = new Date().getHours();
      const isBusinessHours = currentHour >= 8 && currentHour <= 18;

      // Check for rapid successive actions
      const rapidActions = recentActivity.filter(
        (activity, index) => {
          if (index === 0) return false;
          const timeDiff = new Date(activity.timestamp).getTime() - 
                         new Date(recentActivity[index - 1].timestamp).getTime();
          return timeDiff < 1000; // Less than 1 second between actions
        }
      ).length;

      // Suspicious activity indicators
      const suspiciousIndicators = [
        failedAttempts > 5,
        !isBusinessHours && recentActivity.length > 10,
        rapidActions > 3,
        recentActivity.length > 50 // More than 50 actions in 24 hours
      ];

      return suspiciousIndicators.some(indicator => indicator);
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }

  // Generate HIPAA compliance report
  async generateComplianceReport(startDate: string, endDate: string): Promise<any> {
    try {
      const { data: auditLogs, error } = await supabase
        .from('hipaa_audit_logs')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Analyze audit logs
      const totalEvents = auditLogs.length;
      const accessEvents = auditLogs.filter(log => log.action === 'access');
      const deniedEvents = auditLogs.filter(log => log.action === 'access_denied');
      const suspiciousEvents = auditLogs.filter(log => log.event_type === 'suspicious_activity');

      // Group by user
      const userActivity = auditLogs.reduce((acc, log) => {
        if (!acc[log.user_id]) {
          acc[log.user_id] = [];
        }
        acc[log.user_id].push(log);
        return acc;
      }, {} as Record<string, any[]>);

      // Group by resource type
      const resourceActivity = auditLogs.reduce((acc, log) => {
        if (!acc[log.resource_type]) {
          acc[log.resource_type] = [];
        }
        acc[log.resource_type].push(log);
        return acc;
      }, {} as Record<string, any[]>);

      return {
        report_period: { start_date: startDate, end_date: endDate },
        summary: {
          total_events: totalEvents,
          access_events: accessEvents.length,
          denied_events: deniedEvents.length,
          suspicious_events: suspiciousEvents.length,
          unique_users: Object.keys(userActivity).length,
          unique_resources: Object.keys(resourceActivity).length
        },
        user_activity: userActivity,
        resource_activity: resourceActivity,
        compliance_score: this.calculateComplianceScore(auditLogs),
        recommendations: this.generateRecommendations(auditLogs)
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  // Calculate compliance score
  private calculateComplianceScore(auditLogs: any[]): number {
    const totalEvents = auditLogs.length;
    const deniedEvents = auditLogs.filter(log => log.action === 'access_denied').length;
    const suspiciousEvents = auditLogs.filter(log => log.event_type === 'suspicious_activity').length;

    // Base score starts at 100
    let score = 100;

    // Deduct points for denied access (indicates potential security issues)
    score -= (deniedEvents / totalEvents) * 20;

    // Deduct points for suspicious activity
    score -= (suspiciousEvents / totalEvents) * 30;

    // Ensure score doesn't go below 0
    return Math.max(0, Math.round(score));
  }

  // Generate recommendations
  private generateRecommendations(auditLogs: any[]): string[] {
    const recommendations: string[] = [];

    const deniedEvents = auditLogs.filter(log => log.action === 'access_denied').length;
    const suspiciousEvents = auditLogs.filter(log => log.event_type === 'suspicious_activity').length;

    if (deniedEvents > 10) {
      recommendations.push('Review access control policies - high number of denied access attempts');
    }

    if (suspiciousEvents > 5) {
      recommendations.push('Investigate suspicious activity patterns - consider additional monitoring');
    }

    const userActivity = auditLogs.reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highActivityUsers = Object.entries(userActivity)
      .filter(([_, count]) => count > 100)
      .map(([userId, _]) => userId);

    if (highActivityUsers.length > 0) {
      recommendations.push(`Review access patterns for users: ${highActivityUsers.join(', ')}`);
    }

    return recommendations;
  }
}

const hipaaService = new HIPAAComplianceService();

// API Routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const clientId = searchParams.get('clientId');

    switch (action) {
      case 'check_access':
        if (!userId || !clientId) {
          return NextResponse.json({ error: 'User ID and Client ID are required' }, { status: 400 });
        }
        const hasAccess = await hipaaService.checkPHIAccess(userId, clientId, 'read');
        return NextResponse.json({ hasAccess });

      case 'validate_retention':
        const resourceType = searchParams.get('resourceType');
        const resourceId = searchParams.get('resourceId');
        if (!resourceType || !resourceId) {
          return NextResponse.json({ error: 'Resource type and ID are required' }, { status: 400 });
        }
        const isValidRetention = await hipaaService.validateDataRetention(resourceType, resourceId);
        return NextResponse.json({ isValidRetention });

      case 'detect_suspicious':
        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        const isSuspicious = await hipaaService.detectSuspiciousActivity(userId, 'access', '');
        return NextResponse.json({ isSuspicious });

      case 'compliance_report':
        const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = searchParams.get('endDate') || new Date().toISOString();
        const report = await hipaaService.generateComplianceReport(startDate, endDate);
        return NextResponse.json({ report });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'encrypt':
        const encryptedData = await hipaaService.encryptData(data.text);
        return NextResponse.json({ encryptedData });

      case 'decrypt':
        const decryptedData = await hipaaService.decryptData(data.encryptedData, data.iv, data.tag);
        return NextResponse.json({ decryptedData });

      case 'log_audit':
        const auditLog = await hipaaService.logAuditEvent(data);
        return NextResponse.json({ auditLog });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
