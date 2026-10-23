export interface KelasFaseOption {
  value: string;
  label: string;
  jenjang: 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'SLB' | 'UMUM';
  fase: string;
  keterangan?: string;
}

export interface JenjangCategory {
  id: 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'SLB';
  nama: string;
  deskripsi: string;
  badge: string;
  faseList: string[];
}

export const JENJANG_CATEGORIES: JenjangCategory[] = [
  {
    id: 'TK',
    nama: 'PAUD / TK',
    deskripsi: 'Pendidikan Anak Usia Dini / Taman Kanak-Kanak',
    badge: 'Fase Fondasi',
    faseList: ['Fase Fondasi'],
  },
  {
    id: 'SD',
    nama: 'SD / MI',
    deskripsi: 'Sekolah Dasar / Madrasah Ibtidaiyah (Kelas 1 - 6)',
    badge: 'Fase A, B, C',
    faseList: ['Fase A', 'Fase B', 'Fase C'],
  },
  {
    id: 'SMP',
    nama: 'SMP / MTs',
    deskripsi: 'Sekolah Menengah Pertama / Madrasah Tsanawiyah (Kelas 7 - 9)',
    badge: 'Fase D',
    faseList: ['Fase D'],
  },
  {
    id: 'SMA',
    nama: 'SMA / MA',
    deskripsi: 'Sekolah Menengah Atas / Madrasah Aliyah (Kelas 10 - 12)',
    badge: 'Fase E, F',
    faseList: ['Fase E', 'Fase F'],
  },
  {
    id: 'SMK',
    nama: 'SMK / MAK',
    deskripsi: 'Sekolah Menengah Kejuruan (Kelas 10 - 12 & 13)',
    badge: 'Fase E, F',
    faseList: ['Fase E', 'Fase F'],
  },
  {
    id: 'SLB',
    nama: 'SLB (Khusus)',
    deskripsi: 'Pendidikan Khusus / Sekolah Luar Biasa',
    badge: 'Fase A - F',
    faseList: ['Fase A', 'Fase B', 'Fase C', 'Fase D', 'Fase E', 'Fase F'],
  },
];

