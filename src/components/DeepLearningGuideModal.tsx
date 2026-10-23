import React from 'react';
import { X, BookOpen, Heart, Compass, Smile, CheckCircle, Brain } from 'lucide-react';
import { DPL_LIST } from '../data/dplData';

interface DeepLearningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeepLearningGuideModal: React.FC<DeepLearningGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Panduan Pembelajaran Mendalam (Deep Learning)
              </h2>
              <p className="text-xs text-slate-500">
                Prinsip Alur M3 & 8 Dimensi Profil Lulusan (BSKAP Kurikulum Merdeka)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-700 text-sm">
          {/* 3 Pillars */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Tiga Pilar Pembelajaran Mendalam
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Heart className="w-4 h-4" />
                  Berkesadaran (Mindful)
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  Murid hadir secara utuh pikiran dan hati, menyadari tujuan belajarnya, dan mengaitkan materi dengan jati dirinya.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                  <Compass className="w-4 h-4" />
                  Bermakna (Meaningful)
                </div>
                <p className="text-xs text-teal-900/80 leading-relaxed">
                  Materi tidak sekadar hafalan, melainkan terhubung langsung dengan realitas kehidupan murid, keluarga, dan lingkungan tempat tinggalnya.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Smile className="w-4 h-4" />
                  Menggembirakan (Joyful)
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Proses belajar memicu rasa ingin tahu yang antusias, eksperimen menyenangkan, serta aman dari rasa takut salah.
                </p>
              </div>
            </div>
          </div>

          {/* Flow M3 */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Alur Pengalaman Belajar M3
            </h3>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  M1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Memahami (Mindful)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Membangun kesadaran awal melalui tayangan autentik, fenomena kontekstual, dan pertanyaan pemantik yang menyentuh nurani dan rasa ingin tahu murid.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  M2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Mengaplikasikan (Meaningful & Joyful)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Murid melakukan observasi nyata di lingkungan sekitar sekolah/masyarakat, memecahkan masalah kontekstual, dan memproduksi karya kreatif (poster, video reels, komik, aksi sosial) secara kolaboratif.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  M3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Merefleksikan (Mindful & Meaningful)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Refleksi mendalam dengan 3 pertanyaan kunci: Apa yang membuat karya ini bermakna? Bagaimana cara berpikir berubah? Tindakan nyata apa yang akan diterapkan dalam kehidupan sehari-hari?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 8 DPL */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-600" />
              3. Delapan Dimensi Profil Lulusan (DPL BSKAP)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DPL_LIST.map((dpl) => (
                <div key={dpl.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <div className="font-bold text-slate-900">
                    {dpl.code}: {dpl.nama}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    {dpl.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
