import React from 'react';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText,
  Key,
  Shield,
  LogOut,
  UserCheck,
  Clock,
} from 'lucide-react';
import { TokenSession } from '../types/token';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenOnboarding?: () => void;
  activeTab: 'official' | 'interactive' | 'gemini' | 'markdown';
  setActiveTab: (tab: 'official' | 'interactive' | 'gemini' | 'markdown') => void;
  hasGenerated: boolean;
  activeSession: TokenSession | null;
  onOpenAdminToken: () => void;
  onOpenLoginToken: () => void;
  onLogoutToken: () => void;
  inactivityRemainingSeconds?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenOnboarding,
  activeTab,
  setActiveTab,
  hasGenerated,
  activeSession,
  onOpenAdminToken,
  onOpenLoginToken,
  onLogoutToken,
  inactivityRemainingSeconds,
}) => {
  const formatTimer = (totalSec?: number) => {
    if (totalSec === undefined) return '';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 bg-clip-text text-transparent">
                    Deep Learning Generator
                  </span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  BSKAP
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  Alur M3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                RPP Pembelajaran Mendalam (RPP-PM) • Mindful, Meaningful, & Joyful
              </p>
            </div>
          </div>

          {/* Right actions: View mode switch & Guide */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {hasGenerated && (
              <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('official')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === 'official'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Template Resmi BSKAP
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('interactive')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === 'interactive'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Tampilan Interaktif
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gemini')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === 'gemini'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Prompt & Format Gemini (DOC/PDF/Excel)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('markdown')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    activeTab === 'markdown'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    Markdown Murni
                  </span>
                </button>
              </div>
            )}

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                title="Buka kembali animasi panduan awal aplikasi"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>🎬 Panduan Awal</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Panduan M3 & DPL</span>
            </button>

            {/* Token Status Badge, Inactivity Timer, & Tombol Logout */}
            {activeSession ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <div className="flex items-center gap-1 text-emerald-800 font-bold font-mono text-[11px]">
                    <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[110px]" title={`${activeSession.token} - ${activeSession.label}`}>
                      {activeSession.token}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 hidden sm:inline font-medium">
                    ({activeSession.role === 'admin' ? 'Admin' : 'Guru'})
                  </span>

                  {/* Auto-logout countdown indicator if less than 5 mins */}
                  {inactivityRemainingSeconds !== undefined && (
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                        inactivityRemainingSeconds < 120
                          ? 'bg-rose-100 text-rose-700 font-bold animate-pulse'
                          : 'bg-slate-200/60 text-slate-600'
                      }`}
                      title={`Sesi aktif. Akan logout otomatis jika tidak ada aktivitas selama 15 menit. Sisa waktu: ${formatTimer(
                        inactivityRemainingSeconds
                      )}`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatTimer(inactivityRemainingSeconds)}</span>
                    </div>
                  )}
                </div>

                {/* Explicit Tombol Logout */}
                <button
                  type="button"
                  onClick={onLogoutToken}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 hover:border-rose-300 rounded-lg transition-colors shadow-2xs group"
                  title="Logout / Keluar dari sesi saat ini"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:rotate-12 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginToken}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
              >
                <Key className="w-3.5 h-3.5 text-white" />
                <span>Masuk Token</span>
              </button>
            )}

            {/* Admin Management Portal Button */}
            <button
              type="button"
              onClick={onOpenAdminToken}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors shadow-2xs"
              title="Portal Khusus Administrator untuk setting & kelola token"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>⚙️ Admin Token</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
