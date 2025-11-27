import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('[AUTH_ROUTE] NextAuth route loaded');
console.log('[AUTH_ROUTE] authOptions:', {
  hasProviders: !!authOptions.providers?.length,
  providerNames: authOptions.providers?.map((p: any) => p.name),
  hasSecret: !!authOptions.secret,
  debug: authOptions.debug,
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };



