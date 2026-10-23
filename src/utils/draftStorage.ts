import { RPPData } from '../types/rpp';

export interface SavedRppDraft {
  id: string;
  namaDraft: string;
  tanggalDisimpan: string;
  topik: string;
  mapel: string;
  kelas: string;
  rpp: RPPData;
}

const STORAGE_KEY = 'rpp_deep_learning_saved_drafts_v1';

export function getSavedDrafts(): SavedRppDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Gagal membaca draft RPP tersimpan:', e);
    return [];
  }
}

export function saveRppDraft(namaDraft: string, rpp: RPPData): SavedRppDraft {
  const drafts = getSavedDrafts();
  const id = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newDraft: SavedRppDraft = {
    id,
    namaDraft: namaDraft.trim() || `${rpp.identitas.mapel} - ${rpp.identitas.topik}`,
    tanggalDisimpan: new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    topik: rpp.identitas.topik,
    mapel: rpp.identitas.mapel,
    kelas: rpp.identitas.kelas,
    rpp,
  };

  drafts.unshift(newDraft);
  // Keep max 30 drafts
  if (drafts.length > 30) drafts.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  return newDraft;
}

export function updateSavedDraft(id: string, namaDraft: string, rpp: RPPData): void {
  const drafts = getSavedDrafts();
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx !== -1) {
    drafts[idx] = {
      ...drafts[idx],
      namaDraft: namaDraft.trim() || drafts[idx].namaDraft,
      tanggalDisimpan: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      topik: rpp.identitas.topik,
      mapel: rpp.identitas.mapel,
      kelas: rpp.identitas.kelas,
      rpp,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }
}

export function deleteSavedDraft(id: string): void {
  const drafts = getSavedDrafts().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}
