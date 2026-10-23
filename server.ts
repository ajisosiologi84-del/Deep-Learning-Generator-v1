import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// Global Cloud Configuration Storage (Multi-Browser Persistence for Supabase & Webhooks)
const CONFIG_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'cloud_config.json');

interface ServerCloudConfig {
  supabase: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    tableName: string;
    enabled: boolean;
  };
  webhook: {
    webhookUrl: string;
    enabled: boolean;
    logOnLogin: boolean;
    logOnGenerateRpp: boolean;
    logOnExportDoc: boolean;
  };
}

const defaultServerConfig: ServerCloudConfig = {
  supabase: {
    supabaseUrl: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim(),
    supabaseAnonKey: (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim(),
    tableName: 'app_tokens',
    enabled: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
  },
  webhook: {
    webhookUrl: (process.env.VITE_GOOGLE_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_WEBHOOK_URL || '').trim(),
    enabled: Boolean(process.env.VITE_GOOGLE_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_WEBHOOK_URL),
    logOnLogin: true,
    logOnGenerateRpp: true,
    logOnExportDoc: true,
  },
};

let inMemoryCloudConfig: ServerCloudConfig = { ...defaultServerConfig };

function loadServerCloudConfig(): ServerCloudConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryCloudConfig = {
        supabase: { ...defaultServerConfig.supabase, ...(parsed.supabase || {}) },
        webhook: { ...defaultServerConfig.webhook, ...(parsed.webhook || {}) },
      };
      return inMemoryCloudConfig;
    }
  } catch (err) {
    console.warn('Could not read cloud_config.json, using defaults:', err);
  }
  return inMemoryCloudConfig;
}

function saveServerCloudConfig(updates: Partial<ServerCloudConfig>): ServerCloudConfig {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = loadServerCloudConfig();
    const merged: ServerCloudConfig = {
      supabase: { ...current.supabase, ...(updates.supabase || {}) },
      webhook: { ...current.webhook, ...(updates.webhook || {}) },
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    inMemoryCloudConfig = merged;
    return merged;
  } catch (err) {
    console.error('Failed to write cloud_config.json:', err);
    inMemoryCloudConfig = {
      supabase: { ...inMemoryCloudConfig.supabase, ...(updates.supabase || {}) },
      webhook: { ...inMemoryCloudConfig.webhook, ...(updates.webhook || {}) },
    };
    return inMemoryCloudConfig;
  }
}

// Initial load
loadServerCloudConfig();

// Cloud Config Endpoints: Allow any browser to inherit saved Supabase & Google Apps Script configuration
app.get('/api/cloud-config', (req, res) => {
  res.json(loadServerCloudConfig());
});

app.post('/api/cloud-config', (req, res) => {
  const updated = saveServerCloudConfig(req.body);
  res.json({ success: true, config: updated });
});

// Server-side Token Validation Proxy: Solves all browser CORS, mobile, and adblocker issues
app.post('/api/validate-token', async (req, res) => {
  const token = (req.body?.token || '').trim();
  if (!token) {
    return res.status(400).json({ valid: false, message: 'Kode token wajib diisi.' });
  }

  const config = loadServerCloudConfig();
  const rawUrl = (config.supabase?.supabaseUrl || process.env.VITE_SUPABASE_URL || 'https://ozprerxcoxyhfclnbioc.supabase.co').trim();
  const rawKey = (config.supabase?.supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cHJlcnhjb3h5aGZjbG5iaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mzc5MjIsImV4cCI6MjEwNzExMzkyMn0.Bye79O7mcfz6gjHGDAFcqUihGW03mpUxy4QkALrbl9s').trim();
  const tableName = config.supabase?.tableName || 'app_tokens';
  const cleanUrl = rawUrl.replace(/\/+$/, '');

  if (!cleanUrl || !rawKey) {
    return res.json({ valid: false, message: 'Supabase belum terkonfigurasi di server.' });
  }

  try {
    const endpoint = `${cleanUrl}/rest/v1/${tableName}?token=ilike.${encodeURIComponent(token)}&select=*`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': rawKey,
        'Authorization': `Bearer ${rawKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.json({
        valid: false,
        message: `Koneksi Supabase error (${response.status}): ${response.statusText}`,
      });
    }

    const rows: any = await response.json();
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.json({
        valid: false,
        message: 'Token tidak valid atau tidak terdaftar dalam sistem database.',
      });
    }

    const row = rows[0];
    const appToken = {
      id: row.id,
      token: row.token,
      label: row.label,
      schoolName: row.school_name || '',
      role: row.role || 'guru',
      maxUses: typeof row.max_uses === 'number' ? row.max_uses : -1,
      usedCount: typeof row.used_count === 'number' ? row.used_count : 0,
      expiresAt: row.expires_at || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at || new Date().toISOString(),
      notes: row.notes || '',
    };

    if (!appToken.isActive) {
      return res.json({
        valid: false,
        message: 'Token ini telah dinonaktifkan oleh Administrator.',
        tokenData: appToken,
      });
    }

    if (appToken.expiresAt && new Date() > new Date(appToken.expiresAt)) {
      return res.json({
        valid: false,
        message: `Masa berlaku token telah habis pada ${new Date(appToken.expiresAt).toLocaleDateString('id-ID')}.`,
        tokenData: appToken,
      });
    }

    if (appToken.maxUses > 0 && appToken.usedCount >= appToken.maxUses) {
      return res.json({
        valid: false,
        message: `Batas kuota penggunaan token (${appToken.maxUses}x) telah habis.`,
        tokenData: appToken,
      });
    }

    // Update usage asynchronously in background
    fetch(`${cleanUrl}/rest/v1/${tableName}?token=eq.${encodeURIComponent(row.token)}`, {
      method: 'PATCH',
      headers: {
        'apikey': rawKey,
        'Authorization': `Bearer ${rawKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ used_count: appToken.usedCount + 1 }),
    }).catch(console.warn);

    return res.json({
      valid: true,
      message: `Akses berhasil diverifikasi! Selamat datang, ${appToken.label}.`,
      tokenData: { ...appToken, usedCount: appToken.usedCount + 1 },
    });
  } catch (err: any) {
    return res.json({
      valid: false,
      message: `Gagal memverifikasi token ke Supabase Cloud: ${err?.message || 'Koneksi terputus'}`,
    });
  }
});

