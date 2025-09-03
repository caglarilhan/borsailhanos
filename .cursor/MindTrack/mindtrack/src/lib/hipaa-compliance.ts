import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// HIPAA Compliance Service
class HIPAAComplianceService {
  private encryptionKey: string;
  private auditLogTable: string;

  constructor() {
    this.encryptionKey = process.env.HIPAA_ENCRYPTION_KEY || '';
    this.auditLogTable = 'hipaa_audit_logs';
  }

  // Encrypt sensitive data
  private encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    cipher.setAAD(iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  // Decrypt sensitive data
  private decryptData(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAAD(iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Log HIPAA audit event
  async logAuditEvent(eventData: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(this.auditLogTable)
        .insert({
          user_id: eventData.userId,
          action: eventData.action,
          resource_type: eventData.resourceType,
          resource_id: eventData.resourceId,
          details: eventData.details,
          ip_address: eventData.ipAddress,
          user_agent: eventData.userAgent,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // Check user permissions for PHI access
  async checkPHIAccess(userId: string, resourceType: string, resourceId: string): Promise<boolean> {
    try {
      // Check if user has access to the specific resource
      const { data: permissions, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .eq('status', 'active');

      if (error) {
        console.error('Error checking PHI access:', error);
        return false;
      }

      return permissions && permissions.length > 0;
    } catch (error) {
      console.error('Error checking PHI access:', error);
      return false;
    }
  }

  // Validate data retention policies
  async validateDataRetention(resourceType: string, resourceId: string): Promise<boolean> {
    try {
      // Check if data should be retained based on retention policies
      const { data: retentionPolicy, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('resource_type', resourceType)
        .single();

      if (error) {
        console.error('Error validating data retention:', error);
        return false;
      }

      if (!retentionPolicy) {
        return true; // No specific policy, allow access
      }

      // Check if data is within retention period
      const { data: resource, error: resourceError } = await supabase
        .from(resourceType)
        .select('created_at')
        .eq('id', resourceId)
        .single();

      if (resourceError) {
        console.error('Error fetching resource:', resourceError);
        return false;
      }

      const resourceAge = Date.now() - new Date(resource.created_at).getTime();
      const retentionPeriod = retentionPolicy.retention_days * 24 * 60 * 60 * 1000;

      return resourceAge <= retentionPeriod;
    } catch (error) {
      console.error('Error validating data retention:', error);
      return false;
    }
  }

  // Sanitize data for logging (remove PHI)
  sanitizeDataForLogging(data: any): any {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'ssn', 'social_security_number', 'date_of_birth', 'birth_date',
      'phone', 'phone_number', 'email', 'email_address',
      'address', 'street_address', 'city', 'state', 'zip_code',
      'insurance_id', 'member_id', 'account_number'
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // Generate access report
  async generateAccessReport(
    startDate: string,
    endDate: string,
    userId?: string,
    resourceType?: string
  ): Promise<any[]> {
    try {
      let query = supabase
        .from(this.auditLogTable)
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error generating access report:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error generating access report:', error);
      return [];
    }
  }

  // Check for suspicious activity
  async detectSuspiciousActivity(userId: string, timeWindow: number = 3600000): Promise<boolean> {
    try {
      const startTime = new Date(Date.now() - timeWindow).toISOString();
      
      const { data: recentActivity, error } = await supabase
        .from(this.auditLogTable)
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startTime);

      if (error) {
        console.error('Error detecting suspicious activity:', error);
        return false;
      }

      // Check for unusual patterns
      const accessCount = recentActivity.length;
      const uniqueResources = new Set(recentActivity.map(a => a.resource_id)).size;
      
      // Flag if too many accesses or too many different resources
      if (accessCount > 100 || uniqueResources > 50) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }
}

// Middleware for HIPAA compliance
export async function hipaaMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const hipaaService = new HIPAAComplianceService();
  
  try {
    // Extract user information from request
    const userId = request.headers.get('x-user-id');
    const resourceType = request.headers.get('x-resource-type');
    const resourceId = request.headers.get('x-resource-id');
    const action = request.method;

    if (userId && resourceType && resourceId) {
      // Check PHI access permissions
      const hasAccess = await hipaaService.checkPHIAccess(userId, resourceType, resourceId);
      if (!hasAccess) {
        await hipaaService.logAuditEvent({
          userId,
          action: 'UNAUTHORIZED_ACCESS',
          resourceType,
          resourceId,
          details: { reason: 'Insufficient permissions' },
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
        });
        
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Validate data retention
      const isValidRetention = await hipaaService.validateDataRetention(resourceType, resourceId);
      if (!isValidRetention) {
        await hipaaService.logAuditEvent({
          userId,
          action: 'RETENTION_VIOLATION',
          resourceType,
          resourceId,
          details: { reason: 'Data retention policy violation' },
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
        });
        
        return NextResponse.json(
          { error: 'Data retention policy violation' },
          { status: 410 }
        );
      }

      // Check for suspicious activity
      const isSuspicious = await hipaaService.detectSuspiciousActivity(userId);
      if (isSuspicious) {
        await hipaaService.logAuditEvent({
          userId,
          action: 'SUSPICIOUS_ACTIVITY',
          resourceType,
          resourceId,
          details: { reason: 'Unusual access pattern detected' },
          ipAddress: request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
        });
        
        // Log but don't block - just monitor
        console.warn(`Suspicious activity detected for user ${userId}`);
      }

      // Log successful access
      await hipaaService.logAuditEvent({
        userId,
        action,
        resourceType,
        resourceId,
        details: hipaaService.sanitizeDataForLogging({
          method: request.method,
          url: request.url,
          timestamp: new Date().toISOString(),
        }),
        ipAddress: request.ip || '',
        userAgent: request.headers.get('user-agent') || '',
      });
    }

    return null; // Continue with request
  } catch (error) {
    console.error('HIPAA middleware error:', error);
    return NextResponse.json(
      { error: 'Compliance check failed' },
      { status: 500 }
    );
  }
}

// API Routes for HIPAA compliance
const hipaaService = new HIPAAComplianceService();

// GET /api/hipaa/audit-report - Generate audit report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const resourceType = searchParams.get('resourceType');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const report = await hipaaService.generateAccessReport(
      startDate,
      endDate,
      userId || undefined,
      resourceType || undefined
    );

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating audit report:', error);
    return NextResponse.json(
      { error: 'Failed to generate audit report' },
      { status: 500 }
    );
  }
}

// POST /api/hipaa/encrypt - Encrypt sensitive data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, action } = body;

    switch (action) {
      case 'encrypt':
        if (!data) {
          return NextResponse.json(
            { error: 'Data is required' },
            { status: 400 }
          );
        }
        
        const encrypted = hipaaService.encryptData(JSON.stringify(data));
        return NextResponse.json({ encrypted });

      case 'decrypt':
        if (!data) {
          return NextResponse.json(
            { error: 'Encrypted data is required' },
            { status: 400 }
          );
        }
        
        const decrypted = hipaaService.decryptData(data);
        return NextResponse.json({ decrypted: JSON.parse(decrypted) });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('HIPAA encryption error:', error);
    return NextResponse.json(
      { error: 'Encryption/decryption failed' },
      { status: 500 }
    );
  }
}
