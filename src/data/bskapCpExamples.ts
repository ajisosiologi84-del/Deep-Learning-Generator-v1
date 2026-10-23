export interface BskapCpPreset {
  id: string;
  jenjang: string;
  fase: string;
  mapel: string;
  topik: string;
  elemenCP: string;
  rumusanCP: string;
}

export const BSKAP_CP_EXAMPLES: BskapCpPreset[] = [
  {
    id: 'smp-bindo-cerpen',
    jenjang: 'SMP / MTs',
    fase: 'Fase D (Kelas 7-9)',
    mapel: 'Bahasa Indonesia',
    topik: 'Menelaah Struktur dan Nilai Kehidupan dalam Teks Cerpen',
    elemenCP: 'Membaca dan Memirsa, Menulis Kreatif Multimodal',
    rumusanCP: 'Peserta didik memahami informasi berupa gagasan, pikiran, pandangan, arahan atau pesan dari teks narasi/cerpen yang dibaca dan disimak. Peserta didik mampu mengevaluasi dan merefleksikan nilai-nilai kemanusiaan dalam teks cerpen serta mengkreasikan kembali cerita pendek bermakna yang berakar pada kearifan budaya lokal.',
  },
  {
    id: 'sma-sosiologi-masalah-sosial',
    jenjang: 'SMA / MA',
    fase: 'Fase F (Kelas 11-12)',
    mapel: 'Sosiologi',
    topik: 'Analisis Masalah Sosial dan Transformasi Digital Masyarakat',
    elemenCP: 'Pemahaman Konsep Sosiologi & Keterampilan Proses Penyelidikan',
    rumusanCP: 'Peserta didik mampu menganalisis berbagai permasalahan sosial yang muncul akibat globalisasi dan transformasi digital di lingkungan masyarakat sekitar, mengevaluasi dampaknya terhadap kohesi sosial, serta merancang aksi kolaboratif kontekstual sebagai solusi pemecahan masalah.',
  },
  {
    id: 'smp-ipa-ekosistem',
    jenjang: 'SMP / MTs',
    fase: 'Fase D (Kelas 7-9)',
    mapel: 'Ilmu Pengetahuan Alam (IPA)',
    topik: 'Interaksi Antarkomponen Ekosistem dan Pelestarian Lingkungan Hidup',
    elemenCP: 'Pemahaman IPA & Keterampilan Proses Inkuiri',
    rumusanCP: 'Peserta didik mampu mengidentifikasi interaksi antarmakhluk hidup dan lingkungannya dalam ekosistem, menganalisis pengaruh aktivitas manusia terhadap keseimbangan ekosistem dan perubahan iklim, serta merancang upaya pelestarian lingkungan hidup berbasis kearifan lokal.',
  },
  {
    id: 'sd-ipas-fase-b-wujud-zat',
    jenjang: 'SD / MI',
    fase: 'Fase B (Kelas 3-4)',
    mapel: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    topik: 'Wujud Zat dan Perubahannya dalam Kehidupan Sehari-hari',
    elemenCP: 'Pemahaman IPAS (Sains dan Sosial)',
    rumusanCP: 'Peserta didik mengidentifikasi wujud zat (padat, cair, dan gas), menganalisis perubahan wujud zat yang terjadi dalam kehidupan sehari-hari melalui pengamatan dan percobaan sederhana, serta mendemonstrasikan pemanfaatannya untuk memecahkan kebutuhan harian.',
  },
  {
    id: 'smp-matematika-statistika',
    jenjang: 'SMP / MTs',
    fase: 'Fase D (Kelas 7-9)',
    mapel: 'Matematika',
    topik: 'Analisis Data Statistika & Pengambilan Keputusan Nyata',
    elemenCP: 'Analisis Data dan Peluang',
    rumusanCP: 'Peserta didik dapat merumuskan pertanyaan, mengumpulkan, menyajikan, dan menganalisis data menggunakan diagram batang, lingkaran, serta ukuran pemusatan (mean, median, modus) untuk mengambil keputusan bijak yang berkaitan dengan isu sosial dan lingkungan di sekitarnya.',
  },
  {
    id: 'sma-ppkn-pancasila',
    jenjang: 'SMA / MA',
    fase: 'Fase E (Kelas 10)',
    mapel: 'Pendidikan Pancasila',
    topik: 'Harmonisasi Hak dan Kewajiban Warga Negara dalam Masyarakat Beragam',
    elemenCP: 'Pancasila & UUD NRI Tahun 1945',
    rumusanCP: 'Peserta didik mampu menganalisis kasus pelanggaran hak dan pengingkaran kewajiban warga negara dalam kehidupan bermasyarakat, berbangsa, dan bernegara, serta menginisiasi praktik nyata gotong royong dan toleransi dalam bingkai Bhinneka Tunggal Ika.',
  },
  {
    id: 'smk-kewirausahaan',
    jenjang: 'SMK / MAK',
    fase: 'Fase F (Kelas 11-12)',
    mapel: 'Projek Kreatif dan Kewirausahaan',
    topik: 'Perencanaan Usaha dan Inovasi Produk Ramah Lingkungan',
    elemenCP: 'Kewirausahaan dan Produksi Kreatif',
    rumusanCP: 'Peserta didik mampu menyusun rencana usaha (business plan) sederhana dengan memanfaatkan peluang pasar lokal, menciptakan purwarupa produk bernilai jual yang ramah lingkungan, serta mempromosikan produk secara digital dengan integritas etika bisnis.',
  },
  {
    id: 'paud-fondasi-diri',
    jenjang: 'PAUD / TK',
    fase: 'Fase Fondasi',
    mapel: 'Fondasi Belajar Tematik',
    topik: 'Aku Sayang Bumi dan Mengenal Emosi Diri',
    elemenCP: 'Nilai Agama dan Budi Pekerti, Jati Diri, Dasar-dasar Literasi dan STEAM',
    rumusanCP: 'Anak mengenali, mengekspresikan, dan mengelola emosi diri serta membangun hubungan sosial yang positif. Anak menunjukkan rasa ingin tahu melalui eksplorasi lingkungan dan menunjukkan kepedulian terhadap kelestarian alam dan makhluk ciptaan Tuhan.',
  },
];
