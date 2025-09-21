import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Set sample rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configure which integrations to use
  integrations: [
    // Add any additional integrations here
  ],
  
  // Configure beforeSend to filter or modify events
  beforeSend(event, hint) {
    // Filter out development errors in production
    if (process.env.NODE_ENV === 'production' && event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out common development errors
        if (error.message.includes('webworker-threads')) {
          return null;
        }
        if (error.message.includes('Module not found')) {
          return null;
        }
      }
    }
    
    // Add user context if available
    if (event.user === undefined) {
      event.user = {
        ip_address: '{{auto}}',
      };
    }
    
    return event;
  },
  
  // Configure environment
  environment: process.env.NODE_ENV || 'development',
  
  // Configure release
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
  
  // Configure server name
  serverName: process.env.VERCEL_URL || 'localhost',
});

// Export Sentry for manual usage
export { Sentry };