// Server-side Fetch All Cloud Tokens: Allows any browser to sync all 33 tokens immediately
app.get('/api/tokens/cloud', async (req, res) => {
  const config = loadServerCloudConfig();
  const rawUrl = (config.supabase?.supabaseUrl || process.env.VITE_SUPABASE_URL || 'https://ozprerxcoxyhfclnbioc.supabase.co').trim();
  const rawKey = (config.supabase?.supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cHJlcnhjb3h5aGZjbG5iaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mzc5MjIsImV4cCI6MjEwNzExMzkyMn0.Bye79O7mcfz6gjHGDAFcqUihGW03mpUxy4QkALrbl9s').trim();
  const tableName = config.supabase?.tableName || 'app_tokens';
  const cleanUrl = rawUrl.replace(/\/+$/, '');

  if (!cleanUrl || !rawKey) {
    return res.json({ success: false, tokens: [] });
  }

  try {
    const endpoint = `${cleanUrl}/rest/v1/${tableName}?select=*&order=created_at.desc`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': rawKey,
        'Authorization': `Bearer ${rawKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const rows = await response.json();
      return res.json({ success: true, tokens: rows });
    }
    return res.json({ success: false, tokens: [] });
  } catch (err) {
    return res.json({ success: false, tokens: [] });
  }
});

// Prompt generator based on official BSKAP Kurikulum Merdeka Deep Learning (M3)
const SYSTEM_INSTRUCTION = `Anda adalah AI Ahli Perancang Pembelajaran dan Kurikulum Merdeka BSKAP (Badan Standar, Kurikulum, dan Asesmen Pendidikan).
Tugas utama Anda adalah menyusun Rencana Pelaksanaan Pembelajaran (RPP) Pembelajaran Mendalam (Deep Learning) secara sistematis berdasarkan Capaian Pembelajaran (CP) terbaru BSKAP.
RPP PM yang Anda buat wajib mengedepankan suasana belajar yang berkesadaran (mindful), bermakna (meaningful), dan menggembirakan (joyful) melalui alur M3: Memahami, Mengaplikasi, dan Merefleksi.

8 Dimensi Profil Lulusan (DPL):
- DPL 1: Keimanan dan Ketakwaan terhadap Tuhan YME
- DPL 2: Kewargaan
- DPL 3: Penalaran Kritis
- DPL 4: Kreativitas
- DPL 5: Kolaborasi
- DPL 6: Kemandirian
- DPL 7: Kesehatan
- DPL 8: Komunikasi

RPP yang dihasilkan harus sangat terpersonalisasi, terhubung dengan profil, minat, gaya belajar, dan lingkungan tempat tinggal murid.

Output Anda HARUS berupa JSON valid tanpa teks pengantar atau penutup. JSON harus mengikuti format struktur yang ditentukan.`;

app.post('/api/generate-rpp', async (req, res) => {
  const {
    namaGuru = 'Guru Penggerak, S.Pd.',
    nipGuru = '-',
    kelas = 'XI',
    fase = 'Fase F',
    mapel = 'Bahasa Indonesia',
    topik = 'Karya Sastra Gurindam',
    minat = 'Musik, sosial media, game',
    caraBelajar = 'Visual, diskusi',
    lingkungan = 'Pesisir utara, nelayan, dan buruh',
    alokasiWaktu = '2 x 45 Menit (1 Pertemuan)',
    selectedDpl = [3, 4, 5],
    satuanPendidikan = 'SMA Negeri 1 Pesisir Bahari',
    namaDinas = 'PEMERINTAH PROVINSI / DINAS PENDIDIKAN',
    alamatSekolah = 'Jl. Pendidikan No. 1',
    kontakSekolah = 'Telp. (021) 123456 • info@sekolah.sch.id',
    tampilkanKop = true,
    namaKepalaSekolah = 'Kepala Sekolah, M.Pd.',
    nipKepalaSekolah = '19750101 200003 1 001',
    tempatPenetapan = 'Pesisir Bahari',
    tanggalPenetapan = '15 Juli 2024',
    capaianPembelajaran = '',
    elemenCP = '',
    pemahamanBermakna = '',
    pertanyaanPemantik = '',
    diferensiasiKonten = '',
    diferensiasiProses = '',
    diferensiasiProduk = '',
    saranaPrasarana = '',
  } = req.body;

  const prompt = `Susunlah RPP Pembelajaran Mendalam (Deep Learning) Kurikulum Merdeka BSKAP secara komprehensif berdasarkan data berikut:
- Nama Guru: ${namaGuru}
- Kelas / Jenjang: ${kelas}
- Fase: ${fase || 'Sesuai Jenjang'}
- Mata Pelajaran: ${mapel}
- Topik Materi: ${topik}
- Alokasi Waktu: ${alokasiWaktu}
- Elemen CP (jika ada): ${elemenCP || 'Tentukan elemen CP mata pelajaran yang relevan'}
- Capaian Pembelajaran (CP): ${capaianPembelajaran || 'Rumuskan CP BSKAP yang selaras dengan topik dan fase'}
- Pemahaman Bermakna: ${pemahamanBermakna || 'Rumuskan Big Idea / pemahaman esensial yang bermakna bagi murid'}
- Pertanyaan Pemantik HOTS: ${pertanyaanPemantik || 'Rumuskan 3 pertanyaan pemantik esensial tingkat tinggi'}
- Profil Murid:
  * Minat: ${minat}
  * Cara Belajar: ${caraBelajar}
  * Lingkungan Tempat Tinggal: ${lingkungan}
- Pilihan DPL yang diutamakan (pilih 2-4 yang paling esensial): nomor ${selectedDpl.join(', ')}
- Diferensiasi Pembelajaran:
  * Konten: ${diferensiasiKonten || 'Ragam materi berbasis profil murid'}
  * Proses: ${diferensiasiProses || 'Scaffolding dan pendampingan bertingkat'}
  * Produk: ${diferensiasiProduk || 'Pilihan unjuk karya kontekstual'}
- Sarana & Prasarana: ${saranaPrasarana || 'Media digital, alat peraga kontekstual, dan lingkungan sekitar'}

Pastikan alur M3 sangat kaya dan terintegrasi:
1. Memahami (Mindful): Aktivitas pemantik untuk membangun kesadaran dan koneksi awal dengan materi (mengaitkan dengan minat dan lingkungan).
2. Mengaplikasikan (Meaningful, Joyful): Aktivitas inti atau proyek berbasis masalah (PBL/PjBL) kontekstual dengan isu nyata di lingkungan murid, menyenangkan, interaktif.
3. Merefleksikan (Mindful, Meaningful): Pertanyaan refleksi mendalam mengenai kebermaknaan, dampak terhadap cara berpikir, dan penerapan di dunia nyata.

Wajib sertakan Lampiran Praktik Deep Learning:
- LKPD (Lembar Kerja Peserta Didik) Tematik & Tantangan Studi Kasus Nyata
- Lembar Refleksi Metakognitif Murid (Model 3-2-1: 3 Hal Dipahami, 2 Hal Didalami, 1 Aksi Nyata)
- Lembar Refleksi Evaluasi Guru & Rencana Tindak Lanjut

Berikan respon HANYA dalam format JSON valid dengan schema persis seperti ini:
{
  "identitas": {
    "nama": "${namaGuru}",
    "kelas": "${kelas}",
    "fase": "${fase}",
    "mapel": "${mapel}",
    "topik": "${topik}",
    "alokasiWaktu": "${alokasiWaktu}",
    "satuanPendidikan": "${satuanPendidikan}"
  },
  "capaianPembelajaran": "Rumusan Capaian Pembelajaran BSKAP yang komprehensif...",
  "elemenCP": "Nama elemen CP (misal: Menyimak / Membaca dan Memirsa / Pemahaman Konsep)...",
  "pemahamanBermakna": "Penjelasan Big Idea pemahaman esensial yang menetap seumur hidup...",
  "pertanyaanPemantik": [
    "Pertanyaan pemantik HOTS 1...",
    "Pertanyaan pemantik HOTS 2...",
    "Pertanyaan pemantik HOTS 3..."
  ],
  "diferensiasiPembelajaran": {
    "konten": "Strategi diferensiasi konten berdasarkan kesiapan dan modalitas belajar...",
    "proses": "Strategi diferensiasi proses bimbingan bertingkat (scaffolding)...",
    "produk": "Pilihan produk akhir sesuai minat dan profil kontekstual murid..."
  },
  "saranaPrasarana": "Daftar media, alat, teknologi, dan sumber belajar lingkungan...",
  "profilMurid": {
    "minat": "${minat}",
    "caraBelajar": "${caraBelajar}",
    "lingkungan": "${lingkungan}"
  },
  "dplTerpilih": [
    { "id": 3, "nama": "Penalaran Kritis", "alasan": "Alasan singkat relevansi" }
  ],
  "desainPembelajaran": {
    "tujuanPembelajaran": "Murid mampu...",
    "praktikPedagogis": "Menggunakan pembelajaran berbasis proyek...",
    "kemitraanPembelajaran": "Melibatkan pihak terkait (misal tokoh masyarakat/orang tua)...",
    "lingkunganPembelajaran": "Pengaturan kelas dan suasana belajar...",
    "pemanfaatanDigital": "Aplikasi atau media digital yang digunakan..."
  },
  "pengalamanBelajar": {
    "memahami": {
      "judul": "Memahami (Mindful)",
      "langkahLangkah": [
        "Guru menayangkan media...",
        "Guru memberikan pertanyaan pemantik...",
        "Murid melakukan diskusi kelompok...",
        "Setiap kelompok presentasi...",
        "Guru menyimpulkan..."
      ]
    },
    "mengaplikasikan": {
      "judul": "Mengaplikasikan (Meaningful, Joyful)",
      "langkahLangkah": [
        "Guru meminta murid observasi...",
        "Murid mengolah hasil observasi...",
        "Murid menciptakan produk kreatif kontekstual...",
        "Pameran karya atau unjuk karya menyenangkan..."
      ]
    },
    "merefleksikan": {
      "judul": "Merefleksikan (Mindful, Meaningful)",
      "pertanyaanRefleksi": [
        "Apa yang membuat karya kalian bermakna?",
        "Bagaimana proses ini memengaruhi cara kalian berpikir tentang isu sekitar?",
        "Apa yang dapat kalian terapkan di kehidupan nyata dari pembelajaran ini?"
      ],
      "aktivitasRefleksi": "Deskripsi aktivitas penutup refleksi..."
    }
  },
  "asesmen": {
    "awal": "Assessment of Learning / Diagnostik (Angket / Kuis Pemantik / Asesmen diagnostik non-kognitif & kognitif)",
    "proses": "Assessment as Learning (Self Assessment, Peer Assessment, Lembar Observasi)",
    "akhir": "Assessment for Learning (Produk kreatif / Proyek kontekstual / Portofolio)"
  },
  "rubrikPenilaian": [
    {
      "kriteria": "Nama Kriteria 1",
      "baruMemulai": "Deskripsi tingkat baru memulai",
      "berkembang": "Deskripsi tingkat berkembang",
      "cakap": "Deskripsi tingkat cakap",
      "sangatBerkembang": "Deskripsi tingkat sangat berkembang"
    }
  ],
  "lkpd": {
    "judul": "Judul LKPD Tematik...",
    "tujuanAktivitas": "Tujuan eksplorasi pada LKPD...",
    "petunjukKerja": [
      "Langkah petunjuk 1...",
      "Langkah petunjuk 2...",
      "Langkah petunjuk 3..."
    ],
    "studiKasusTantangan": "Uraian studi kasus kontekstual nyata di lingkungan sekitar...",
    "pertanyaanPanduan": [
      "Pertanyaan analisis kritis 1...",
      "Pertanyaan analisis kritis 2...",
      "Pertanyaan analisis kritis 3..."
    ]
  },
  "refleksiMurid": {
    "model321": {
      "tigaHalDipahami": "1. ... 2. ... 3. ...",
      "duaHalDidalami": "1. ... 2. ...",
      "satuAksiNyata": "1. ..."
    },
    "pertanyaanMetakognisi": [
      "Pertanyaan metakognisi 1...",
      "Pertanyaan metakognisi 2..."
    ]
  },
  "refleksiGuru": {
    "pertanyaanRefleksi": [
      "Pertanyaan evaluasi diri guru 1...",
      "Pertanyaan evaluasi diri guru 2..."
    ],
    "tindakLanjut": "Rencana tindak lanjut dan perbaikan siklus berikutnya..."
  }
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        parsed.kopSekolah = {
          tampilkanKop,
          namaDinas,
          namaSekolah: satuanPendidikan,
          alamatSekolah,
          kontakSekolah,
        };
        parsed.pengesahan = {
          tempatPenetapan,
          tanggalPenetapan,
          namaKepalaSekolah,
          nipKepalaSekolah,
          namaGuru,
          nipGuru,
        };
        return res.json({ success: true, data: parsed, source: 'gemini' });
      } catch (err) {
        // extract json block if wrapped in markdown
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          parsed.kopSekolah = {
            tampilkanKop,
            namaDinas,
            namaSekolah: satuanPendidikan,
            alamatSekolah,
            kontakSekolah,
          };
          parsed.pengesahan = {
            tempatPenetapan,
            tanggalPenetapan,
            namaKepalaSekolah,
            nipKepalaSekolah,
            namaGuru,
            nipGuru,
          };
          return res.json({ success: true, data: parsed, source: 'gemini' });
        }
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, using intelligent contextual generator fallback:', apiError?.message);
    }
  }

  // High quality contextual fallback generator matching BSKAP template
  const fallbackData = generateFallbackRPP({
    namaGuru,
    nipGuru,
    kelas,
    mapel,
    topik,
    minat,
    caraBelajar,
    lingkungan,
    alokasiWaktu,
    selectedDpl,
    satuanPendidikan,
    namaDinas,
    alamatSekolah,
    kontakSekolah,
    tampilkanKop,
    namaKepalaSekolah,
    nipKepalaSekolah,
    tempatPenetapan,
    tanggalPenetapan,
  });

  return res.json({ success: true, data: fallbackData, source: 'fallback' });
});

