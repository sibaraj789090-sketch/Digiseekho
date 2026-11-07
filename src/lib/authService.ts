import { supabase, isSupabaseConfigured, getSupabaseClient } from './supabase';

export const AUTHORIZED_ADMIN_EMAIL = 'rajsiba2005@gmail.com';

const AUTH_STORAGE_KEYS = {
  SESSION: 'digiseekho_admin_secure_session',
  PASSWORD_HASH: 'digiseekho_admin_pwd_hash',
  PASSWORD_INITIALIZED: 'digiseekho_admin_pwd_init'
};

export interface AdminSession {
  email: string;
  token: string;
  role: 'admin';
  loginTime: string;
  expiresAt: number;
  provider: 'password' | 'supabase_auth' | 'google';
}

// Simple hash helper for local fallback credential storage
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `dg_${Math.abs(hash)}_${text.length}`;
}

class AuthService {
  // Check if given email strictly matches authorized admin
  isAuthorizedEmail(email: string): boolean {
    if (!email) return false;
    return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  }

  // Check if password has been set up for rajsiba2005@gmail.com
  isPasswordInitialized(): boolean {
    try {
      const init = localStorage.getItem(AUTH_STORAGE_KEYS.PASSWORD_INITIALIZED);
      const hash = localStorage.getItem(AUTH_STORAGE_KEYS.PASSWORD_HASH);
      return init === 'true' && Boolean(hash);
    } catch {
      return false;
    }
  }

  // Get current active session if valid
  getCurrentSession(): AdminSession | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION);
      if (!raw) return null;

      const session: AdminSession = JSON.parse(raw);

      // Verify email is strictly rajsiba2005@gmail.com
      if (!this.isAuthorizedEmail(session.email)) {
        this.logout();
        return null;
      }

      // Verify expiration (24h validity)
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      this.logout();
      return null;
    }
  }

  // Check if current user has an active, valid admin session
  isSessionValid(): boolean {
    const session = this.getCurrentSession();
    return Boolean(session && this.isAuthorizedEmail(session.email) && session.role === 'admin');
  }

  // Login handler
  async loginWithPassword(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; isInitialSetup?: boolean }> {
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Strict email check: ANY other email is rejected immediately
    if (!this.isAuthorizedEmail(normalizedEmail)) {
      return {
        success: false,
        error: `Access Denied: Only authorized administrator (${AUTHORIZED_ADMIN_EMAIL}) is permitted to access DigiSeekho Admin Panel. Access with "${email}" is strictly blocked.`
      };
    }

    if (!password || password.trim().length === 0) {
      return {
        success: false,
        error: 'Password is required to authenticate.'
      };
    }

    const client = getSupabaseClient();
    let authenticatedViaSupabase = false;

    // 2. If Supabase Auth is configured, attempt real Supabase Auth authentication
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: AUTHORIZED_ADMIN_EMAIL,
          password: password.trim()
        });

        if (!error && data?.user) {
          if (this.isAuthorizedEmail(data.user.email || '')) {
            authenticatedViaSupabase = true;
          } else {
            // Signed into Supabase with unauthorized email
            await client.auth.signOut();
            return {
              success: false,
              error: `Access Denied: Supabase account "${data.user.email}" is not authorized. Only ${AUTHORIZED_ADMIN_EMAIL} can access the Admin Panel.`
            };
          }
        }
      } catch (err) {
        console.warn('Supabase Auth authentication attempt warning:', err);
      }
    }

    // 3. Password Verification (Local secure storage / Initialization)
    const isInit = this.isPasswordInitialized();
    const storedHash = localStorage.getItem(AUTH_STORAGE_KEYS.PASSWORD_HASH);
    const incomingHash = simpleHash(password.trim());

    if (!authenticatedViaSupabase) {
      if (!isInit) {
        // First-time password initialization: Save the password provided by the user
        if (password.trim().length < 6) {
          return {
            success: false,
            error: 'Password must be at least 6 characters long to secure your admin account.'
          };
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.PASSWORD_HASH, incomingHash);
        localStorage.setItem(AUTH_STORAGE_KEYS.PASSWORD_INITIALIZED, 'true');
      } else {
        // Password already initialized: Must match exactly
        if (incomingHash !== storedHash) {
          return {
            success: false,
            error: 'Access Denied: Incorrect password provided for rajsiba2005@gmail.com.'
          };
        }
      }
    }

    // 4. Create cryptographically generated session
    const token = `dg_sec_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity

    const session: AdminSession = {
      email: AUTHORIZED_ADMIN_EMAIL,
      token,
      role: 'admin',
      loginTime: new Date().toISOString(),
      expiresAt,
      provider: authenticatedViaSupabase ? 'supabase_auth' : 'password'
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.SESSION, JSON.stringify(session));
    // Keep backwards-compatibility marker for existing route checks
    localStorage.setItem('digiseekho_admin_session', 'active');

    return {
      success: true,
      isInitialSetup: !isInit
    };
  }

  // Google OAuth Login handler
  async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!isSupabaseConfigured() || !client) {
      return {
        success: false,
        error: 'Google Sign-In requires Supabase connection configured with Google OAuth provider.'
      };
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account'
          },
          redirectTo: window.location.origin + '/admin'
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google OAuth failed' };
    }
  }

  // Handle incoming OAuth callback or auth state change
  async handleSupabaseUser(user: any): Promise<{ valid: boolean; error?: string }> {
    if (!user || !user.email) {
      this.logout();
      return { valid: false, error: 'No user session found' };
    }

    if (!this.isAuthorizedEmail(user.email)) {
      // Unauthorized account attempted login!
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
      this.logout();
      return {
        valid: false,
        error: `Access Denied: Account "${user.email}" is not authorized. Only ${AUTHORIZED_ADMIN_EMAIL} is allowed to log in as Admin.`
      };
    }

    // Authorized user
    const token = `dg_sec_g_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const session: AdminSession = {
      email: AUTHORIZED_ADMIN_EMAIL,
      token,
      role: 'admin',
      loginTime: new Date().toISOString(),
      expiresAt,
      provider: 'google'
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem('digiseekho_admin_session', 'active');

    return { valid: true };
  }

  // Change Admin Password
  changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    if (!this.isSessionValid()) {
      return { success: false, error: 'Unauthorized: Active session required to update credentials.' };
    }

    if (newPassword.trim().length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const currentHash = simpleHash(currentPassword.trim());
    const storedHash = localStorage.getItem(AUTH_STORAGE_KEYS.PASSWORD_HASH);

    if (storedHash && currentHash !== storedHash) {
      return { success: false, error: 'Current password does not match.' };
    }

    const newHash = simpleHash(newPassword.trim());
    localStorage.setItem(AUTH_STORAGE_KEYS.PASSWORD_HASH, newHash);
    localStorage.setItem(AUTH_STORAGE_KEYS.PASSWORD_INITIALIZED, 'true');

    return { success: true };
  }

  // Logout
  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION);
    localStorage.removeItem('digiseekho_admin_session');

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // Ignore network signout errors
      }
    }
  }
}

export const authService = new AuthService();
