import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Plus,
  Trash2,
  Copy,
  Check,
  Power,
  RotateCcw,
  Download,
  Upload,
  Share2,
  X,
  Lock,
  Calendar,
  Sparkles,
  Users,
  School,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Layers,
  FileSpreadsheet,
  ExternalLink,
  Code2,
  Send,
  RefreshCw,
  Table,
  Activity,
  FileText,
  HelpCircle,
  Database,
  Globe,
  Printer,
} from 'lucide-react';
import { tokenService } from '../services/tokenService';
import { webhookService, GOOGLE_APPS_SCRIPT_TEMPLATE } from '../services/webhookService';
import { supabaseService, SUPABASE_SQL_SETUP } from '../services/supabaseService';
import { AppToken, AdminConfig, GoogleSheetsWebhookConfig, ActivityLogEntry, SupabaseConfig } from '../types/token';
import { TokenCardPrintModal } from './TokenCardPrintModal';

interface AdminTokenManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
}

export const AdminTokenManagerModal: React.FC<AdminTokenManagerModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [tokens, setTokens] = useState<AppToken[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(tokenService.getAdminConfig());
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'batch' | 'print' | 'settings' | 'sheets' | 'supabase'>('list');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Token Card Print Modal State
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [selectedTokenForPrint, setSelectedTokenForPrint] = useState<string | null>(null);

  // Webhook Google Sheets State
  const [webhookConfig, setWebhookConfig] = useState<GoogleSheetsWebhookConfig>(webhookService.getWebhookConfig());
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>('');
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

  // Supabase Cloud State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(supabaseService.getConfig());
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>('');
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState<string>('');
  const [isTestingSupabase, setIsTestingSupabase] = useState<boolean>(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string; rowCount?: number } | null>(null);
  const [copiedSqlScript, setCopiedSqlScript] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // New Token Form State
  const [newTokenString, setNewTokenString] = useState<string>('');
  const [newLabel, setNewLabel] = useState<string>('');
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [newRole, setNewRole] = useState<'guru' | 'pengawas' | 'admin'>('guru');
  const [newDurationDays, setNewDurationDays] = useState<number>(0); // 0 = selamanya
  const [newMaxUses, setNewMaxUses] = useState<number>(-1); // -1 = unlimited
  const [newNotes, setNewNotes] = useState<string>('');

  // Batch Form State
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchPrefix, setBatchPrefix] = useState<string>('GURU');
  const [batchDays, setBatchDays] = useState<number>(30);

  // Settings Form State
  const [newAdminPasscode, setNewAdminPasscode] = useState<string>('');
  const [confirmPasscode, setConfirmPasscode] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setTokens(tokenService.getAllTokens());
    const config = tokenService.getAdminConfig();
    setAdminConfig(config);
    setNewAdminPasscode(config.adminPasscode);
    setConfirmPasscode(config.adminPasscode);

    const wh = webhookService.getWebhookConfig();
    setWebhookConfig(wh);
    setWebhookUrlInput(wh.webhookUrl);
    setActivityLogs(webhookService.getActivityLogs());
    setTestResult(null);

    const sb = supabaseService.getConfig();
    setSupabaseConfig(sb);
    setSupabaseUrlInput(sb.supabaseUrl);
    setSupabaseAnonKeyInput(sb.supabaseAnonKey);
    setSupabaseTestResult(null);

    // Asynchronously fetch latest global server configuration
    supabaseService.syncFromGlobalServer().then((latestSb) => {
      setSupabaseConfig(latestSb);
      if (latestSb.supabaseUrl) setSupabaseUrlInput(latestSb.supabaseUrl);
      if (latestSb.supabaseAnonKey) setSupabaseAnonKeyInput(latestSb.supabaseAnonKey);
    }).catch(() => {});

    webhookService.syncFromGlobalServer().then((latestWh) => {
      setWebhookConfig(latestWh);
      if (latestWh.webhookUrl) setWebhookUrlInput(latestWh.webhookUrl);
    }).catch(() => {});

    setStatusMessage(null);
  };

  if (!isOpen) return null;

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleShareWhatsApp = (tokenItem: AppToken) => {
    const text = `*KODE TOKEN AKSES RPP DEEP LEARNING (BSKAP)*\n\nHalo Bapak/Ibu,\nBerikut token akses Anda untuk menggunakan Aplikasi Perancang RPP Pembelajaran Mendalam Kurikulum Merdeka:\n\n🔑 *TOKEN:* \`${tokenItem.token}\`\n📋 *Untuk:* ${tokenItem.label}\n🏫 *Sekolah:* ${tokenItem.schoolName || '-'}\n⏳ *Masa Berlaku:* ${
      tokenItem.expiresAt ? new Date(tokenItem.expiresAt).toLocaleDateString('id-ID') : 'Selamanya (Akses Penuh)'
    }\n\nSilakan masukkan token di halaman login aplikasi. Terima kasih!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleToggleStatus = (id: string) => {
    const updated = tokenService.toggleTokenStatus(id);
    if (updated) {
      loadData();
      showStatus('success', `Status token "${updated.token}" berhasil diubah!`);
    }
  };

  const handleDeleteToken = (id: string, tokenName: string) => {
    if (window.confirm(`Yakin ingin menghapus token "${tokenName}"? Guru dengan token ini tidak dapat login lagi.`)) {
      tokenService.deleteToken(id);
      loadData();
      showStatus('success', `Token "${tokenName}" telah dihapus.`);
    }
  };

  const handleGenerateRandomToken = () => {
    const random = tokenService.generateRandomTokenString('DL');
    setNewTokenString(random);
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expiresAt =
        newDurationDays > 0
          ? new Date(Date.now() + newDurationDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const created = tokenService.createToken({
        token: newTokenString || tokenService.generateRandomTokenString('DL'),
        label: newLabel || 'Guru Mata Pelajaran',
        schoolName: newSchoolName,
        role: newRole,
        maxUses: newMaxUses,
        expiresAt,
        notes: newNotes,
      });

      loadData();
      showStatus('success', `Token "${created.token}" berhasil dibuat untuk ${created.label}!`);
      setNewTokenString('');
      setNewLabel('');
      setNewNotes('');
      setActiveTab('list');
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal membuat token.');
    }
  };

  const handleBatchGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = tokenService.generateBatchTokens(batchCount, batchPrefix, batchDays);
      loadData();
      showStatus('success', `Berhasil membuat ${created.length} token massal!`);
      setActiveTab('list');
    } catch (err: any) {
      showStatus('error', err.message || 'Gagal membuat token massal.');
    }
  };

  const handleToggleRequireLogin = () => {
    const updated = tokenService.updateAdminConfig({
      requireTokenLogin: !adminConfig.requireTokenLogin,
    });
    setAdminConfig(updated);
    if (onConfigChanged) onConfigChanged();
    showStatus(
      'success',
      updated.requireTokenLogin
        ? 'Aplikasi sekarang DIKUNCI (Wajib Token untuk mengakses).'
        : 'Aplikasi sekarang TERBUKA (Bisa diakses tanpa token).'
    );
  };

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPasscode.trim()) {
      showStatus('error', 'Kata sandi baru tidak boleh kosong!');
      return;
    }
    if (newAdminPasscode !== confirmPasscode) {
      showStatus('error', 'Konfirmasi kata sandi tidak cocok!');
      return;
    }
    const updated = tokenService.updateAdminConfig({ adminPasscode: newAdminPasscode.trim() });
    setAdminConfig(updated);
    showStatus('success', 'Kata sandi master administrator berhasil diperbarui!');
  };

  const handleExportJson = () => {
    const data = tokenService.exportTokensJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar-token-rpp-bskap-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveWebhookConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await webhookService.saveWebhookConfigToServer({
      ...webhookConfig,
      webhookUrl: webhookUrlInput.trim(),
      enabled: Boolean(webhookUrlInput.trim()),
    });
    setWebhookConfig(updated);
    showStatus('success', 'Konfigurasi Webhook berhasil disimpan permanen di server! Semua browser guru otomatis terhubung.');
  };

  const handleTestPing = async () => {
    if (!webhookUrlInput.trim()) {
      showStatus('error', 'Masukkan URL Webhook Google Apps Script terlebih dahulu!');
      return;
    }
    setIsTestingPing(true);
    setTestResult(null);
    try {
      const res = await webhookService.testWebhookPing(webhookUrlInput);
      setTestResult(res);
      setActivityLogs(webhookService.getActivityLogs());
      if (res.success) {
        showStatus('success', 'Test ping berhasil! Periksa baris baru di Google Sheet Anda.');
      } else {
        showStatus('error', res.message);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal mengirim ping.' });
      showStatus('error', 'Gagal mengirim ping ke webhook.');
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleExportCsvLogs = () => {
    const csvData = webhookService.exportLogsCsv();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-aktivitas-guru-rpp-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearActivityLogs = () => {
    webhookService.clearActivityLogs();
    setActivityLogs([]);
    showStatus('success', 'Riwayat log lokal berhasil dibersihkan.');
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await supabaseService.saveConfigToServer({
      ...supabaseConfig,
      supabaseUrl: supabaseUrlInput.trim(),
      supabaseAnonKey: supabaseAnonKeyInput.trim(),
      enabled: Boolean(supabaseUrlInput.trim() && supabaseAnonKeyInput.trim()),
    });
    setSupabaseConfig(updated);
    showStatus('success', 'Konfigurasi Supabase Cloud berhasil disimpan permanen di server! Semua browser & seluruh guru otomatis terhubung.');
  };

  const handleTestSupabaseConnection = async () => {
    if (!supabaseUrlInput.trim() || !supabaseAnonKeyInput.trim()) {
      showStatus('error', 'Masukkan Project URL dan Anon Key Supabase terlebih dahulu!');
      return;
    }
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await supabaseService.testConnection(supabaseUrlInput, supabaseAnonKeyInput);
      setSupabaseTestResult(res);
      if (res.success) {
        showStatus('success', res.message);
      } else {
        showStatus('error', res.message);
      }
    } catch (err: any) {
      setSupabaseTestResult({ success: false, message: err?.message || 'Gagal tersambung ke Supabase.' });
      showStatus('error', 'Gagal menghubungkan ke Supabase Cloud.');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSqlScript(true);
    setTimeout(() => setCopiedSqlScript(false), 3000);
  };

  const handlePushTokensToSupabase = async () => {
    if (!supabaseConfig.enabled) {
      showStatus('error', 'Aktifkan status Supabase terlebih dahulu.');
      return;
    }
    setIsSyncingCloud(true);
    try {
      const res = await supabaseService.pushLocalTokensToSupabase(tokens);
      if (res.success) {
        showStatus('success', res.message);
      } else {
        showStatus('error', res.message);
      }
    } catch (err: any) {
      showStatus('error', 'Gagal mengirim token ke Supabase.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handlePullTokensFromSupabase = async () => {
    if (!supabaseConfig.enabled) {
      showStatus('error', 'Aktifkan status Supabase terlebih dahulu.');
      return;
    }
    setIsSyncingCloud(true);
    try {
      const res = await supabaseService.pullTokensFromSupabase();
      if (res.success && res.tokens.length > 0) {
        tokenService.saveTokens(res.tokens);
        setTokens(res.tokens);
        showStatus('success', res.message);
      } else if (res.success && res.tokens.length === 0) {
        showStatus('error', 'Belum ada token di database Supabase.');
      } else {
        showStatus('error', res.message);
      }
    } catch (err: any) {
      showStatus('error', 'Gagal mengambil data dari Supabase.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = tokenService.importTokensJson(content);
      if (res.success) {
        loadData();
        showStatus('success', `Berhasil mengimpor ${res.count} token!`);
      } else {
        showStatus('error', res.error || 'Gagal mengimpor file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slideInUp">
        
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md ring-2 ring-amber-400/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Panel Pengaturan Token Administrator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                  Master Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Hanya Administrator yang memiliki hak membuat, mengatur kuota, dan mendistribusikan token guru
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-3 text-xs flex items-center gap-2 border-b animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Nav Tabs & Global Toggle Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daftar Token ({tokens.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Buat Token Tunggal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>⚡ Generate Massal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('print');
                setSelectedTokenForPrint(null);
                setPrintModalOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'print'
                  ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500'
                  : 'bg-amber-100/90 text-amber-950 hover:bg-amber-200 border border-amber-300/80'
              }`}
              title="Buka menu cetak kartu token kertas F4 atau A4"
            >
              <Printer className="w-3.5 h-3.5 text-amber-800" />
              <span>🖨️ Cetak Kartu Token (F4/A4)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>Sandi & Penguncian</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sheets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'sheets'
                  ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-emerald-300'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/70'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>📑 Webhook Sheets (Hybrid)</span>
              {webhookConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Webhook aktif" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'supabase'
                  ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>⚡ Supabase Cloud</span>
              {supabaseConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Cloud aktif" />
              )}
            </button>
          </div>

          {/* Quick Toggle Application Locking */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-600">
              Gembok Aplikasi:
            </span>
            <button
              type="button"
              onClick={handleToggleRequireLogin}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 border ${
                adminConfig.requireTokenLogin
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="Aktifkan/Matikan kewajiban login token"
            >
              <Power className={`w-3 h-3 ${adminConfig.requireTokenLogin ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>{adminConfig.requireTokenLogin ? 'Wajib Token (AKTIF)' : 'Bebas Akses (OFF)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Semua Token yang Terdaftar dalam Sistem
                  </h3>
                  <p className="text-xs text-slate-500">
                    Salin atau bagikan token ini kepada guru agar dapat membuka kunci aplikasi
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTokenForPrint(null);
                      setPrintModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-xs transition"
                    title="Cetak lembaran kartu token untuk seluruh guru (Format Kertas F4 / A4)"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-950" />
                    <span>Cetak Kartu Token (F4/A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
                    title="Cadangkan daftar token ke format JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ekspor JSON</span>
                  </button>
                  <label className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Impor JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Table / Cards */}
              <div className="space-y-2.5">
                {tokens.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.isActive
                        ? 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Left: Token info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-300">
                          {item.token}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isActive ? '● AKTIF' : '○ NONAKTIF'}
                        </span>
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          Peran: {item.role.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.schoolName && (
                          <span className="text-slate-500 font-normal">
                            ({item.schoolName})
                          </span>
                        )}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span>
                          Masa Berlaku:{' '}
                          <strong className="text-slate-700">
                            {item.expiresAt
                              ? new Date(item.expiresAt).toLocaleDateString('id-ID')
                              : 'Selamanya'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Terpakai:{' '}
                          <strong className="text-slate-700">
                            {item.usedCount}x {item.maxUses > 0 ? `/ ${item.maxUses}x` : '(Unlimited)'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.token, item.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
                        title="Salin kode token"
                      >
                        {copiedTokenId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(item)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition"
                        title="Kirim ke WhatsApp Guru"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim WA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTokenForPrint(item.id);
                          setPrintModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg flex items-center gap-1 transition"
                        title="Cetak kartu fisik untuk token ini (F4 / A4)"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-800" />
                        <span>Cetak</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          item.isActive
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={item.isActive ? 'Nonaktifkan token' : 'Aktifkan token'}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteToken(item.id, item.token)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                        title="Hapus token ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateToken} className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Formulir Pembuatan Token Akses Baru
                </h3>

                {/* Token string input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Kode Token:</label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomToken}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Generate Acak
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newTokenString}
                    onChange={(e) => setNewTokenString(e.target.value.toUpperCase())}
                    placeholder="Misal: GURU-IPA-2026 atau KLIK GENERATE ACAK"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm uppercase focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peruntukan / Nama Guru / Mapel:
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Misal: Bu Siti Rahmawati, S.Pd. (Guru Biologi)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Satuan Pendidikan / Sekolah (Opsional):
                  </label>
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    placeholder="Misal: SMA Negeri 1 Penggerak"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Role & Masa Berlaku */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Peran Pengguna:</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                    >
                      <option value="guru">Guru Mata Pelajaran / Kelas</option>
                      <option value="pengawas">Pengawas / Fasilitator Sekolah</option>
                      <option value="admin">Administrator Sekolah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Masa Berlaku:</label>
                    <select
                      value={newDurationDays}
                      onChange={(e) => setNewDurationDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                    >
                      <option value={0}>Selamanya (Tanpa Batas Waktu)</option>
                      <option value={7}>7 Hari</option>
                      <option value={30}>30 Hari (1 Bulan)</option>
                      <option value={90}>3 Bulan (Triwulan)</option>
                      <option value={180}>6 Bulan (1 Semester)</option>
                      <option value={365}>1 Tahun Ajaran</option>
                    </select>
                  </div>
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batas Kuota Penggunaan RPP:
                  </label>
                  <select
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                  >
                    <option value={-1}>Tak Terbatas (Unlimited)</option>
                    <option value={10}>Maksimal 10 Kali Pembuatan</option>
                    <option value={25}>Maksimal 25 Kali Pembuatan</option>
                    <option value={50}>Maksimal 50 Kali Pembuatan</option>
                    <option value={100}>Maksimal 100 Kali Pembuatan</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan:</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Misal: Diberikan saat IKM Workshop RPP Mendalam"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan & Terbitkan Token Baru</span>
              </button>
            </form>
          )}

          {activeTab === 'batch' && (
            <form onSubmit={handleBatchGenerate} className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Pembuat Token Massal (Batch Generator)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gunakan fitur ini untuk membuat banyak token sekaligus bagi seluruh dewan guru di sekolah Anda dalam hitungan detik.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Token:</label>
                  <select
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-bold"
                  >
                    <option value={5}>Buat 5 Token Sekaligus</option>
                    <option value={10}>Buat 10 Token Sekaligus</option>
                    <option value={20}>Buat 20 Token Sekaligus</option>
                    <option value={30}>Buat 30 Token Sekaligus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Awalan / Kode Prefix:</label>
                  <input
                    type="text"
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                    placeholder="Contoh: GURU, SMAN1, IKM"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-xs uppercase"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Contoh format hasil: <strong>{batchPrefix}-2026-X8K9</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Masa Berlaku:</label>
                  <select
                    value={batchDays}
                    onChange={(e) => setBatchDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                  >
                    <option value={0}>Selamanya (Unlimited)</option>
                    <option value={30}>30 Hari</option>
                    <option value={90}>90 Hari (3 Bulan)</option>
                    <option value={180}>180 Hari (1 Semester)</option>
                    <option value={365}>365 Hari (1 Tahun)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Eksekusi Pembuatan {batchCount} Token Massal</span>
              </button>
            </form>
          )}

          {activeTab === 'print' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
              {/* Hero Banner for Token Card Printing */}
              <div className="p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-300 uppercase tracking-wider">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Fitur Baru Administrator</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    Cetak Kartu Token Fisik (Kertas F4 / Folio & A4)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-900/90 font-medium max-w-2xl leading-relaxed">
                    Fitur ini memungkinkan Anda mencetak lembaran kartu peserta/guru dalam format resmi berstandar nasional. Dilengkapi dengan <strong>Kode Akses Unik</strong>, <strong>QR Code Login Otomatis</strong>, <strong>Kop Satuan Pendidikan</strong>, dan <strong>Garis Potong Gunting (✂)</strong> yang rapi.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTokenForPrint(null);
                        setPrintModalOpen(true);
                      }}
                      className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-md hover:shadow-xl cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>Buka Studio Cetak Kartu Sekarang ({tokens.length} Token Tersedia)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Format & Specification Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Paper F4 Box */}
                <div className="p-5 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Ukuran Kertas F4 / Folio (HVS)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Standar Sekolah RI
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dimensi <strong>215 mm × 330 mm</strong>. Sangat pas untuk kertas HVS Folio/F4 yang umum digunakan oleh sekolah, madrasah, dan kantor dinas pendidikan di seluruh Indonesia.
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    <li>Kapasitas 8 kartu/lembar (ID Card Standar ~95 × 76 mm)</li>
                    <li>Kapasitas 10 kartu/lembar (Format Saku Hemat ~95 × 60 mm)</li>
                    <li>Margin seimbang 6–8 mm anti terpotong printer</li>
                  </ul>
                </div>

                {/* Paper A4 Box */}
                <div className="p-5 bg-white rounded-2xl border-2 border-blue-500/40 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Ukuran Kertas A4 Internasional
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Standar Kantor / PDF
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dimensi <strong>210 mm × 297 mm</strong>. Format standar internasional yang didukung oleh semua printer desktop dan ideal untuk disimpan menjadi file dokumen PDF.
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    <li>Kapasitas 8 kartu/lembar (Ukuran kartu ~94 × 68 mm)</li>
                    <li>Kapasitas 4 kartu/lembar (Ukuran besar VIP ~100 × 135 mm)</li>
                    <li>Kompatibel langsung dengan simpan PDF satu klik</li>
                  </ul>
                </div>

              </div>

              {/* Features Overview */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Keunggulan Kartu Token BSKAP Deep Learning:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">📱 QR Code Scan Cepat</span>
                    <p className="text-[11px] text-slate-500">Guru tinggal memindai QR lewat kamera gawai untuk otomatis membuka dan masuk aplikasi.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">✂ Garis Potong Gunting</span>
                    <p className="text-[11px] text-slate-500">Dilengkapi batas garis putus-putus (*dashed line*) agar panitia dapat menggunting dengan rapi dan presisi.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">🎨 4 Pilihan Tema Desain</span>
                    <p className="text-[11px] text-slate-500">Tersedia Emerald Kemdikbud, Biru Safir Edukasi, Ungu Inovatif, hingga Monokrom Hitam-Putih hemat tinta.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* Change Passcode */}
              <form onSubmit={handleSavePasscode} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Ganti Kata Sandi Master Administrator
                </h3>
                <p className="text-xs text-slate-500">
                  Hanya Anda sebagai Admin yang dapat mengakses menu ini dengan kata sandi tersebut.
                </p>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block">Kata Sandi Administrator Aktif:</span>
                    <span className="text-[11px] text-slate-500">Tersimpan aman di panel Admin (Bawaan awal: <code className="font-mono font-bold text-purple-700">ADMIN#DEEP2026</code>)</span>
                  </div>
                  <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 shrink-0">
                    {adminConfig.adminPasscode || 'ADMIN#DEEP2026'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Admin Baru:
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminPasscode}
                    onChange={(e) => setNewAdminPasscode(e.target.value)}
                    placeholder="Masukkan sandi baru"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ulangi Kata Sandi Admin:
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Ulangi sandi baru"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                >
                  Perbarui Kata Sandi Admin
                </button>
              </form>

              {/* Security Policy */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-xs text-purple-950">
                <span className="font-bold flex items-center gap-1.5 text-purple-900">
                  <Shield className="w-4 h-4 text-purple-700" />
                  Keamanan Akses Mandiri & Terpusat:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-purple-900/90 text-[11px]">
                  <li>Setiap token terhubung dengan sesi peramban guru (multi-perangkat & multi-browser).</li>
                  <li>Jika ada guru yang tidak berhak mengakses lagi, Administrator dapat langsung menekan tombol <strong>Nonaktifkan (Power)</strong> pada token tersebut.</li>
                  <li>Sesi login yang dinonaktifkan akan otomatis terkunci kembali saat peramban dibuka.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 5: Google Sheets Webhook (Hybrid Model) */}
          {activeTab === 'sheets' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Hybrid Architecture Info Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-500/30 shadow-md">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-1.5">
                        Model Hybrid: Keamanan Token di Primary Gate + Rekapitulasi di Google Sheets
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                        Rekomendasi Terbaik
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sesuai prinsip keamanan data, <strong>kunci token dan password admin tetap diamankan di gerbang utama</strong> aplikasi (Local DB / Server). Google Sheets <strong>tidak menyimpan kunci rahasia</strong>, melainkan berfungsi sebagai <strong>Webhook Catatan Rekapitulasi</strong> untuk mendata log kehadiran guru, topik RPP yang disusun, dan ekspor berkas secara real-time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Webhook Configuration Form */}
              <form onSubmit={handleSaveWebhookConfig} className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                {/* Global Multi-Browser Sync Banner */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-blue-950 block">
                      Tersimpan Global untuk Semua Browser & Seluruh Perangkat Guru (Cukup Atur 1x)
                    </span>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Konfigurasi webhook ini disimpan di server aplikasi. Anda tidak perlu memasukkannya lagi saat berganti browser atau saat guru mengakses dari HP/laptop mereka.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pengaturan Webhook Google Apps Script
                    </h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookConfig.enabled}
                      onChange={(e) => setWebhookConfig({ ...webhookConfig, enabled: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {webhookConfig.enabled ? '🟢 Webhook Aktif' : '⚪ Webhook Dinonaktifkan'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Aplikasi Web Google Apps Script (Webhook Endpoint):
                  </label>
                  <input
                    type="url"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Salin URL dari hasil Penerapan Baru (Deploy &gt; Web App) Google Apps Script spreadsheet Anda.
                  </p>
                </div>

                {/* Event Triggers Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pilih Aktivitas Guru yang Akan Dicatat ke Google Sheets:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={webhookConfig.logOnLogin}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, logOnLogin: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">1. Login Token</span>
                        <span className="text-[10px] text-slate-500">Mencatat sesi guru masuk</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={webhookConfig.logOnGenerateRpp}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, logOnGenerateRpp: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">2. Penyusunan RPP</span>
                        <span className="text-[10px] text-slate-500">Mencatat Mapel &amp; Topik</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={webhookConfig.logOnExportDoc}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, logOnExportDoc: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">3. Ekspor Berkas</span>
                        <span className="text-[10px] text-slate-500">Word, PDF, Excel, Cetak</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan Webhook</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={isTestingPing || !webhookUrlInput.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isTestingPing ? 'animate-spin' : ''}`} />
                    <span>{isTestingPing ? 'Mengirim Sinyal...' : '🧪 Uji Kirim / Test Ping ke Sheet'}</span>
                  </button>
                </div>

                {/* Test Ping Result Banner */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-fadeIn ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium">{testResult.message}</span>
                  </div>
                )}
              </form>

              {/* Step-by-Step Setup Guide with Copy Script Button */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-600" />
                      Panduan Setup Google Spreadsheet (3 Langkah Cepat)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Script ini sudah dilengkapi proteksi kunci (ScriptLock) agar tidak terjadi bentrokan saat banyak guru mengakses bersamaan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Kode Apps Script Tersalin!' : '📋 Salin Kode Apps Script Otomatis'}</span>
                  </button>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-700 list-decimal pl-4">
                  <li>
                    <strong>Buat Google Sheets:</strong> Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">sheets.new</a> pada peramban Anda dan beri nama dokumen misal: <em>"Rekapitulasi RPP Deep Learning Guru"</em>.
                  </li>
                  <li>
                    <strong>Buka Apps Script:</strong> Pada menu atas spreadsheet, klik <strong>Ekstensi (Extensions) &gt; Apps Script</strong>.
                  </li>
                  <li>
                    <strong>Tempel Kode:</strong> Hapus semua teks bawaan, klik tombol hijau <strong>"📋 Salin Kode Apps Script Otomatis"</strong> di atas, lalu tempelkan (Paste) ke editor Apps Script dan klik ikon <strong>Simpan (Disket)</strong>.
                  </li>
                  <li>
                    <strong>Terapkan Aplikasi Web:</strong> Klik tombol biru <strong>Terapkan (Deploy) &gt; Penerapan baru (New deployment)</strong>:
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-slate-600">
                      <li>Pilih jenis penerapan: <strong>Aplikasi Web (Web App)</strong>.</li>
                      <li>Jalankan sebagai: <strong>Saya (Email Anda)</strong>.</li>
                      <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong>.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Selesai:</strong> Salin <strong>URL Aplikasi Web</strong> yang berakhiran <code>/exec</code> lalu tempelkan ke form webhook di atas dan klik <em>Simpan</em>!
                  </li>
                </ol>

                <div className="bg-slate-900 rounded-xl p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40 border border-slate-800">
                  <pre>{GOOGLE_APPS_SCRIPT_TEMPLATE.substring(0, 520)}
... [Salin kode lengkap dengan tombol di atas] ...
                  </pre>
                </div>
              </div>

              {/* Local Activity Logs & Rekap Table */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Riwayat Log Aktivitas Guru Real-Time ({activityLogs.length} Entri)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Dicatat otomatis saat guru login, menyusun RPP, atau mengunduh berkas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCsvLogs}
                      disabled={activityLogs.length === 0}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      title="Unduh rekapitulasi riwayat aktivitas dalam format Excel CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Unduh Rekap (.CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearActivityLogs}
                      disabled={activityLogs.length === 0}
                      className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg border border-rose-200 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      title="Bersihkan riwayat log lokal"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Bersihkan</span>
                    </button>
                  </div>
                </div>

                {activityLogs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat aktivitas yang tercatat. Lakukan uji coba login atau susun RPP untuk melihat catatan di sini.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-64 border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2">Waktu (WIB)</th>
                          <th className="px-3 py-2">Tipe Aktivitas</th>
                          <th className="px-3 py-2">Guru / Pengguna</th>
                          <th className="px-3 py-2">Token</th>
                          <th className="px-3 py-2">Mata Pelajaran</th>
                          <th className="px-3 py-2">Rincian Aktivitas</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="px-3 py-2 whitespace-nowrap text-slate-500 font-mono">
                              {log.timestamp}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.actionType === 'LOGIN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : log.actionType === 'GENERATE_RPP'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.actionType === 'EXPORT_DOC'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {log.actionType}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-900">
                              {log.userLabel}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-600">
                              {log.tokenCode}
                            </td>
                            <td className="px-3 py-2 text-slate-700">
                              {log.subject || '-'}
                            </td>
                            <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={log.details}>
                              {log.details}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: SUPABASE CLOUD SYNC */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm">Supabase PostgreSQL Cloud (Multi-Device Sync)</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    supabaseConfig.enabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-800 text-emerald-200'
                  }`}>
                    {supabaseConfig.enabled ? '● Cloud Aktif' : '○ Mode Offline'}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Supabase adalah database PostgreSQL cloud serverless (100% gratis untuk sekolah). 
                  Dengan menghubungkan Supabase, token yang Anda buat di laptop langsung aktif secara real-time 
                  di HP dan perangkat semua guru saat aplikasi di-deploy di Vercel atau domain sekolah.
                </p>
              </div>

              {/* Multi-Browser & Global Server Persistence Notice */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Globe className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-emerald-950 flex items-center gap-2">
                    Sinkronisasi Server Global Aktif (Multi-Browser & Multi-Perangkat)
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded-full">Cukup Atur 1x</span>
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    <strong>Tidak perlu mengatur ulang setiap ganti browser!</strong> Setelah Anda menyimpan Project URL dan Anon Key di bawah ini, konfigurasi disimpan permanen di server aplikasi. Semua browser guru (Chrome, Edge, Safari), laptop lain, maupun HP akan <strong>langsung otomatis terhubung</strong> tanpa perlu setting lagi.
                  </p>
                </div>
              </div>

              {/* Status & Sync Actions */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Power className={`w-4 h-4 ${supabaseConfig.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                      Status Autentikasi Cloud
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {supabaseConfig.enabled
                        ? 'Guru login akan divalidasi langsung ke Supabase Cloud (fallback ke lokal jika offline)'
                        : 'Aplikasi saat ini hanya menggunakan Local Storage browser ini'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const newStatus = !supabaseConfig.enabled;
                      const updated = await supabaseService.saveConfigToServer({ enabled: newStatus });
                      setSupabaseConfig(updated);
                      showStatus('success', newStatus ? 'Supabase Cloud diaktifkan di server untuk semua browser!' : 'Supabase dinonaktifkan (mode lokal).');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      supabaseConfig.enabled
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{supabaseConfig.enabled ? 'Status: AKTIF' : 'Status: NON-AKTIF'}</span>
                  </button>
                </div>

                {/* Form Input URL & Anon Key */}
                <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://abcdefghijklmn.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Didapat dari menu: <em>Project Settings → API → Project URL</em>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Supabase Anon Public Key (Safe for Browser)
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKeyInput}
                      onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Kunci <code>anon public</code> aman ditaruh di browser karena dibatasi aturan Row Level Security (RLS).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Pengaturan Cloud</span>
                    </button>

                    <button
                      type="button"
                      disabled={isTestingSupabase}
                      onClick={handleTestSupabaseConnection}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                      <span>{isTestingSupabase ? 'Menguji Koneksi...' : 'Uji Koneksi Cloud'}</span>
                    </button>
                  </div>
                </form>

                {/* Test Result Box */}
                {supabaseTestResult && (
                  <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    supabaseTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}>
                    {supabaseTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block">
                        {supabaseTestResult.success ? 'Koneksi Berhasil!' : 'Koneksi Bermasalah'}
                      </span>
                      <span className="text-[11px] leading-relaxed block">{supabaseTestResult.message}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cloud Sync Tool: Push and Pull */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-emerald-950">Sinkronisasi Data Token (Lokal ↔ Cloud)</h4>
                </div>
                <p className="text-[11px] text-emerald-900">
                  Gunakan tombol di bawah untuk menyamakan token antara browser Anda dan database Supabase:
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isSyncingCloud || !supabaseConfig.enabled}
                    onClick={handlePushTokensToSupabase}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isSyncingCloud ? 'Sedang Mengunggah...' : `Unggah ${tokens.length} Token Lokal ke Cloud`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSyncingCloud || !supabaseConfig.enabled}
                    onClick={handlePullTokensFromSupabase}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isSyncingCloud ? 'Sedang Mengambil...' : 'Tarik Token dari Cloud ke Browser Ini'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Guide & SQL Template */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-800">
                      Panduan Cepat & Script SQL Setup (1-Klik)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySqlScript}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    {copiedSqlScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Script SQL Supabase</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      1
                    </span>
                    <strong className="block text-slate-800 mb-0.5">Buat Project</strong>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">supabase.com</a>, daftar gratis, lalu klik <strong>New Project</strong> (pilih region Singapore).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      2
                    </span>
                    <strong className="block text-slate-800 mb-0.5">Jalankan Query SQL</strong>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Buka menu <strong>SQL Editor</strong> di dashboard Supabase, klik tombol biru di atas untuk <em>Salin Script SQL</em>, tempel (Paste), lalu klik <strong>Run</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      3
                    </span>
                    <strong className="block text-slate-800 mb-0.5">Salin URL & Key</strong>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Buka menu <strong>Project Settings → API</strong>. Salin <strong>Project URL</strong> dan <strong>anon public key</strong> ke form di atas, lalu klik <strong>Simpan</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SETUP}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Total Token Aktif: <strong>{tokens.filter((t) => t.isActive).length}</strong> dari {tokens.length} token
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-800 font-semibold rounded-lg border border-slate-300 transition"
          >
            Selesai / Tutup
          </button>
        </div>

      </div>

      {/* Token Card Print Modal (Full Page F4 / A4 Studio) */}
      <TokenCardPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        tokens={tokens}
        preSelectedTokenId={selectedTokenForPrint}
      />
    </div>
  );
};
