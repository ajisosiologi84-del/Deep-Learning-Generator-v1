import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface RecommendFromCPRequest {
  capaianPembelajaran: string;
  mapel?: string;
  kelas?: string;
  fase?: string;
  topik?: string;
  elemenCP?: string;
}

export interface RecommendFromCPResponse {
  success: boolean;
  data: {
    topikSaran?: string;
    elemenCP: string;
    pemahamanBermakna: string;
    pertanyaanPemantik: string[];
    diferensiasiKonten: string;
    diferensiasiProses: string;
    diferensiasiProduk: string;
    saranaPrasarana: string;
    profilMurid: {
      minat: string;
      caraBelajar: string;
      lingkungan: string;
    };
    selectedDpl: number[];
    alasanDpl: string;
  };
  source: 'gemini' | 'heuristic';
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    capaianPembelajaran = '',
    mapel = 'Bahasa Indonesia',
    kelas = 'Fase D',
    fase = '',
    topik = '',
    elemenCP = '',
  }: RecommendFromCPRequest = req.body || {};

  const cpCleaned = (capaianPembelajaran || '').trim();

  if (!cpCleaned && !topik) {
    return res.status(400).json({
      error: 'Mohon masukkan teks Rumusan Capaian Pembelajaran (CP) BSKAP atau topik materi.',
    });
  }

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
          return res.status(200).json({
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
          return res.status(200).json({
            success: true,
            data: parsed,
            source: 'gemini',
          });
        }
      }
    } catch (apiError: any) {
      console.warn('Gemini recommendation failed, using pedagogical heuristic fallback:', apiError?.message);
    }
  }

  // Pedagogical Rule-Based Fallback Generator
  const fallbackRecommendation = generatePedagogicalRecommendationFallback({
    capaianPembelajaran: cpCleaned,
    mapel,
    kelas,
    fase,
    topik,
  });

  return res.status(200).json({
    success: true,
    data: fallbackRecommendation,
    source: 'heuristic',
  });
}

export function generatePedagogicalRecommendationFallback(params: {
  capaianPembelajaran: string;
  mapel: string;
  kelas: string;
  fase: string;
  topik: string;
}) {
  const { capaianPembelajaran, mapel, kelas, topik } = params;
  const text = `${capaianPembelajaran} ${mapel} ${topik}`.toLowerCase();

  // Detect subject domain
  const isLanguage = text.includes('bahasa') || text.includes('teks') || text.includes('sastra') || text.includes('puisi') || text.includes('literasi') || text.includes('cerita') || text.includes('menyimak') || text.includes('membaca');
  const isMath = text.includes('matematika') || text.includes('hitung') || text.includes('pecahan') || text.includes('aljabar') || text.includes('geometri') || text.includes('numerasi') || text.includes('data') || text.includes('angka');
  const isScience = text.includes('ipa') || text.includes('sains') || text.includes('ekosistem') || text.includes('energi') || text.includes('alam') || text.includes('tubuh') || text.includes('lingkungan') || text.includes('zat');
  const isSocial = text.includes('ips') || text.includes('sejarah') || text.includes('pancasila') || text.includes('ppkn') || text.includes('masyarakat') || text.includes('geografi') || text.includes('budaya') || text.includes('ekonomi');

  let elemen = 'Pemahaman Konsep & Penalaran Bermakna';
  if (isLanguage) elemen = 'Membaca dan Memirsa, Menulis Kreatif Multimodal';
  else if (isMath) elemen = 'Bilangan, Aljabar, Analisis Data dan Peluang';
  else if (isScience) elemen = 'Pemahaman Sains & Keterampilan Proses Inkuiri';
  else if (isSocial) elemen = 'Pemahaman Konsep Sosial & Keterampilan Inkuiri Sosial';

  const topicName = topik || (isLanguage ? 'Literasi & Komunikasi Kontekstual' : isMath ? 'Penalaran Matematis Sehari-hari' : isScience ? 'Penyelidikan Gejala Alam Terapan' : 'Interaksi Sosial & Karakter Bangsa');

  return {
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
  };
}
