import { RPPData, RPPInputFormState } from '../types/rpp';
import { PRESETS } from '../data/presets';

export interface GenerateRPPResponse {
  success: boolean;
  data: RPPData;
  source: 'gemini' | 'fallback' | 'preset';
  error?: string;
}

export async function generateRPP(input: RPPInputFormState): Promise<GenerateRPPResponse> {
  try {
    const res = await fetch('/api/generate-rpp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.warn('API call failed, generating locally using fallback template:', err?.message);
    
    // Check if input matches preset by topic or mapel
    const matchedPreset = PRESETS.find(
      (p) =>
        p.formInput.topik.toLowerCase() === input.topik.toLowerCase() ||
        p.formInput.mapel.toLowerCase() === input.mapel.toLowerCase()
    );

    const base = matchedPreset ? matchedPreset.rppData : PRESETS[0].rppData;

    const parsedPemantik = input.pertanyaanPemantik
      ? input.pertanyaanPemantik.split('\n').map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean)
      : base.pertanyaanPemantik;

    return {
      success: true,
      data: {
        ...base,
        identitas: {
          ...base.identitas,
          nama: input.namaGuru || base.identitas.nama,
          kelas: input.kelas || base.identitas.kelas,
          fase: input.fase || base.identitas.fase,
          semester: input.semester || base.identitas.semester,
          mapel: input.mapel || base.identitas.mapel,
          topik: input.topik || base.identitas.topik,
          alokasiWaktu: input.alokasiWaktu || base.identitas.alokasiWaktu,
          satuanPendidikan: input.satuanPendidikan || base.identitas.satuanPendidikan,
        },
        profilMurid: {
          minat: input.minat || base.profilMurid.minat,
          caraBelajar: input.caraBelajar || base.profilMurid.caraBelajar,
          lingkungan: input.lingkungan || base.profilMurid.lingkungan,
        },
        capaianPembelajaran: input.capaianPembelajaran || base.capaianPembelajaran,
        elemenCP: input.elemenCP || base.elemenCP,
        pemahamanBermakna: input.pemahamanBermakna || base.pemahamanBermakna,
        pertanyaanPemantik: parsedPemantik && parsedPemantik.length > 0 ? parsedPemantik : base.pertanyaanPemantik,
        diferensiasiPembelajaran: {
          konten: input.diferensiasiKonten || base.diferensiasiPembelajaran?.konten || 'Ragam bahan ajar bertingkat dan multimodal disesuaikan dengan modalitas visual, auditori, dan kinestetik murid.',
          proses: input.diferensiasiProses || base.diferensiasiPembelajaran?.proses || 'Scaffolding bertingkat: bimbingan intensif bagi murid yang baru memulai dan tantangan eksplorasi mandiri/tutor sebaya bagi yang cakap.',
          produk: input.diferensiasiProduk || base.diferensiasiPembelajaran?.produk || 'Pilihan produk unjuk kerja sesuai minat (infografis digital, video/podcast narasi, purwarupa fisik, atau artikel kampanye sosial).',
        },
        saranaPrasarana: input.saranaPrasarana || base.saranaPrasarana,
        lkpd: base.lkpd || {
          judul: `Eksplorasi Kontekstual & Investigasi Kasus: ${input.topik || base.identitas.topik}`,
          tujuanAktivitas: `Peserta didik mampu menganalisis konsep ${input.topik || base.identitas.topik}, menghubungkannya dengan fenomena kontekstual di lingkungan sekitar, dan menyusun solusi kolaboratif.`,
          petunjukKerja: [
            'Bentuk kelompok kolaboratif beranggotakan 4-5 peserta didik secara heterogen.',
            'Cermati stimulus kasus kontekstual dan data yang disediakan.',
            'Diskusikan dan jawab pertanyaan panduan penyelidikan menggunakan sumber belajar multi-modal.',
            'Rancang produk karya representatif (infografis, video/siniar pendek, esai, atau produk fisik).',
            'Presentasikan hasil investigasi di depan kelas dengan saling memberikan apresiasi bermakna.',
          ],
          studiKasusTantangan: `Bagaimana prinsip keilmuan ${input.topik || base.identitas.topik} dapat diaplikasikan untuk memecahkan persoalan nyata yang dihadapi masyarakat atau lingkungan tempat tinggal kita saat ini?`,
          pertanyaanPanduan: [
            `Data atau gejala apa yang menunjukkan keterkaitan fenomena ini dengan konsep ${input.topik || base.identitas.topik}?`,
            `Mengapa pemahaman mendalam tentang konsep ini menjadi kunci penyelesaian masalah?`,
            `Gagasan inovatif apa yang dapat ditawarkan kelompok Anda sebagai aksi nyata yang berdampak?`,
          ],
        },
        refleksiMurid: base.refleksiMurid || {
          model321: {
            tigaHalDipahami: `1) Konsep inti ${input.topik || base.identitas.topik}; 2) Hubungan fungsional materi dengan kehidupan sehari-hari; 3) Pentingnya kolaborasi dalam investigasi.`,
            duaHalDidalami: `1) Penerapan lanjutan pada studi kasus kompleks; 2) Pemanfaatan perangkat digital untuk eksplorasi lebih luas.`,
            satuAksiNyata: `Menerapkan wawasan tentang ${input.topik || base.identitas.topik} dalam perilaku sehari-hari dan menyebarkan gagasan solutif.`,
          },
          pertanyaanMetakognisi: [
            'Apa tantangan terbesar yang saya hadapi selama proses pembelajaran ini dan bagaimana saya mengatasinya?',
            'Bagaimana materi ini mengubah pemahaman saya tentang lingkungan sekitar?',
            'Apakah saya telah mendengarkan pendapat rekan kelompok secara berkesadaran (mindful)?',
          ],
        },
        refleksiGuru: base.refleksiGuru || {
          pertanyaanRefleksi: [
            'Apakah alur M3 (Memahami, Mengaplikasikan, Merefleksikan) terlaksana dengan suasana mindful, meaningful, dan joyful?',
            'Apakah diferensiasi konten, proses, dan produk efektif memfasilitasi kebutuhan murid yang beragam?',
            'Bagaimana efektivitas asesmen 3 dimensi dan rubrik 4 skala dalam memetakan capaian kompetensi murid?',
          ],
          tindakLanjut: `Menyediakan bahan scaffolding tambahan untuk kelompok yang masih memerlukan bimbingan, serta memberikan tantangan kontekstual lanjutan (pengayaan) bagi murid yang telah mencapai kriteria sangat berkembang pada topik ${input.topik || base.identitas.topik}.`,
        },
      },
      source: matchedPreset ? 'preset' : 'fallback',
    };
  }
}

