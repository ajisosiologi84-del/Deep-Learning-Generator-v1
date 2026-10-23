import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Smile,
  Compass,
  CheckCircle2,
  Brain,
  Layers,
  FileText,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  Zap,
  Target,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';

interface AppOnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCreating?: () => void;
}

export const AppOnboardingTourModal: React.FC<AppOnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onStartCreating,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(35);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Load user preference on mount
  useEffect(() => {
    const savedPref = localStorage.getItem('hide_rpp_onboarding_guide');
    if (savedPref === 'true') {
      setDontShowAgain(true);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  // Simulated progress timer on step 3 (0-indexed 3 is step 4)
  useEffect(() => {
    if (!isOpen || currentStep !== 3) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    setSimulatedProgress(12);

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        const jump = Math.floor(Math.random() * 8) + 6;
        return Math.min(100, prev + jump);
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('hide_rpp_onboarding_guide', 'true');
    } else {
      localStorage.removeItem('hide_rpp_onboarding_guide');
    }
    onClose();
  };

  const handleFinish = () => {
    handleDismiss();
    if (onStartCreating) {
      onStartCreating();
    }
  };

  const steps = [
    {
      badge: 'Prinsip Inti',
      title: 'Selamat Datang di Deep Learning Generator',
      subtitle: 'Perancang RPP Pembelajaran Mendalam (RPP-PM) Kurikulum Merdeka BSKAP',
      icon: Sparkles,
      iconColor: 'from-emerald-500 to-teal-600',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Aplikasi ini dirancang khusus untuk memandu Bapak/Ibu Guru dan Pengawas menyusun
            <strong> Rencana Pelaksanaan Pembelajaran (RPP/Modul Ajar) Pembelajaran Mendalam</strong> sesuai
            standar resmi Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mindful */}
            <div className="group relative p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Berkesadaran</h4>
                  <span className="text-[10px] text-emerald-700 font-medium">Mindful Learning</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                Murid hadir utuh pikiran dan rasa, memahami tujuan dan makna setiap kegiatan belajar.
              </p>
            </div>

            {/* Meaningful */}
            <div className="group relative p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50/60 border border-teal-200/80 shadow-xs hover:border-teal-300 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-950">Bermakna</h4>
                  <span className="text-[10px] text-teal-700 font-medium">Meaningful Learning</span>
                </div>
              </div>
              <p className="text-[11px] text-teal-900/80 leading-relaxed">
                Materi dikaitkan dengan konteks nyata kehidupan siswa, pemecahan masalah aktual, dan berpikir kritis.
              </p>
            </div>

            {/* Joyful */}
            <div className="group relative p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Menyenangkan</h4>
                  <span className="text-[10px] text-amber-700 font-medium">Joyful Learning</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Suasana belajar memotivasi, kolaboratif, penuh rasa ingin tahu, dan ditutup dengan perayaan refleksi.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-700">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>Keunggulan:</strong> Dilengkapi validasi 8 Dimensi Profil Lulusan (DPL) & Tri-Asesmen Kurikulum Merdeka.
            </span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Formulir Pintar',
      title: 'Identitas, Fase & 8 Dimensi Profil Lulusan (DPL)',
      subtitle: 'Pengisian Otomatis dan Penyelarasan Capaian Pembelajaran (CP)',
      icon: Brain,
      iconColor: 'from-blue-500 to-indigo-600',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Pilih jenjang pendidikan dan fase secara instan. Sistem secara cerdas menyelaraskan
            <strong> Fase A (Kelas 1-2)</strong> sampai <strong>Fase F (Kelas 11-12)</strong>, Elemen CP, serta Profil Pelajar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Pilihan Fase & Elemen CP
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  Otomatis
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tersedia pilihan Capaian Pembelajaran (CP) dan Elemen sesuai materi BSKAP. Bapak/Ibu dapat memilih dari template preset atau mengetik langsung.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {['Fase A (SD 1-2)', 'Fase D (SMP 7-9)', 'Fase E (SMA 10)', 'Fase F (SMA 11-12)'].map((f) => (
                  <span key={f} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  8 Dimensi Profil Lulusan (DPL)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-semibold">
                  Interaktif
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pilih minimal 2 dimensi yang relevan. Sistem akan mengintegrasikan indikator perilaku dan nilai ke dalam langkah pembelajaran:
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {['Keimanan & Akhlak', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Komunikasi'].map((d) => (
                  <span key={d} className="text-[10px] bg-white border border-blue-200 px-1.5 py-0.5 rounded-md text-blue-700 font-medium">
                    ✓ {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Kop Surat & NIP/P3K:</strong> Mendukung kustomisasi logo ganda, nama dinas/kemenag, serta nomor identitas guru (NIP/NUPTK/PPPK).
            </span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Sintaks Alur M3',
      title: 'Sintaks 3M & Desain Diferensiasi Pembelajaran',
      subtitle: 'Memahami (Mindful) → Mengalami (Meaningful) → Merefleksi (Joyful)',
      icon: Layers,
      iconColor: 'from-amber-500 to-orange-600',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Struktur kegiatan inti mengacu pada alur pedagogis <strong>3M</strong> yang dilengkapi rincian durasi waktu dan diferensiasi murid:
          </p>

          <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-teal-400 before:to-amber-400">
            {/* M1 */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                1
              </span>
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">Memahami (Mindful)</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-medium">
                    Pertanyaan Pemantik & Ice Breaking
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/80 mt-1">
                  Apersepsi menggugah rasa ingin tahu, penyampaian tujuan, dan orientasi konsep awal.
                </p>
              </div>
            </div>

            {/* M2 */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                2
              </span>
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-2.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950">Mengalami (Meaningful)</span>
                  <span className="text-[10px] text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded font-medium">
                    Investigasi Kasus & LKPD Kolaboratif
                  </span>
                </div>
                <p className="text-[11px] text-teal-900/80 mt-1">
                  Eksplorasi nyata melalui LKPD, kerja kelompok, diferensiasi proses, dan presentasi karya.
                </p>
              </div>
            </div>

            {/* M3 */}
            <div className="relative flex items-start gap-3">
              <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                3
              </span>
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">Merefleksi (Joyful)</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-medium">
                    Refleksi 3-2-1 & Apresiasi Diri
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 mt-1">
                  Siswa menuliskan 3 hal baru, 2 hal menarik, dan 1 pertanyaan yang masih dipikirkan.
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
            <span className="font-semibold text-slate-800">Diferensiasi Terintegrasi:</span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[10px]">Konten</span>
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-medium text-[10px]">Proses</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium text-[10px]">Produk</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Animasi & Kecepatan',
      title: 'Penyusunan Otomatis & Animasi Prosentase',
      subtitle: 'Indikator Real-Time dari 0% hingga 100% dengan Tahap Pedagogis',
      icon: Zap,
      iconColor: 'from-emerald-500 to-green-600',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Saat Bapak/Ibu mengklik tombol <strong>&quot;⚡ Susun RPP Deep Learning&quot;</strong>, aplikasi menampilkan animasi progres interaktif beserta persentase dan tahapan penyusunan:
          </p>

          {/* Interactive Simulation Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Simulasi Tahapan Penyusunan
                </span>
              </div>
              <span className="text-base font-extrabold text-emerald-300 font-mono">
                {simulatedProgress}%
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-300"
                style={{ width: `${simulatedProgress}%` }}
              />
            </div>

            {/* Current Phase Description */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300">
              <span>
                {simulatedProgress < 25
                  ? '🔍 Menganalisis Fase, CP & Kebutuhan Belajar...'
                  : simulatedProgress < 50
                  ? '🎯 Mengintegrasikan 8 Dimensi Profil Lulusan...'
                  : simulatedProgress < 75
                  ? '🧠 Merancang Sintaks M3 & Diferensiasi Konten/Proses...'
                  : simulatedProgress < 95
                  ? '📝 Menyusun Lembar LKPD & Rubrik 4 Skala...'
                  : '✨ Memfinalisasi Dokumen Siap Cetak BSKAP!'}
              </span>
              <button
                type="button"
                onClick={() => setSimulatedProgress(15)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium underline"
              >
                <RotateCcw className="w-3 h-3" />
                Ulang Simulasi
              </button>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Bisa Offline & Multi-Device:</strong> Bekerja cepat tanpa kuota melalui mesin lokal cerdas, maupun via Gemini AI jika API Key diisi.
            </span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Ekspor Lengkap',
      title: 'Multi-Format Ekspor Siap Supervisi Pengawas',
      subtitle: 'Word (.doc), Excel (.xls), Cetak Dokumen Resmi PDF A4, & Prompt AI',
      icon: Printer,
      iconColor: 'from-purple-500 to-indigo-600',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Hasil RPP dapat langsung diekspor dan dicetak sesuai kebutuhan administrasi sekolah dan pengawas dinas:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Word */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center text-center space-y-1 hover:border-blue-300 transition">
              <FileText className="w-6 h-6 text-blue-700" />
              <span className="text-xs font-bold text-blue-950">Microsoft Word</span>
              <span className="text-[10px] text-blue-800/80">Format .doc / .docx siap edit</span>
            </div>

            {/* Excel */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center text-center space-y-1 hover:border-emerald-300 transition">
              <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-950">Microsoft Excel</span>
              <span className="text-[10px] text-emerald-800/80">Matriks rubrik & lembar nilai</span>
            </div>

            {/* Print A4 */}
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center text-center space-y-1 hover:border-rose-300 transition">
              <Printer className="w-6 h-6 text-rose-700" />
              <span className="text-xs font-bold text-rose-950">Cetak A4 / PDF</span>
              <span className="text-[10px] text-rose-800/80">Standar resmi 5 Halaman BSKAP</span>
            </div>

            {/* Gemini Prompt */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center text-center space-y-1 hover:border-purple-300 transition">
              <Sparkles className="w-6 h-6 text-purple-700" />
              <span className="text-xs font-bold text-purple-950">Salin Prompt AI</span>
              <span className="text-[10px] text-purple-800/80">Bisa ditempel di Gemini/ChatGPT</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Termasuk 2 Lampiran Standar Wajib:
            </div>
            <p className="text-[11px] text-amber-900/80 pl-5">
              1. <strong>Lembar Kerja Peserta Didik (LKPD)</strong> eksploratif berbasis studi kasus nyata.
              <br />
              2. <strong>Lembar Refleksi Diri 3-2-1</strong> untuk murid dan instrumen refleksi guru.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slideInUp max-h-[92vh]">
        
        {/* Top Decorative Header */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 p-5 sm:p-6 text-white overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm ring-2 ring-white/20">
                <CurrentIcon className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-emerald-100 uppercase tracking-wider mb-1">
                  {steps[currentStep].badge}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                  {steps[currentStep].title}
                </h3>
                <p className="text-xs text-emerald-100/90 hidden sm:block mt-0.5">
                  {steps[currentStep].subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0"
              title="Tutup panduan (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar & Dots */}
          <div className="mt-5 space-y-2 relative z-10">
            <div className="flex items-center justify-between text-[11px] text-emerald-200">
              <span className="font-semibold">
                Langkah {currentStep + 1} dari {steps.length}
              </span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% selesai</span>
            </div>

            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-300 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Stepper Pills */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {steps.map((st, idx) => (
                <button
                  key={st.title}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold text-center transition-all ${
                    idx === currentStep
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : idx < currentStep
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white/10 text-emerald-200/60 hover:bg-white/20'
                  }`}
                >
                  <span className="truncate block">
                    {idx < currentStep ? '✓ ' : ''}
                    {idx + 1}. {st.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {steps[currentStep].renderContent()}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Checkbox preference */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Jangan tampilkan otomatis lagi</span>
          </label>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-2xs flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
              >
                Lewati Tur
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                Lanjut
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Mulai Susun RPP Sekarang!
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
