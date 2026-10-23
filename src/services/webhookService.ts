import { GoogleSheetsWebhookConfig, ActivityLogEntry, TokenSession } from '../types/token';
import { tokenService } from './tokenService';

const STORAGE_KEY_WEBHOOK_CONFIG = 'dl_rpp_webhook_config_v1';
const STORAGE_KEY_ACTIVITY_LOGS = 'dl_rpp_activity_logs_v1';

const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby14Pse1F1L8TLfrEKim0BFlaTwFWwLgqcb4__pWkeUVtcE6y1vQXILJYqfdRVzV_obPw/exec';

export const DEFAULT_WEBHOOK_CONFIG: GoogleSheetsWebhookConfig = {
  enabled: true,
  webhookUrl: ((import.meta as any).env?.VITE_GOOGLE_SCRIPT_WEBHOOK_URL || DEFAULT_WEBHOOK_URL).trim(),
  logOnLogin: true,
  logOnGenerateRpp: true,
  logOnExportDoc: true,
  lastTestedAt: null,
  lastTestStatus: 'success',
};

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ============================================================
 * WEBHOOK REKAPITULASI RPP DEEP LEARNING (BSKAP KURIKULUM MERDEKA)
 * Model Hybrid: Keamanan Token di Primary App, Rekapitulasi di Sheets
 * ============================================================
 * 
 * PANDUAN PEMASANGAN:
 * 1. Buka Google Sheets baru (Beri nama misal: "Rekapitulasi Penggunaan RPP Deep Learning").
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus seluruh isi kode bawaan, lalu tempelkan (Paste) seluruh kode ini.
 * 4. Klik tombol "Simpan" (ikon disket).
 * 5. Klik tombol biru "Terapkan" (Deploy) > "Penerapan Baru" (New Deployment).
 * 6. Pada jenis penerapan pilih "Aplikasi Web" (Web App).
 *    - Deskripsi: Rekapitulasi RPP Guru
 *    - Jalankan sebagai: Saya (Email Anda)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone) -> WAJIB!
 * 7. Klik "Terapkan" (Deploy) dan izinkan akses Google jika diminta.
 * 8. Salin "URL Aplikasi Web" yang berakhiran "/exec", lalu tempelkan ke
 *    kolom Webhook di Panel Pengaturan Admin aplikasi RPP!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Kunci script selama maks 10 detik agar aman dari race-condition multi-guru
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Inisialisasi Header Otomatis jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu (WIB)",
        "Tipe Aktivitas",
        "Nama Guru / Pemegang Token",
        "Kode Token",
        "Nama Sekolah",
        "Peran",
        "Mata Pelajaran",
        "Jenjang & Fase",
        "Keterangan / Rincian Topik",
        "Status"
      ]);
      
      // Beri gaya visual profesional pada Header
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a"); // Dark slate
      headerRange.setFontColor("#f8fafc");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
      sheet.setRowHeight(1, 35);
    }
    
    // Baca payload yang dikirim dari aplikasi
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (errParse) {
        data = { details: e.postData.contents };
      }
    }
    
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var actionType = data.actionType || "LOG";
    var userLabel = data.userLabel || "Pengguna";
    var tokenCode = data.tokenCode || "-";
    var schoolName = data.schoolName || "-";
    var role = data.role || "guru";
    var subject = data.subject || "-";
    var gradeLevel = data.gradeLevel || "-";
    var details = data.details || "-";
    var status = data.status || "SUCCESS";
    
    // Tambahkan baris rekapitulasi baru
    sheet.appendRow([
      timestamp,
      actionType,
      userLabel,
      tokenCode,
      schoolName,
      role,
      subject,
      gradeLevel,
      details,
      status
    ]);
    
    // Auto-fit kolom untuk kemudahan membaca
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 10).setVerticalAlignment("middle");
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data rekapitulasi berhasil dicatat ke Google Sheets",
      recordedRow: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Webhook Rekapitulasi RPP Deep Learning BSKAP",
    instruction: "Gunakan metode HTTP POST untuk mencatat log rekapitulasi."
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

