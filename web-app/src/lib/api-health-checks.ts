/**
 * P1-1: Backend API Health Checks
 * isfinite() check + empty data fallback + response validation
 */

export interface APIHealthCheckResult {
  isValid: boolean;
  isEmpty: boolean;
  hasInvalidNumbers: boolean;
  errors: string[];
  sanitized?: any;
}

/**
 * Check if a number is finite and valid
 */
export function isFiniteNumber(value: any): boolean {
  if (typeof value !== 'number') return false;
  return Number.isFinite(value) && !Number.isNaN(value);
}

/**
 * Sanitize number: replace NaN/Infinity with fallback value
 */
export function sanitizeNumber(value: any, fallback: number = 0): number {
  if (isFiniteNumber(value)) return value;
  return fallback;
}

/**
 * Validate API response structure
 */
export function validateAPIResponse(response: any, expectedFields?: string[]): APIHealthCheckResult {
  const result: APIHealthCheckResult = {
    isValid: true,
    isEmpty: false,
    hasInvalidNumbers: false,
    errors: [],
  };

  // Check if response is empty
  if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
    result.isEmpty = true;
    result.isValid = false;
    result.errors.push('Response is empty');
    return result;
  }

  // Check for invalid numbers (NaN, Infinity)
  const checkNumbers = (obj: any, path: string = ''): void => {
    if (obj === null || obj === undefined) return;
    
    if (typeof obj === 'number') {
      if (!isFiniteNumber(obj)) {
        result.hasInvalidNumbers = true;
        result.isValid = false;
        result.errors.push(`Invalid number at ${path || 'root'}: ${obj}`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        checkNumbers(item, `${path}[${index}]`);
      });
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        checkNumbers(obj[key], path ? `${path}.${key}` : key);
      });
    }
  };

  checkNumbers(response);

  // Check expected fields
  if (expectedFields && Array.isArray(expectedFields)) {
    expectedFields.forEach(field => {
      if (!(field in response)) {
        result.errors.push(`Missing expected field: ${field}`);
        result.isValid = false;
      }
    });
  }

  return result;
}

/**
 * Sanitize API response: replace invalid numbers with fallback
 */
export function sanitizeAPIResponse(response: any, fallbackNumbers: Record<string, number> = {}): any {
  if (response === null || response === undefined) return response;

  if (typeof response === 'number') {
    return sanitizeNumber(response, fallbackNumbers['default'] || 0);
  }

  if (Array.isArray(response)) {
    return response.map(item => sanitizeAPIResponse(item, fallbackNumbers));
  }

  if (typeof response === 'object') {
    const sanitized: any = {};
    Object.keys(response).forEach(key => {
      const fallback = fallbackNumbers[key] ?? fallbackNumbers['default'] ?? 0;
      const value = response[key];
      
      if (typeof value === 'number') {
        sanitized[key] = sanitizeNumber(value, fallback);
      } else {
        sanitized[key] = sanitizeAPIResponse(value, fallbackNumbers);
      }
    });
    return sanitized;
  }

  return response;
}

/**
 * Validate and sanitize API response with fallback
 */
export function validateAndSanitize(
  response: any,
  expectedFields?: string[],
  fallbackNumbers: Record<string, number> = {}
): { result: APIHealthCheckResult; data: any } {
  const validationResult = validateAPIResponse(response, expectedFields);
  
  if (!validationResult.isValid || validationResult.hasInvalidNumbers) {
    // Sanitize if there are invalid numbers
    const sanitized = sanitizeAPIResponse(response, fallbackNumbers);
    return {
      result: {
        ...validationResult,
        sanitized: true,
      },
      data: sanitized,
    };
  }

  return {
    result: validationResult,
    data: response,
  };
}

/**
 * Check if response is empty and provide fallback
 */
export function handleEmptyResponse<T>(
  response: any,
  fallback: T,
  checkEmpty: (data: any) => boolean = (data) => !data || (typeof data === 'object' && Object.keys(data).length === 0)
): T {
  if (checkEmpty(response)) {
    console.warn('API returned empty response, using fallback');
    return fallback;
  }
  return response as T;
}

/**
 * Common fallback values for different endpoint types
 */
export const FALLBACK_VALUES = {
  predictions: [],
  signals: [],
  metrics: {
    accuracy: 0,
    confidence: 0,
    profit: 0,
    risk: 0,
  },
  sentiment: {
    positive: 50,
    negative: 25,
    neutral: 25,
  },
  backtest: {
    sharpe: 0,
    max_drawdown: 0,
    total_return: 0,
    win_rate: 0,
  },
};


