import React from 'react';
import { RPPData } from '../types/rpp';
import { DPL_LIST } from '../data/dplData';
import {
  Sparkles,
  Heart,
  Smile,
  Compass,
  CheckCircle2,
  Users,
  Brain,
  MessageCircle,
  HelpCircle,
  Award,
  BookOpen,
  SlidersHorizontal,
  FileText,
  Lightbulb,
  ListChecks,
} from 'lucide-react';

interface InteractiveCardViewProps {
  rpp: RPPData;
  onOpenRefine: (sectionName: string, content: any) => void;
  onSwitchToOfficial?: () => void;
  onSwitchToGemini?: () => void;
}

export const InteractiveCardView: React.FC<InteractiveCardViewProps> = ({
  rpp,
  onOpenRefine,
  onSwitchToOfficial,
  onSwitchToGemini,
}) => {
  const pemantikList: string[] = Array.isArray(rpp.pertanyaanPemantik) && rpp.pertanyaanPemantik.length > 0
    ? rpp.pertanyaanPemantik
    : typeof (rpp as any).pertanyaanPemantik === 'string' && (rpp as any).pertanyaanPemantik.trim()
      ? (rpp as any).pertanyaanPemantik.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [
          `Mengapa pemahaman tentang ${rpp.identitas.topik} sangat penting dalam menyikapi persoalan di lingkungan sekitar kita?`,
          `Bagaimana keterkaitan konsep materi ini dengan fenomena nyata yang dihadapi peserta didik dalam kehidupan sehari-hari?`,
          `Karya atau aksi nyata apa yang dapat tim Anda ciptakan untuk memberikan dampak positif berkelanjutan?`,
        ];

  const lkpd = rpp.lkpd || {
    judul: `Eksplorasi Kontekstual & Investigasi Kasus: ${rpp.identitas.topik}`,
    tujuanAktivitas: `Peserta didik mampu menganalisis konsep ${rpp.identitas.topik}, menghubungkannya dengan isu kontekstual di sekitar, dan menghasilkan solusi kreatif berbasis kolaborasi kelompok.`,
    petunjukKerja: [
      'Bentuk kelompok kolaboratif beranggotakan 4-5 peserta didik.',
      'Cermati stimulus studi kasus / isu kontekstual yang disajikan.',
      'Diskusikan dan jawab pertanyaan panduan penyelidikan menggunakan sumber belajar multi-modal.',
      'Rancang solusi / karya representatif (pilih: infografis, video/siniar pendek, esai, atau produk fisik).',
      'Presentasikan hasil kerja di depan kelas untuk mendapatkan tanggapan mindful dari kelompok lain.',
    ],
    studiKasusTantangan: `Di lingkungan sekitar kita, tantangan terkait ${rpp.identitas.topik} seringkali dihadapi masyarakat tanpa disadari. Bagaimana kelompok Anda menyusun investigasi kritis untuk membedah akar persoalan dan menawarkan gagasan aplikatif yang dapat diterapkan secara nyata?`,
    pertanyaanPanduan: [
      `Fakta dan data apa saja yang dapat Anda temukan terkait fenomena ${rpp.identitas.topik} pada kasus tersebut?`,
      `Mengapa persoalan ini timbul dan bagaimana prinsip materi yang kita pelajari menjelaskan akar masalahnya?`,
      `Inovasi atau aksi konkret apa yang kelompok Anda ajukan agar persoalan ini dapat diatasi secara berkelanjutan?`,
    ],
  };

  const refleksiMurid = rpp.refleksiMurid || {
    model321: {
      tigaHalDipahami: `1) Makna esensial konsep ${rpp.identitas.topik}; 2) Manfaat fungsional dalam pemecahan masalah; 3) Pentingnya kolaborasi tim yang inklusif.`,
      duaHalDidalami: `1) Studi kasus aplikatif tingkat lanjut di masyarakat; 2) Penggunaan teknologi pendukung investigasi.`,
      satuAksiNyata: `Menerapkan pemahaman tentang ${rpp.identitas.topik} dalam kebiasaan positif dan berbagi wawasan kepada rekan sebaya.`,
    },
    pertanyaanMetakognisi: [
      'Apa yang paling membuat saya tertantang dan bagaimana strategi saya mengatasinya?',
      'Bagaimana materi ini mengubah cara pandang saya terhadap lingkungan sekitar?',
      'Apakah saya sudah berkolaborasi dan mendengarkan rekan kelompok dengan penuh kesadaran?',
    ],
  };

  const refleksiGuru = rpp.refleksiGuru || {
    pertanyaanRefleksi: [
      'Apakah alur Memahami, Mengaplikasikan, dan Merefleksikan (M3) terlaksana dengan suasana mindful, meaningful, dan joyful?',
      'Bagaimana respons diferensiasi murid dengan kesiapan belajar yang bervariasi?',
      'Apakah instrumen asesmen dan rubrik 4 skala berhasil mengukur kompetensi murid secara objektif?',
    ],
    tindakLanjut: `Menyediakan media ajar pendukung yang lebih variatif bagi kelompok yang membutuhkan scaffolding, serta memberikan tantangan eksplorasi lanjutan bagi kelompok yang telah mencapai tingkat sangat berkembang pada topik ${rpp.identitas.topik}.`,
  };

  return (
    <div className="space-y-6">
      {/* Hero Overview */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
              {rpp.identitas.mapel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
              {rpp.identitas.kelas.startsWith('Kelas') || rpp.identitas.kelas.startsWith('TK') || rpp.identitas.kelas.startsWith('PAUD') || rpp.identitas.kelas.startsWith('Fase') || rpp.identitas.kelas.startsWith('SLB')
                ? rpp.identitas.kelas
                : `Kelas ${rpp.identitas.kelas}`}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200">
              {rpp.identitas.alokasiWaktu || '2 x 45 Menit'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {rpp.identitas.topik}
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-3xl">
            {rpp.desainPembelajaran.tujuanPembelajaran}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/80 border-t border-white/10">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-white/60">Guru Pengampu:</span>{' '}
                <strong className="text-white">{rpp.identitas.nama}</strong>
              </div>
              {rpp.identitas.satuanPendidikan && (
                <div>
                  <span className="text-white/60">Sekolah:</span>{' '}
                  <strong className="text-white">{rpp.identitas.satuanPendidikan}</strong>
                </div>
              )}
              <div>
                <span className="text-white/60">Konteks Wilayah:</span>{' '}
                <strong className="text-white">{rpp.profilMurid.lingkungan}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onSwitchToGemini && (
                <button
                  type="button"
                  onClick={onSwitchToGemini}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs border border-white/20 transition shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Prompt Gemini & DOC/PDF/Excel</span>
                </button>
              )}
              {onSwitchToOfficial && (
                <button
                  type="button"
                  onClick={onSwitchToOfficial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/40 text-white font-semibold text-xs border border-emerald-400/30 transition shadow-2xs"
                >
                  <span>Format Resmi BSKAP →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Deep Learning Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Berkesadaran (Mindful)
            </h4>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Hadir utuh, mengenali diri, dan menyadari esensi nilai materi.
            </p>
          </div>
        </div>

        <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
              Bermakna (Meaningful)
            </h4>
            <p className="text-xs text-teal-800/80 mt-0.5">
              Terkoneksi langsung dengan isu autentik & lingkungan nyata murid.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Menggembirakan (Joyful)
            </h4>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Eksplorasi antusias, karya kreatif, dan perayaan capaian bersama.
            </p>
          </div>
        </div>
      </div>

      {/* DPL Badges */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-emerald-600" />
          Dimensi Profil Lulusan (DPL) yang Dikuatkan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rpp.dplTerpilih?.map((item) => {
            const def = DPL_LIST.find((d) => d.id === item.id);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    DPL {item.id}: {item.nama}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  {item.alasan || def?.deskripsi}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capaian Pembelajaran (CP) & Pertanyaan Pemantik HOTS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Capaian Pembelajaran (CP) & Pertanyaan Pemantik HOTS
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Fase {rpp.identitas.fase || 'Standar BSKAP'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">
                Elemen Capaian Pembelajaran:
              </span>
              <p className="text-slate-800 font-semibold">
                {rpp.elemenCP || 'Pemahaman Konsep & Keterampilan Proses'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-1">
              <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wide">
                Rumusan Capaian Pembelajaran (CP):
              </span>
              <p className="text-slate-700 leading-relaxed">
                {rpp.capaianPembelajaran || 'Peserta didik menganalisis konsep dan mengaplikasikan pengetahuan secara kontekstual untuk memecahkan persoalan nyata secara mandiri.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                Pemahaman Bermakna (Big Idea):
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{rpp.pemahamanBermakna || 'Pengetahuan bukan sekadar hafalan teoritis, melainkan bekal bernalar kritis untuk menghasilkan tindakan nyata yang bermanfaat bagi diri sendiri, sesama, dan lingkungan hidup.'}"
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                Pertanyaan Pemantik HOTS (C4 - C6):
              </span>
              <div className="space-y-2">
                {pemantikList.map((q, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-start gap-2 shadow-2xs">
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-snug">{q}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 italic">
              Dirancang untuk memicu rasa ingin tahu (curiosity) dan mengaktifkan kesadaran kritis sejak awal sesi.
            </p>
          </div>
        </div>
      </div>

      {/* Blok Diferensiasi Pembelajaran (Konten, Proses, Produk) & Sarana */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            Blok Diferensiasi Pembelajaran & Sarana Prasarana
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Akomodasi Minat, Cara Belajar & Kesiapan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="font-bold text-sky-900 uppercase tracking-wide text-[11px]">
                1. Diferensiasi Konten
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {rpp.diferensiasiPembelajaran?.konten || `Bahan ajar multi-modal: infografis ringkas, teks bacaan bertingkat, audio visual interaktif, dan pengamatan artefak/studi kasus riil terkait ${rpp.identitas.topik}.`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="font-bold text-indigo-900 uppercase tracking-wide text-[11px]">
                2. Diferensiasi Proses
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {rpp.diferensiasiPembelajaran?.proses || 'Scaffolding bertingkat: pendampingan intensif bagi murid yang baru memulai, bimbingan berkala bagi murid cakap, dan tantangan mandiri serta mentoring sebaya bagi murid mahir.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-bold text-purple-900 uppercase tracking-wide text-[11px]">
                3. Diferensiasi Produk
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {rpp.diferensiasiPembelajaran?.produk || 'Pilihan unjuk karya sesuai minat: poster infografis digital/manual, podcast/video pendek, esai reflektif, atau prototipe terapan.'}
            </p>
          </div>
        </div>

        {rpp.saranaPrasarana && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
            <span className="font-bold text-slate-800 shrink-0">Sarana & Prasarana:</span>
            <span className="text-slate-600">{rpp.saranaPrasarana}</span>
          </div>
        )}
      </div>

      {/* M3 Learning Flow Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Alur Pengalaman Belajar (M3)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Pembelajaran Mendalam Berpusat pada Murid
          </span>
        </div>

        {/* Step 1: Memahami */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white text-emerald-700 font-black flex items-center justify-center text-sm shadow-xs">
                M1
              </span>
              <div>
                <h4 className="font-bold text-sm tracking-wide">
                  Memahami (Mindful)
                </h4>
                <p className="text-xs text-emerald-100">
                  Aktivitas pemantik untuk membangun kesadaran & koneksi awal
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenRefine('Memahami (Mindful)', rpp.pengalamanBelajar.memahami)}
              className="text-xs px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition"
            >
              Kembangkan AI
            </button>
          </div>
          <div className="p-5 space-y-3">
            {rpp.pengalamanBelajar.memahami.langkahLangkah.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Mengaplikasikan */}
        <div className="bg-white rounded-2xl border border-teal-200 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-cyan-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white text-teal-800 font-black flex items-center justify-center text-sm shadow-xs">
                M2
              </span>
              <div>
                <h4 className="font-bold text-sm tracking-wide">
                  Mengaplikasikan (Meaningful & Joyful)
                </h4>
                <p className="text-xs text-teal-100">
                  Aktivitas inti / Proyek kontekstual berbasis masalah di lingkungan murid
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenRefine('Mengaplikasikan', rpp.pengalamanBelajar.mengaplikasikan)}
              className="text-xs px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition"
            >
              Kembangkan AI
            </button>
          </div>
          <div className="p-5 space-y-3">
            {rpp.pengalamanBelajar.mengaplikasikan.langkahLangkah.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Merefleksikan */}
        <div className="bg-white rounded-2xl border border-sky-200 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-sky-700 to-indigo-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white text-sky-800 font-black flex items-center justify-center text-sm shadow-xs">
                M3
              </span>
              <div>
                <h4 className="font-bold text-sm tracking-wide">
                  Merefleksikan (Mindful & Meaningful)
                </h4>
                <p className="text-xs text-sky-100">
                  Pertanyaan reflektif mendalam untuk internalisasi nilai & aksi nyata
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenRefine('Merefleksikan', rpp.pengalamanBelajar.merefleksikan)}
              className="text-xs px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium transition"
            >
              Kembangkan AI
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pertanyaan Pemantik Refleksi:
              </span>
              {rpp.pengalamanBelajar.merefleksikan.pertanyaanRefleksi.map((q, idx) => (
                <div key={idx} className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs sm:text-sm font-medium text-sky-950 italic flex items-start gap-2">
                  <span className="text-sky-500 font-bold shrink-0">“</span>
                  <span>{q}</span>
                  <span className="text-sky-500 font-bold shrink-0">”</span>
                </div>
              ))}
            </div>

            {rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Aktivitas Penutup: </span>
                {rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asesmen Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          Tri-Asesmen Pembelajaran Mendalam
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Awal (Of Learning)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              {rpp.asesmen.awal}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Proses (As Learning)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              {rpp.asesmen.proses}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Akhir (For Learning)
            </span>
            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              {rpp.asesmen.akhir}
            </p>
          </div>
        </div>
      </div>

      {/* Lampiran 1: LKPD Card */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Lampiran 1: Lembar Kerja Peserta Didik (LKPD) Pembelajaran Mendalam
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Kolaboratif & Kontekstual
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wide">
              Aktivitas Belajar:
            </span>
            <p className="font-semibold text-emerald-900 text-sm mt-0.5">{lkpd.judul}</p>
            <p className="text-slate-600 mt-1 leading-relaxed">{lkpd.tujuanAktivitas}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                Petunjuk Pengerjaan:
              </span>
              <div className="space-y-1.5">
                {lkpd.petunjukKerja.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wide">
                  Tantangan / Kasus Kontekstual:
                </span>
                <p className="text-slate-700 italic mt-1 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-teal-100">
                  "{lkpd.studiKasusTantangan}"
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-teal-200/60">
                <span className="font-bold text-teal-950 block text-[11px] mb-1">Pertanyaan Panduan:</span>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {lkpd.pertanyaanPanduan.map((q, idx) => (
                    <li key={idx} className="leading-snug">{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lampiran 2: Lembar Refleksi Card */}
      <div className="bg-white rounded-2xl border border-sky-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Lampiran 2: Lembar Refleksi (Murid Model 3-2-1 & Refleksi Guru)
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            Metakognisi & Tindak Lanjut
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Murid */}
          <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200 space-y-2.5">
            <span className="font-bold text-sky-950 block text-[11px] uppercase tracking-wide">
              A. Refleksi Murid Model 3-2-1:
            </span>
            <div className="space-y-2">
              <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                <strong className="text-sky-900 block text-[11px]">3 Hal Baru yang Dipahami:</strong>
                <p className="text-slate-700 mt-0.5">{refleksiMurid.model321.tigaHalDipahami}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                <strong className="text-sky-900 block text-[11px]">2 Hal yang Ingin Didalami:</strong>
                <p className="text-slate-700 mt-0.5">{refleksiMurid.model321.duaHalDidalami}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-sky-100">
                <strong className="text-sky-900 block text-[11px]">1 Aksi Nyata yang Akan Dilakukan:</strong>
                <p className="text-slate-700 mt-0.5">{refleksiMurid.model321.satuAksiNyata}</p>
              </div>
            </div>
          </div>

          {/* Guru */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
                B. Refleksi & Evaluasi Guru Pengampu:
              </span>
              <div className="space-y-1.5">
                {refleksiGuru.pertanyaanRefleksi.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-emerald-600 font-bold">•</span>
                    <p className="leading-snug">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 mt-2">
              <span className="font-bold text-emerald-950 block text-[11px] mb-0.5">
                Rencana Tindak Lanjut Modul Ajar:
              </span>
              <p className="text-slate-700 leading-snug">{refleksiGuru.tindakLanjut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pengesahan & Tanda Tangan Card */}
      {rpp.pengesahan && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lembar Pengesahan & Tanda Tangan Resmi
            </h3>
            <span className="text-xs text-slate-500">
              {rpp.pengesahan.tempatPenetapan || 'Kota'}, {rpp.pengesahan.tanggalPenetapan || '-'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Mengetahui:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">Kepala Sekolah</p>
              <p className="font-semibold text-slate-800 mt-2 underline">{rpp.pengesahan.namaKepalaSekolah || '-'}</p>
              <p className="text-[11px] text-slate-500">NIP. {rpp.pengesahan.nipKepalaSekolah || '-'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right sm:text-left">
              <span className="text-slate-500 block text-[11px]">Penyusun:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">Guru Mata Pelajaran</p>
              <p className="font-semibold text-slate-800 mt-2 underline">{rpp.pengesahan.namaGuru || rpp.identitas.nama || '-'}</p>
              <p className="text-[11px] text-slate-500">NIP. {rpp.pengesahan.nipGuru || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
