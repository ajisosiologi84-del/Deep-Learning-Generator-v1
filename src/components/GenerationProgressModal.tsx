import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Brain,
  BookOpen,
  SlidersHorizontal,
  FileText,
  ListChecks,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface GenerationProgressModalProps {
  isOpen: boolean;
  isComplete: boolean;
  onFinishAnimation?: () => void;
  topicTitle?: string;
}

interface StepInfo {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  minProgress: number;
}

const STEPS: StepInfo[] = [
  {
    label: '1. Profil Murid & Lingkungan',
    sublabel: 'Menelaah minat, modalitas cara belajar, dan konteks lingkungan lokal murid',
    icon: <Brain className="w-4 h-4" />,
    minProgress: 15,
  },
  {
    label: '2. Capaian Pembelajaran & HOTS',
    sublabel: 'Merumuskan CP BSKAP, Pemahaman Bermakna (Big Idea), dan Pertanyaan Pemantik',
    icon: <BookOpen className="w-4 h-4" />,
    minProgress: 35,
  },
  {
    label: '3. Dimensi Profil Lulusan & Diferensiasi',
    sublabel: 'Memetakan 8 DPL dan merancang diferensiasi konten, proses, dan produk',
    icon: <SlidersHorizontal className="w-4 h-4" />,
    minProgress: 55,
  },
  {
    label: '4. Skenario Alur M3',
    sublabel: 'Menyusun aktivitas Memahami (Mindful), Mengaplikasikan (Meaningful), & Merefleksikan (Joyful)',
    icon: <Sparkles className="w-4 h-4" />,
    minProgress: 75,
  },
  {
    label: '5. Lampiran LKPD & Refleksi 3-2-1',
    sublabel: 'Mengonstruksi Lembar Kerja Peserta Didik kontekstual dan instrumen metakognisi',
    icon: <FileText className="w-4 h-4" />,
    minProgress: 90,
  },
  {
    label: '6. Rubrik 4 Skala BSKAP & Format Cetak',
    sublabel: 'Memfinalisasi instrumen asesmen 3 dimensi dan dokumen 5 halaman resmi',
    icon: <ListChecks className="w-4 h-4" />,
    minProgress: 100,
  },
];

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  isOpen,
  isComplete,
  onFinishAnimation,
  topicTitle,
}) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    setProgress(8);

    // Natural multi-phase increment while waiting for completion
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          return 94; // Hold near finish until isComplete signal is received
        }
        // Smooth non-linear progress
        const increment = prev < 40 ? 5 : prev < 75 ? 3 : 1.5;
        return Math.min(prev + increment, 94);
      });
    }, 110);

    return () => clearInterval(interval);
  }, [isOpen]);

  // When complete, quickly glide to 100% and notify parent
  useEffect(() => {
    if (isOpen && isComplete) {
      setProgress(100);
      const timer = setTimeout(() => {
        onFinishAnimation?.();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isComplete, onFinishAnimation]);

  if (!isOpen) return null;

  const currentStepIndex = STEPS.findIndex((s) => progress <= s.minProgress);
  const activeStep = currentStepIndex !== -1 ? STEPS[currentStepIndex] : STEPS[STEPS.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden transition-all scale-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[11px] font-semibold mb-2 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>AI Perancang Pembelajaran Mendalam BSKAP</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Menyusun RPP Deep Learning
              </h3>
              {topicTitle && (
                <p className="text-xs text-emerald-100/90 mt-1 line-clamp-1">
                  Materi: <span className="font-semibold text-white">{topicTitle}</span>
                </p>
              )}
            </div>

            {/* Glowing circular badge with percentage */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-white/15 rounded-2xl border border-white/30 backdrop-blur-md shadow-inner">
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                {Math.round(progress)}
                <span className="text-xs font-bold text-emerald-200">%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Current Status */}
        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-600 flex items-center gap-1.5">
                {progress === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                )}
                <span className="font-bold text-slate-800">
                  {progress === 100 ? 'Selesai! Menyiapkan Dokumen RPP...' : activeStep.label}
                </span>
              </span>
              <span className="text-emerald-700 font-bold font-mono">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Visual Animated Progress Track */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer light effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 italic leading-relaxed">
              {progress === 100 ? 'Seluruh struktur 5 halaman telah lengkap dan terverifikasi.' : activeStep.sublabel}
            </p>
          </div>

          {/* Stepper Checklist Indicator */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Tahapan Konstruksi Pembelajaran:
            </span>

            <div className="space-y-2">
              {STEPS.map((step, idx) => {
                const isPassed = progress >= step.minProgress;
                const isCurrent = !isPassed && (idx === 0 || progress >= STEPS[idx - 1].minProgress);

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                      isPassed
                        ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/60 font-medium'
                        : isCurrent
                        ? 'bg-white text-slate-900 border border-emerald-300 shadow-2xs font-semibold'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.icon}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedagogical Quality Assurance Footer */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Memastikan prinsip Mindful, Meaningful, & Joyful</span>
            </span>
            <span className="font-medium text-slate-400">Kurikulum Merdeka BSKAP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
