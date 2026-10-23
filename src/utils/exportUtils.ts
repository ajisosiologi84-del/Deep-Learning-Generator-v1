import { RPPData } from '../types/rpp';
import { DPL_LIST } from '../data/dplData';
import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { DEFAULT_LOGO_SEKOLAH, DEFAULT_LOGO_PEMDA } from '../data/defaultLogos';

export function getLkpd(rpp: RPPData) {
  if (rpp.lkpd) return rpp.lkpd;
  return {
    judul: `Eksplorasi Kontekstual & Solusi Terapan: ${rpp.identitas.topik}`,
    tujuanAktivitas: `Peserta didik mampu menganalisis konsep ${rpp.identitas.topik}, mengidentifikasi isu kontekstual di lingkungan sekitar, dan menyusun karya solusi terapan secara kolaboratif.`,
    petunjukKerja: [
      'Bentuk kelompok kolaboratif beranggotakan 3-4 peserta didik.',
      `Cermati studi kasus dan materi kontekstual mengenai ${rpp.identitas.topik} yang disajikan oleh guru.`,
      'Diskusikan pertanyaan penyelidikan dan eksplorasi menggunakan multi-sumber belajar.',
      'Tuangkan rancangan gagasan dan kesimpulan analisis pada lembar kerja kelompok.',
    ],
    studiKasusTantangan: `Dalam kehidupan nyata di lingkungan sekitar kita, pemahaman komprehensif tentang ${rpp.identitas.topik} menjadi kunci untuk menyelesaikan masalah nyata. Bagaimanakah tim Anda merumuskan tindakan kreatif, etis, dan solutif yang berkesadaran serta bernilai manfaat nyata?`,
    pertanyaanPanduan: [
      `Fakta dan fenomena apa yang paling esensial mengenai ${rpp.identitas.topik} dalam konteks kehidupan sehari-hari?`,
      'Bagaimana konsep yang dipelajari dapat diterapkan untuk merumuskan pemecahan masalah atau karya inovatif?',
      'Aksi nyata apa yang paling aplikatif dan dapat segera dipraktikkan oleh tim Anda di lingkungan sekitar?',
    ],
  };
}

export function getRefleksiMurid(rpp: RPPData) {
  if (rpp.refleksiMurid) return rpp.refleksiMurid;
  return {
    model321: {
      tigaHalDipahami: `1) Hakikat mendalam tentang konsep ${rpp.identitas.topik}; 2) Relevansi materi dengan fenomena kehidupan nyata; 3) Peran kolaborasi bernalar kritis dalam menyelesaikan masalah.`,
      duaHalDidalami: `1) Strategi menyajikan karya ${rpp.identitas.topik} dengan dampak lebih luas; 2) Eksplorasi studi kasus nyata lanjutan yang belum terpecahkan.`,
      satuAksiNyata: `Menerapkan wawasan ${rpp.identitas.topik} dalam kebiasaan positif dan karya solutif di sekolah, rumah, atau masyarakat.`,
    },
    pertanyaanMetakognisi: [
      'Bagian mana dari pengalaman belajar hari ini yang paling memicu rasa ingin tahu saya?',
      'Tantangan apa yang sempat saya hadapi saat berproses, dan bagaimana saya mengatasinya?',
      'Bagaimana perasaan saya setelah berhasil menuntaskan aktivitas kolaboratif ini?',
    ],
  };
}

export function getRefleksiGuru(rpp: RPPData) {
  if (rpp.refleksiGuru) return rpp.refleksiGuru;
  return {
    pertanyaanRefleksi: [
      'Apakah seluruh peserta didik menunjukkan keterlibatan berkesadaran (mindful engagement) dalam alur M3?',
      'Seberapa efektif diferensiasi konten, proses, dan produk dalam memfasilitasi keragaman gaya belajar siswa?',
      'Apakah asesmen formatif yang dilakukan mampu memotret penguasaan kompetensi bernalar kritis secara objektif?',
    ],
    tindakLanjut: `Memberikan pendampingan tambahan (remedial scaffolding) untuk peserta didik yang masih berproses pada kriteria baru memulai, serta memperkaya tantangan kontekstual (pengayaan) bagi murid yang telah mencapai tingkat sangat berkembang pada topik ${rpp.identitas.topik}.`,
  };
}

export function rppToMarkdown(rpp: RPPData): string {
  const dplBoxes = DPL_LIST.map((dpl) => {
    const isChecked = rpp.dplTerpilih?.some((d) => d.id === dpl.id);
    return `[${isChecked ? 'x' : ' '}] ${dpl.code}: ${dpl.nama}`;
  }).join('\n');

  const langkahMemahami = rpp.pengalamanBelajar?.memahami?.langkahLangkah
    ?.map((step) => `- ${step}`)
    .join('\n') || '';

  const langkahMengaplikasikan = rpp.pengalamanBelajar?.mengaplikasikan?.langkahLangkah
    ?.map((step) => `- ${step}`)
    .join('\n') || '';

  const pertanyaanRefleksi = rpp.pengalamanBelajar?.merefleksikan?.pertanyaanRefleksi
    ?.map((q) => `- ${q}`)
    .join('\n') || '';

  const aktivitasRefleksi = rpp.pengalamanBelajar?.merefleksikan?.aktivitasRefleksi
    ? `\n*Aktivitas:* ${rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi}`
    : '';

  const rubrikRows = rpp.rubrikPenilaian?.map((row) => {
    return `| ${row.kriteria} | ${row.baruMemulai} | ${row.berkembang} | ${row.cakap} | ${row.sangatBerkembang} |`;
  }).join('\n') || '';

  const kopText = rpp.kopSekolah?.tampilkanKop
    ? `================================================================================
${rpp.kopSekolah.namaDinas || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
${rpp.kopSekolah.namaSekolah || rpp.identitas.satuanPendidikan || 'SATUAN PENDIDIKAN'}
${rpp.kopSekolah.alamatSekolah || ''}
${rpp.kopSekolah.kontakSekolah || ''}
================================================================================\n\n`
    : '';

  const pengesahanText = rpp.pengesahan
    ? `\n\n### PENGESAHAN
Mengetahui,
Kepala Sekolah: ${rpp.pengesahan.namaKepalaSekolah || '-'} (NIP: ${rpp.pengesahan.nipKepalaSekolah || '-'})

Ditetapkan di: ${rpp.pengesahan.tempatPenetapan || '-'}, ${rpp.pengesahan.tanggalPenetapan || '-'}
Guru Mata Pelajaran: ${rpp.pengesahan.namaGuru || rpp.identitas.nama || '-'} (NIP: ${rpp.pengesahan.nipGuru || '-'})`
    : '';

  const lkpd = getLkpd(rpp);
  const refleksiM = getRefleksiMurid(rpp);
  const refleksiG = getRefleksiGuru(rpp);

  const pemantikList = Array.isArray(rpp.pertanyaanPemantik) && rpp.pertanyaanPemantik.length > 0
    ? rpp.pertanyaanPemantik
    : typeof (rpp as any).pertanyaanPemantik === 'string' && (rpp as any).pertanyaanPemantik.trim()
      ? (rpp as any).pertanyaanPemantik.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [
          `Mengapa pemahaman tentang ${rpp.identitas.topik} sangat penting dalam menyikapi persoalan di lingkungan sekitar kita?`,
          `Bagaimana keterkaitan konsep materi ini dengan fenomena nyata yang dihadapi peserta didik dalam kehidupan sehari-hari?`,
          `Karya atau aksi nyata apa yang dapat tim Anda ciptakan untuk memberikan dampak positif berkelanjutan?`,
        ];

  const pemantikMd = pemantikList.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n');

  return `${kopText}# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) PEMBELAJARAN MENDALAM
## KURIKULUM MERDEKA - BSKAP (ALUR M3: MEMAHAMI, MENGAPLIKASI, MEREFLEKSI)

### IDENTITAS
- **Nama Guru:** ${rpp.identitas.nama || '-'}
- **NIP Guru:** ${rpp.pengesahan?.nipGuru || '-'}
- **Satuan Pendidikan:** ${rpp.identitas.satuanPendidikan || '-'}
- **Kelas / Fase:** ${rpp.identitas.kelas || '-'} ${rpp.identitas.fase ? `(${rpp.identitas.fase})` : ''}
- **Mata Pelajaran:** ${rpp.identitas.mapel || '-'}
- **Topik Materi:** ${rpp.identitas.topik || '-'}
- **Alokasi Waktu:** ${rpp.identitas.alokasiWaktu || '2 x 45 Menit'}

### PROFIL MURID
- **Minat:** ${rpp.profilMurid.minat || '-'}
- **Cara Belajar:** ${rpp.profilMurid.caraBelajar || '-'}
- **Lingkungan tempat tinggal:** ${rpp.profilMurid.lingkungan || '-'}

### IDENTIFIKASI DIMENSI PROFIL LULUSAN
${dplBoxes}

${rpp.dplTerpilih?.length ? `*Catatan DPL Terpilih:*\n` + rpp.dplTerpilih.map((d) => `- **DPL ${d.id} (${d.nama}):** ${d.alasan || 'Fokus penguatan kompetensi'}`).join('\n') : ''}

### CAPAIAN PEMBELAJARAN (CP) & PERTANYAAN PEMANTIK HOTS
- **Elemen CP:** ${rpp.elemenCP || 'Pemahaman Konsep & Keterampilan Proses Penyelidikan'}
- **Rumusan Capaian Pembelajaran (CP):**
  ${rpp.capaianPembelajaran || 'Peserta didik mampu menganalisis konsep, mengaplikasikan pengetahuan dalam pemecahan masalah kontekstual, dan menyajikan solusi solutif secara mandiri.'}
- **Pemahaman Bermakna (Big Idea):**
  ${rpp.pemahamanBermakna || 'Pengetahuan bukan sekadar hafalan teoritis, melainkan bekal bernalar kritis untuk menghasilkan tindakan nyata yang bermanfaat bagi diri sendiri, sesama, dan lingkungan hidup.'}
- **Pertanyaan Pemantik HOTS:**
${pemantikMd}

### DIFERENSIASI PEMBELAJARAN & SARANA PRASARANA
- **Diferensiasi Konten:** ${rpp.diferensiasiPembelajaran?.konten || `Bahan ajar multi-modal: infografis, materi bertingkat, audio-visual, dan artefak/kasus riil terkait ${rpp.identitas.topik}.`}
- **Diferensiasi Proses:** ${rpp.diferensiasiPembelajaran?.proses || 'Scaffolding berjenjang: pendampingan intensif bagi murid yang baru memulai, bimbingan berkala bagi murid cakap, dan tantangan mandiri bagi murid mahir.'}
- **Diferensiasi Produk:** ${rpp.diferensiasiPembelajaran?.produk || 'Pilihan unjuk karya sesuai minat: poster infografis, siniar/video pendek, esai reflektif, atau prototipe terapan.'}
- **Sarana & Prasarana:** ${rpp.saranaPrasarana || 'Media multi-modal, perangkat TIK, lembar kerja kontekstual, dan lingkungan sekolah.'}

### DESAIN PEMBELAJARAN
- **Tujuan Pembelajaran:**
  ${rpp.desainPembelajaran.tujuanPembelajaran}
- **Praktik Pedagogis:**
  ${rpp.desainPembelajaran.praktikPedagogis}
- **Kemitraan Pembelajaran:**
  ${rpp.desainPembelajaran.kemitraanPembelajaran}
- **Lingkungan Pembelajaran:**
  ${rpp.desainPembelajaran.lingkunganPembelajaran}
- **Pemanfaatan Digital:**
  ${rpp.desainPembelajaran.pemanfaatanDigital}

### PENGALAMAN BELAJAR (ALUR M3)
#### 1. Memahami (Mindful)
${langkahMemahami}

#### 2. Mengaplikasikan (Meaningful, Joyful)
${langkahMengaplikasikan}

#### 3. Merefleksikan (Mindful, Meaningful)
${pertanyaanRefleksi}${aktivitasRefleksi}

### ASESMEN
- **Assessment of Learning (Awal):**
  ${rpp.asesmen.awal}
- **Assessment as Learning (Proses):**
  ${rpp.asesmen.proses}
- **Assessment for Learning (Akhir):**
  ${rpp.asesmen.akhir}

### RUBRIK PENILAIAN (4 SKALA BSKAP)
| Kriteria | Baru Memulai | Berkembang | Cakap | Sangat Berkembang |
|---|---|---|---|---|
${rubrikRows}${pengesahanText}

---

### LAMPIRAN 1: LEMBAR KERJA PESERTA DIDIK (LKPD) PEMBELAJARAN MENDALAM
- **Aktivitas Belajar:** ${lkpd.judul}
- **Tujuan Pembelajaran:** ${lkpd.tujuanAktivitas}
- **Petunjuk Pengerjaan:**
${lkpd.petunjukKerja.map((p, i) => `${i + 1}. ${p}`).join('\n')}
- **Tantangan / Studi Kasus Kontekstual:**
  "${lkpd.studiKasusTantangan}"
- **Pertanyaan Panduan Penyelidikan:**
${lkpd.pertanyaanPanduan.map((q, i) => `${i + 1}. ${q}`).join('\n')}

---

### LAMPIRAN 2: LEMBAR REFLEKSI PEMBELAJARAN (MURID & GURU)
#### A. Refleksi Murid Model 3-2-1
- **3 Hal Baru yang Dipahami:** ${refleksiM.model321.tigaHalDipahami}
- **2 Hal yang Ingin Didalami:** ${refleksiM.model321.duaHalDidalami}
- **1 Aksi Nyata yang Akan Diterapkan:** ${refleksiM.model321.satuAksiNyata}

#### B. Pertanyaan Metakognisi Murid
${refleksiM.pertanyaanMetakognisi.map((q) => `- "${q}"`).join('\n')}

#### C. Refleksi & Tindak Lanjut Guru Pengampu
- **Fokus Evaluasi Guru:**
${refleksiG.pertanyaanRefleksi.map((q) => `- ${q}`).join('\n')}
- **Rencana Tindak Lanjut Modul Ajar:**
  ${refleksiG.tindakLanjut}
`;
}

