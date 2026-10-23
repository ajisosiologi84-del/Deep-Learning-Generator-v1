import { AppToken, AdminConfig, TokenSession, TokenValidationResult } from '../types/token';
import { supabaseService } from './supabaseService';

const STORAGE_KEY_TOKENS = 'dl_rpp_tokens_v1';
const STORAGE_KEY_ADMIN_CONFIG = 'dl_rpp_admin_config_v1';
const STORAGE_KEY_SESSION = 'dl_rpp_active_session_v1';

// Default Admin Master configuration
const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  requireTokenLogin: true,
  adminPasscode: 'ADMIN#DEEP2026',
  allowGuestAccessIfDisabled: true,
  appName: 'Perancang RPP Deep Learning BSKAP',
};

// Default tokens available out-of-the-box
const INITIAL_TOKENS: AppToken[] = [
  {
    id: 'tok-bskap-001',
    token: 'DL-BSKAP-2026',
    label: 'Token Guru Penggerak BSKAP (Akses Penuh)',
    schoolName: 'Sekolah Penggerak Kemendikbudristek',
    role: 'guru',
    maxUses: -1,
    usedCount: 0,
    expiresAt: null, // Berlaku selamanya
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: 'Token resmi percontohan Deep Learning BSKAP Kurikulum Merdeka',
  },
  {
    id: 'tok-merdeka-002',
    token: 'GURU-MERDEKA',
    label: 'Lisensi Guru Merdeka Mandiri',
    schoolName: 'Satuan Pendidikan Pelaksana Kurikulum Merdeka',
    role: 'guru',
    maxUses: 100,
    usedCount: 0,
    expiresAt: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: 'Token umum pelatihan guru',
  },
  {
    id: 'tok-pengawas-003',
    token: 'PENGAWAS-DEEP',
    label: 'Akses Pengawas & Fasilitator Sekolah',
    schoolName: 'Dinas Pendidikan & Kebudayaan',
    role: 'pengawas',
    maxUses: -1,
    usedCount: 0,
    expiresAt: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    notes: 'Khusus telaah dan supervisi RPP',
  },
];

