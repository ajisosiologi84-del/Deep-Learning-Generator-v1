import React, { useState } from 'react';
import { X, Sparkles, Wand2, Loader2, Check } from 'lucide-react';
import { refineSection } from '../services/rppService';

interface RefineSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  currentContent: any;
  onApplyRevised: (sectionName: string, revised: any) => void;
}

export const RefineSectionModal: React.FC<RefineSectionModalProps> = ({
  isOpen,
  onClose,
  sectionName,
  currentContent,
  onApplyRevised,
}) => {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [revisedText, setRevisedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await refineSection({
        sectionName,
        currentContent,
        instruction,
      });
      setRevisedText(result);
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses rekomendasi AI');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!revisedText) return;
    try {
      // try parse JSON if it is structured
      const parsed = JSON.parse(revisedText);
      onApplyRevised(sectionName, parsed);
    } catch {
      onApplyRevised(sectionName, revisedText);
    }
    onClose();
  };

  const QUICK_PROMPTS = [
    'Tingkatkan aspek mindful dan hening cipta pada pemantik',
    'Tambahkan pilihan produk kreatif yang lebih kekinian (Instagram Reels & Podcast)',
    'Kaitkan lebih kuat dengan isu lingkungan tempat tinggal murid',
    'Buat rubrik penilaian lebih detail dengan indikator operasional',
    'Tambahkan aktivitas ice-breaking bermakna di awal pembelajaran',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sempurnakan Bagian: {sectionName}
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan AI Gemini untuk memperkaya aktivitas atau rubrik
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Instruksi Penyesuaian Guru:
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Contoh: Tolong buatkan langkah investigasi lapangan yang lebih ramah bagi murid dengan gaya belajar kinestetik dan hubungkan dengan kearifan lokal..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Quick prompt chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Inspirasi Permintaan Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(p)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-left"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRefine}
              disabled={loading || !instruction.trim()}
              className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? 'Sedang Memproses...' : 'Proses dengan AI'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {revisedText && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Rekomendasi Revisi Hasil AI:
                </span>
              </div>
              <div className="text-xs text-slate-800 whitespace-pre-wrap font-sans max-h-60 overflow-y-auto p-3 bg-white rounded-xl border border-emerald-100">
                {revisedText}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisedText(null)}
                  className="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="text-xs px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Terapkan ke RPP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