export function exportToWord(rpp: RPPData) {
  const lkpd = getLkpd(rpp);
  const refleksiM = getRefleksiMurid(rpp);
  const refleksiG = getRefleksiGuru(rpp);

  const dplGridHtml = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 11pt;">
      <tr style="background-color: #f1f5f9;">
        <th colspan="4" style="text-align: left; padding: 8px;">DIMENSI PROFIL LULUSAN (DPL)</th>
      </tr>
      <tr>
        <td style="width: 25%;">${rpp.dplTerpilih?.some((d) => d.id === 1) ? '☑' : '☐'} <strong>DPL 1:</strong> Keimanan & Ketakwaan Tuhan YME</td>
        <td style="width: 25%;">${rpp.dplTerpilih?.some((d) => d.id === 3) ? '☑' : '☐'} <strong>DPL 3:</strong> Penalaran Kritis</td>
        <td style="width: 25%;">${rpp.dplTerpilih?.some((d) => d.id === 5) ? '☑' : '☐'} <strong>DPL 5:</strong> Kolaborasi</td>
        <td style="width: 25%;">${rpp.dplTerpilih?.some((d) => d.id === 7) ? '☑' : '☐'} <strong>DPL 7:</strong> Kesehatan</td>
      </tr>
      <tr>
        <td>${rpp.dplTerpilih?.some((d) => d.id === 2) ? '☑' : '☐'} <strong>DPL 2:</strong> Kewargaan</td>
        <td>${rpp.dplTerpilih?.some((d) => d.id === 4) ? '☑' : '☐'} <strong>DPL 4:</strong> Kreativitas</td>
        <td>${rpp.dplTerpilih?.some((d) => d.id === 6) ? '☑' : '☐'} <strong>DPL 6:</strong> Kemandirian</td>
        <td>${rpp.dplTerpilih?.some((d) => d.id === 8) ? '☑' : '☐'} <strong>DPL 8:</strong> Komunikasi</td>
      </tr>
    </table>
  `;

  const rubrikRowsHtml = rpp.rubrikPenilaian?.map((row) => `
    <tr>
      <td style="font-weight: bold; background-color: #f8fafc; vertical-align: top; width: 20%;">${row.kriteria}</td>
      <td style="vertical-align: top; width: 20%;">${row.baruMemulai}</td>
      <td style="vertical-align: top; width: 20%;">${row.berkembang}</td>
      <td style="vertical-align: top; width: 20%;">${row.cakap}</td>
      <td style="vertical-align: top; width: 20%;">${row.sangatBerkembang}</td>
    </tr>
  `).join('') || '';

  const logoKiriSrc = rpp.kopSekolah?.logoKiri || DEFAULT_LOGO_SEKOLAH;
  const logoKananSrc = rpp.kopSekolah?.logoKanan || DEFAULT_LOGO_PEMDA;

  const kopHtml = rpp.kopSekolah?.tampilkanKop ? `
    <table style="width: 100%; border-bottom: 4px double #000; padding-bottom: 8px; margin-bottom: 16px; border-collapse: collapse; border: none;">
      <tr>
        <td style="width: 15%; text-align: center; vertical-align: middle; border: none;">
          <img src="${logoKiriSrc}" width="65" height="65" alt="Logo Sekolah" style="object-fit: contain;" />
        </td>
        <td style="width: 70%; text-align: center; vertical-align: middle; border: none;">
          <p style="font-size: 11pt; font-weight: bold; margin: 0; text-transform: uppercase;">${rpp.kopSekolah.namaDinas || 'DINAS PENDIDIKAN'}</p>
          <p style="font-size: 14pt; font-weight: bold; margin: 2px 0; text-transform: uppercase;">${rpp.kopSekolah.namaSekolah || rpp.identitas.satuanPendidikan || 'SEKOLAH'}</p>
          <p style="font-size: 9pt; margin: 2px 0; color: #333;">${rpp.kopSekolah.alamatSekolah || ''}</p>
          <p style="font-size: 9pt; margin: 0; color: #333;">${rpp.kopSekolah.kontakSekolah || ''}</p>
        </td>
        <td style="width: 15%; text-align: center; vertical-align: middle; border: none;">
          <img src="${logoKananSrc}" width="65" height="65" alt="Logo Pemda" style="object-fit: contain;" />
        </td>
      </tr>
    </table>
  ` : '';

  const pengesahanHtml = `
    <table style="width: 100%; margin-top: 35px; border-collapse: collapse; border: none; font-size: 11pt;">
      <tr>
        <td style="width: 50%; vertical-align: top; border: none;">
          <p style="margin: 0;">Mengetahui,</p>
          <p style="margin: 2px 0 0 0; font-weight: bold;">Kepala Sekolah</p>
          <div style="height: 60px;"></div>
          <p style="margin: 0; font-weight: bold; text-decoration: underline;">${rpp.pengesahan?.namaKepalaSekolah || '___________________________'}</p>
          <p style="margin: 2px 0 0 0; color: #475569;">NIP. ${rpp.pengesahan?.nipKepalaSekolah || '-'}</p>
        </td>
        <td style="width: 50%; vertical-align: top; text-align: right; border: none;">
          <p style="margin: 0;">${rpp.pengesahan?.tempatPenetapan || 'Ditetapkan di Tempat'}, ${rpp.pengesahan?.tanggalPenetapan || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 2px 0 0 0; font-weight: bold;">Guru Mata Pelajaran</p>
          <div style="height: 60px;"></div>
          <p style="margin: 0; font-weight: bold; text-decoration: underline;">${rpp.pengesahan?.namaGuru || rpp.identitas.nama || '___________________________'}</p>
          <p style="margin: 2px 0 0 0; color: #475569;">NIP. ${rpp.pengesahan?.nipGuru || '-'}</p>
        </td>
      </tr>
    </table>
  `;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>RPP Pembelajaran Mendalam - ${rpp.identitas.topik}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #1e293b; }
        h1 { text-align: center; font-size: 15pt; margin-bottom: 2px; }
        h2 { text-align: center; font-size: 12pt; margin-top: 0; font-weight: normal; color: #334155; }
        table.main-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table.main-table td, table.main-table th { border: 1px solid #334155; padding: 8px; vertical-align: top; }
        .section-header { background-color: #e2e8f0; font-weight: bold; width: 24%; }
        ul, ol { margin: 4px 0 8px 20px; padding: 0; }
        li { margin-bottom: 4px; }
      </style>
    </head>
    <body>
      ${kopHtml}
      <h1>RENCANA PELAKSANAAN PEMBELAJARAN (RPP) PEMBELAJARAN MENDALAM</h1>
      <h2>Kurikulum Merdeka - Alur M3 (Memahami, Mengaplikasikan, Merefleksikan)</h2>
      
      <table class="main-table">
        <tr>
          <td class="section-header">Identitas</td>
          <td>
            <strong>Nama Guru:</strong> ${rpp.identitas.nama}<br>
            <strong>NIP Guru:</strong> ${rpp.pengesahan?.nipGuru || '-'}<br>
            <strong>Satuan Pendidikan:</strong> ${rpp.identitas.satuanPendidikan || '-'}<br>
            <strong>Kelas:</strong> ${rpp.identitas.kelas}<br>
            <strong>Mapel:</strong> ${rpp.identitas.mapel}<br>
            <strong>Topik:</strong> ${rpp.identitas.topik}<br>
            <strong>Alokasi Waktu:</strong> ${rpp.identitas.alokasiWaktu || '2 x 45 Menit'}
          </td>
        </tr>
        <tr>
          <td class="section-header">Profil Murid</td>
          <td>
            <strong>Minat:</strong> ${rpp.profilMurid.minat}<br>
            <strong>Cara Belajar:</strong> ${rpp.profilMurid.caraBelajar}<br>
            <strong>Lingkungan tempat tinggal:</strong> ${rpp.profilMurid.lingkungan}
          </td>
        </tr>
        <tr>
          <td class="section-header">Identifikasi</td>
          <td>
            ${dplGridHtml}
          </td>
        </tr>
        <tr>
          <td class="section-header">Capaian Pembelajaran (CP) & Pemantik HOTS</td>
          <td>
            <p><strong>Elemen Capaian Pembelajaran:</strong><br>${rpp.elemenCP || 'Pemahaman Konsep & Keterampilan Proses Penyelidikan'}</p>
            <p><strong>Rumusan Capaian Pembelajaran (CP):</strong><br>${rpp.capaianPembelajaran || 'Peserta didik menganalisis konsep dan mengaplikasikan pengetahuan secara kontekstual untuk memecahkan persoalan nyata secara mandiri.'}</p>
            <p><strong>Pemahaman Bermakna (Big Idea):</strong><br>${rpp.pemahamanBermakna || 'Pengetahuan bukan sekadar hafalan teoritis, melainkan bekal bernalar kritis untuk menghasilkan tindakan nyata yang bermanfaat bagi diri sendiri, sesama, dan lingkungan hidup.'}</p>
            <p><strong>Pertanyaan Pemantik HOTS:</strong></p>
            <ol>
              ${(Array.isArray(rpp.pertanyaanPemantik) && rpp.pertanyaanPemantik.length > 0
                ? rpp.pertanyaanPemantik
                : [
                    `Mengapa pemahaman tentang ${rpp.identitas.topik} sangat penting dalam menyikapi persoalan di lingkungan sekitar kita?`,
                    `Bagaimana keterkaitan konsep materi ini dengan fenomena nyata yang dihadapi peserta didik dalam kehidupan sehari-hari?`,
                    `Karya atau aksi nyata apa yang dapat tim Anda ciptakan untuk memberikan dampak positif berkelanjutan?`,
                  ]
              ).map((q) => `<li>${q}</li>`).join('')}
            </ol>
          </td>
        </tr>
        <tr>
          <td class="section-header">Diferensiasi Pembelajaran & Sarana</td>
          <td>
            <p><strong>1. Diferensiasi Konten:</strong><br>${rpp.diferensiasiPembelajaran?.konten || `Bahan ajar multi-modal: infografis ringkas, teks bacaan bertingkat, audio visual interaktif, dan pengamatan artefak/studi kasus riil terkait ${rpp.identitas.topik}.`}</p>
            <p><strong>2. Diferensiasi Proses:</strong><br>${rpp.diferensiasiPembelajaran?.proses || 'Scaffolding bertingkat: pendampingan intensif bagi murid yang baru memulai, bimbingan berkala bagi murid cakap, dan tantangan mandiri serta mentoring sebaya bagi murid mahir.'}</p>
            <p><strong>3. Diferensiasi Produk:</strong><br>${rpp.diferensiasiPembelajaran?.produk || 'Pilihan unjuk karya sesuai minat: poster infografis digital/manual, siniar (podcast)/video pendek, esai reflektif, atau peragaan purwarupa/simulasi.'}</p>
            <p><strong>Sarana & Prasarana:</strong><br>${rpp.saranaPrasarana || 'Media multi-modal, lembar kerja kontekstual, perangkat proyektor/TIK, serta lingkungan belajar autentik.'}</p>
          </td>
        </tr>
        <tr>
          <td class="section-header">Desain Pembelajaran</td>
          <td>
            <p><strong>Tujuan Pembelajaran:</strong><br>${rpp.desainPembelajaran.tujuanPembelajaran}</p>
            <p><strong>Praktik Pedagogis:</strong><br>${rpp.desainPembelajaran.praktikPedagogis}</p>
            <p><strong>Kemitraan Pembelajaran:</strong><br>${rpp.desainPembelajaran.kemitraanPembelajaran}</p>
            <p><strong>Lingkungan Pembelajaran:</strong><br>${rpp.desainPembelajaran.lingkunganPembelajaran}</p>
            <p><strong>Pemanfaatan Digital:</strong><br>${rpp.desainPembelajaran.pemanfaatanDigital}</p>
          </td>
        </tr>
        <tr>
          <td class="section-header">Pengalaman Belajar</td>
          <td>
            <p><strong>Memahami (Mindful)</strong></p>
            <ul>
              ${rpp.pengalamanBelajar.memahami.langkahLangkah.map((l) => `<li>${l}</li>`).join('')}
            </ul>
            <p><strong>Mengaplikasikan (Meaningful, Joyful)</strong></p>
            <ul>
              ${rpp.pengalamanBelajar.mengaplikasikan.langkahLangkah.map((l) => `<li>${l}</li>`).join('')}
            </ul>
            <p><strong>Merefleksikan (Mindful, Meaningful)</strong></p>
            <ul>
              ${rpp.pengalamanBelajar.merefleksikan.pertanyaanRefleksi.map((q) => `<li>${q}</li>`).join('')}
            </ul>
            ${rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi ? `<p><em>${rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi}</em></p>` : ''}
          </td>
        </tr>
        <tr>
          <td class="section-header">Asesmen</td>
          <td>
            <p><strong>Assessment of Learning (Awal):</strong><br>${rpp.asesmen.awal}</p>
            <p><strong>Assessment as Learning (Proses):</strong><br>${rpp.asesmen.proses}</p>
            <p><strong>Assessment for Learning (Akhir):</strong><br>${rpp.asesmen.akhir}</p>
          </td>
        </tr>
      </table>

      <h3 style="margin-top: 25px;">Rubrik Penilaian (4 Skala Standar BSKAP)</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 10pt;">
        <tr style="background-color: #e2e8f0; text-align: center;">
          <th style="width: 20%;">Kriteria</th>
          <th style="width: 20%;">Baru Memulai</th>
          <th style="width: 20%;">Berkembang</th>
          <th style="width: 20%;">Cakap</th>
          <th style="width: 20%;">Sangat Berkembang</th>
        </tr>
        ${rubrikRowsHtml}
      </table>

      ${pengesahanHtml}

      <br style="page-break-before: always;">
      <h2 style="text-align: center; margin-top: 30px;">LAMPIRAN 1: LEMBAR KERJA PESERTA DIDIK (LKPD) PEMBELAJARAN MENDALAM</h2>
      <p style="text-align: center; font-size: 11pt; color: #475569;">
        <strong>Topik:</strong> ${rpp.identitas.topik} | <strong>Kelas / Fase:</strong> ${rpp.identitas.kelas} ${rpp.identitas.fase ? `• ${rpp.identitas.fase}` : ''}
      </p>

      <table class="main-table">
        <tr>
          <td class="section-header">Identitas Kelompok</td>
          <td>
            <strong>Nama Anggota Kelompok:</strong><br>
            1. ..................................................... 2. .....................................................<br>
            3. ..................................................... 4. .....................................................<br>
            <strong>Mata Pelajaran:</strong> ${rpp.identitas.mapel} | <strong>Alokasi Waktu:</strong> ${rpp.identitas.alokasiWaktu || '2 x 45 Menit'}
          </td>
        </tr>
        <tr>
          <td class="section-header">Judul & Tujuan</td>
          <td>
            <p><strong>Aktivitas Belajar:</strong><br>${lkpd.judul}</p>
            <p><strong>Tujuan Pembelajaran:</strong><br>${lkpd.tujuanAktivitas}</p>
          </td>
        </tr>
        <tr>
          <td class="section-header">Petunjuk & Tantangan</td>
          <td>
            <p><strong>Petunjuk Pengerjaan:</strong></p>
            <ol>
              ${lkpd.petunjukKerja.map((step) => `<li>${step}</li>`).join('')}
            </ol>
            <p><strong>Tantangan / Studi Kasus Kontekstual:</strong></p>
            <p style="font-style: italic; background-color: #f8fafc; padding: 6px; border-left: 3px solid #0d9488;">
              "${lkpd.studiKasusTantangan}"
            </p>
          </td>
        </tr>
        <tr>
          <td class="section-header">Pertanyaan Panduan</td>
          <td>
            <ol>
              ${lkpd.pertanyaanPanduan.map((q) => `<li>${q}</li>`).join('')}
            </ol>
          </td>
        </tr>
        <tr>
          <td class="section-header">Ruang Hasil Kerja Kelompok</td>
          <td>
            <p style="color: #64748b; font-style: italic;">[Tuangkan kesimpulan analisis, gagasan solusi, atau skema karya kelompok di bawah ini]</p>
            <div style="height: 120px; border: 1px dashed #cbd5e1; margin-top: 5px;"></div>
            <p style="margin-top: 10px; font-weight: bold;">Catatan & Nilai Guru: ........................................ (Skor: .......... / Paraf: ..........)</p>
          </td>
        </tr>
      </table>

      <br style="page-break-before: always;">
      <h2 style="text-align: center; margin-top: 30px;">LAMPIRAN 2: LEMBAR REFLEKSI PEMBELAJARAN (MURID & GURU)</h2>
      <p style="text-align: center; font-size: 11pt; color: #475569;">
        <strong>Model Refleksi 3-2-1, Pertanyaan Metakognisi, dan Evaluasi Diri Guru Pengampu</strong>
      </p>

      <table class="main-table">
        <tr>
          <td class="section-header">Refleksi Murid (Model 3-2-1)</td>
          <td>
            <p><strong>3 Hal Baru yang Dipahami Secara Mendalam:</strong><br>${refleksiM.model321.tigaHalDipahami}</p>
            <p><strong>2 Hal yang Menantang & Ingin Didalami:</strong><br>${refleksiM.model321.duaHalDidalami}</p>
            <p><strong>1 Aksi Nyata yang Akan Dipraktikkan:</strong><br>${refleksiM.model321.satuAksiNyata}</p>
          </td>
        </tr>
        <tr>
          <td class="section-header">Metakognisi Murid</td>
          <td>
            <ul>
              ${refleksiM.pertanyaanMetakognisi.map((q) => `<li><em>"${q}"</em></li>`).join('')}
            </ul>
          </td>
        </tr>
        <tr>
          <td class="section-header">Refleksi & Tindak Lanjut Guru</td>
          <td>
            <p><strong>Fokus Evaluasi Guru:</strong></p>
            <ul>
              ${refleksiG.pertanyaanRefleksi.map((q) => `<li>${q}</li>`).join('')}
            </ul>
            <p><strong>Rencana Tindak Lanjut Modul Ajar:</strong><br>${refleksiG.tindakLanjut}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(rpp: RPPData) {
  const md = rppToMarkdown(rpp);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates the complete prompt formatted for Google Chat Gemini (gemini.google.com)
 * including the structured user input, school/teacher identity, and mandatory output template.
 * Specially optimized to generate both Word (.doc / .docx) and Excel (.xlsx / Sheets) outputs.
 */
export function generateGeminiPrompt(
  rpp: RPPData,
  formatMode: 'standard' | 'doc' | 'pdf' | 'excel' | 'python' = 'standard'
): string {
  const kopText = rpp.kopSekolah?.tampilkanKop
    ? `Kop Sekolah: ${rpp.kopSekolah.namaSekolah || rpp.identitas.satuanPendidikan} (${rpp.kopSekolah.namaDinas || 'Dinas Pendidikan'})
Alamat: ${rpp.kopSekolah.alamatSekolah || '-'}
Kontak: ${rpp.kopSekolah.kontakSekolah || '-'}`
    : `Satuan Pendidikan: ${rpp.identitas.satuanPendidikan || '-'}`;

  const dplListText = rpp.dplTerpilih && rpp.dplTerpilih.length > 0
    ? rpp.dplTerpilih.map((d) => `- DPL ${d.id} (${d.nama}): ${d.alasan || 'Penguatan dimensi karakter & kompetensi peserta didik'}`).join('\n')
    : `- DPL 3 (Penalaran Kritis): Menganalisis konsep dan memecahkan masalah kontekstual
- DPL 4 (Kreativitas): Menghasilkan gagasan dan karya inovatif
- DPL 5 (Kolaborasi): Bekerja sama secara inklusif dan gotong royong`;

  const rubrikExisting = rpp.rubrikPenilaian && rpp.rubrikPenilaian.length > 0
    ? rpp.rubrikPenilaian.map((r) => `* ${r.kriteria}:
  - Baru Memulai: ${r.baruMemulai}
  - Berkembang: ${r.berkembang}
  - Cakap: ${r.cakap}
  - Sangat Berkembang: ${r.sangatBerkembang}`).join('\n')
    : 'Belum diisi spesifik (AI wajib merumuskan 3-4 kriteria operasional).';

  const baseHeader = `Anda adalah Konsultan Senior Kurikulum Merdeka & Pakar Desain Instruksional Pembelajaran Mendalam (Deep Learning) BSKAP Kemendikbudristek RI. Tugas utama Anda adalah menyusun Rencana Pelaksanaan Pembelajaran (RPP) Pembelajaran Mendalam yang komprehensif, berbasis data murid, dan siap diaplikasikan langsung di ruang kelas.

Pedoman Filosofis & Pedagogis Deep Learning:
1. Berkesadaran (Mindful): Mengaktifkan kesadaran penuh, pemusatan perhatian, rasa ingin tahu alami, dan metakognisi peserta didik.
2. Bermakna (Meaningful): Mengaitkan materi pembelajaran dengan realitas kehidupan nyata, budaya, dan lingkungan tempat tinggal murid sehingga ilmu yang dipelajari memiliki relevansi fungsional.
3. Menggembirakan (Joyful): Menghadirkan suasana kelas yang inklusif, merangsang daya kreasi, kolaboratif, serta bebas dari rasa takut salah (antusiasme belajar tinggi).
4. Sintaks Alur M3: Memahami (Mindful) -> Mengaplikasikan (Meaningful & Joyful) -> Merefleksikan (Mindful & Meaningful).
5. Pembelajaran Berdiferensiasi: Mengakomodasi diferensiasi konten, proses, dan produk berdasarkan minat, profil cara belajar, dan lingkungan murid.

[DATA INPUT PEMBELAJARAN DARI GURU]
- ${kopText}
- Guru Pengampu: ${rpp.identitas.nama || '-'} (NIP: ${rpp.pengesahan?.nipGuru || '-'})
- Mata Pelajaran: ${rpp.identitas.mapel || '-'}
- Kelas / Fase: ${rpp.identitas.kelas || '-'}
- Topik / Materi: ${rpp.identitas.topik || '-'}
- Alokasi Waktu: ${rpp.identitas.alokasiWaktu || '2 x 45 Menit (1 Pertemuan)'}
- Profil Minat Murid: ${rpp.profilMurid.minat || '-'}
- Profil Cara Belajar: ${rpp.profilMurid.caraBelajar || '-'}
- Lingkungan Tempat Tinggal: ${rpp.profilMurid.lingkungan || '-'}
- Dimensi Profil Lulusan (DPL) Terpilih:
${dplListText}
- Desain Awal Pembelajaran:
  * Tujuan Pembelajaran: ${rpp.desainPembelajaran.tujuanPembelajaran || '-'}
  * Praktik Pedagogis: ${rpp.desainPembelajaran.praktikPedagogis || '-'}
  * Kemitraan Belajar: ${rpp.desainPembelajaran.kemitraanPembelajaran || '-'}
  * Lingkungan Belajar: ${rpp.desainPembelajaran.lingkunganPembelajaran || '-'}
  * Pemanfaatan Digital: ${rpp.desainPembelajaran.pemanfaatanDigital || '-'}
- Pengesahan:
  * Kepala Sekolah: ${rpp.pengesahan?.namaKepalaSekolah || '-'} (NIP: ${rpp.pengesahan?.nipKepalaSekolah || '-'})
  * Tempat & Tanggal Penetapan: ${rpp.pengesahan?.tempatPenetapan || '-'}, ${rpp.pengesahan?.tanggalPenetapan || '-'}

[INSTRUKSI ELABORASI MENDALAM (DEEP EXPANSION)]
Kembangkan rancangan pembelajaran di atas secara detail dan profesional:
1. Rumuskan Tujuan Pembelajaran operasional berbasis konsep HOTS (C4-C6) yang selaras dengan Profil Murid.
2. Rinci Diferensiasi Pembelajaran: Diferensiasi Konten, Diferensiasi Proses (scaffolding terarah), dan Diferensiasi Produk.
3. Rancang Skenario Alur M3 secara menit-demi-menit:
   - Memahami (Mindful): Aktivitas pembuka, mindful breathing/focusing, pertanyaan pemantik pemantik pemikiran kritis, eksplorasi konsep.
   - Mengaplikasikan (Meaningful & Joyful): Aktivitas kolaboratif/proyek otentik berbasis lingkungan lokal murid, pemecahan masalah nyata.
   - Merefleksikan (Mindful & Meaningful): Pertanyaan metakognitif (apa yang dipelajari, perasaan, relevansi hidup), lembar refleksi, komitmen aksi tindak lanjut.
4. Rancang Asesmen 3 Dimensi: Assessment of Learning (awal/diagnostik), Assessment as Learning (proses/refleksi diri & teman), dan Assessment for Learning (akhir/sumatif).`;

  // 1. MASTER PROMPT (STANDARD) - PRODUCES BOTH DOC AND EXCEL OUTPUTS PROFICIENTLY
  if (formatMode === 'standard') {
    return `${baseHeader}

[TARGET KELUARAN WAJIB: MENGHASILKAN FILE DOC DAN EXCEL]
Susun jawaban Anda dalam DUA BAGIAN UTAMA YANG LENGKAP DAN TERPISAH, sehingga saya dapat langsung:
1. Memanfaatkan tombol bawaan Gemini "Ekspor ke Google Dokumen" atau menyalinnya langsung ke Microsoft Word (.docx) dengan tata letak dokumen kedinasan rapi.
2. Memanfaatkan tombol bawaan Gemini "Ekspor ke Google Spreadsheet" atau menyalin tabelnya langsung ke Microsoft Excel (.xlsx) dengan formula/rumus perhitungan otomatis aktif.

================================================================================
BAGIAN 1: STRUKTUR DOKUMEN RPP LENGKAP (SIAP EKSPOR KE WORD / DOCX / GOOGLE DOCS)
================================================================================
Tampilkan format dokumen kedinasan standar BSKAP Kurikulum Merdeka yang siap salin ke Microsoft Word / Google Docs:

# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) PEMBELAJARAN MENDALAM
## KURIKULUM MERDEKA - BSKAP KEMENDIKBUDRISTEK (ALUR M3)

### KOP SURAT KEDINASAN RESMI
${rpp.kopSekolah?.namaDinas || 'PEMERINTAH PROVINSI / DINAS PENDIDIKAN DAN KEBUDAYAAN'}
${rpp.kopSekolah?.namaSekolah || rpp.identitas.satuanPendidikan || 'NAMA SATUAN PENDIDIKAN'}
${rpp.kopSekolah?.alamatSekolah || 'Alamat Sekolah Lengkap'} | Kontak: ${rpp.kopSekolah?.kontakSekolah || '-'}
────────────────────────────────────────────────────────────────────────────────

### I. IDENTITAS PEMBELAJARAN & PROFIL PESERTA DIDIK
Buat tabel rapi 2 kolom:
| Komponen | Deskripsi Rinci |
|---|---|
| Satuan Pendidikan | ${rpp.kopSekolah?.namaSekolah || rpp.identitas.satuanPendidikan || '-'} |
| Guru Mata Pelajaran | ${rpp.identitas.nama || '-'} (NIP: ${rpp.pengesahan?.nipGuru || '-'}) |
| Kelas / Fase | ${rpp.identitas.kelas || '-'} |
| Mata Pelajaran | ${rpp.identitas.mapel || '-'} |
| Alokasi Waktu | ${rpp.identitas.alokasiWaktu || '2 x 45 Menit'} |
| Topik & Tema Materi | ${rpp.identitas.topik || '-'} |
| Profil Minat Murid | (Uraikan integrasi minat murid dalam topik ini) |
| Profil Cara Belajar | (Uraikan akomodasi gaya belajar visual/auditori/kinestetik) |
| Lingkungan Tempat Tinggal | (Uraikan koneksi materi dengan konteks lokal murid) |

### II. DIMENSI PROFIL LULUSAN (8 DPL BSKAP)
Tampilkan matriks checklist 8 DPL dengan tanda [x] pada dimensi terpilih, sertakan indikator perilaku teramati (observable behavior) untuk tiap DPL terpilih:
- [ ] DPL 1: Keimanan & Ketakwaan Terhadap Tuhan YME
- [ ] DPL 2: Kewargaan & Kebangsaan
- [ ] DPL 3: Penalaran Kritis
- [ ] DPL 4: Kreativitas
- [ ] DPL 5: Kolaborasi & Gotong Royong
- [ ] DPL 6: Kemandirian
- [ ] DPL 7: Kesehatan & Kebugaran
- [ ] DPL 8: Komunikasi Efektif
*(Beri tanda [x] dan elaborasikan indikator konkret pada DPL yang dipilih guru).*

### III. DESAIN PEMBELAJARAN & LINGKUNGAN BELAJAR
Buat tabel berisi:
1. Tujuan Pembelajaran (Spesifik, Terukur, Relevan, Berdiferensiasi)
2. Praktik Pedagogis (Model/Pendekatan kontekstual, misal: PBL / PjBL / Inkuiri Bermakna)
3. Kemitraan Pembelajaran (Peran orang tua / pakar / lingkungan sekitar)
4. Lingkungan Pembelajaran (Pemanfaatan ruang fisik, luar kelas, kenyamanan psikologis)
5. Pemanfaatan Teknologi Digital (Aplikasi, simulasi, media interaktif pendukung)

### IV. SKENARIO PENGALAMAN BELAJAR ALUR M3 (MINDFUL, MEANINGFUL, JOYFUL)
Sajikan dalam tabel skenario terperinci 4 kolom:
| Tahapan Alur M3 | Aktivitas Guru & Murid | Prinsip Deep Learning | Alokasi Waktu |
1. MEMAHAMI (Mindful):
   - Aktivitas Pemantik & Mindful Focusing
   - Pertanyaan Pemantik HOTS kontekstual
   - Eksplorasi Konsep & Apersepsi Bermakna
2. MENGAPLIKASIKAN (Meaningful & Joyful):
   - Kerja Kelompok Kolaboratif Berdiferensiasi
   - Studi Kasus Nyata / Proyek Pemecahan Masalah
   - Pemanfaatan Sumber Belajar Lokal yang Menggembirakan
3. MEREFLEKSIKAN (Mindful & Meaningful):
   - Metakognisi & Pertanyaan Reflektif Mendalam
   - Berbagi Wawasan & Komitmen Aksi Nyata Murid
   - Rangkuman & Penguatan Konsep

### V. ASESMEN PEMBELAJARAN 3 DIMENSI
Tabel berisi:
1. Asesmen Diagnostik Awal (Assessment of Learning): Bentuk tes diagnostik / kuis pemantik kesiapan.
2. Asesmen Formatif Proses (Assessment as Learning & for Learning): Lembar observasi, ceklis keterlibatan, umpan balik konstruktif teman sebaya.
3. Asesmen Sumatif Akhir (Assessment for Learning): Bentuk karya/produk unjuk kerja kontekstual.

### VI. LEMBAR PENGESAHAN KEDINASAN RESMI
Tampilkan lembar tanda tangan resmi lengkap:
Mengetahui,
Kepala Sekolah: ${rpp.pengesahan?.namaKepalaSekolah || '....................................'} (NIP: ${rpp.pengesahan?.nipKepalaSekolah || '....................................'})
Guru Mata Pelajaran: ${rpp.pengesahan?.namaGuru || rpp.identitas.nama || '....................................'} (NIP: ${rpp.pengesahan?.nipGuru || '....................................'})
Ditetapkan di: ${rpp.pengesahan?.tempatPenetapan || '...................'}, pada tanggal: ${rpp.pengesahan?.tanggalPenetapan || '...................'}

================================================================================
BAGIAN 2: FORMAT SPREADSHEET EVALUASI & REKAP NILAI (SIAP EKSPOR KE EXCEL / XLSX)
================================================================================
Tampilkan tabel-tabel tabular murni (Markdown Table) yang diformat presisi agar dapat langsung di-copy paste ke Microsoft Excel atau diekspor ke Google Sheets:

### TABEL 1: MATRIKS RUBRIK PENILAIAN 4 SKALA BSKAP (STANDAR EVALUASI)
Buat tabel rubrik 5 kolom dengan kriteria penilaian operasional:
| Kriteria Penilaian | Baru Memulai (Skor 1) | Berkembang (Skor 2) | Cakap (Skor 3) | Sangat Berkembang (Skor 4) |
|---|---|---|---|---|
(Rinci 3-5 kriteria penilaian unjuk kerja / pemahaman dengan deskriptor performa konkret di setiap level skor 1 sampai 4).

### TABEL 2: FORMAT DAFTAR REKAPITULASI NILAI MURID LENGKAP DENGAN RUMUS EXCEL
Tampilkan tabel buku nilai murid siap pakai di Microsoft Excel yang menyertakan 5 baris contoh nama murid dan RUMUS EXCEL AKTIF:
| No | NISN | Nama Peserta Didik | Kriteria 1 (1-4) | Kriteria 2 (1-4) | Kriteria 3 (1-4) | Kriteria 4 (1-4) | Rata-rata Skor | Nilai Konversi (0-100) | Predikat Capaian | Catatan Tindak Lanjut / Diferensiasi |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0012345671 | Ahmad Fauzi | 4 | 3 | 4 | 3 | =AVERAGE(D3:G3) | =ROUND(H3*25,1) | =IF(I3>=88,"Sangat Berkembang",IF(I3>=75,"Cakap",IF(I3>=60,"Berkembang","Baru Memulai"))) | Pengayaan: Eksplorasi mandiri studi kasus lanjutan |
| 2 | 0012345672 | Siti Aisyah | 3 | 3 | 3 | 4 | =AVERAGE(D4:G4) | =ROUND(H4*25,1) | =IF(I4>=88,"Sangat Berkembang",IF(I4>=75,"Cakap",IF(I4>=60,"Berkembang","Baru Memulai"))) | Penguatan konsep pada presentasi |
| 3 | 0012345673 | Budi Santoso | 2 | 3 | 2 | 3 | =AVERAGE(D5:G5) | =ROUND(H5*25,1) | =IF(I5>=88,"Sangat Berkembang",IF(I5>=75,"Cakap",IF(I5>=60,"Berkembang","Baru Memulai"))) | Pendampingan tutor sebaya pada kriteria 1 |
| 4 | 0012345674 | Dewi Lestari | 4 | 4 | 4 | 4 | =AVERAGE(D6:G6) | =ROUND(H6*25,1) | =IF(I6>=88,"Sangat Berkembang",IF(I6>=75,"Cakap",IF(I6>=60,"Berkembang","Baru Memulai"))) | Diberikan peran ketua kelompok kolaborasi |
| 5 | 0012345675 | Rizky Pratama | 2 | 2 | 3 | 2 | =AVERAGE(D7:G7) | =ROUND(H7*25,1) | =IF(I7>=88,"Sangat Berkembang",IF(I7>=75,"Cakap",IF(I7>=60,"Berkembang","Baru Memulai"))) | Bimbingan personal guru & remedial terarah |

### TABEL 3: RANGKUMAN STATISTIK KELAS (FORMULA EXCEL)
| Parameter Statistik | Formula Excel | Keterangan |
|---|---|---|
| Nilai Tertinggi Kelas | =MAX(I3:I7) | Nilai maksimum siswa |
| Nilai Terendah Kelas | =MIN(I3:I7) | Nilai minimum siswa |
| Rata-rata Kelas | =AVERAGE(I3:I7) | Rata-rata pencapaian kelas |
| Jumlah Murid Cakap/Sangat Berkembang | =COUNTIF(I3:I7, ">=75") | Memenuhi kriteria ketercapaian tujuan |

================================================================================
BAGIAN 3 (OPSIONAL): SKRIP PYTHON CODE GENERATOR (.DOCX & .XLSX OTOMATIS)
================================================================================
Jika Anda memiliki kapabilitas Python Code Interpreter di Gemini (Advanced Data Analysis), buatkan dan jalankan skrip python ringkas menggunakan library \`python-docx\` dan \`openpyxl\` untuk langsung men-generate dan menyediakan link unduhan berkas nyata:
- \`RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.docx\`
- \`Rekap_Nilai_dan_Rubrik_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.xlsx\`
agar saya dapat mengunduhnya langsung dalam 1 klik!`;
  }

  // 2. DEDICATED WORD / DOC PROMPT
  if (formatMode === 'doc') {
    return `${baseHeader}

[TARGET KELUARAN KHUSUS: DOKUMEN MICROSOFT WORD (.DOC / .DOCX / GOOGLE DOCS)]
Tuliskan dokumen RPP resmi siap salin ke Microsoft Word (.docx) atau Google Docs dengan format halaman dokumen kedinasan:
1. KOP SURAT KEDINASAN RESMI:
   ${rpp.kopSekolah?.namaDinas || 'PEMERINTAH PROVINSI / DINAS PENDIDIKAN'}
   ${rpp.kopSekolah?.namaSekolah || rpp.identitas.satuanPendidikan || 'NAMA SATUAN PENDIDIKAN'}
   ${rpp.kopSekolah?.alamatSekolah || ''} • Kontak: ${rpp.kopSekolah?.kontakSekolah || ''}
   (Gunakan garis ganda pembatas kop dokumen resmi)
2. TABEL 1: IDENTITAS LENGKAP & PROFIL MURID (Nama, NIP Guru, Mapel, Kelas/Fase, Topik, Waktu, Minat, Cara Belajar, Lingkungan).
3. TABEL 2: 8 DIMENSI PROFIL LULUSAN (Centang [x] pada dimensi terpilih & berikan deskripsi indikator perilaku teramati).
4. TABEL 3: DESAIN PEMBELAJARAN (Tujuan, Praktik Pedagogis, Kemitraan, Lingkungan Fisik/Sosial, Pemanfaatan Digital).
5. TABEL 4: SKENARIO ALUR M3 (Memahami - Mindful, Mengaplikasikan - Meaningful & Joyful, Merefleksikan - Mindful & Meaningful) lengkap alokasi menit.
6. TABEL 5: ASESMEN 3 DIMENSI & MATRIKS RUBRIK 4 SKALA BSKAP.
7. LEMBAR PENGESAHAN DOKUMEN RESMI:
   Mengetahui Kepala Sekolah (${rpp.pengesahan?.namaKepalaSekolah || '-'}, NIP: ${rpp.pengesahan?.nipKepalaSekolah || '-'})
   dan Guru Mata Pelajaran (${rpp.pengesahan?.namaGuru || rpp.identitas.nama || '-'}, NIP: ${rpp.pengesahan?.nipGuru || '-'}) tertanggal di ${rpp.pengesahan?.tempatPenetapan || '-'}, ${rpp.pengesahan?.tanggalPenetapan || '-'}.

Gunakan format tabel Markdown rapi dan tanpa kalimat pembuka obrolan bertele-tele agar hasil siap langsung di-copy atau diekspor melalui tombol "Ekspor ke Google Dokumen" di Gemini.`;
  }

  // 3. DEDICATED SPREADSHEET / EXCEL PROMPT
  if (formatMode === 'excel') {
    return `${baseHeader}

[TARGET KELUARAN KHUSUS: BUKU KERJA SPREADSHEET EXCEL (.XLSX / GOOGLE SHEETS)]
Keluarkan seluruh hasil dalam bentuk TABEL-TABEL MARKDOWN TABULAR MURNI yang dapat langsung disalin ke lembar kerja Excel atau diekspor melalui tombol bawaan Gemini "Ekspor ke Google Spreadsheet":

1. TABEL 1: METADATA & IDENTITAS PEMBELAJARAN
   - Kolom A: Komponen (Sekolah, Guru, NIP, Mapel, Kelas/Fase, Topik, Alokasi Waktu)
   - Kolom B: Rincian Data

2. TABEL 2: DESAIN ALUR M3 & ALOKASI WAKTU
   - Kolom A: Tahapan M3 (Memahami / Mengaplikasikan / Merefleksikan)
   - Kolom B: Aktivitas Guru & Murid
   - Kolom C: Prinsip Deep Learning (Mindful / Meaningful / Joyful)
   - Kolom D: Alokasi Waktu (Menit)

3. TABEL 3: MATRIKS RUBRIK PENILAIAN 4 SKALA BSKAP (STANDAR EVALUASI)
   | Kriteria Penilaian | Baru Memulai (Skor 1) | Berkembang (Skor 2) | Cakap (Skor 3) | Sangat Berkembang (Skor 4) |
   (Rinci 4 kriteria spesifik sesuai topik ${rpp.identitas.topik} lengkap deskriptor perilaku konkret).

4. TABEL 4: FORMAT BUKU NILAI & REKAPITULASI CAPAIAN MURID DENGAN FORMULA EXCEL LENGKAP
   Kolom-kolom:
   | No | NISN | Nama Siswa | Kriteria 1 (1-4) | Kriteria 2 (1-4) | Kriteria 3 (1-4) | Kriteria 4 (1-4) | Rata-rata Skor | Nilai Konversi (0-100) | Predikat Capaian | Catatan Tindak Lanjut |
   Sertakan 5 baris simulasi data siswa dengan rumus Excel:
   - Kolom H (Rata-rata): \`=AVERAGE(D3:G3)\`
   - Kolom I (Konversi): \`=ROUND(H3*25, 1)\`
   - Kolom J (Predikat): \`=IF(I3>=88,"Sangat Berkembang",IF(I3>=75,"Cakap",IF(I3>=60,"Berkembang","Baru Memulai")))\`

5. TABEL 5: RINGKASAN REKAPITULASI STATISTIK KELAS
   | Indikator | Formula Excel | Keterangan |
   | Nilai Tertinggi | \`=MAX(I3:I7)\` | Skor tertinggi kelas |
   | Nilai Terendah | \`=MIN(I3:I7)\` | Skor terendah kelas |
   | Rata-rata Kelas | \`=AVERAGE(I3:I7)\` | Capaian rata-rata |
   | Jumlah Tuntas (Cakap & Sangat Berkembang) | \`=COUNTIF(I3:I7, ">=75")\` | Murid tuntas kompetensi |

Sajikan tanpa narasi pembuka/penutup agar tabel-tabel dapat langsung diblok dan ditempelkan ke file Excel (.xlsx).`;
  }

  // 4. DEDICATED PYTHON CODE INTERPRETER PROMPT
  if (formatMode === 'python') {
    return `${baseHeader}

[TARGET KELUARAN KHUSUS: GENERATE FILE FISIK .DOCX DAN .XLSX VIA PYTHON DI GEMINI]
Tugas Anda adalah menulis dan mengeksekusi kode Python di lingkungan Anda menggunakan library \`python-docx\` dan \`openpyxl\` untuk menghasilkan dua file fisik yang dapat diunduh langsung:

1. File 1: \`RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.docx\`
   Spesifikasi dokumen Word:
   - Kop Surat lengkap dengan garis pembatas ganda
   - Tabel Identitas Pembelajaran & Profil Siswa (${rpp.profilMurid.minat}, ${rpp.profilMurid.caraBelajar}, ${rpp.profilMurid.lingkungan})
   - Kotak 8 Dimensi Profil Lulusan dengan centang pada DPL terpilih
   - Tabel Desain Pembelajaran & Lingkungan Belajar
   - Tabel Skenario Alur M3 (Memahami, Mengaplikasikan, Merefleksikan) dengan alokasi waktu menit
   - Tabel Asesmen 3 Dimensi & Rubrik Penilaian 4 Skala
   - Lembar Pengesahan NIP Kepala Sekolah & Guru Mata Pelajaran

2. File 2: \`Rekap_Nilai_dan_Rubrik_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.xlsx\`
   Spesifikasi lembar kerja Excel:
   - Sheet 1: "Rubrik_BSKAP" -> Berisi Matriks Rubrik Penilaian 4 Skala (Baru Memulai, Berkembang, Cakap, Sangat Berkembang) dengan styling header hijau dan border tabel rapi.
   - Sheet 2: "Rekap_Nilai" -> Berisi Daftar Nilai Siswa (No, NISN, Nama Siswa, Kriteria 1-4, Rata-rata Skor dengan formula \`=AVERAGE(D3:G3)\`, Nilai Konversi dengan formula \`=ROUND(H3*25, 1)\`, Predikat dengan formula \`=IF(I3>=88,"Sangat Berkembang",IF(I3>=75,"Cakap",IF(I3>=60,"Berkembang","Baru Memulai")))\`, dan Catatan Tindak Lanjut).
   - Sheet 3: "Statistik_Kelas" -> Nilai Tertinggi (\`=MAX\`), Terendah (\`=MIN\`), dan Rata-rata (\`=AVERAGE\`).

Jalankan kode Python tersebut sekarang dan sediakan link download untuk kedua berkas tersebut agar pengguna dapat langsung menyimpannya ke komputer.`;
  }

  // 5. PDF FORMAT (3 HALAMAN A4 BSKAP)
  if (formatMode === 'pdf') {
    return `${baseHeader}

[TARGET KELUARAN KHUSUS: FORMAT DOKUMEN CETAK PDF A4 (3 HALAMAN PRESISI BSKAP)]
Keluarkan dokumen berstruktur rapi siap cetak atau simpan ke PDF A4 yang terbagi ke dalam 3 Halaman Presisi:
- [HALAMAN 1]: KOP SEKOLAH RESMI, TABEL IDENTITAS, PROFIL MURID (Minat, Gaya Belajar, Lingkungan), KOTAK 8 DPL BSKAP, dan DESAIN PEMBELAJARAN LENGKAP.
- [HALAMAN 2]: TABEL PENGALAMAN BELAJAR ALUR M3 (Langkah konkret Memahami - Mindful, Mengaplikasikan proyek nyata kontekstual - Meaningful & Joyful, dan Pertanyaan/Aktivitas Merefleksikan - Mindful & Meaningful).
- [HALAMAN 3]: TABEL ASESMEN 3 DIMENSI, MATRIKS RUBRIK PENILAIAN LENGKAP (4 SKALA), dan LEMBAR PENGESAHAN LENGKAP NIP KEPALA SEKOLAH DAN GURU.
Tanpa kalimat pembuka atau basa-basi AI.`;
  }

  return baseHeader;
}