export const tokenService = {
  getAdminConfig(): AdminConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_CONFIG);
      if (stored) {
        return { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load admin config, using defaults:', e);
    }
    return DEFAULT_ADMIN_CONFIG;
  },

  updateAdminConfig(updates: Partial<AdminConfig>): AdminConfig {
    const current = this.getAdminConfig();
    const next = { ...current, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_CONFIG, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save admin config:', e);
    }
    return next;
  },

  verifyAdminPasscode(passcode: string): boolean {
    const config = this.getAdminConfig();
    return passcode.trim() === config.adminPasscode.trim();
  },

  getAllTokens(): AppToken[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse tokens from localStorage, using initial tokens:', e);
    }

    // Save initial tokens
    this.saveTokens(INITIAL_TOKENS);
    return INITIAL_TOKENS;
  },

  saveTokens(tokens: AppToken[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
    } catch (e) {
      console.error('Failed to persist tokens:', e);
    }
  },

  createToken(params: {
    token: string;
    label: string;
    schoolName?: string;
    role?: 'guru' | 'pengawas' | 'admin';
    maxUses?: number;
    expiresAt?: string | null;
    notes?: string;
  }): AppToken {
    const tokens = this.getAllTokens();
    const cleanToken = params.token.trim().toUpperCase().replace(/\s+/g, '-');

    // Check if token already exists
    const existingIndex = tokens.findIndex((t) => t.token.toUpperCase() === cleanToken);
    if (existingIndex !== -1) {
      throw new Error(`Token "${cleanToken}" sudah terdaftar! Gunakan kode token yang berbeda.`);
    }

    const newToken: AppToken = {
      id: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      token: cleanToken,
      label: params.label.trim() || 'Akses Guru',
      schoolName: params.schoolName?.trim() || '',
      role: params.role || 'guru',
      maxUses: params.maxUses ?? -1,
      usedCount: 0,
      expiresAt: params.expiresAt || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      notes: params.notes || '',
    };

    tokens.unshift(newToken);
    this.saveTokens(tokens);
    return newToken;
  },

  generateRandomTokenString(prefix = 'DL'): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `${prefix}-${year}-${code}`;
  },

  generateBatchTokens(count: number, prefix = 'GURU', daysValid = 30): AppToken[] {
    const created: AppToken[] = [];
    const expiresAt = daysValid > 0
      ? new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString()
      : null;

    for (let i = 1; i <= count; i++) {
      const code = this.generateRandomTokenString(prefix);
      try {
        const token = this.createToken({
          token: code,
          label: `Voucher Guru #${i} (${daysValid > 0 ? `${daysValid} Hari` : 'Aktif Penuh'})`,
          schoolName: 'Sekolah Penggerak',
          role: 'guru',
          maxUses: -1,
          expiresAt,
          notes: 'Digenerate secara massal oleh Administrator',
        });
        created.push(token);
      } catch {
        // If collision, continue
      }
    }
    return created;
  },

  toggleTokenStatus(id: string): AppToken | null {
    const tokens = this.getAllTokens();
    const token = tokens.find((t) => t.id === id);
    if (!token) return null;

    token.isActive = !token.isActive;
    this.saveTokens(tokens);
    return token;
  },

  deleteToken(id: string): boolean {
    const tokens = this.getAllTokens();
    const filtered = tokens.filter((t) => t.id !== id);
    if (filtered.length !== tokens.length) {
      this.saveTokens(filtered);
      return true;
    }
    return false;
  },

  validateToken(inputToken: string): TokenValidationResult {
    const cleaned = inputToken.trim();
    if (!cleaned) {
      return { valid: false, message: 'Silakan masukkan kode token akses!' };
    }

    const config = this.getAdminConfig();

    // Check if user entered Admin Master Passcode directly
    if (cleaned === config.adminPasscode) {
      return {
        valid: true,
        message: 'Berhasil login sebagai Administrator!',
        isAdminPasscode: true,
        tokenData: {
          id: 'admin-master',
          token: 'MASTER-ADMIN',
          label: 'Super Administrator',
          role: 'admin',
          maxUses: -1,
          usedCount: 1,
          expiresAt: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          notes: 'Sesi login via Master Admin Passcode',
        },
      };
    }

    const tokens = this.getAllTokens();
    const matched = tokens.find((t) => t.token.toUpperCase() === cleaned.toUpperCase());

    if (!matched) {
      return {
        valid: false,
        message: 'Token tidak valid atau tidak terdaftar dalam sistem.',
      };
    }

    if (!matched.isActive) {
      return {
        valid: false,
        message: 'Token ini telah dinonaktifkan oleh Administrator.',
      };
    }

    // Check expiration
    if (matched.expiresAt) {
      const expDate = new Date(matched.expiresAt);
      if (new Date() > expDate) {
        return {
          valid: false,
          message: `Masa berlaku token telah habis pada ${expDate.toLocaleDateString('id-ID')}. Hubungi Administrator.`,
        };
      }
    }

    // Check usage limits
    if (matched.maxUses > 0 && matched.usedCount >= matched.maxUses) {
      return {
        valid: false,
        message: `Batas kuota penggunaan token ini (${matched.maxUses}x) telah habis.`,
      };
    }

    // Increment used count
    matched.usedCount += 1;
    this.saveTokens(tokens);

    return {
      valid: true,
      message: `Akses diberikan! Selamat datang, ${matched.label}.`,
      tokenData: matched,
    };
  },

  /**
   * Asynchronous validation supporting Supabase Cloud as primary gate
   */
  async validateTokenAsync(tokenInput: string): Promise<TokenValidationResult> {
    const cleaned = tokenInput.trim();
    if (!cleaned) {
      return { valid: false, message: 'Silakan masukkan kode token akses!' };
    }

    // 0. Quick check for Master Admin Passcode
    const config = this.getAdminConfig();
    if (cleaned === config.adminPasscode) {
      return {
        valid: true,
        message: 'Berhasil login sebagai Administrator!',
        isAdminPasscode: true,
        tokenData: {
          id: 'admin-master',
          token: 'MASTER-ADMIN',
          label: 'Super Administrator',
          role: 'admin',
          maxUses: -1,
          usedCount: 1,
          expiresAt: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          notes: 'Sesi login via Master Admin Passcode',
        },
      };
    }

    // 1. Primary: Verify via Server-side Proxy (/api/validate-token)
    // This completely circumvents browser CORS, ad-blockers, and 3rd-party cookie restrictions
    try {
      const apiRes = await fetch('/api/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleaned }),
      });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.valid && apiData.tokenData) {
          // Sync token into local storage for offline access
          const tokens = this.getAllTokens();
          const existingIdx = tokens.findIndex((t) => t.token.toUpperCase() === apiData.tokenData.token.toUpperCase());
          if (existingIdx >= 0) {
            tokens[existingIdx] = apiData.tokenData;
          } else {
            tokens.unshift(apiData.tokenData);
          }
          this.saveTokens(tokens);
          return apiData;
        }

        // If explicitly restricted by status/expiration/quota, return server diagnostic
        if (apiData.message && (
          apiData.message.includes('dinonaktifkan') || 
          apiData.message.includes('habis') || 
          apiData.message.includes('kedaluwarsa')
        )) {
          return apiData;
        }
      }
    } catch (apiErr) {
      console.warn('Backend proxy validation failed, attempting client fallback:', apiErr);
    }

    // 2. Secondary: If server endpoint is unreachable, verify directly from client to Supabase
    if (supabaseService.isConfigured()) {
      try {
        const cloudResult = await supabaseService.validateTokenFromCloud(cleaned);
        if (cloudResult && cloudResult.valid && cloudResult.tokenData) {
          const tokens = this.getAllTokens();
          const existingIdx = tokens.findIndex((t) => t.token.toUpperCase() === cloudResult.tokenData!.token.toUpperCase());
          if (existingIdx >= 0) {
            tokens[existingIdx] = cloudResult.tokenData;
          } else {
            tokens.unshift(cloudResult.tokenData);
          }
          this.saveTokens(tokens);
          return cloudResult;
        }
      } catch (err) {
        console.warn('Direct client Supabase check failed, checking local database:', err);
      }
    }

    // 3. Tertiary: Fallback to Local DB verification
    const localResult = this.validateToken(cleaned);
    return localResult;
  },

  /**
   * Syncs all active cloud tokens from Supabase into this browser's local database
   */
  async syncCloudTokens(): Promise<AppToken[]> {
    try {
      // 1. Try server endpoint
      const res = await fetch('/api/tokens/cloud');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.tokens) && data.tokens.length > 0) {
          const cloudTokens: AppToken[] = data.tokens.map((row: any) => ({
            id: row.id || `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            token: row.token,
            label: row.label,
            schoolName: row.school_name || '',
            role: row.role || 'guru',
            maxUses: typeof row.max_uses === 'number' ? row.max_uses : -1,
            usedCount: typeof row.used_count === 'number' ? row.used_count : 0,
            expiresAt: row.expires_at || null,
            isActive: Boolean(row.is_active),
            createdAt: row.created_at || new Date().toISOString(),
            notes: row.notes || '',
          }));
          this.saveTokens(cloudTokens);
          return cloudTokens;
        }
      }
    } catch (e) {
      // Fallback to direct client pull
    }

    // 2. Fallback to direct client pull if configured
    if (supabaseService.isConfigured()) {
      try {
        const pullRes = await supabaseService.pullTokensFromSupabase();
        if (pullRes.success && pullRes.tokens.length > 0) {
          this.saveTokens(pullRes.tokens);
          return pullRes.tokens;
        }
      } catch (e) {
        // quiet
      }
    }

    return this.getAllTokens();
  },

  getActiveSession(): TokenSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION);
      if (stored) {
        const session: TokenSession = JSON.parse(stored);
        const config = this.getAdminConfig();

        // If admin session
        if (session.isAdmin) {
          return session;
        }

        // Validate if token is still valid in system
        const tokens = this.getAllTokens();
        const matched = tokens.find((t) => t.token.toUpperCase() === session.token.toUpperCase());

        if (!matched || !matched.isActive) {
          this.clearActiveSession();
          return null;
        }

        if (matched.expiresAt && new Date() > new Date(matched.expiresAt)) {
          this.clearActiveSession();
          return null;
        }

        return session;
      }
    } catch (e) {
      console.warn('Failed to retrieve active token session:', e);
    }
    return null;
  },

  setActiveSession(session: TokenSession): void {
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },

  clearActiveSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  },

  exportTokensJson(): string {
    const tokens = this.getAllTokens();
    return JSON.stringify(tokens, null, 2);
  },

  importTokensJson(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Format JSON harus berupa daftar token (array).' };
      }

      const validTokens: AppToken[] = [];
      for (const item of parsed) {
        if (item.token && item.label) {
          validTokens.push({
            id: item.id || `tok-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            token: item.token.toUpperCase(),
            label: item.label,
            schoolName: item.schoolName || '',
            role: item.role || 'guru',
            maxUses: typeof item.maxUses === 'number' ? item.maxUses : -1,
            usedCount: typeof item.usedCount === 'number' ? item.usedCount : 0,
            expiresAt: item.expiresAt || null,
            isActive: item.isActive ?? true,
            createdAt: item.createdAt || new Date().toISOString(),
            notes: item.notes || '',
          });
        }
      }

      if (validTokens.length === 0) {
        return { success: false, count: 0, error: 'Tidak ada data token yang valid dalam file.' };
      }

      this.saveTokens(validTokens);
      return { success: true, count: validTokens.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Gagal membaca file JSON.' };
    }
  },
};
