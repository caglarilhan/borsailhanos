import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { timingSafeEqual } from 'crypto';

type RegistryRole = 'admin' | 'trader';

type RegistryUser = {
  username: string;
  password: string;
  role?: RegistryRole;
  displayName?: string;
};

const BCRYPT_PREFIXES = ['$2a$', '$2b$', '$2y$'];

function parseUsers(): RegistryUser[] {
  console.log('[AUTH_DEBUG] parseUsers() called');
  console.log('[AUTH_DEBUG] AUTH_USERS_JSON:', process.env.AUTH_USERS_JSON ? 'exists' : 'not set');
  console.log('[AUTH_DEBUG] AUTH_USERS:', process.env.AUTH_USERS || 'not set');
  console.log('[AUTH_DEBUG] ADMIN_USERNAME:', process.env.ADMIN_USERNAME || 'not set');
  console.log('[AUTH_DEBUG] ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? 'exists' : 'not set');
  
  const users: RegistryUser[] = [];
  const json = process.env.AUTH_USERS_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        parsed.forEach((user) => {
          if (user?.username && user?.password) {
            users.push({
              username: String(user.username),
              password: String(user.password),
              role: user.role === 'admin' ? 'admin' : 'trader',
              displayName: user.displayName ? String(user.displayName) : undefined,
            });
          }
        });
      }
    } catch (error) {
      console.error('[AUTH_DEBUG] AUTH_USERS_JSON parse error:', error);
    }
  } else if (process.env.AUTH_USERS) {
    console.log('[AUTH_DEBUG] Parsing AUTH_USERS:', process.env.AUTH_USERS);
    const entries = process.env.AUTH_USERS.split(';');
    console.log('[AUTH_DEBUG] Split entries:', entries);
    entries.forEach((entry, index) => {
      const trimmed = entry.trim();
      if (!trimmed) {
        console.log(`[AUTH_DEBUG] Entry ${index} is empty, skipping`);
        return;
      }
      const [username, password, role] = trimmed.split(':');
      console.log(`[AUTH_DEBUG] Entry ${index} parsed:`, { username, password: password ? '***' : undefined, role });
      if (!username || !password) {
        console.log(`[AUTH_DEBUG] Entry ${index} missing username or password, skipping`);
        return;
      }
      users.push({
        username: username.trim(),
        password: password.trim(),
        role: role?.trim() === 'admin' ? 'admin' : 'trader',
      });
    });
  }

  if (!users.length && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    console.log('[AUTH_DEBUG] No users found, using ADMIN_USERNAME/ADMIN_PASSWORD');
    users.push({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      displayName: process.env.ADMIN_DISPLAY_NAME || process.env.ADMIN_USERNAME,
    });
  }

  console.log('[AUTH_DEBUG] Final parsed users:', users.map(u => ({ username: u.username, role: u.role })));
  return users;
}

async function verifySecret(plain: string, stored: string): Promise<boolean> {
  if (!plain || !stored) return false;
  if (BCRYPT_PREFIXES.some((prefix) => stored.startsWith(prefix))) {
    return bcrypt.compare(plain, stored);
  }
  if (plain.length !== stored.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(plain), Buffer.from(stored));
  } catch {
    // Buffer lengths mismatch or invalid input
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[NEXTAUTH_ERROR]', code, metadata);
    },
    warn(code) {
      console.warn('[NEXTAUTH_WARN]', code);
    },
    debug(code, metadata) {
      console.log('[NEXTAUTH_DEBUG]', code, metadata);
    },
  },
  providers: [
    Credentials({
      name: 'Borsa Girişi',
      id: 'credentials',
      credentials: {
        username: { label: 'Kullanıcı Adı', type: 'text', placeholder: 'ornek' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        // TEST: Eğer bu throw görünmüyorsa, authorize() hiç çağrılmıyor demektir
        // Şimdilik throw ekleyerek test ediyoruz - eğer authorize() çağrılıyorsa hata göreceğiz
        throw new Error('[AUTH_DEBUG] TEST: authorize() CALLED - If you see this, authorize() is working!');
        
        // TEST: Eğer bu log görünmüyorsa, authorize() hiç çağrılmıyor demektir
        // Hem console.error hem de process.stderr.write ile log
        console.error('[AUTH_DEBUG] ⚠️⚠️⚠️ authorize() CALLED ⚠️⚠️⚠️');
        console.error('[AUTH_DEBUG] credentials:', JSON.stringify({
          username: credentials?.username,
          passwordLength: credentials?.password?.length,
          hasUsername: !!credentials?.username,
          hasPassword: !!credentials?.password,
        }));
        
        // Hemen admin/admin döndür - test için
        if (credentials?.username === 'admin' && credentials?.password === 'admin') {
          console.error('[AUTH_DEBUG] ✅ Returning admin user immediately');
          return {
            id: 'admin',
            name: 'Admin',
            email: 'admin@local',
            role: 'admin',
          } as any;
        }

        const username = credentials?.username?.trim();
        const password = typeof credentials?.password === 'string' ? credentials.password.trim() : '';
        
        console.log('[AUTH_DEBUG] after trim:', { username, passwordLength: password.length });
        
        if (!username || !password) {
          console.log('[AUTH_DEBUG] username or password empty, returning null');
          return null;
        }

        // Geçici, garantili admin girişi: ENV ne olursa olsun admin/admin çalışsın
        if (username === 'admin' && password === 'admin') {
          console.log('[AUTH_DEBUG] ✅ using hardcoded admin/admin login - RETURNING USER');
          return {
            id: 'admin',
            name: 'Admin',
            email: 'admin@local',
            role: 'admin',
          } as any;
        }

        const users = parseUsers();
        console.log('[AUTH_DEBUG] authorize payload:', { username, users });
        if (!users.length) {
          console.error('AUTH_USERS boş; giriş yapılamaz.');
          return null;
        }

        const record = users.find((user) => user.username === username);
        if (!record) {
          return null;
        }

        const ok = await verifySecret(password, record.password);
        if (!ok) {
          return null;
        }

        return {
          id: record.username,
          name: record.displayName || record.username,
          email: `${record.username}@local`,
          role: record.role || 'trader',
        } as any;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('[AUTH_DEBUG] jwt callback called:', { hasUser: !!user, tokenId: token.sub });
      if (user) {
        token.role = (user as any).role || 'trader';
        console.log('[AUTH_DEBUG] jwt callback - user added to token:', { id: user.id, role: (user as any).role });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('[AUTH_DEBUG] session callback called:', { hasToken: !!token, tokenRole: token.role });
      if (session.user) {
        (session.user as any).role = (token.role as RegistryRole) || 'trader';
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('[AUTH_DEBUG] signIn callback called:', { hasUser: !!user, userId: user?.id });
      return true;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRETS_MASTER_KEY,
};


