export interface P3Item {
  id: string;
  nama: string;
  ringkasan: string;
  elemenKunci: string[];
}

export const P3_LIST: P3Item[] = [
  {
    id: 'p3-1',
    nama: 'Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia',
    ringkasan: 'Akhlak beragama, akhlak pribadi, akhlak kepada manusia, alam, dan bernegara.',
    elemenKunci: ['Akhlak Beragama', 'Akhlak Pribadi', 'Akhlak kepada Sesama', 'Akhlak kepada Alam', 'Akhlak Bernegara'],
  },
  {
    id: 'p3-2',
    nama: 'Berkebinekaan Global',
    ringkasan: 'Mengenal dan menghargai budaya, komunikasi dan interaksi antarbudaya, refleksi kebinekaan.',
    elemenKunci: ['Mengenal Budaya', 'Komunikasi Interkultural', 'Refleksi Kebinekaan'],
  },
  {
    id: 'p3-3',
    nama: 'Gotong Royong',
    ringkasan: 'Kolaborasi, kepedulian terhadap lingkungan sosial, dan berbagi sumber daya.',
    elemenKunci: ['Kolaborasi Tim', 'Kepedulian Sosial', 'Saling Berbagi'],
  },
  {
    id: 'p3-4',
    nama: 'Mandiri',
    ringkasan: 'Pemahaman diri dan situasi yang dihadapi serta regulasi emosi & strategi belajar.',
    elemenKunci: ['Kesadaran Diri', 'Regulasi Belajar', 'Tanggung Jawab Pribadi'],
  },
  {
    id: 'p3-5',
    nama: 'Bernalar Kritis',
    ringkasan: 'Memperoleh dan memproses informasi, menganalisis, mengevaluasi, dan merefleksikan pemikiran.',
    elemenKunci: ['Memproses Informasi', 'Analisis & Evaluasi', 'Refleksi Pemikiran'],
  },
  {
    id: 'p3-6',
    nama: 'Kreatif',
    ringkasan: 'Menghasilkan gagasan orisinal serta menghasilkan karya dan tindakan yang bermakna.',
    elemenKunci: ['Gagasan Orisinal', 'Karya Inovatif', 'Keluwesan Berpikir'],
  },
];

/**
 * Otomatis memetakan DPL (Deep Learning) ke Dimensi P3 (Profil Pelajar Pancasila)
 */
export function mapDplToP3(dplIds: number[]): string[] {
  const result = new Set<string>();
  if (dplIds.includes(1)) result.add('Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia');
  if (dplIds.includes(2)) result.add('Berkebinekaan Global');
  if (dplIds.includes(3)) result.add('Bernalar Kritis');
  if (dplIds.includes(4)) result.add('Kreatif');
  if (dplIds.includes(5)) result.add('Gotong Royong');
  if (dplIds.includes(6)) result.add('Mandiri');
  if (dplIds.includes(7)) result.add('Mandiri');
  if (dplIds.includes(8)) result.add('Berkebinekaan Global');

  // Default jika belum ada terpilih
  if (result.size === 0) {
    result.add('Bernalar Kritis');
    result.add('Kreatif');
    result.add('Gotong Royong');
  }

  return Array.from(result);
}
