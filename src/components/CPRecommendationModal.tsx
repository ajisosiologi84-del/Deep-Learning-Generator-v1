import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  HelpCircle,
  SlidersHorizontal,
  Users,
  Check,
  CheckCircle2,
  X,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Brain,
  Layers,
  MapPin,
  Clock,
  Compass,
  Loader2,
} from 'lucide-react';
import { CPRecommendationResult } from '../types/rpp';
import { DPL_LIST } from '../data/dplData';

interface CPRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: CPRecommendationResult | null;
  onApplyAll: (rec: CPRecommendationResult) => void;
  onApplySelected: (rec: CPRecommendationResult, selectedFields: Record<string, boolean>) => void;
  source: 'gemini' | 'heuristic';
  isLoading?: boolean;
}

export const CPRecommendationModal: React.FC<CPRecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  onApplyAll,
  onApplySelected,
  source,
  isLoading,
}) => {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    pemahamanBermakna: true,
    pertanyaanPemantik: true,
    diferensiasi: true,
    saranaPrasarana: true,
    profilMurid: true,
    dpl: true,
    elemenCP: true,
  });

  if (!isOpen) return null;

  if (isLoading && !recommendation) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-8 text-center space-y-4 animate-slideInUp">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              Menganalisis Taksonomi CP BSKAP...
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Sistem sedang mengekstrak Big Idea, merumuskan Pertanyaan Pemantik HOTS, menyelaraskan diferensiasi pembelajaran, dan mengidentifikasi 8 Dimensi Profil Lulusan (DPL).
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-left space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Memproses 4 Pilar Pembelajaran Mendalam:</span>
            </div>
            <ul className="text-[11px] text-emerald-800 space-y-1 pl-6 list-disc">
              <li>Pemahaman Bermakna (Big Idea / Enduring Understanding)</li>
              <li>Pertanyaan Pemantik HOTS (Analisis, Evaluasi, Kreasi)</li>
              <li>Diferensiasi Pembelajaran (Konten, Proses, Produk) & Sarana</li>
              <li>Karakteristik Profil Murid & Rekomendasi 8 DPL</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
          >
            Tutup Sementara
          </button>
        </div>
      </div>
    );
  }

  if (!recommendation) return null;

  const toggleField = (key: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApplyAllClick = () => {
    onApplyAll(recommendation);
    onClose();
  };

  const handleApplySelectedClick = () => {
    onApplySelected(recommendation, selectedFields);
    onClose();
  };

  // Get DPL details for selected IDs
  const dplSelectedItems = DPL_LIST.filter((d) =>
    recommendation.selectedDpl?.includes(d.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Dialog */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-slideInUp">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/15 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Rekomendasi Pembelajaran Mendalam dari CP BSKAP</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  {source === 'gemini' ? 'AI Gemini 3.8 Flash' : 'Pedagogical Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Hasil analisis otomatis taksonomi CP terhadap Pemahaman Bermakna, HOTS, Diferensiasi, Profil Murid & DPL
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

        {/* Modal Body (Scrollable Review Cards) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/70 flex-1">
          
          {/* Quick Notice */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Analisis CP Berhasil:</strong> Semua rekomendasi telah dirumuskan selaras dengan alur <strong>M3 (Memahami, Mengaplikasikan, Merefleksikan)</strong>.
              </span>
            </div>
            <span className="text-[11px] font-bold bg-emerald-200/70 px-2 py-0.5 rounded text-emerald-900 shrink-0">
              {recommendation.selectedDpl?.length || 4} DPL Teridentifikasi
            </span>
          </div>

          {/* Card 1: Pemahaman Bermakna (Big Idea) */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.pemahamanBermakna}
                  onChange={() => toggleField('pemahamanBermakna')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>1. Pemahaman Bermakna (Big Idea / Enduring Understanding)</span>
                </span>
              </label>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Melekat Seumur Hidup
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium italic">
              "{recommendation.pemahamanBermakna}"
            </div>
          </div>

          {/* Card 2: Pertanyaan Pemantik HOTS */}
          <div className="bg-white rounded-2xl border border-sky-200/80 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.pertanyaanPemantik}
                  onChange={() => toggleField('pertanyaanPemantik')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4 text-sky-500" />
                  <span>2. Pertanyaan Pemantik HOTS (3 Butir Esensial)</span>
                </span>
              </label>
              <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Level C4 - C6 (HOTS)
              </span>
            </div>
            <div className="space-y-2">
              {recommendation.pertanyaanPemantik.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200/60 flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed font-medium"
                >
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Diferensiasi Pembelajaran (Konten, Proses, Produk) & Sarana */}
          <div className="bg-white rounded-2xl border border-teal-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.diferensiasi}
                  onChange={() => toggleField('diferensiasi')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                  <span>3. Diferensiasi Pembelajaran & Sarana Kontekstual</span>
                </span>
              </label>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Kurikulum Merdeka BSKAP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Konten */}
              <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-200/70 space-y-1">
                <strong className="block text-teal-900 font-bold">1. Diferensiasi Konten:</strong>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {recommendation.diferensiasiKonten}
                </p>
              </div>

              {/* Proses */}
              <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-200/70 space-y-1">
                <strong className="block text-teal-900 font-bold">2. Diferensiasi Proses:</strong>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {recommendation.diferensiasiProses}
                </p>
              </div>

              {/* Produk */}
              <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-200/70 space-y-1">
                <strong className="block text-teal-900 font-bold">3. Diferensiasi Produk:</strong>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {recommendation.diferensiasiProduk}
                </p>
              </div>
            </div>

            {recommendation.saranaPrasarana && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Sarana & Media Pembelajaran: </span>
                  <span className="text-slate-600">{recommendation.saranaPrasarana}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Profil Murid (Minat, Cara Belajar, Lingkungan) */}
          <div className="bg-white rounded-2xl border border-indigo-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.profilMurid}
                  onChange={() => toggleField('profilMurid')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>4. Profil Murid Rekomendasi</span>
                </span>
              </label>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Personalisasi Belajar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-200/70">
                <span className="font-bold text-indigo-950 block mb-0.5">Minat Murid:</span>
                <span className="text-slate-700 text-[11px]">{recommendation.profilMurid.minat}</span>
              </div>
              <div className="p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-200/70">
                <span className="font-bold text-indigo-950 block mb-0.5">Cara Belajar:</span>
                <span className="text-slate-700 text-[11px]">{recommendation.profilMurid.caraBelajar}</span>
              </div>
              <div className="p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-200/70">
                <span className="font-bold text-indigo-950 block mb-0.5">Lingkungan Hidup:</span>
                <span className="text-slate-700 text-[11px]">{recommendation.profilMurid.lingkungan}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Identifikasi 8 Dimensi Profil Lulusan (DPL) */}
          <div className="bg-white rounded-2xl border border-purple-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.dpl}
                  onChange={() => toggleField('dpl')}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>5. Identifikasi 8 Dimensi Profil Lulusan (DPL) Terpilih</span>
                </span>
              </label>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                BSKAP 8 Dimensi
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {dplSelectedItems.map((dpl) => (
                <div
                  key={dpl.id}
                  className="p-2.5 rounded-xl border border-purple-300 bg-purple-50/60 text-xs flex items-center gap-2 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {dpl.id}
                  </span>
                  <div>
                    <strong className="text-purple-950 block">{dpl.nama}</strong>
                    <span className="text-[10px] text-purple-800 font-medium">{dpl.deskripsi}</span>
                  </div>
                </div>
              ))}
            </div>

            {recommendation.alasanDpl && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <strong>Alasan Pedagogis:</strong> {recommendation.alasanDpl}
              </p>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Klik tombol di bawah untuk langsung menyematkan rekomendasi ke formulir RPP Anda.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplySelectedClick}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition cursor-pointer"
              title="Hanya terapkan bagian yang dicentang"
            >
              Terapkan Pilihan
            </button>
            <button
              type="button"
              onClick={handleApplyAllClick}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Terapkan Semua ke Formulir (1-Klik)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