export const KELAS_FASE_OPTIONS: KelasFaseOption[] = [
  // --- PAUD / TK (Fase Fondasi) ---
  {
    value: 'TK A (Fase Fondasi)',
    label: 'TK A (Usia 4-5 Thn - Fase Fondasi)',
    jenjang: 'TK',
    fase: 'Fase Fondasi',
    keterangan: 'Kelompok A (PAUD/TK)',
  },
  {
    value: 'TK B (Fase Fondasi)',
    label: 'TK B (Usia 5-6 Thn - Fase Fondasi)',
    jenjang: 'TK',
    fase: 'Fase Fondasi',
    keterangan: 'Kelompok B (PAUD/TK)',
  },
  {
    value: 'PAUD / KB (Fase Fondasi)',
    label: 'PAUD / KB (Kelompok Bermain - Fase Fondasi)',
    jenjang: 'TK',
    fase: 'Fase Fondasi',
    keterangan: 'Kelompok Bermain / TPA / SPS',
  },
  {
    value: 'Fase Fondasi (PAUD/TK)',
    label: 'Fase Fondasi (Umum PAUD/TK)',
    jenjang: 'TK',
    fase: 'Fase Fondasi',
    keterangan: 'Standar Kurikulum Merdeka PAUD',
  },

  // --- SD / MI (Fase A, B, C) ---
  {
    value: 'Kelas 1 SD (Fase A)',
    label: 'Kelas 1 SD / MI (Fase A)',
    jenjang: 'SD',
    fase: 'Fase A',
    keterangan: 'Usia 6-7 Thn',
  },
  {
    value: 'Kelas 2 SD (Fase A)',
    label: 'Kelas 2 SD / MI (Fase A)',
    jenjang: 'SD',
    fase: 'Fase A',
    keterangan: 'Usia 7-8 Thn',
  },
  {
    value: 'Kelas 3 SD (Fase B)',
    label: 'Kelas 3 SD / MI (Fase B)',
    jenjang: 'SD',
    fase: 'Fase B',
    keterangan: 'Usia 8-9 Thn',
  },
  {
    value: 'Kelas 4 SD (Fase B)',
    label: 'Kelas 4 SD / MI (Fase B)',
    jenjang: 'SD',
    fase: 'Fase B',
    keterangan: 'Usia 9-10 Thn',
  },
  {
    value: 'Kelas 5 SD (Fase C)',
    label: 'Kelas 5 SD / MI (Fase C)',
    jenjang: 'SD',
    fase: 'Fase C',
    keterangan: 'Usia 10-11 Thn',
  },
  {
    value: 'Kelas 6 SD (Fase C)',
    label: 'Kelas 6 SD / MI (Fase C)',
    jenjang: 'SD',
    fase: 'Fase C',
    keterangan: 'Usia 11-12 Thn',
  },

  // --- SMP / MTs (Fase D) ---
  {
    value: 'Kelas VII SMP (Fase D)',
    label: 'Kelas VII SMP / MTs (Fase D)',
    jenjang: 'SMP',
    fase: 'Fase D',
    keterangan: 'Kelas 7',
  },
  {
    value: 'Kelas VIII SMP (Fase D)',
    label: 'Kelas VIII SMP / MTs (Fase D)',
    jenjang: 'SMP',
    fase: 'Fase D',
    keterangan: 'Kelas 8',
  },
  {
    value: 'Kelas IX SMP (Fase D)',
    label: 'Kelas IX SMP / MTs (Fase D)',
    jenjang: 'SMP',
    fase: 'Fase D',
    keterangan: 'Kelas 9',
  },

  // --- SMA / MA (Fase E & F) ---
  {
    value: 'Kelas X SMA (Fase E)',
    label: 'Kelas X SMA / MA (Fase E)',
    jenjang: 'SMA',
    fase: 'Fase E',
    keterangan: 'Kelas 10 SMA Umum',
  },
  {
    value: 'Kelas XI SMA (Fase F)',
    label: 'Kelas XI SMA / MA (Fase F)',
    jenjang: 'SMA',
    fase: 'Fase F',
    keterangan: 'Kelas 11 Pilihan Mata Pelajaran',
  },
  {
    value: 'Kelas XII SMA (Fase F)',
    label: 'Kelas XII SMA / MA (Fase F)',
    jenjang: 'SMA',
    fase: 'Fase F',
    keterangan: 'Kelas 12 Tingkat Akhir SMA',
  },

  // --- SMK / MAK (Fase E & F) ---
  {
    value: 'Kelas X SMK (Fase E)',
    label: 'Kelas X SMK / MAK (Fase E)',
    jenjang: 'SMK',
    fase: 'Fase E',
    keterangan: 'Dasar-dasar Program Keahlian',
  },
  {
    value: 'Kelas XI SMK (Fase F)',
    label: 'Kelas XI SMK / MAK (Fase F)',
    jenjang: 'SMK',
    fase: 'Fase F',
    keterangan: 'Konsentrasi Keahlian Kejuruan',
  },
  {
    value: 'Kelas XII SMK (Fase F)',
    label: 'Kelas XII SMK / MAK (Fase F)',
    jenjang: 'SMK',
    fase: 'Fase F',
    keterangan: 'Praktik Kerja Lapangan (PKL)',
  },
  {
    value: 'Kelas XIII SMK (Fase F)',
    label: 'Kelas XIII SMK (Fase F - Program 4 Tahun)',
    jenjang: 'SMK',
    fase: 'Fase F',
    keterangan: 'SMK 4 Tahun Program Khusus',
  },

  // --- SLB (Pendidikan Khusus) ---
  {
    value: 'SLB Kelas 1-2 (Fase A)',
    label: 'SLB Kelas I - II (Fase A)',
    jenjang: 'SLB',
    fase: 'Fase A',
    keterangan: 'Pendidikan Khusus SDLB',
  },
  {
    value: 'SLB Kelas 3-4 (Fase B)',
    label: 'SLB Kelas III - IV (Fase B)',
    jenjang: 'SLB',
    fase: 'Fase B',
    keterangan: 'Pendidikan Khusus SDLB',
  },
  {
    value: 'SLB Kelas 5-6 (Fase C)',
    label: 'SLB Kelas V - VI (Fase C)',
    jenjang: 'SLB',
    fase: 'Fase C',
    keterangan: 'Pendidikan Khusus SDLB',
  },
  {
    value: 'SMPLB Kelas 7-9 (Fase D)',
    label: 'SMPLB Kelas VII - IX (Fase D)',
    jenjang: 'SLB',
    fase: 'Fase D',
    keterangan: 'Pendidikan Khusus SMPLB',
  },
  {
    value: 'SMALB Kelas 10 (Fase E)',
    label: 'SMALB Kelas X (Fase E)',
    jenjang: 'SLB',
    fase: 'Fase E',
    keterangan: 'Pendidikan Khusus SMALB',
  },
  {
    value: 'SMALB Kelas 11-12 (Fase F)',
    label: 'SMALB Kelas XI - XII (Fase F)',
    jenjang: 'SLB',
    fase: 'Fase F',
    keterangan: 'Pendidikan Khusus SMALB',
  },

  // --- Lintas / Fase Saja ---
  {
    value: 'Fase A (Kelas 1-2 SD)',
    label: 'Fase A (Umum SD Kelas 1-2)',
    jenjang: 'SD',
    fase: 'Fase A',
  },
  {
    value: 'Fase B (Kelas 3-4 SD)',
    label: 'Fase B (Umum SD Kelas 3-4)',
    jenjang: 'SD',
    fase: 'Fase B',
  },
  {
    value: 'Fase C (Kelas 5-6 SD)',
    label: 'Fase C (Umum SD Kelas 5-6)',
    jenjang: 'SD',
    fase: 'Fase C',
  },
  {
    value: 'Fase D (Kelas 7-9 SMP)',
    label: 'Fase D (Umum SMP Kelas 7-9)',
    jenjang: 'SMP',
    fase: 'Fase D',
  },
  {
    value: 'Fase E (Kelas 10 SMA/SMK)',
    label: 'Fase E (Umum Kelas 10 SMA/SMK)',
    jenjang: 'SMA',
    fase: 'Fase E',
  },
  {
    value: 'Fase F (Kelas 11-12 SMA/SMK)',
    label: 'Fase F (Umum Kelas 11-12 SMA/SMK)',
    jenjang: 'SMA',
    fase: 'Fase F',
  },
];