/**
 * Exports the RPP and rubric matrix directly to an Excel (.xls) spreadsheet
 * compatible with Microsoft Excel, Google Sheets, and LibreOffice.
 */
export function exportToExcel(rpp: RPPData) {
  const dplListText = rpp.dplTerpilih?.map((d) => `DPL ${d.id}: ${d.nama}`).join(', ') || '-';
  const lkpd = getLkpd(rpp);
  const refleksiM = getRefleksiMurid(rpp);
  const refleksiG = getRefleksiGuru(rpp);
  const rubrikRowsHtml = rpp.rubrikPenilaian?.map((row) => `
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; background-color: #f8fafc; vertical-align: top;">${row.kriteria}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; vertical-align: top;">${row.baruMemulai}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; vertical-align: top;">${row.berkembang}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; vertical-align: top;">${row.cakap}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; background-color: #f0fdf4;">${row.sangatBerkembang}</td>
    </tr>
  `).join('') || '';

  const kopRowsHtml = rpp.kopSekolah?.tampilkanKop ? `
    <tr>
      <td colspan="2" style="font-weight: bold; text-align: center; background-color: #e2e8f0; font-size: 11pt;">${rpp.kopSekolah.namaDinas || 'DINAS PENDIDIKAN'}</td>
    </tr>
    <tr>
      <td colspan="2" style="font-weight: bold; text-align: center; background-color: #f8fafc; font-size: 13pt;">${rpp.kopSekolah.namaSekolah || rpp.identitas.satuanPendidikan || 'SEKOLAH'}</td>
    </tr>
    <tr>
      <td colspan="2" style="text-align: center; font-size: 9pt; color: #475569;">${rpp.kopSekolah.alamatSekolah || ''} ${rpp.kopSekolah.kontakSekolah ? '• ' + rpp.kopSekolah.kontakSekolah : ''}</td>
    </tr>
  ` : '';

  const pengesahanRowsHtml = `
    <table>
      <tr>
        <th colspan="4" class="section-title">LEMBAR PENGESAHAN</th>
      </tr>
      <tr>
        <td colspan="2" style="width: 50%;">
          Mengetahui,<br><strong>Kepala Sekolah</strong><br><br><br><br>
          <strong><u>${rpp.pengesahan?.namaKepalaSekolah || '___________________________'}</u></strong><br>
          NIP. ${rpp.pengesahan?.nipKepalaSekolah || '-'}
        </td>
        <td colspan="2" style="width: 50%; text-align: right;">
          ${rpp.pengesahan?.tempatPenetapan || 'Ditetapkan'}, ${rpp.pengesahan?.tanggalPenetapan || new Date().toLocaleDateString('id-ID')}<br>
          <strong>Guru Mata Pelajaran</strong><br><br><br><br>
          <strong><u>${rpp.pengesahan?.namaGuru || rpp.identitas.nama || '___________________________'}</u></strong><br>
          NIP. ${rpp.pengesahan?.nipGuru || '-'}
        </td>
      </tr>
    </table>
  `;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
        th { background-color: #059669; color: #ffffff; padding: 10px; font-weight: bold; border: 1px solid #047857; text-align: left; }
        td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
        .section-title { background-color: #0f766e; color: #ffffff; font-size: 13pt; font-weight: bold; padding: 10px; border: 1px solid #0f766e; }
        .sub-header { background-color: #f1f5f9; font-weight: bold; width: 25%; }
      </style>
    </head>
    <body>
      <table>
        ${kopRowsHtml}
        <tr>
          <th colspan="2" class="section-title">RENCANA PELAKSANAAN PEMBELAJARAN (RPP) DEEP LEARNING - BSKAP KURIKULUM MERDEKA</th>
        </tr>
        <tr>
          <td class="sub-header">Mata Pelajaran</td>
          <td>${rpp.identitas.mapel}</td>
        </tr>
        <tr>
          <td class="sub-header">Kelas / Fase</td>
          <td>${rpp.identitas.kelas}</td>
        </tr>
        <tr>
          <td class="sub-header">Topik Materi</td>
          <td>${rpp.identitas.topik}</td>
        </tr>
        <tr>
          <td class="sub-header">Guru Pengampu</td>
          <td>${rpp.identitas.nama}</td>
        </tr>
        <tr>
          <td class="sub-header">NIP Guru</td>
          <td>${rpp.pengesahan?.nipGuru || '-'}</td>
        </tr>
        <tr>
          <td class="sub-header">Satuan Pendidikan</td>
          <td>${rpp.identitas.satuanPendidikan || '-'}</td>
        </tr>
        <tr>
          <td class="sub-header">Alokasi Waktu</td>
          <td>${rpp.identitas.alokasiWaktu || '2 x 45 Menit'}</td>
        </tr>
        <tr>
          <td class="sub-header">Minat Murid</td>
          <td>${rpp.profilMurid.minat}</td>
        </tr>
        <tr>
          <td class="sub-header">Cara Belajar</td>
          <td>${rpp.profilMurid.caraBelajar}</td>
        </tr>
        <tr>
          <td class="sub-header">Lingkungan Tempat Tinggal</td>
          <td>${rpp.profilMurid.lingkungan}</td>
        </tr>
        <tr>
          <td class="sub-header">Dimensi Profil Lulusan (DPL)</td>
          <td>${dplListText}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">CAPAIAN PEMBELAJARAN (CP) & PERTANYAAN PEMANTIK HOTS</th>
        </tr>
        <tr>
          <td class="sub-header">Elemen Capaian Pembelajaran</td>
          <td>${rpp.elemenCP || 'Pemahaman Konsep & Keterampilan Proses'}</td>
        </tr>
        <tr>
          <td class="sub-header">Rumusan Capaian Pembelajaran (CP)</td>
          <td>${rpp.capaianPembelajaran || 'Peserta didik menganalisis konsep dan mengaplikasikan pengetahuan dalam pemecahan masalah nyata.'}</td>
        </tr>
        <tr>
          <td class="sub-header">Pemahaman Bermakna (Big Idea)</td>
          <td>${rpp.pemahamanBermakna || 'Pengetahuan menghubungkan teori dengan tindakan nyata untuk kemaslahatan bersama.'}</td>
        </tr>
        <tr>
          <td class="sub-header">Pertanyaan Pemantik HOTS</td>
          <td>
            ${(Array.isArray(rpp.pertanyaanPemantik) && rpp.pertanyaanPemantik.length > 0 ? rpp.pertanyaanPemantik : [
              `Mengapa pemahaman tentang ${rpp.identitas.topik} sangat penting dalam menyikapi persoalan di era modern?`,
              `Bagaimana keterkaitan materi ini dengan tantangan nyata yang dihadapi murid?`,
              `Karya konkret apa yang dapat Anda hasilkan untuk memberikan dampak positif?`
            ]).map((q, i) => `${i + 1}. ${q}`).join('<br>')}
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">DIFERENSIASI PEMBELAJARAN & SARANA PRASARANA</th>
        </tr>
        <tr>
          <td class="sub-header">1. Diferensiasi Konten</td>
          <td>${rpp.diferensiasiPembelajaran?.konten || `Bahan ajar multi-modal terkait ${rpp.identitas.topik}.`}</td>
        </tr>
        <tr>
          <td class="sub-header">2. Diferensiasi Proses</td>
          <td>${rpp.diferensiasiPembelajaran?.proses || 'Scaffolding bertingkat dan pendampingan terarah.'}</td>
        </tr>
        <tr>
          <td class="sub-header">3. Diferensiasi Produk</td>
          <td>${rpp.diferensiasiPembelajaran?.produk || 'Pilihan unjuk karya sesuai minat dan ekspresi.'}</td>
        </tr>
        <tr>
          <td class="sub-header">Sarana & Prasarana</td>
          <td>${rpp.saranaPrasarana || 'Media ajar multi-modal, perangkat TIK, dan lingkungan sekitar.'}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">DESAIN PEMBELAJARAN</th>
        </tr>
        <tr>
          <td class="sub-header">Tujuan Pembelajaran</td>
          <td>${rpp.desainPembelajaran.tujuanPembelajaran}</td>
        </tr>
        <tr>
          <td class="sub-header">Praktik Pedagogis</td>
          <td>${rpp.desainPembelajaran.praktikPedagogis}</td>
        </tr>
        <tr>
          <td class="sub-header">Kemitraan Pembelajaran</td>
          <td>${rpp.desainPembelajaran.kemitraanPembelajaran}</td>
        </tr>
        <tr>
          <td class="sub-header">Lingkungan Pembelajaran</td>
          <td>${rpp.desainPembelajaran.lingkunganPembelajaran}</td>
        </tr>
        <tr>
          <td class="sub-header">Pemanfaatan Digital</td>
          <td>${rpp.desainPembelajaran.pemanfaatanDigital}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">PENGALAMAN BELAJAR (ALUR M3)</th>
        </tr>
        <tr>
          <td class="sub-header">1. Memahami (Mindful)</td>
          <td>
            ${rpp.pengalamanBelajar.memahami.langkahLangkah.map((s, i) => `${i + 1}. ${s}`).join('<br>')}
          </td>
        </tr>
        <tr>
          <td class="sub-header">2. Mengaplikasikan (Meaningful, Joyful)</td>
          <td>
            ${rpp.pengalamanBelajar.mengaplikasikan.langkahLangkah.map((s, i) => `${i + 1}. ${s}`).join('<br>')}
          </td>
        </tr>
        <tr>
          <td class="sub-header">3. Merefleksikan (Mindful, Meaningful)</td>
          <td>
            <strong>Pertanyaan Refleksi:</strong><br>
            ${rpp.pengalamanBelajar.merefleksikan.pertanyaanRefleksi.map((q) => `• ${q}`).join('<br>')}
            ${rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi ? `<br><br><strong>Aktivitas:</strong> ${rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi}` : ''}
          </td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">ASESMEN PEMBELAJARAN</th>
        </tr>
        <tr>
          <td class="sub-header">Assessment of Learning (Awal)</td>
          <td>${rpp.asesmen.awal}</td>
        </tr>
        <tr>
          <td class="sub-header">Assessment as Learning (Proses)</td>
          <td>${rpp.asesmen.proses}</td>
        </tr>
        <tr>
          <td class="sub-header">Assessment for Learning (Akhir)</td>
          <td>${rpp.asesmen.akhir}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="5" class="section-title">RUBRIK PENILAIAN (4 SKALA BSKAP)</th>
        </tr>
        <tr style="background-color: #047857; color: #ffffff;">
          <th style="width: 20%; padding: 8px;">Kriteria</th>
          <th style="width: 20%; padding: 8px;">Baru Memulai</th>
          <th style="width: 20%; padding: 8px;">Berkembang</th>
          <th style="width: 20%; padding: 8px;">Cakap</th>
          <th style="width: 20%; padding: 8px;">Sangat Berkembang</th>
        </tr>
        ${rubrikRowsHtml}
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">LAMPIRAN 1: LEMBAR KERJA PESERTA DIDIK (LKPD)</th>
        </tr>
        <tr>
          <td class="sub-header">Aktivitas Belajar</td>
          <td>${lkpd.judul}</td>
        </tr>
        <tr>
          <td class="sub-header">Tujuan Aktivitas</td>
          <td>${lkpd.tujuanAktivitas}</td>
        </tr>
        <tr>
          <td class="sub-header">Petunjuk Pengerjaan</td>
          <td>${lkpd.petunjukKerja.map((p, i) => `${i + 1}. ${p}`).join('<br>')}</td>
        </tr>
        <tr>
          <td class="sub-header">Tantangan Kontekstual / Kasus</td>
          <td><em>"${lkpd.studiKasusTantangan}"</em></td>
        </tr>
        <tr>
          <td class="sub-header">Pertanyaan Panduan Penyelidikan</td>
          <td>${lkpd.pertanyaanPanduan.map((q, i) => `${i + 1}. ${q}`).join('<br>')}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th colspan="2" class="section-title">LAMPIRAN 2: LEMBAR REFLEKSI (MURID & GURU)</th>
        </tr>
        <tr>
          <td class="sub-header">3 Hal Baru Dipahami (Murid)</td>
          <td>${refleksiM.model321.tigaHalDipahami}</td>
        </tr>
        <tr>
          <td class="sub-header">2 Hal Ingin Didalami (Murid)</td>
          <td>${refleksiM.model321.duaHalDidalami}</td>
        </tr>
        <tr>
          <td class="sub-header">1 Aksi Nyata Diterapkan (Murid)</td>
          <td>${refleksiM.model321.satuAksiNyata}</td>
        </tr>
        <tr>
          <td class="sub-header">Pertanyaan Metakognisi</td>
          <td>${refleksiM.pertanyaanMetakognisi.map((q) => `• "${q}"`).join('<br>')}</td>
        </tr>
        <tr>
          <td class="sub-header">Evaluasi & Tindak Lanjut Guru</td>
          <td>
            <strong>Refleksi Guru:</strong><br>
            ${refleksiG.pertanyaanRefleksi.map((q) => `• ${q}`).join('<br>')}<br><br>
            <strong>Tindak Lanjut:</strong><br>
            ${refleksiG.tindakLanjut}
          </td>
        </tr>
      </table>

      ${pengesahanRowsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the RPP as a high-quality multi-page A4 PDF document,
 * leveraging discrete page rendering and high DPI canvas rendering.
 */
export async function downloadAsPDF(
  container: HTMLElement | null,
  filename: string,
  onProgress?: (status: string) => void
): Promise<boolean> {
  if (!container) {
    throw new Error('Elemen dokumen RPP tidak ditemukan.');
  }

  try {
    onProgress?.('Mempersiapkan dokumen cetak A4...');

    // Find all discrete pdf-page sections if present
    const pageElements = Array.from(container.querySelectorAll<HTMLElement>('.pdf-page'));
    const elementsToRender = pageElements.length > 0 ? pageElements : [container];

    // Standard A4 dimensions in millimeters
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 10; // 10mm margins on all sides
    const printableWidth = pageWidth - margin * 2; // 190mm
    const printableHeight = pageHeight - margin * 2; // 277mm
    const targetA4WidthPx = 794; // Exact A4 width at 96 DPI

    for (let i = 0; i < elementsToRender.length; i++) {
      const pageEl = elementsToRender[i];
      onProgress?.(`Memproses halaman ${i + 1} dari ${elementsToRender.length}...`);

      const originalWidth = pageEl.style.width;
      const originalMaxWidth = pageEl.style.maxWidth;
      const originalBoxSizing = pageEl.style.boxSizing;
      const originalBoxShadow = pageEl.style.boxShadow;

      // Lock to exact A4 width with border-box to prevent horizontal overflow/clipping
      pageEl.classList.add('pdf-export-mode');
      pageEl.style.width = `${targetA4WidthPx}px`;
      pageEl.style.maxWidth = `${targetA4WidthPx}px`;
      pageEl.style.boxSizing = 'border-box';
      pageEl.style.boxShadow = 'none';

      // Small delay for DOM layout reflow
      await new Promise((resolve) => setTimeout(resolve, 60));

      const canvas = await toCanvas(pageEl, {
        pixelRatio: 2, // 2x retina crispness (high-DPI)
        backgroundColor: '#ffffff',
        fontEmbedCSS: ' ', // Non-null dummy string so html-to-image bypasses remote CSS/webfont parsing completely!
        skipFonts: true,
        width: targetA4WidthPx,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList?.contains('print:hidden')) {
            return false;
          }
          return true;
        },
      });

      // Restore original element styles immediately
      pageEl.style.width = originalWidth;
      pageEl.style.maxWidth = originalMaxWidth;
      pageEl.style.boxSizing = originalBoxSizing;
      pageEl.style.boxShadow = originalBoxShadow;
      pageEl.classList.remove('pdf-export-mode');

      // Add page to PDF if not the first page
      if (i > 0) {
        pdf.addPage();
      }

      // Calculate rendered dimensions
      const scaleRatio = printableWidth / canvas.width;
      const renderedHeightInMm = canvas.height * scaleRatio;
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // If a single page exceeds 1 A4 page (e.g. fallback mode), slice smoothly
      if (renderedHeightInMm > printableHeight && elementsToRender.length === 1) {
        const pageHeightInCanvasPx = printableHeight / scaleRatio;
        let remainingHeight = canvas.height;
        let currentSourceY = 0;
        let pageNum = 0;

        while (remainingHeight > 0) {
          const sliceHeight = Math.min(pageHeightInCanvasPx, remainingHeight);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const pageCtx = pageCanvas.getContext('2d');

          if (pageCtx) {
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.drawImage(
              canvas,
              0,
              currentSourceY,
              canvas.width,
              sliceHeight,
              0,
              0,
              canvas.width,
              sliceHeight
            );

            const sliceImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
            if (pageNum > 0) {
              pdf.addPage();
            }
            pdf.addImage(sliceImgData, 'JPEG', margin, margin, printableWidth, sliceHeight * scaleRatio);
          }

          currentSourceY += sliceHeight;
          remainingHeight -= sliceHeight;
          pageNum++;
        }
      } else {
        // Fit within page, vertically positioned nicely
        const topPos = Math.max(margin, Math.min(margin + 2, (pageHeight - renderedHeightInMm) / 2));
        pdf.addImage(imgData, 'JPEG', margin, topPos, printableWidth, Math.min(renderedHeightInMm, printableHeight));
      }
    }

    onProgress?.('Menyimpan file PDF...');
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
}

/**
 * Downloads Token Cards as standard F4 or A4 PDF document
 */
export async function downloadTokenCardsAsPDF(
  container: HTMLElement | null,
  filename: string,
  paperSize: 'F4' | 'A4',
  orientation: 'portrait' | 'landscape',
  onProgress?: (status: string) => void
): Promise<boolean> {
  if (!container) {
    throw new Error('Elemen lembar kartu tidak ditemukan.');
  }

  try {
    onProgress?.(`Mempersiapkan dokumen PDF format ${paperSize}...`);

    const sheetElements = Array.from(container.querySelectorAll<HTMLElement>('.token-print-sheet'));
    const elementsToRender = sheetElements.length > 0 ? sheetElements : [container];

    const isPortrait = orientation === 'portrait';
    const pageWidthMm = paperSize === 'F4' ? (isPortrait ? 215 : 330) : (isPortrait ? 210 : 297);
    const pageHeightMm = paperSize === 'F4' ? (isPortrait ? 330 : 215) : (isPortrait ? 297 : 210);

    const pdf = new jsPDF({
      orientation: isPortrait ? 'p' : 'l',
      unit: 'mm',
      format: paperSize === 'F4' ? (isPortrait ? [215, 330] : [330, 215]) : (isPortrait ? [210, 297] : [297, 210]),
    });

    const margin = 6; // 6mm margin
    const printableWidth = pageWidthMm - margin * 2;
    const printableHeight = pageHeightMm - margin * 2;

    for (let i = 0; i < elementsToRender.length; i++) {
      const sheetEl = elementsToRender[i];
      onProgress?.(`Memproses lembar ${i + 1} dari ${elementsToRender.length}...`);

      const canvas = await toCanvas(sheetEl, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fontEmbedCSS: ' ',
        skipFonts: true,
      });

      if (i > 0) {
        pdf.addPage(paperSize === 'F4' ? (isPortrait ? [215, 330] : [330, 215]) : (isPortrait ? [210, 297] : [297, 210]), isPortrait ? 'p' : 'l');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, printableHeight);
    }

    onProgress?.('Menyimpan berkas PDF...');
    const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(safeFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate Token Cards PDF:', error);
    throw error;
  }
}