export async function refineSection(params: {
  sectionName: string;
  currentContent: any;
  instruction: string;
}): Promise<string> {
  const res = await fetch('/api/refine-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal memproses perbaikan');
  }

  const data = await res.json();
  return data.revisedContent;
}

export interface RecommendCPParams {
  capaianPembelajaran: string;
  mapel?: string;
  kelas?: string;
  fase?: string;
  topik?: string;
  elemenCP?: string;
}

import { analyzeCpAndGenerateRecommendation } from './pedagogicalEngine';

export async function getRecommendationsFromCP(params: RecommendCPParams): Promise<{
  success: boolean;
  data: any;
  source: 'gemini' | 'heuristic';
}> {
  try {
    const res = await fetch('/api/recommend-from-cp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }

    const json = await res.json();
    return json;
  } catch (error: any) {
    console.warn('Network call to recommend-from-cp failed, generating client fallback using pedagogicalEngine:', error?.message);
    const result = analyzeCpAndGenerateRecommendation({
      capaianPembelajaran: params.capaianPembelajaran,
      mapel: params.mapel,
      kelas: params.kelas,
      fase: params.fase,
      topik: params.topik,
      elemenCP: params.elemenCP,
    });

    return {
      success: true,
      data: result,
      source: 'heuristic',
    };
  }
}


