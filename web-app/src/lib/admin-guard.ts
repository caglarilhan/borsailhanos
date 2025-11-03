/**
 * Admin Guard
 * Role-based access control for admin routes
 */

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

/**
 * Check if user is admin
 */
export function isAdminUser(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user has access to route
 */
export function hasRouteAccess(user: User | null, route: string): boolean {
  if (route.startsWith('/admin')) {
    return isAdminUser(user);
  }
  // Public routes
  if (route === '/' || route.startsWith('/plans') || route.startsWith('/login')) {
    return true;
  }
  // Protected routes require authenticated user
  return !!user;
}

/**
 * Get user from localStorage (mock - replace with real auth)
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('bistai_user');
    if (stored) {
      return JSON.parse(stored) as User;
    }
  } catch (error) {
    console.warn('Failed to load user from localStorage:', error);
  }
  return null;
}

/**
 * Set current user (mock - replace with real auth)
 */
export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bistai_user', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  }
}