// Refine section endpoint
app.post('/api/refine-section', async (req, res) => {
  const { sectionName, currentContent, instruction } = req.body;

  if (!ai) {
    return res.status(400).json({
      error: 'Fitur penyempurnaan AI membutuhkan GEMINI_API_KEY aktif.',
    });
  }

  try {
    const prompt = `Anda adalah pakar Kurikulum Merdeka BSKAP untuk Pembelajaran Mendalam (Deep Learning).
Perbaiki atau kembangkan bagian "${sectionName}" berikut berdasarkan instruksi: "${instruction}".

Konten saat ini:
${typeof currentContent === 'object' ? JSON.stringify(currentContent, null, 2) : currentContent}

Kembalikan hasil revisi yang telah disesuaikan dan siap pakai, mempertahankan nuansa Mindful, Meaningful, dan Joyful serta konteks murid.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return res.json({ success: true, revisedContent: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Gagal memproses perbaikan.' });
  }
});

// Automatic AI Pedagogical Recommendations from Capaian Pembelajaran (CP) BSKAP
app.post('/api/recommend-from-cp', async (req, res) => {
  const {
    capaianPembelajaran = '',
    mapel = 'Bahasa Indonesia',
    kelas = 'Fase D',
    fase = '',
    topik = '',
    elemenCP = '',
  } = req.body || {};

  const cpCleaned = (capaianPembelajaran || '').trim();

  const prompt = `Anda adalah AI Ahli Kurikulum Merdeka BSKAP (Badan Standar, Kurikulum, dan Asesmen Pendidikan) dan Perancang Pembelajaran Mendalam (Deep Learning) berparadigma M3 (Memahami, Mengaplikasikan, Merefleksikan).

Tugas Anda:
Analisis secara komprehensif Rumusan Capaian Pembelajaran (CP) BSKAP berikut dan buatlah rekomendasi pilar pembelajaran mendalam yang terintegrasi, bermakna (meaningful), menggembirakan (joyful), dan berkesadaran (mindful).

Data Masukan:
- Rumusan Capaian Pembelajaran (CP): "${cpCleaned || 'Selaras dengan topik: ' + topik}"
- Mata Pelajaran: ${mapel || 'Sesuai konteks CP'}
- Kelas / Fase: ${kelas} ${fase ? '(' + fase + ')' : ''}
- Topik / Materi Utama: ${topik || 'Ekstrak topik paling esensial dari rumusan CP di atas'}
- Elemen CP saat ini: ${elemenCP || 'Tentukan elemen CP resmi'}

8 Dimensi Profil Lulusan (DPL):
- DPL 1: Keimanan dan Ketakwaan terhadap Tuhan YME
- DPL 2: Kewargaan
- DPL 3: Penalaran Kritis
- DPL 4: Kreativitas
- DPL 5: Kolaborasi
- DPL 6: Kemandirian
- DPL 7: Kesehatan
- DPL 8: Komunikasi

Berikan rekomendasi lengkap dan kembalikan HANYA format JSON valid tanpa kata pengantar atau penutup dengan skema persis:
{
  "topikSaran": "Topik pembelajaran spesifik dan menarik yang ditarik dari CP",
  "elemenCP": "Nama elemen CP resmi BSKAP (misal: Membaca dan Memirsa / Menyimak / Pemahaman Konsep)",
  "pemahamanBermakna": "Rumusan Big Idea / Enduring Understanding 1-2 kalimat filosofis dan esensial yang melekat seumur hidup bagi murid",
  "pertanyaanPemantik": [
    "Pertanyaan HOTS 1 (Tingkat analisis/evaluasi yang memantik kesadaran kontekstual)",
    "Pertanyaan HOTS 2 (Menghubungkan materi dengan dunia nyata atau lingkungan murid)",
    "Pertanyaan HOTS 3 (Tantangan kreasi atau solusi atas masalah di sekitar)"
  ],
  "diferensiasiKonten": "Variasi materi ajar multi-modal (teks visual/infografis, rekaman audio, artefak fisik/studi kasus) berbasis kesiapan murid",
  "diferensiasiProses": "Scaffolding bertingkat: strategi pendampingan intensif berjenjang bagi murid pemula, kolaborasi terarah untuk murid cakap, dan proyek mandiri bagi murid mahir",
  "diferensiasiProduk": "Pilihan unjuk karya kontekstual murid (misal: infografis digital, video/podcast pendek, unjuk purwarupa/model, atau esai reflektif)",
  "saranaPrasarana": "Daftar media digital (Canva, smartphone, LCD), alat peraga kontekstual, dan lingkungan sekitar",
  "profilMurid": {
    "minat": "Daftar minat murid yang relevan (misal: Media sosial, musik, sains populer, game edukasi, fotografi)",
    "caraBelajar": "Gaya belajar yang sesuai (misal: Visual kinestetik, diskusi kelompok kolaboratif, eksplorasi lapangan)",
    "lingkungan": "Karakteristik konteks lingkungan hidup murid yang kontekstual (misal: Pesisir, perdesaan agraris, kawasan sentra UMKM, atau perkotaan)"
  },
  "selectedDpl": [3, 4, 5],
  "alasanDpl": "Alasan singkat mengapa kombinasi DPL tersebut paling relevan dengan tuntutan CP ini"
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Anda adalah konsultan perancang Kurikulum Merdeka BSKAP Pembelajaran Mendalam.',
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        if (parsed.pemahamanBermakna && Array.isArray(parsed.pertanyaanPemantik)) {
          return res.json({
            success: true,
            data: {
              topikSaran: parsed.topikSaran || topik,
              elemenCP: parsed.elemenCP || elemenCP || 'Pemahaman Konsep & Keterampilan Proses',
              pemahamanBermakna: parsed.pemahamanBermakna,
              pertanyaanPemantik: parsed.pertanyaanPemantik,
              diferensiasiKonten: parsed.diferensiasiKonten || '',
              diferensiasiProses: parsed.diferensiasiProses || '',
              diferensiasiProduk: parsed.diferensiasiProduk || '',
              saranaPrasarana: parsed.saranaPrasarana || '',
              profilMurid: {
                minat: parsed.profilMurid?.minat || 'Media sosial, game edukatif, sains, seni visual',
                caraBelajar: parsed.profilMurid?.caraBelajar || 'Visual, diskusi kelompok terarah, eksplorasi langsung',
                lingkungan: parsed.profilMurid?.lingkungan || 'Lingkungan masyarakat lokal sekitar sekolah dan sentra kegiatan warga',
              },
              selectedDpl: Array.isArray(parsed.selectedDpl) && parsed.selectedDpl.length > 0 ? parsed.selectedDpl : [3, 4, 5],
              alasanDpl: parsed.alasanDpl || 'Menguatkan penalaran kritis, kreativitas pemecahan masalah, dan kolaborasi tim.',
            },
            source: 'gemini',
          });
        }
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return res.json({ success: true, data: parsed, source: 'gemini' });
        }
      }
    } catch (apiError: any) {
      console.warn('Gemini recommendation in server.ts failed, using fallback:', apiError?.message);
    }
  }

  // Heuristic rule-based fallback
  const textMatch = `${cpCleaned} ${mapel} ${topik}`.toLowerCase();
  const isLanguage = textMatch.includes('bahasa') || textMatch.includes('teks') || textMatch.includes('sastra') || textMatch.includes('puisi') || textMatch.includes('literasi') || textMatch.includes('cerita');
  const isMath = textMatch.includes('matematika') || textMatch.includes('hitung') || textMatch.includes('pecahan') || textMatch.includes('aljabar') || textMatch.includes('numerasi') || textMatch.includes('data');
  const isScience = textMatch.includes('ipa') || textMatch.includes('sains') || textMatch.includes('ekosistem') || textMatch.includes('energi') || textMatch.includes('alam');

  let elemen = 'Pemahaman Konsep & Penalaran Bermakna';
  if (isLanguage) elemen = 'Membaca dan Memirsa, Menulis Kreatif Multimodal';
  else if (isMath) elemen = 'Bilangan, Aljabar, Analisis Data dan Peluang';
  else if (isScience) elemen = 'Pemahaman Sains & Keterampilan Proses Inkuiri';

  const topicName = topik || (isLanguage ? 'Literasi & Komunikasi Kontekstual' : isMath ? 'Penalaran Matematis Sehari-hari' : isScience ? 'Penyelidikan Gejala Alam Terapan' : 'Interaksi Sosial & Karakter Bangsa');

  return res.json({
    success: true,
    data: {
      topikSaran: topicName,
      elemenCP: elemen,
      pemahamanBermakna: `Konsep dan keterampilan dalam ${topicName} bukan sekadar materi hafalan, melainkan cara bernalar esensial yang membimbing murid membuat keputusan bijak, memecahkan masalah autentik, dan memberikan kontribusi nyata bagi masyarakat.`,
      pertanyaanPemantik: [
        `Bagaimanakah keterkaitan langsung antara ${topicName} dengan peristiwa atau tantangan nyata yang kalian amati di lingkungan sekitar?`,
        `Mengapa pemahaman mendalam tentang materi ini menjadi bekal penting dalam kehidupan sehari-hari dan masa depan kalian?`,
        `Karya kreatif, inovasi, atau aksi nyata apa yang dapat tim Anda wujudkan untuk menyelesaikan persoalan terkait topik ini?`,
      ],
      diferensiasiKonten: `Menyediakan media multi-modal bertingkat: Murid visual diberikan infografis ringkas dan diagram alur; murid auditori menyimak siniar/penjelasan lisan bertahap; murid kinestetik mengkaji langsung objek kontekstual dan lembar studi kasus riil.`,
      diferensiasiProses: `Menerapkan scaffolding bertingkat: Murid pada tahap 'Baru Memulai' didampingi intensif dengan panduan langkah bertahap; murid 'Cakap' mengeksplorasi secara kolaboratif dalam kelompok heterogen; murid 'Mahir' diberi tantangan pengayaan terbuka dan berperan sebagai mentor sebaya.`,
      diferensiasiProduk: `Memberikan kebebasan unjuk karya sesuai minat dan profil murid: Pilihan membuat poster digital/infografis (Canva), video demonstrasi/ulasan singkat berdurasi 2 menit, presentasi purwarupa visual, atau laporan reflektif tematik.`,
      saranaPrasarana: `Papan pajang kelas, smartphone/laptop murid, proyektor LCD, aplikasi digital sederhana (Canva/CapCut/Google Slides), lembar kerja inkuiri, dan sumber belajar lingkungan sekitar sekolah.`,
      profilMurid: {
        minat: `Media sosial, musik dan audio visual, sains terapan, fotografi, kewirausahaan lokal, dan game edukasi.`,
        caraBelajar: `Visual spasial, diskusi kelompok kolaboratif, eksperimen langsung (hands-on), dan eksplorasi lingkungan nyata.`,
        lingkungan: `Kawasan masyarakat sosial yang dinamis, sentra aktivitas warga/UMKM, dan lingkungan alam sekitar satuan pendidikan.`,
      },
      selectedDpl: [3, 4, 5, 8],
      alasanDpl: `CP ini sangat memerlukan penguatan Penalaran Kritis (DPL 3) dalam membedah konsep, Kreativitas (DPL 4) dalam merancang produk karya, Kolaborasi (DPL 5) saat investigasi kelompok, dan Komunikasi (DPL 8) saat menyampaikan gagasan.`,
    },
    source: 'heuristic',
  });
});

