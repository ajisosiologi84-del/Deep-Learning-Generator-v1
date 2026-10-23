export interface Identitas {
  nama: string;
  kelas: string;
  fase?: string;
  semester?: string;
  mapel: string;
  topik: string;
  alokasiWaktu?: string;
  satuanPendidikan?: string;
}

export interface ProfilMurid {
  minat: string;
  caraBelajar: string;
  lingkungan: string;
}

export interface DPLItem {
  id: number;
  nama: string;
  alasan?: string;
}

export interface DiferensiasiPembelajaran {
  konten: string;
  proses: string;
  produk: string;
}

export interface LKPDData {
  judul: string;
  tujuanAktivitas: string;
  petunjukKerja: string[];
  studiKasusTantangan: string;
  pertanyaanPanduan: string[];
}

export interface RefleksiMuridData {
  model321: {
    tigaHalDipahami: string;
    duaHalDidalami: string;
    satuAksiNyata: string;
  };
  pertanyaanMetakognisi: string[];
}

export interface RefleksiGuruData {
  pertanyaanRefleksi: string[];
  tindakLanjut: string;
}

export interface DesainPembelajaran {
  tujuanPembelajaran: string;
  praktikPedagogis: string;
  kemitraanPembelajaran: string;
  lingkunganPembelajaran: string;
  pemanfaatanDigital: string;
}

export interface PengalamanBelajar {
  memahami: {
    judul: string;
    langkahLangkah: string[];
  };
  mengaplikasikan: {
    judul: string;
    langkahLangkah: string[];
  };
  merefleksikan: {
    judul: string;
    pertanyaanRefleksi: string[];
    aktivitasRefleksi?: string;
  };
}

export interface Asesmen {
  awal: string;
  proses: string;
  akhir: string;
}

export interface RubrikKriteria {
  kriteria: string;
  baruMemulai: string;
  berkembang: string;
  cakap: string;
  sangatBerkembang: string;
}

export interface KopSekolah {
  tampilkanKop: boolean;
  namaDinas: string;
  namaSekolah: string;
  alamatSekolah: string;
  kontakSekolah: string;
  logoKiri?: string; // Data URL / Base64 / URL for Logo Sekolah (Kiri)
  logoKanan?: string; // Data URL / Base64 / URL for Logo Pemda (Kanan)
}

export interface Pengesahan {
  tempatPenetapan: string;
  tanggalPenetapan: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaGuru: string;
  nipGuru: string;
}

export interface GlosariumItem {
  istilah: string;
  definisi: string;
}

export interface BahanAjarData {
  judulMateri: string;
  ringkasanMateri: string;
  poinKunci: string[];
  glosarium: GlosariumItem[];
  daftarPustaka: string[];
}

export interface SoalItem {
  nomor: number;
  tipe: 'Diagnostik' | 'Formatif' | 'Sumatif';
  pertanyaan: string;
  kunciJawaban: string;
  pedomanSkor?: string;
}

export interface InstrumenAsesmenData {
  soalDiagnostikAwal: SoalItem[];
  soalFormatifSumatifHOTS: SoalItem[];
  pedomanPenskoran: string;
}

export interface WaktuAlurM3 {
  memahamiMenit: number;
  mengaplikasikanMenit: number;
  merefleksikanMenit: number;
}

export interface RPPData {
  identitas: Identitas;
  profilMurid: ProfilMurid;
  dplTerpilih: DPLItem[];
  dimensiP3?: string[];
  waktuAlurM3?: WaktuAlurM3;
  capaianPembelajaran?: string;
  elemenCP?: string;
  pemahamanBermakna?: string;
  pertanyaanPemantik?: string[];
  diferensiasiPembelajaran?: DiferensiasiPembelajaran;
  saranaPrasarana?: string;
  desainPembelajaran: DesainPembelajaran;
  pengalamanBelajar: PengalamanBelajar;
  asesmen: Asesmen;
  instrumenAsesmen?: InstrumenAsesmenData;
  rubrikPenilaian: RubrikKriteria[];
  lkpd?: LKPDData;
  refleksiMurid?: RefleksiMuridData;
  refleksiGuru?: RefleksiGuruData;
  bahanAjar?: BahanAjarData;
  kopSekolah?: KopSekolah;
  pengesahan?: Pengesahan;
}

export interface RPPInputFormState {
  namaGuru: string;
  nipGuru: string;
  kelas: string;
  fase?: string;
  semester?: string;
  mapel: string;
  topik: string;
  alokasiWaktu: string;
  satuanPendidikan: string;
  capaianPembelajaran?: string;
  elemenCP?: string;
  pemahamanBermakna?: string;
  pertanyaanPemantik?: string;
  diferensiasiKonten?: string;
  diferensiasiProses?: string;
  diferensiasiProduk?: string;
  saranaPrasarana?: string;
  namaDinas: string;
  alamatSekolah: string;
  kontakSekolah: string;
  tampilkanKop: boolean;
  logoKiri?: string;
  logoKanan?: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tempatPenetapan: string;
  tanggalPenetapan: string;
  minat: string;
  caraBelajar: string;
  lingkungan: string;
  selectedDpl: number[];
  selectedP3?: string[];
  waktuMemahami?: number;
  waktuMengaplikasikan?: number;
  waktuMerefleksikan?: number;
  catatanKhusus?: string;
}

export interface CPRecommendationResult {
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
  alasanDpl?: string;
}
