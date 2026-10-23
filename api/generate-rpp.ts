import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
  } = req.body || {};

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
- Pilihan DPL yang diutamakan (pilih 2-4 yang paling esensial): nomor ${Array.isArray(selectedDpl) ? selectedDpl.join(', ') : '3, 4, 5'}
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
  "elemenCP": "Nama elemen CP...",
  "pemahamanBermakna": "Penjelasan Big Idea pemahaman esensial yang menetap seumur hidup...",
  "pertanyaanPemantik": [
    "Pertanyaan pemantik HOTS 1...",
    "Pertanyaan pemantik HOTS 2...",
    "Pertanyaan pemantik HOTS 3..."
  ],
  "diferensiasiPembelajaran": {
    "konten": "Strategi diferensiasi konten...",
    "proses": "Strategi diferensiasi proses...",
    "produk": "Pilihan produk akhir..."
  },
  "saranaPrasarana": "Daftar media, alat, teknologi...",
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
    "kemitraanPembelajaran": "Melibatkan pihak terkait...",
    "lingkunganPembelajaran": "Pengaturan kelas dan suasana belajar...",
    "pemanfaatanDigital": "Aplikasi atau media digital yang digunakan..."
  },
  "pengalamanBelajar": {
    "memahami": {
      "judul": "Memahami (Mindful)",
      "langkahLangkah": ["Langkah 1", "Langkah 2"]
    },
    "mengaplikasikan": {
      "judul": "Mengaplikasikan (Meaningful, Joyful)",
      "langkahLangkah": ["Langkah 1", "Langkah 2"]
    },
    "merefleksikan": {
      "judul": "Merefleksikan (Mindful, Meaningful)",
      "pertanyaanRefleksi": ["Refleksi 1"],
      "aktivitasRefleksi": "Deskripsi aktivitas penutup refleksi..."
    }
  },
  "asesmen": {
    "awal": "Assessment of Learning / Diagnostik",
    "proses": "Assessment as Learning",
    "akhir": "Assessment for Learning"
  },
  "rubrikPenilaian": [
    {
      "kriteria": "Nama Kriteria",
      "baruMemulai": "Deskripsi",
      "berkembang": "Deskripsi",
      "cakap": "Deskripsi",
      "sangatBerkembang": "Deskripsi"
    }
  ],
  "lkpd": {
    "judul": "Judul LKPD...",
    "tujuanAktivitas": "Tujuan...",
    "petunjukKerja": ["Petunjuk 1"],
    "studiKasusTantangan": "Studi kasus...",
    "pertanyaanPanduan": ["Pertanyaan 1"]
  },
  "refleksiMurid": {
    "model321": {
      "tigaHalDipahami": "1. ...",
      "duaHalDidalami": "1. ...",
      "satuAksiNyata": "1. ..."
    },
    "pertanyaanMetakognisi": ["Metakognisi 1"]
  },
  "refleksiGuru": {
    "pertanyaanRefleksi": ["Refleksi guru 1"],
    "tindakLanjut": "Tindak lanjut..."
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
        return res.status(200).json({ success: true, data: parsed, source: 'gemini' });
      } catch {
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
          return res.status(200).json({ success: true, data: parsed, source: 'gemini' });
        }
      }
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back:', apiError?.message);
    }
  }

  // Fallback generator
  const fallbackData = buildFallbackRPP({
    namaGuru,
    nipGuru,
    kelas,
    mapel,
    topik,
    minat,
    caraBelajar,
    lingkungan,
    alokasiWaktu,
    selectedDpl: Array.isArray(selectedDpl) ? selectedDpl : [3, 4, 5],
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

  return res.status(200).json({ success: true, data: fallbackData, source: 'fallback' });
}

function buildFallbackRPP(params: any) {
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

  const dplList = (params.selectedDpl || [3, 4, 5]).map((id: number) => ({
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
      praktikPedagogis: `Menggunakan pembelajaran berbasis proyek (PjBL) kontekstual dan berbasis masalah (PBL). Murid diajak membuat karya bermakna yang mengangkat nilai-nilai esensial materi ${params.topik} dan menghubungkannya dengan realitas kehidupan di lingkungan ${params.lingkungan}. Produk disesuaikan dengan minat murid (${params.minat}).`,
      kemitraanPembelajaran: `Melibatkan orang tua, tokoh masyarakat, dan praktisi lokal di lingkungan ${params.lingkungan} sebagai narasumber cerita autentik maupun mitra apresiasi karya murid.`,
      lingkunganPembelajaran: `Kelas diatur fleksibel menjadi zona eksplorasi, kolaborasi, dan presentasi. Disediakan papan ide fisik/digital (Sticky Board) dan dinding refleksi bersama.`,
      pemanfaatanDigital: `Murid memanfaatkan aplikasi desain kreatif (Canva, CapCut) untuk mengemas karya, platform kurasi ide bersama, serta media presentasi interaktif.`,
    },
    pengalamanBelajar: {
      memahami: {
        judul: 'Memahami (Mindful)',
        langkahLangkah: [
          `Guru menghadirkan momen berkesadaran (Mindful Moment) berupa tayangan video/audio/gambar kontekstual terkait "${params.topik}" yang beririsan dengan minat murid (${params.minat}) dan lingkungan mereka (${params.lingkungan}).`,
          `Guru mengajukan pertanyaan pemantik berkesadaran: "Apa hubungan materi ini dengan apa yang kalian temui di lingkungan kita? Mengapa ini penting?"`,
          `Murid dalam kelompok kecil berdiskusi secara mindful mengamati contoh autentik, mengidentifikasi pola kunci, dan makna esensial materi.`,
          `Setiap kelompok berbagi temuan awal secara singkat, saling menyimak dan memberikan umpan balik positif.`,
          `Guru bersama murid menarik benang merah dan mengonfirmasi pemahaman konsep inti secara komprehensif.`
        ]
      },
      mengaplikasikan: {
        judul: 'Mengaplikasikan (Meaningful, Joyful)',
        langkahLangkah: [
          `Guru memandu murid melakukan observasi atau investigasi kontekstual terkait isu nyata di lingkungan sekitar (${params.lingkungan}).`,
          `Kelompok murid memetakan data hasil temuan dan menyusun ide produk/karya nyata bertema "${params.topik}".`,
          `Murid memproduksi karya bermakna yang menggembirakan sesuai gaya belajar (${params.caraBelajar}), seperti poster infografis, video kreatif, atau produk nyata lainnya.`,
          `Festival Belajar / Gelar Karya: Murid memamerkan hasil karya dan saling memberikan apresiasi positif (Joyful Peer Review).`
        ]
      },
      merefleksikan: {
        judul: 'Merefleksikan (Mindful, Meaningful)',
        pertanyaanRefleksi: [
          `Apa yang membuat proses dan karya hari ini terasa bermakna bagi diri kalian dan lingkungan?`,
          `Bagaimana proses ini mengubah cara pandang kalian terhadap topik ini?`,
          `Langkah konkret apa yang akan kalian lakukan selanjutnya?`
        ],
        aktivitasRefleksi: `Murid mengisi Lembar Refleksi Metakognitif (Model 3-2-1), disusul apresiasi penutup dan komitmen aksi nyata.`
      }
    },
    capaianPembelajaran: `Memahami dan menerapkan konsep esensial ${params.topik} dalam konteks kontekstual lingkungan sosial, budaya, dan kehidupan nyata secara bernalar kritis dan kreatif.`,
    elemenCP: `Pemahaman dan Penerapan Kontekstual ${params.mapel}`,
    pemahamanBermakna: `Konsep ${params.topik} bukan sekadar teori tekstual, melainkan instrumen berpikir kritis untuk memahami dinamika kehidupan dan memecahkan tantangan nyata di lingkungan ${params.lingkungan}.`,
    pertanyaanPemantik: [
      `Bagaimana konsep ${params.topik} dapat kita temukan dalam kehidupan sehari-hari di sekitar kita?`,
      `Mengapa pemahaman mendalam tentang materi ini penting bagi masa depan kita bersama?`,
      `Tantangan apa yang paling menarik untuk kita selesaikan melalui karya nyata hari ini?`
    ],
    diferensiasiPembelajaran: {
      konten: `Penyediaan beragam format sumber belajar: teks visual infografis, modul ringkas, studi kasus video/audio, dan contoh benda nyata berbasis lingkungan (${params.lingkungan}).`,
      proses: `Pendampingan bertingkat (scaffolding): kelompok mandiri melakukan eksplorasi mandiri, kelompok yang membutuhkan bimbingan didampingi secara intensif melalui bimbingan terbimbing.`,
      produk: `Murid diberi keleluasaan memilih bentuk karya akhir: poster visual/infografis digital, rekaman podcast/video pendek, infonotula rangkuman, atau demonstrasi langsung sesuai minat (${params.minat}).`
    },
    saranaPrasarana: `Gawai/smartphone, proyektor, lembar kerja kelompok, sticky notes warna-warni, akses internet/perpustakaan sekolah, dan lingkungan sekitar sekolah.`,
    asesmen: {
      awal: `Asesmen diagnostik awal: Kuis interaktif singkat & curah pendapat mengenai pemahaman awal tentang ${params.topik}.`,
      proses: `Asesmen formatif berkelanjutan: Lembar observasi diskusi kelompok, cek pemahaman bertahap, dan umpan balik teman sebaya.`,
      akhir: `Asesmen sumatif produk kontekstual: Portofolio unjuk karya kreatif berbasis rubrik kriteria ketercapaian tujuan pembelajaran.`
    },
    rubrikPenilaian: [
      {
        kriteria: `Kedalaman Pemahaman Konsep ${params.topik}`,
        baruMemulai: `Menyebutkan konsep dasar tanpa penjelasan hubungan sebab-akibat.`,
        berkembang: `Menjelaskan konsep dasar dengan contoh sederhana namun belum kontekstual.`,
        cakap: `Menganalisis konsep secara mendalam dan mengaitkannya dengan kondisi lingkungan sekitar.`,
        sangatBerkembang: `Menganalisis secara kritis, mengajukan gagasan orisinal, serta memberikan solusi inovatif berbasis materi.`
      },
      {
        kriteria: `Kreativitas & Kontekstualitas Produk Akhir`,
        baruMemulai: `Produk sekadar menyalin materi tanpa sentuhan personal atau kontekstual.`,
        berkembang: `Produk rapi dengan sentuhan variasi visual atau narasi sederhana.`,
        cakap: `Produk kontekstual, menarik, mengintegrasikan isu nyata lingkungan dengan pesan yang jelas.`,
        sangatBerkembang: `Karya sangat inovatif, menginspirasi audiens luas, dan memiliki daya guna nyata bagi masyarakat.`
      },
      {
        kriteria: `Kolaborasi & Komunikasi Tim`,
        baruMemulai: `Kurang terlibat aktif dalam dinamika pembagian tugas kelompok.`,
        berkembang: `Terlibat dalam tugas tertentu namun komunikasi belum merata.`,
        cakap: `Bekerja sama secara aktif, saling menghargai pendapat, dan berbagi tugas secara adil.`,
        sangatBerkembang: `Menunjukkan kepemimpinan empatik, memfasilitasi rekannya, dan mempresentasikan karya dengan artikulatif.`
      }
    ],
    lkpd: {
      judul: `LKPD Eksplorasi Mendalam: Investigasi Kontekstual ${params.topik}`,
      tujuanAktivitas: `Murid secara kolaboratif menganalisis fenomena nyata, memetakan solusi kreatif, dan menyusun karya berbasis konteks lingkungan ${params.lingkungan}.`,
      petunjukKerja: [
        `Bentuk kelompok kecil heterogen yang terdiri atas 4-5 murid.`,
        `Bacalah studi kasus kontekstual yang disajikan atau amati isu langsung di sekitar lingkungan.`,
        `Diskusikan pertanyaan pemantik analisis menggunakan lembar kerja bersama.`,
        `Rancanglah karya kreatif pemecahan masalah sesuai minat kelompok (poster/video/podcast/presentasi).`,
        `Siapkan diri untuk unjuk karya dan saling memberi umpan balik apresiatif.`
      ],
      studiKasusTantangan: `Di lingkungan sekitar kita (${params.lingkungan}), sering kali dijumpai fenomena nyata yang relevan dengan prinsip dasar ${params.topik}. Banyak orang belum menyadari pentingnya hal ini dalam kehidupan sehari-hari. Tugas tim kalian adalah menjadi 'Duta Edukasi Muda' yang mampu menerjemahkan konsep ini menjadi pesan kontekstual, menarik, dan mudah dipahami oleh masyarakat luas!`,
      pertanyaanPanduan: [
        `Apa keterkaitan paling nyata antara materi ${params.topik} dengan kehidupan masyarakat di lingkungan kita?`,
        `Apa hambatan atau masalah yang sering timbul jika masyarakat belum memahami prinsip ini?`,
        `Gagasan kreatif apa yang paling efektif kalian tawarkan untuk mengedukasi rekan sebaya dan masyarakat?`
      ]
    },
    refleksiMurid: {
      model321: {
        tigaHalDipahami: `1. Esensi utama materi ${params.topik}\n2. Pentingnya keterkaitan materi dengan kehidupan nyata di lingkungan sekitar\n3. Cara menganalisis masalah secara kritis dan kolaboratif`,
        duaHalDidalami: `1. Bagaimana menerapkan konsep ini dalam situasi yang lebih kompleks?\n2. Strategi apa yang paling ampuh untuk mengajak orang lain peduli?`,
        satuAksiNyata: `Berkomitmen menerapkan nilai positif dan pemahaman materi ini dalam interaksi sosial dan kegiatan sehari-hari.`
      },
      pertanyaanMetakognisi: [
        `Bagian mana dari pembelajaran hari ini yang paling menantang dan bagaimana saya berhasil mengatasinya?`,
        `Bagaimana proses belajar bersama kelompok ini mengubah cara saya memandang isu di sekitar?`
      ]
    },
    refleksiGuru: {
      pertanyaanRefleksi: [
        `Apakah seluruh murid merasa aman secara psikologis, termotivasi, dan gembira selama alur pembelajaran M3?`,
        `Bagian diferensiasi mana yang paling berhasil memfasilitasi kebutuhan keberagaman murid, dan bagian mana yang memerlukan penguatan?`,
        `Seberapa mendalam tingkat pemahaman bermakna yang berhasil dirumuskan oleh murid?`
      ],
      tindakLanjut: `Memberikan pendampingan tambahan bagi murid yang masih membutuhkan penguatan dasar, serta menyediakan ruang pameran karya digital bagi kelompok yang telah mencapai tingkat sangat berkembang.`
    }
  };
}
