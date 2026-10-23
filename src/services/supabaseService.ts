import { SupabaseConfig, AppToken, TokenValidationResult } from '../types/token';

const STORAGE_KEY_SUPABASE_CONFIG = 'dl_rpp_supabase_config_v1';

export const SUPABASE_SQL_SETUP = `-- =======================================================
-- SQL SETUP: TABEL TOKEN & AUDIT LOG DEEP LEARNING BSKAP
-- Jalankan query ini di menu "SQL Editor" pada Dashboard Supabase Anda
-- =======================================================

-- 1. Buat Tabel Tokens
CREATE TABLE IF NOT EXISTS app_tokens (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  school_name TEXT,
  role TEXT DEFAULT 'guru',
  max_uses INTEGER DEFAULT -1,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 2. Aktifkan Keamanan Row Level Security (RLS)
ALTER TABLE app_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan (Public Anon Key)
-- Bersihkan policy lama jika sudah pernah dijalankan sebelumnya (idempotent):
DROP POLICY IF EXISTS "Izinkan baca token aktif" ON app_tokens;
DROP POLICY IF EXISTS "Izinkan update kuota token" ON app_tokens;
DROP POLICY IF EXISTS "Izinkan kelola token publik" ON app_tokens;

-- Izinkan guru membaca token aktif untuk validasi login
CREATE POLICY "Izinkan baca token aktif" 
  ON app_tokens 
  FOR SELECT 
  TO anon 
  USING (is_active = true);

-- Izinkan increment used_count saat login berhasil
CREATE POLICY "Izinkan update kuota token" 
  ON app_tokens 
  FOR UPDATE 
  TO anon 
  USING (true);

-- Izinkan kelola token (insert/update/delete)
CREATE POLICY "Izinkan kelola token publik" 
  ON app_tokens 
  FOR ALL 
  TO anon 
  USING (true) 
  WITH CHECK (true);

-- 4. Masukkan Data Token Default Awal
INSERT INTO app_tokens (id, token, label, school_name, role, max_uses, used_count, is_active, notes)
VALUES 
  ('tok-bskap-001', 'DL-BSKAP-2026', 'Token Guru Penggerak BSKAP (Akses Penuh)', 'Sekolah Penggerak Kemendikbudristek', 'guru', -1, 0, true, 'Token master BSKAP'),
  ('tok-merdeka-002', 'GURU-MERDEKA', 'Lisensi Guru Merdeka Mandiri', 'Satuan Pendidikan Kurikulum Merdeka', 'guru', 100, 0, true, 'Token umum guru'),
  ('tok-pengawas-003', 'PENGAWAS-DEEP', 'Akses Pengawas & Fasilitator Sekolah', 'Dinas Pendidikan & Kebudayaan', 'pengawas', -1, 0, true, 'Token supervisi RPP')
ON CONFLICT (token) DO NOTHING;
`;

const DEFAULT_SUPABASE_URL = 'https://ozprerxcoxyhfclnbioc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cHJlcnhjb3h5aGZjbG5iaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mzc5MjIsImV4cCI6MjEwNzExMzkyMn0.Bye79O7mcfz6gjHGDAFcqUihGW03mpUxy4QkALrbl9s';

const getEnvSupabase = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return {
    url: typeof envUrl === 'string' && envUrl.trim() ? envUrl.trim() : DEFAULT_SUPABASE_URL,
    key: typeof envKey === 'string' && envKey.trim() ? envKey.trim() : DEFAULT_SUPABASE_ANON_KEY,
  };
};

const envDefaults = getEnvSupabase();

const DEFAULT_CONFIG: SupabaseConfig = {
  enabled: true,
  supabaseUrl: envDefaults.url,
  supabaseAnonKey: envDefaults.key,
  tableName: 'app_tokens',
  lastTestedAt: null,
  lastTestStatus: 'success',
};

