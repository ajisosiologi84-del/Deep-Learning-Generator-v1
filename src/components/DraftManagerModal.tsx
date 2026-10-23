import React, { useState, useEffect } from 'react';
import { RPPData } from '../types/rpp';
import {
  SavedRppDraft,
  getSavedDrafts,
  saveRppDraft,
  deleteSavedDraft,
} from '../utils/draftStorage';
import {
  FolderOpen,
  Save,
  Trash2,
  Calendar,
  BookOpen,
  GraduationCap,
  X,
  CheckCircle2,
  FileCheck,
  Plus,
} from 'lucide-react';

interface DraftManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRpp: RPPData;
  onLoadDraft: (rpp: RPPData) => void;
}

export const DraftManagerModal: React.FC<DraftManagerModalProps> = ({
  isOpen,
  onClose,
  currentRpp,
  onLoadDraft,
}) => {
  const [drafts, setDrafts] = useState<SavedRppDraft[]>([]);
  const [draftNameInput, setDraftNameInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDrafts(getSavedDrafts());
      setDraftNameInput(`RPP Pertemuan: ${currentRpp.identitas.topik || 'Topik Baru'}`);
    }
  }, [isOpen, currentRpp]);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftNameInput.trim()) return;
    saveRppDraft(draftNameInput, currentRpp);
    setDrafts(getSavedDrafts());
    setNotification('Draft berhasil disimpan ke peramban!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus draft ini?')) {
      deleteSavedDraft(id);
      setDrafts(getSavedDrafts());
    }
  };

  const handleSelectDraft = (draft: SavedRppDraft) => {
    onLoadDraft(draft.rpp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Manajer Draft RPP (Penyimpanan Lokal)</h3>
              <p className="text-[11px] text-slate-300">
                Kelola multi-pertemuan RPP Anda di peramban tanpa khawatir hilang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Save Current RPP Form */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSaveCurrent} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Simpan Dokumen Aktif Saat Ini Sebagai Draft:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={draftNameInput}
                onChange={(e) => setDraftNameInput(e.target.value)}
                placeholder="Beri label draft (misal: RPP Pertemuan 1 - Gurindam)..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
              <button
                type="submit"
                className="text-xs px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Draft
              </button>
            </div>
          </form>
        </div>

        {/* Draft List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Daftar Draft Tersimpan ({drafts.length})</span>
            <span className="text-[10px] text-slate-400">Klik item untuk membuka ke kanvas</span>
          </div>

          {drafts.length === 0 ? (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Belum ada draft RPP tersimpan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gunakan formulir di atas untuk menyimpan RPP aktif Anda agar dapat dibuka kembali kapan saja.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleSelectDraft(draft)}
                  className="group p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                        {draft.namaDraft}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium shrink-0">
                        {draft.kelas}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-600" />
                        {draft.mapel}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">Topik: {draft.topik}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar className="w-2.5 h-2.5" />
                        {draft.tanggalDisimpan}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(draft.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus draft ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition hidden sm:inline">
                      Buka →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Data disimpan aman di LocalStorage peramban komputer Anda.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