// Helper for deterministic high-fidelity fallback generator matching BSKAP
function generateFallbackRPP(params: {
  namaGuru: string;
  nipGuru?: string;
  kelas: string;
  mapel: string;
  topik: string;
  minat: string;
  caraBelajar: string;
  lingkungan: string;
  alokasiWaktu: string;
  selectedDpl: number[];
  satuanPendidikan?: string;
  namaDinas?: string;
  alamatSekolah?: string;
  kontakSekolah?: string;
  tampilkanKop?: boolean;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  tempatPenetapan?: string;
  tanggalPenetapan?: string;
}) {
  const DPL_MAP: Record<number, { nama: string; defaultAlasan: string }> = {
    1: { nama: 'Keimanan dan Ketakwaan terhadap Tuhan YME', defaultAlasan: 'Menghubungkan rasa syukur atas ciptaan dan keteraturan alam/sosial.' },
    2: { nama: 'Kewargaan', defaultAlasan: 'Membangun kepedulian terhadap isu sosial dan kearifan lokal masyarakat.' },
    3: { nama: 'Penalaran Kritis', defaultAlasan: 'Menganalisis sebab-akibat, membedah teks/masalah kontekstual secara logis.' },
    4: { nama: 'Kreativitas', defaultAlasan: 'Menghasilkan inovasi karya yang ekspresif, kontekstual, dan memecahkan masalah.' },
    5: { nama: 'Kolaborasi', defaultAlasan: 'Bekerja sama dalam kelompok heterogen, saling mendengarkan dan berbagi peran.' },
    6: { nama: 'Kemandirian', defaultAlasan: 'Menumbuhkan tanggung jawab pribadi dalam eksplorasi dan pengambilan keputusan belajar.' },
    7: { nama: 'Kesehatan', defaultAlasan: 'Menjaga keseimbangan raga, emosi, dan kesehatan lingkungan hidup.' },
    8: { nama: 'Komunikasi', defaultAlasan: 'Menyampaikan gagasan secara artikulatif, empatik, dan persuasif di depan audiens.' },
  };

  const dplList = params.selectedDpl.map((id) => ({
    id,
    nama: DPL_MAP[id]?.nama || `DPL ${id}`,
    alasan: DPL_MAP[id]?.defaultAlasan || 'Mendukung kompetensi esensial materi.',
  }));

  return {
    identitas: {
      nama: params.namaGuru,
      kelas: params.kelas,
      mapel: params.mapel,
      topik: params.topik,
      alokasiWaktu: params.alokasiWaktu,
      satuanPendidikan: params.satuanPendidikan || 'SEKOLAH PENGGERAK',
    },
    kopSekolah: {
      tampilkanKop: params.tampilkanKop ?? true,
      namaDinas: params.namaDinas || 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      namaSekolah: params.satuanPendidikan || 'SEKOLAH PENGGERAK',
      alamatSekolah: params.alamatSekolah || 'Jl. Pendidikan Nasional No. 1',
      kontakSekolah: params.kontakSekolah || 'Telp: (021) 1234567 • Pos-el: info@sekolah.sch.id',
    },
    pengesahan: {
      tempatPenetapan: params.tempatPenetapan || 'Kota',
      tanggalPenetapan: params.tanggalPenetapan || '15 Juli 2024',
      namaKepalaSekolah: params.namaKepalaSekolah || 'Drs. H. Bambang Sudiro, M.Pd.',
      nipKepalaSekolah: params.nipKepalaSekolah || '19720412 199802 1 004',
      namaGuru: params.namaGuru,
      nipGuru: params.nipGuru || '19890615 201503 1 002',
    },
    profilMurid: {
      minat: params.minat,
      caraBelajar: params.caraBelajar,
      lingkungan: params.lingkungan,
    },
    dplTerpilih: dplList,
    desainPembelajaran: {
      tujuanPembelajaran: `Murid mampu memahami konsep mendalam tentang ${params.topik} dan mengaplikasikannya dalam konteks kehidupan sehari-hari serta isu nyata di lingkungan ${params.lingkungan}.`,
      praktikPedagogis: `Menggunakan pembelajaran berbasis proyek (PjBL) kontekstual dan berbasis masalah (PBL). Murid diajak membuat karya yang mengangkat nilai-nilai esensial materi ${params.topik} dan menghubungkannya dengan realitas kehidupan di lingkungan ${params.lingkungan}. Produk disesuaikan dengan minat murid (${params.minat}), seperti: poster visual/infografis digital, konten video pendek/reels, atau karya analogi kreatif.`,
      kemitraanPembelajaran: `Melibatkan orang tua, tokoh masyarakat, dan praktisi lokal di lingkungan ${params.lingkungan} sebagai narasumber cerita autentik maupun mitra apresiasi karya murid.`,
      lingkunganPembelajaran: `Kelas diatur fleksibel menjadi zona eksplorasi, kolaborasi, dan presentasi. Disediakan papan ide fisik/digital (Sticky Board) dan dinding refleksi bersama. Guru mengondisikan iklim belajar yang aman secara psikologis, ramah kekeliruan, dan suportif.`,
      pemanfaatanDigital: `Murid memanfaatkan aplikasi desain kreatif (misalnya Canva, CapCut) untuk mengemas karya, platform kurasi ide bersama (Padlet/Jamboard), serta media presentasi interaktif dan media sosial edukatif.`,
    },
    pengalamanBelajar: {
      memahami: {
        judul: 'Memahami (Mindful)',
        langkahLangkah: [
          `Guru menghadirkan momen berkesadaran (Mindful Moment) berupa tayangan video/audio/gambar pemantik kontekstual terkait "${params.topik}" yang beririsan dengan minat murid (${params.minat}) dan lingkungan mereka (${params.lingkungan}).`,
          `Guru mengajukan pertanyaan pemantik berkesadaran: "Apa hubungan pola fenomena dalam materi ini dengan pengalaman yang kalian lihat setiap hari di lingkungan kita? Mengapa hal ini penting bagi kita?"`,
          `Murid dalam kelompok kecil berdiskusi secara mindful mengamati contoh autentik, mengidentifikasi pola kunci, struktur, dan makna esensial materi.`,
          `Setiap kelompok berbagi temuan awal secara singkat, sementara kelompok lain menyimak dengan aktif dan saling memberikan apresiasi atau umpan balik positif.`,
          `Guru bersama murid menarik benang merah, mengonfirmasi pemahaman konsep inti secara komprehensif, dan meluruskan miskonsepsi.`
        ]
      },
      mengaplikasikan: {
        judul: 'Mengaplikasikan (Meaningful, Joyful)',
        langkahLangkah: [
          `Guru memandu murid melakukan observasi atau investigasi kontekstual mengenai permasalahan/isu nyata yang ada di lingkungan sekolah atau tempat tinggal (${params.lingkungan}).`,
          `Sebelum observasi, guru membimbing murid memahami rubrik dan instrumen observasi agar fokus pengamatan terarah dengan jelas.`,
          `Kelompok murid memetakan data hasil temuan, menyusun hubungan sebab-akibat, dan menyepakati ide solusi/kampanye kreatif bertema "${params.topik}".`,
          `Murid memproduksi karya bermakna yang menggembirakan sesuai minat dan gaya belajar (${params.caraBelajar}), seperti konten edukasi visual, modul mini, video reels/podcast, atau poster kampanye sosial.`,
          `Festival Belajar / Gelar Karya Kelas: Murid memamerkan karya dalam suasana yang meriah dan saling memberikan "bintang apresiasi" (Joyful Peer Review).`
        ]
      },
      merefleksikan: {
        judul: 'Merefleksikan (Mindful, Meaningful)',
        pertanyaanRefleksi: [
          `Apa yang membuat proses dan karya yang kalian hasilkan hari ini terasa bermakna bagi diri sendiri dan orang lain?`,
          `Bagaimana pemahaman baru tentang "${params.topik}" ini memengaruhi sudut pandang kalian terhadap lingkungan sekitar?`,
          `Tindakan nyata apa yang dapat segera kalian terapkan dalam kehidupan sehari-hari berdasarkan pembelajaran ini?`
        ],
        aktivitasRefleksi: `Murid menuliskan refleksi "Tiga Mutiara Pemikiran" pada lembar jurnal refleksi atau papan digital, lalu hening sejenak (mindful breathing) untuk menginternalisasi nilai-nilai kebaikan yang dipelajari.`
      }
    },
    asesmen: {
      awal: `Assessment of Learning (Awal): Angket minat & pemetaan awal (asesmen diagnostik non-kognitif serta kuis pemantik konsep dasar secara visual/interaktif).`,
      proses: `Assessment as Learning (Proses): Lembar Self-Assessment & Peer Assessment berkala menggunakan panduan umpan balik terstruktur (Rubrik Observasi Partisipasi).`,
      akhir: `Assessment for Learning (Akhir): Asesmen Produk Kreatif Kontekstual & Presentasi Kampanye Solusi yang mengaitkan nilai materi dengan lingkungan nyata murid.`
    },
    rubrikPenilaian: [
      {
        kriteria: `1. Pemahaman Konsep Dasar dan Esensi ${params.topik}`,
        baruMemulai: `Menyebutkan konsep dasar secara terbatas dan minim konteks; pemahaman atas ciri khas materi belum konsisten atau sekadar mengulang definisi literal.`,
        berkembang: `Menyebutkan beberapa prinsip esensial materi dengan penjelasan sederhana; mulai mengaitkan dengan contoh meski belum mendalam.`,
        cakap: `Menjelaskan dengan jelas struktur, esensi konsep, dan latar belakang kontekstual dengan penalaran logis serta relevansi nyata.`,
        sangatBerkembang: `Menguraikan secara komprehensif, kritis, dan inovatif; mampu menghubungkan konsep silang dengan wawasan terkini dan nilai kearifan lokal.`
      },
      {
        kriteria: `2. Analisis Kontekstual dan Penalaran Kritis`,
        baruMemulai: `Analisis masih bersifat permukaan; belum mampu mengaitkan materi dengan isu nyata di lingkungan sekitar.`,
        berkembang: `Menunjukkan upaya awal menghubungkan konsep dengan masalah di lingkungan; analisis masih deskriptif umum.`,
        cakap: `Menganalisis hubungan sebab-akibat secara logis berdasarkan bukti observasi autentik di lingkungan sekitar secara sistematis.`,
        sangatBerkembang: `Melakukan analisis mendalam berdaya nalar kritis tinggi; menghasilkan sudut pandang baru yang tajam dan solusi solutif.`
      },
      {
        kriteria: `3. Kolaborasi dan Dinamika Kelompok`,
        baruMemulai: `Partisipasi minimal dalam kelompok; belum menunjukkan inisiatif aktif bertukar gagasan secara konstruktif.`,
        berkembang: `Aktif menyimak dan menyampaikan pendapat sederhana; mulai berkolaborasi menjalankan tugas yang diberikan.`,
        cakap: `Berkolaborasi proaktif, menghargai perbedaan gagasan, dan efektif mengintegrasikan kontribusi seluruh anggota tim.`,
        sangatBerkembang: `Menunjukkan kepemimpinan empatik, menginspirasi dinamika diskusi bermakna, dan memfasilitasi kerja tim secara inklusif.`
      },
      {
        kriteria: `4. Kreativitas dan Kualitas Produk Nyata`,
        baruMemulai: `Karya masih meniru format umum tanpa sentuhan inovasi; pengaitan dengan minat dan isu lingkungan minim.`,
        berkembang: `Mulai memadukan minat murid ke dalam produk; visual atau pesan sudah cukup komunikatif meski standar.`,
        cakap: `Mengemas gagasan secara orisinal, menarik, dan selaras dengan gaya belajar murid serta media digital yang dipilih.`,
        sangatBerkembang: `Karya sangat orisinal, berdampak nyata, estetis, dan memiliki daya gugah tinggi bagi masyarakat sekolah dan lingkungan sekitar.`
      }
    ]
  };
}

// Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