export const supabaseService = {
  getConfig(): SupabaseConfig {
    const env = getEnvSupabase();
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
      if (stored) {
        const parsed: SupabaseConfig = JSON.parse(stored);
        // If stored config lacks URL or Key but env vars are available, supplement them
        const mergedUrl = parsed.supabaseUrl || env.url;
        const mergedKey = parsed.supabaseAnonKey || env.key;
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          supabaseUrl: mergedUrl,
          supabaseAnonKey: mergedKey,
          enabled: parsed.enabled ?? Boolean(mergedUrl && mergedKey),
        };
      }
    } catch (e) {
      console.warn('Failed to load Supabase config:', e);
    }
    return { ...DEFAULT_CONFIG };
  },

  saveConfig(partial: Partial<SupabaseConfig>): SupabaseConfig {
    const current = this.getConfig();
    const updated: SupabaseConfig = { ...current, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save Supabase config:', e);
    }
    return updated;
  },

  /**
   * Saves configuration both to browser localStorage and to the application backend
   * so every teacher, device, and browser automatically inherits the configuration.
   */
  async saveConfigToServer(partial: Partial<SupabaseConfig>): Promise<SupabaseConfig> {
    const updated = this.saveConfig(partial);
    try {
      await fetch('/api/cloud-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabase: {
            supabaseUrl: updated.supabaseUrl,
            supabaseAnonKey: updated.supabaseAnonKey,
            tableName: updated.tableName,
            enabled: updated.enabled,
          },
        }),
      });
    } catch (e) {
      console.warn('Could not persist Supabase config to server:', e);
    }
    return updated;
  },

  /**
   * Synchronizes configuration from global backend so new browsers & devices
   * immediately get connected to Supabase without manual configuration.
   */
  async syncFromGlobalServer(): Promise<SupabaseConfig> {
    try {
      const res = await fetch('/api/cloud-config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.supabase && (data.supabase.supabaseUrl || data.supabase.supabaseAnonKey)) {
          const current = this.getConfig();
          const merged: SupabaseConfig = {
            ...current,
            supabaseUrl: data.supabase.supabaseUrl || current.supabaseUrl,
            supabaseAnonKey: data.supabase.supabaseAnonKey || current.supabaseAnonKey,
            tableName: data.supabase.tableName || current.tableName || 'app_tokens',
            enabled: typeof data.supabase.enabled === 'boolean' ? data.supabase.enabled : Boolean(data.supabase.supabaseUrl && data.supabase.supabaseAnonKey),
          };
          this.saveConfig(merged);
          return merged;
        }
      }
    } catch (e) {
      // Quiet fallback
    }
    return this.getConfig();
  },

  isConfigured(): boolean {
    const cfg = this.getConfig();
    return Boolean(cfg.enabled && cfg.supabaseUrl && cfg.supabaseAnonKey);
  },

  cleanUrl(rawUrl: string): string {
    return rawUrl.trim().replace(/\/+$/, '');
  },

  getHeaders(anonKey: string) {
    return {
      'apikey': anonKey.trim(),
      'Authorization': `Bearer ${anonKey.trim()}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  },

  /**
   * Test connection to Supabase REST endpoint
   */
  async testConnection(customUrl?: string, customKey?: string): Promise<{
    success: boolean;
    message: string;
    rowCount?: number;
  }> {
    const cfg = this.getConfig();
    const url = this.cleanUrl(customUrl ?? cfg.supabaseUrl);
    const key = (customKey ?? cfg.supabaseAnonKey).trim();
    const tableName = cfg.tableName || 'app_tokens';

    if (!url || !key) {
      return {
        success: false,
        message: 'URL Supabase dan Anon Public Key wajib diisi.',
      };
    }

    try {
      const endpoint = `${url}/rest/v1/${tableName}?select=count`;
      const res = await fetch(endpoint, {
        method: 'HEAD',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'count=exact',
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            message: 'Otorisasi gagal (401/403). Pastikan Anon Public Key benar.',
          };
        }
        if (res.status === 404) {
          return {
            success: false,
            message: `Tabel "${tableName}" belum ditemukan di Supabase. Silakan jalankan script SQL yang tersedia.`,
          };
        }
        return {
          success: false,
          message: `Gagal tersambung (Status ${res.status}): ${res.statusText}`,
        };
      }

      // Check row count from Content-Range header
      const contentRange = res.headers.get('content-range');
      let count = 0;
      if (contentRange && contentRange.includes('/')) {
        const total = contentRange.split('/')[1];
        count = parseInt(total, 10) || 0;
      }

      this.saveConfig({
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'success',
      });

      return {
        success: true,
        message: `Terhubung sukses ke Supabase Cloud! Ditemukan ${count} token di database.`,
        rowCount: count,
      };
    } catch (err: any) {
      this.saveConfig({
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'failed',
      });
      return {
        success: false,
        message: `Koneksi gagal atau CORS terblokir: ${err?.message || 'Periksa jaringan internet'}`,
      };
    }
  },

  /**
   * Validate a token directly against Supabase Cloud
   */
  async validateTokenFromCloud(tokenInput: string): Promise<TokenValidationResult | null> {
    if (!this.isConfigured()) return null;

    const cfg = this.getConfig();
    const url = this.cleanUrl(cfg.supabaseUrl);
    const key = cfg.supabaseAnonKey.trim();
    const tableName = cfg.tableName || 'app_tokens';
    const cleanToken = tokenInput.trim();

    try {
      // Use case-insensitive ilike query so DL-BSKAP-2026 matches dl-bskap-2026
      const endpoint = `${url}/rest/v1/${tableName}?token=ilike.${encodeURIComponent(cleanToken)}&select=*`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(key),
      });

      if (!res.ok) {
        console.warn('Supabase token fetch error:', res.status);
        if (res.status === 401 || res.status === 403) {
          return {
            valid: false,
            message: 'Akses Supabase ditolak (401/403). Pastikan Anon Public Key benar & Policy RLS untuk role "anon" aktif di dashboard Supabase.',
          };
        }
        if (res.status === 404) {
          return {
            valid: false,
            message: `Tabel "${tableName}" tidak ditemukan di database Supabase Cloud. Pastikan nama tabel adalah "${tableName}".`,
          };
        }
        return {
          valid: false,
          message: `Koneksi Supabase Cloud bermasalah (Status ${res.status}): ${res.statusText}`,
        };
      }

      const rows: any[] = await res.json();
      if (!rows || rows.length === 0) {
        return {
          valid: false,
          message: `Token "${cleanToken}" tidak ditemukan di tabel "${tableName}" database Supabase Cloud. Pastikan kode cocok dan Policy RLS SELECT diizinkan.`,
        };
      }

      const row = rows[0];

      // Convert DB row to AppToken
      const appToken: AppToken = {
        id: row.id,
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
      };

      if (!appToken.isActive) {
        return {
          valid: false,
          message: 'Token ini terdaftar di Supabase namun statusnya dinonaktifkan (is_active = false) oleh administrator.',
          tokenData: appToken,
        };
      }

      if (appToken.expiresAt && new Date() > new Date(appToken.expiresAt)) {
        return {
          valid: false,
          message: 'Masa berlaku token telah kedaluwarsa.',
          tokenData: appToken,
        };
      }

      if (appToken.maxUses > 0 && appToken.usedCount >= appToken.maxUses) {
        return {
          valid: false,
          message: `Batas kuota token (${appToken.maxUses}x) telah habis.`,
          tokenData: appToken,
        };
      }

      // Increment used count in cloud asynchronously
      this.incrementUsageOnSupabase(appToken.token, appToken.usedCount + 1).catch(console.warn);

      return {
        valid: true,
        message: `Akses berhasil diverifikasi via Supabase Cloud! Selamat datang, ${appToken.label}.`,
        tokenData: { ...appToken, usedCount: appToken.usedCount + 1 },
      };
    } catch (e: any) {
      console.warn('Network error checking Supabase token:', e);
      return {
        valid: false,
        message: `Gagal terhubung ke database Supabase Cloud: ${e?.message || 'Periksa koneksi internet Anda.'}`,
      };
    }
  },

  /**
   * Increment usage count for a token in Supabase
   */
  async incrementUsageOnSupabase(token: string, newCount: number): Promise<boolean> {
    if (!this.isConfigured()) return false;
    const cfg = this.getConfig();
    const url = this.cleanUrl(cfg.supabaseUrl);
    const key = cfg.supabaseAnonKey.trim();
    const tableName = cfg.tableName || 'app_tokens';

    try {
      const endpoint = `${url}/rest/v1/${tableName}?token=eq.${encodeURIComponent(token)}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders(key),
        body: JSON.stringify({ used_count: newCount }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update used_count in Supabase:', e);
      return false;
    }
  },

  /**
   * Pull all tokens from Supabase to local storage
   */
  async pullTokensFromSupabase(): Promise<{ success: boolean; tokens: AppToken[]; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, tokens: [], message: 'Supabase belum diaktifkan atau dikonfigurasi.' };
    }

    const cfg = this.getConfig();
    const url = this.cleanUrl(cfg.supabaseUrl);
    const key = cfg.supabaseAnonKey.trim();
    const tableName = cfg.tableName || 'app_tokens';

    try {
      const endpoint = `${url}/rest/v1/${tableName}?select=*&order=created_at.desc`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(key),
      });

      if (!res.ok) {
        return {
          success: false,
          tokens: [],
          message: `Gagal mengambil data dari Supabase (Status ${res.status})`,
        };
      }

      const rows: any[] = await res.json();
      const tokens: AppToken[] = rows.map((row) => ({
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

      return {
        success: true,
        tokens,
        message: `Berhasil menarik ${tokens.length} token dari Supabase Cloud!`,
      };
    } catch (e: any) {
      return {
        success: false,
        tokens: [],
        message: `Gagal mengambil token dari Supabase: ${e?.message || 'Gangguan koneksi'}`,
      };
    }
  },

  /**
   * Push local tokens to Supabase
   */
  async pushLocalTokensToSupabase(tokens: AppToken[]): Promise<{
    success: boolean;
    syncedCount: number;
    message: string;
  }> {
    if (!this.isConfigured()) {
      return { success: false, syncedCount: 0, message: 'Supabase belum dikonfigurasi.' };
    }

    const cfg = this.getConfig();
    const url = this.cleanUrl(cfg.supabaseUrl);
    const key = cfg.supabaseAnonKey.trim();
    const tableName = cfg.tableName || 'app_tokens';

    try {
      const rows = tokens.map((t) => ({
        id: t.id,
        token: t.token,
        label: t.label,
        school_name: t.schoolName || '',
        role: t.role,
        max_uses: t.maxUses,
        used_count: t.usedCount,
        expires_at: t.expiresAt,
        is_active: t.isActive,
        created_at: t.createdAt,
        notes: t.notes || '',
      }));

      const endpoint = `${url}/rest/v1/${tableName}?on_conflict=token`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...this.getHeaders(key),
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(rows),
      });

      if (!res.ok) {
        return {
          success: false,
          syncedCount: 0,
          message: `Gagal mengirim token ke Supabase (Status ${res.status}). Pastikan policy insert diizinkan.`,
        };
      }

      return {
        success: true,
        syncedCount: tokens.length,
        message: `Sukses menyinkronkan ${tokens.length} token ke Supabase Cloud!`,
      };
    } catch (e: any) {
      return {
        success: false,
        syncedCount: 0,
        message: `Gagal sinkronisasi ke Supabase: ${e?.message || 'Gangguan koneksi'}`,
      };
    }
  },
};
