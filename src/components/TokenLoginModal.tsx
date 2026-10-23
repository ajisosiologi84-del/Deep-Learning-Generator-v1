import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  School,
  UserCheck,
  Settings,
  ArrowRight,
  Eye,
  EyeOff,
  Brain,
  BookOpen,
} from 'lucide-react';
import { tokenService } from '../services/tokenService';
import { webhookService } from '../services/webhookService';
import { TokenSession } from '../types/token';

interface TokenLoginModalProps {
  isOpen: boolean;
  onSuccess: (session: TokenSession) => void;
  onOpenAdminPanel: () => void;
  canDismiss?: boolean;
  onClose?: () => void;
  inactivityLogoutNotice?: boolean;
  onDismissNotice?: () => void;
}

export const TokenLoginModal: React.FC<TokenLoginModalProps> = ({
  isOpen,
  onSuccess,
  onOpenAdminPanel,
  canDismiss = false,
  onClose,
  inactivityLogoutNotice = false,
  onDismissNotice,
}) => {
  const [inputToken, setInputToken] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await tokenService.validateTokenAsync(inputToken);
      setIsLoading(false);

      if (res.valid && res.tokenData) {
        setSuccessMsg(res.message);
        const session: TokenSession = {
          token: res.tokenData.token,
          label: res.tokenData.label,
          role: res.tokenData.role,
          schoolName: res.tokenData.schoolName,
          loginTime: new Date().toISOString(),
          isAdmin: res.isAdminPasscode || false,
        };
        tokenService.setActiveSession(session);
        // Log to Google Sheets Webhook and local history (Hybrid Model)
        webhookService.logActivity({
          actionType: 'LOGIN',
          userLabel: session.label,
          tokenCode: session.token,
          schoolName: session.schoolName,
          role: session.role,
          details: `Login berhasil menggunakan Token Akses: ${session.token}`,
          status: 'SUCCESS',
        });
        setTimeout(() => {
          onSuccess(session);
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Terjadi kendala saat memeriksa token. Silakan coba lagi.');
    }
  };

  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const isVerified = tokenService.verifyAdminPasscode(adminPasscode);
      if (isVerified) {
        const session: TokenSession = {
          token: 'MASTER-ADMIN',
          label: 'Super Administrator',
          role: 'admin',
          loginTime: new Date().toISOString(),
          isAdmin: true,
        };
        tokenService.setActiveSession(session);
        onSuccess(session);
        onOpenAdminPanel();
      } else {
        setErrorMsg('Kata sandi administrator salah. Silakan periksa kembali!');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slideInUp">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 p-6 sm:p-7 text-white text-center relative overflow-hidden">
          {/* Ambient decorative lighting */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          
          {/* Top Brand Ribbon Badge */}
          <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 uppercase tracking-widest border border-emerald-400/30 backdrop-blur-md shadow-xs mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Kurikulum Merdeka • BSKAP Kemendikdasmen</span>
          </div>

          {/* Central Animated Badge Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 backdrop-blur-md border border-white/25 flex items-center justify-center text-white mb-3 shadow-xl ring-4 ring-emerald-400/10">
            {isAdminMode ? (
              <Settings className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '14s' }} />
            ) : (
              <div className="relative">
                <Brain className="w-8 h-8 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-ping opacity-75" />
              </div>
            )}
          </div>

          {/* Primary App Title */}
          <h1 className="relative text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
              Deep Learning Generator
            </span>
          </h1>

          {/* Sub-Brand Title & Badge */}
          <div className="relative flex items-center justify-center flex-wrap gap-2 mt-1.5">
            <span className="text-xs sm:text-sm font-bold text-emerald-200/90 tracking-wide">
              RPP Pembelajaran Mendalam (RPP-PM)
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              Alur M3
            </span>
          </div>

          {/* 3 Pillars Tags (Mindful - Meaningful - Joyful) */}
          <div className="relative flex items-center justify-center gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-white/10">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/20 shadow-2xs">
              🧠 Mindful
            </span>
            <span className="text-emerald-400/50 text-[10px]">•</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-200 border border-teal-400/20 shadow-2xs">
              💡 Meaningful
            </span>
            <span className="text-emerald-400/50 text-[10px]">•</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/20 shadow-2xs">
              🎉 Joyful
            </span>
          </div>

          {/* Mode Context Description */}
          <p className="relative text-[11px] text-emerald-100/80 mt-2.5 max-w-sm mx-auto leading-relaxed">
            {isAdminMode
              ? '🔑 Portal Manajemen Lisensi Token & Rekapitulasi Guru'
              : '✨ Masukkan Token Akses Resmi untuk menyusun perangkat ajar cerdas'}
          </p>

          {canDismiss && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition border border-white/10"
            >
              ✕ Tutup
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {inactivityLogoutNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Sesi Ditutup Otomatis (15 Menit Inaktif)</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Aplikasi telah keluar secara otomatis untuk menjaga keamanan karena tidak ada aktivitas selama 15 menit. Silakan masukkan token Anda kembali untuk melanjutkan.
                </p>
              </div>
              {onDismissNotice && (
                <button
                  type="button"
                  onClick={onDismissNotice}
                  className="text-amber-700 hover:text-amber-950 font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Akses Ditolak</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Berhasil Masuk</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {!isAdminMode ? (
            /* Mode Login Guru (Token Akses) */
            <form onSubmit={handleSubmitTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Kode Token Akses RPP:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={inputToken}
                    onChange={(e) => {
                      setInputToken(e.target.value.toUpperCase());
                      setErrorMsg('');
                    }}
                    placeholder="Masukkan kode token akses"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold tracking-wider text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Token bersifat unik dan divalidasi dengan database administrator.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Token...</span>
                ) : (
                  <>
                    <span>Buka Kunci Aplikasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode Login Admin (PIN / Password Master) */
            <form onSubmit={handleSubmitAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Password Master Administrator:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    value={adminPasscode}
                    onChange={(e) => {
                      setAdminPasscode(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Masukkan Password Admin"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-slate-900 to-amber-900 hover:from-slate-800 hover:to-amber-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Membuka Panel Admin...</span>
                ) : (
                  <>
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Masuk ke Panel Kelola Token</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle between Teacher Token and Admin Login */}
          <div className="pt-2 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline transition inline-flex items-center gap-1.5"
            >
              {isAdminMode ? (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Kembali ke Login Guru (Pakai Token)</span>
                </>
              ) : (
                <>
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Saya Administrator (Setting & Kelola Token)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-slate-400" />
            Standar BSKAP Kurikulum Merdeka
          </span>
          <span className="text-emerald-700 font-semibold">Dual-Protection v1.0</span>
        </div>

      </div>
    </div>
  );
};
