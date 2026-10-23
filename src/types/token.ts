export interface AppToken {
  id: string;
  token: string;
  label: string; // e.g., "Guru Matematika SMP", "Bu Nurul, S.Pd."
  schoolName?: string;
  role: 'guru' | 'pengawas' | 'admin';
  maxUses: number; // -1 for unlimited
  usedCount: number;
  expiresAt: string | null; // ISO string or null for lifetime
  isActive: boolean;
  createdAt: string;
  notes?: string;
}

export interface TokenSession {
  token: string;
  label: string;
  role: 'guru' | 'pengawas' | 'admin';
  schoolName?: string;
  loginTime: string;
  isAdmin?: boolean;
}

export interface GoogleSheetsWebhookConfig {
  enabled: boolean;
  webhookUrl: string; // e.g. https://script.google.com/macros/s/.../exec
  logOnLogin: boolean;
  logOnGenerateRpp: boolean;
  logOnExportDoc: boolean;
  lastTestedAt?: string | null;
  lastTestStatus?: 'success' | 'failed' | null;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO String
  actionType: 'LOGIN' | 'GENERATE_RPP' | 'EXPORT_DOC' | 'TEST_PING';
  userLabel: string;
  tokenCode: string;
  schoolName?: string;
  role?: string;
  details: string;
  subject?: string;
  gradeLevel?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  syncedToSheets?: boolean;
}

export interface SupabaseConfig {
  enabled: boolean;
  supabaseUrl: string; // e.g. https://xyzcompany.supabase.co
  supabaseAnonKey: string;
  tableName?: string; // defaults to 'app_tokens'
  lastTestedAt?: string | null;
  lastTestStatus?: 'success' | 'failed' | null;
}

export interface AdminConfig {
  requireTokenLogin: boolean;
  adminPasscode: string;
  allowGuestAccessIfDisabled: boolean;
  appName: string;
  webhookConfig?: GoogleSheetsWebhookConfig;
  supabaseConfig?: SupabaseConfig;
}

export interface TokenValidationResult {
  valid: boolean;
  message: string;
  tokenData?: AppToken;
  isAdminPasscode?: boolean;
}
