/**
 * Feature Flags for Production/Development Environments
 * Controls visibility of advanced features based on environment and user role
 */

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  if (typeof window === 'undefined') return true;
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return !isProduction();
}

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  GOD_MODE: isDevelopment(),
  ADMIN_PANEL: false, // Only for admin users via RBAC
  V5_ENTERPRISE: false, // Only for enterprise tier
  ADVANCED_VISUALIZATION: true,
  TRADER_GPT: true,
  AI_CONFIDENCE: true,
  GAMIFICATION: true,
};

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Admin role check (simple implementation)
 * In production, this should come from backend auth
 */
export function isAdmin(userRole?: string): boolean {
  return userRole === 'admin' || userRole === 'Admin';
}