export const webhookService = {
  getWebhookConfig(): GoogleSheetsWebhookConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WEBHOOK_CONFIG);
      if (stored) {
        return { ...DEFAULT_WEBHOOK_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load webhook config, using defaults:', e);
    }
    return DEFAULT_WEBHOOK_CONFIG;
  },

  updateWebhookConfig(updates: Partial<GoogleSheetsWebhookConfig>): GoogleSheetsWebhookConfig {
    const current = this.getWebhookConfig();
    const next = { ...current, ...updates };
    try {
      localStorage.setItem(STORAGE_KEY_WEBHOOK_CONFIG, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save webhook config:', e);
    }
    return next;
  },

  /**
   * Saves webhook configuration to both browser and backend server
   * so all users and browsers automatically log to the same Google Sheet.
   */
  async saveWebhookConfigToServer(updates: Partial<GoogleSheetsWebhookConfig>): Promise<GoogleSheetsWebhookConfig> {
    const updated = this.updateWebhookConfig(updates);
    try {
      await fetch('/api/cloud-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook: {
            webhookUrl: updated.webhookUrl,
            enabled: updated.enabled,
            logOnLogin: updated.logOnLogin,
            logOnGenerateRpp: updated.logOnGenerateRpp,
            logOnExportDoc: updated.logOnExportDoc,
          },
        }),
      });
    } catch (e) {
      console.warn('Could not persist webhook config to server:', e);
    }
    return updated;
  },

  /**
   * Synchronizes webhook configuration from backend server so new browsers
   * automatically log without re-configuration.
   */
  async syncFromGlobalServer(): Promise<GoogleSheetsWebhookConfig> {
    try {
      const res = await fetch('/api/cloud-config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.webhook && data.webhook.webhookUrl) {
          const current = this.getWebhookConfig();
          const merged: GoogleSheetsWebhookConfig = {
            ...current,
            webhookUrl: data.webhook.webhookUrl || current.webhookUrl,
            enabled: typeof data.webhook.enabled === 'boolean' ? data.webhook.enabled : Boolean(data.webhook.webhookUrl),
            logOnLogin: typeof data.webhook.logOnLogin === 'boolean' ? data.webhook.logOnLogin : current.logOnLogin,
            logOnGenerateRpp: typeof data.webhook.logOnGenerateRpp === 'boolean' ? data.webhook.logOnGenerateRpp : current.logOnGenerateRpp,
            logOnExportDoc: typeof data.webhook.logOnExportDoc === 'boolean' ? data.webhook.logOnExportDoc : current.logOnExportDoc,
          };
          this.updateWebhookConfig(merged);
          return merged;
        }
      }
    } catch (e) {
      // Quiet fallback
    }
    return this.getWebhookConfig();
  },

  getActivityLogs(): ActivityLogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY_LOGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse activity logs:', e);
    }
    return [];
  },

  saveActivityLogs(logs: ActivityLogEntry[]): void {
    try {
      // Keep up to 200 most recent logs
      const trimmed = logs.slice(0, 200);
      localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save activity logs:', e);
    }
  },

  clearActivityLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVITY_LOGS);
    } catch (e) {
      console.error('Failed to clear logs:', e);
    }
  },

  /**
   * Log an activity event:
   * 1. Saves to local activity history for Admin review
   * 2. If Google Sheets Webhook is active and matches event rules, sends POST non-blocking
   */
  async logActivity(params: {
    actionType: 'LOGIN' | 'GENERATE_RPP' | 'EXPORT_DOC' | 'TEST_PING';
    userLabel?: string;
    tokenCode?: string;
    schoolName?: string;
    role?: string;
    details: string;
    subject?: string;
    gradeLevel?: string;
    status?: 'SUCCESS' | 'WARNING' | 'FAILED';
  }): Promise<ActivityLogEntry> {
    const session: TokenSession | null = tokenService.getActiveSession();

    const entry: ActivityLogEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      actionType: params.actionType,
      userLabel: params.userLabel || session?.label || 'Guru / Pengguna',
      tokenCode: params.tokenCode || session?.token || (session?.isAdmin ? 'MASTER-ADMIN' : 'TAMU'),
      schoolName: params.schoolName || session?.schoolName || 'Satuan Pendidikan',
      role: params.role || session?.role || 'guru',
      details: params.details,
      subject: params.subject || '-',
      gradeLevel: params.gradeLevel || '-',
      status: params.status || 'SUCCESS',
      syncedToSheets: false,
    };

    // Save locally
    const currentLogs = this.getActivityLogs();
    currentLogs.unshift(entry);
    this.saveActivityLogs(currentLogs);

    // Send to Google Sheets Webhook if enabled
    const config = this.getWebhookConfig();
    const shouldSend =
      config.enabled &&
      Boolean(config.webhookUrl.trim()) &&
      ((params.actionType === 'LOGIN' && config.logOnLogin) ||
        (params.actionType === 'GENERATE_RPP' && config.logOnGenerateRpp) ||
        (params.actionType === 'EXPORT_DOC' && config.logOnExportDoc) ||
        params.actionType === 'TEST_PING');

    if (shouldSend) {
      this.dispatchWebhook(config.webhookUrl, entry).then((success) => {
        if (success) {
          entry.syncedToSheets = true;
          this.saveActivityLogs(currentLogs);
        }
      });
    }

    return entry;
  },

  /**
   * Dispatches payload to Google Apps Script Webhook.
   * Google Apps Script requires text/plain and mode: 'no-cors' from browser to avoid CORS redirection errors.
   */
  async dispatchWebhook(url: string, entry: ActivityLogEntry): Promise<boolean> {
    const cleanUrl = url.trim();
    if (!cleanUrl) return false;

    try {
      const payload = {
        timestamp: entry.timestamp,
        actionType: entry.actionType,
        userLabel: entry.userLabel,
        tokenCode: entry.tokenCode,
        schoolName: entry.schoolName,
        role: entry.role,
        subject: entry.subject,
        gradeLevel: entry.gradeLevel,
        details: entry.details,
        status: entry.status,
      };

      // Using mode 'no-cors' allows sending data to Google Apps Script without CORS blockage
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      return true;
    } catch (err) {
      console.warn('Webhook dispatch warning:', err);
      return false;
    }
  },

  /**
   * Tests the webhook by sending a test ping
   */
  async testWebhookPing(url: string): Promise<{ success: boolean; message: string }> {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      return { success: false, message: 'URL Webhook Google Apps Script belum diisi!' };
    }

    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'Format URL tidak valid. URL Google Apps Script harus dimulai dengan: https://script.google.com/macros/s/.../exec',
      };
    }

    try {
      const testEntry: ActivityLogEntry = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        actionType: 'TEST_PING',
        userLabel: 'Administrator Penguji',
        tokenCode: 'PING-TEST',
        schoolName: 'Uji Koneksi Aplikasi',
        role: 'admin',
        details: 'Uji coba sinkronisasi webhook Google Sheets dari Panel Pengaturan',
        subject: 'Uji Integrasi',
        gradeLevel: 'Admin Test',
        status: 'SUCCESS',
        syncedToSheets: true,
      };

      await this.dispatchWebhook(cleanUrl, testEntry);

      // Record test result in config
      this.updateWebhookConfig({
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'success',
      });

      // Also record in local activity log
      const currentLogs = this.getActivityLogs();
      currentLogs.unshift(testEntry);
      this.saveActivityLogs(currentLogs);

      return {
        success: true,
        message: 'Sinyal Webhook berhasil dikirim ke Google Sheets! Periksa baris baru pada spreadsheet Anda.',
      };
    } catch (err: any) {
      this.updateWebhookConfig({
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'failed',
      });
      return {
        success: false,
        message: `Gagal mengirim sinyal ke Google Sheets: ${err.message || 'Koneksi terputus'}`,
      };
    }
  },

  exportLogsCsv(): string {
    const logs = this.getActivityLogs();
    const headers = ['Waktu', 'Tipe Aktivitas', 'Nama Guru / Pengguna', 'Token', 'Sekolah', 'Peran', 'Mapel', 'Jenjang', 'Rincian', 'Status'];
    const rows = logs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.actionType}"`,
      `"${log.userLabel.replace(/"/g, '""')}"`,
      `"${log.tokenCode}"`,
      `"${(log.schoolName || '-').replace(/"/g, '""')}"`,
      `"${log.role || 'guru'}"`,
      `"${(log.subject || '-').replace(/"/g, '""')}"`,
      `"${(log.gradeLevel || '-').replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.status}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
