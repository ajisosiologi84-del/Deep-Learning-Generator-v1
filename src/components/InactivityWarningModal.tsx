import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, LogOut } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-200 overflow-hidden text-center p-6 sm:p-8 animate-scaleIn">
        {/* Glow & Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          Peringatan Keamanan Sesi Aktif
        </span>

        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Sesi Akan Ditutup Otomatis
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Aplikasi tidak mendeteksi aktivitas pengguna selama hampir 15 menit. Untuk melindungi keamanan dokumen dan token Anda, aplikasi akan logout otomatis dalam:
        </p>

        {/* Big countdown badge */}
        <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-700 font-black text-3xl font-mono mb-6 shadow-sm">
          {remainingSeconds} detik
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tetap Masuk & Lanjutkan</span>
          </button>
          <button
            type="button"
            onClick={onLogoutNow}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-sm border border-slate-200 hover:border-rose-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
