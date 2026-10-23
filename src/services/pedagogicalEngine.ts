import { CPRecommendationResult } from '../types/rpp';

export function analyzeCpAndGenerateRecommendation(params: {
  capaianPembelajaran: string;
  mapel?: string;
  kelas?: string;
  fase?: string;
  topik?: string;
  elemenCP?: string;
}): CPRecommendationResult {
  const { capaianPembelajaran = '', mapel = '', kelas = '', topik = '', elemenCP = '' } = params;
  const combined = `${capaianPembelajaran} ${mapel} ${kelas} ${topik} ${elemenCP}`.toLowerCase();

  // Subject and Topic Classification
  const isLanguage = /bahasa|sastra|cerpen|puisi|gurindam|teks|menyimak|membaca|memirsa|menulis|literasi|novel|paragraf|laporan hasil observasi|eksplanasi|negosiasi|anekdot|narasi/.test(combined);
  const isMath = /matematik|hitung|aljabar|geometri|bilangan|pecahan|persamaan|fungsi|statistika|peluang|numerasi|sudut|bangun datar|bangun ruang|trigonometri|kalkulus/.test(combined);
  const isScience = /ipa|sains|ekosistem|biologi|fisika|kimia|energi|alam|zat|wujud zat|lingkungan|fotosintesis|sel|organ|magnet|listrik|gelombang|tatasurya|bumi|iklim|pemanasan global/.test(combined);
  const isSocial = /ips|sosiologi|sejarah|antropologi|geografi|ekonomi|sosial|masyarakat|budaya|globalisasi|konflik|stratifikasi|interaksi sosial|pasar|peta|kolonialisme|kemerdekaan/.test(combined);
  const isCivic = /pancasila|ppkn|kewarganegaraan|uud|hukum|norma|hak dan kewajiban|bhineka|demokrasi|toleransi|keberagaman|gotong royong/.test(combined);
  const isInformatics = /informatika|tik|komputer|koding|coding|algoritma|pemrograman|jaringan|internet|data digital|keamanan siber|kecerdasan buatan|ai/.test(combined);
  const isSport = /pjok|olahraga|penjas|kebugaran|atletik|sepak bola|senam|renang|permainan bola|kesehatan raga|gizi/.test(combined);
  const isArt = /seni|rupa|musik|tari|teater|gambar|lukis|estetika|nada|harmoni|kreasi rupa|pameran|pertunjukan/.test(combined);
  const isVocational = /pkk|kewirausahaan|smk|kejuruan|bisnis|produksi|usaha|pemasaran|jasa|akuntansi|otomotif|tkj|rpl|tata boga|busana/.test(combined);
  const isPaud = /paud|tk|fondasi|usia dini|jati diri|nilai agama|budi pekerti/.test(combined);

  // Extract core keywords for tailored phrasing
  let inferredTopic = topik.trim();
  if (!inferredTopic) {
    if (isLanguage) {
      if (/cerpen/.test(combined)) inferredTopic = 'Teks Cerita Pendek (Cerpen) & Nilai Kehidupan';
      else if (/puisi|pantun|gurindam/.test(combined)) inferredTopic = 'Karya Sastra & Petuah Luhur Nusantara';
      else if (/eksplanasi|laporan/.test(combined)) inferredTopic = 'Teks Laporan Hasil Observasi & Eksplanasi Faktual';
      else inferredTopic = 'Literasi Kritis & Komunikasi Multimodal';
    } else if (isMath) {
      if (/statistika|data/.test(combined)) inferredTopic = 'Penyajian dan Analisis Data Statistika Kontekstual';
      else if (/pecahan|bilangan/.test(combined)) inferredTopic = 'Operasi Bilangan & Pemecahan Masalah Nyata';
      else if (/aljabar/.test(combined)) inferredTopic = 'Pemodelan Pola Aljabar dalam Kehidupan';
      else inferredTopic = 'Penalaran Matematis & Numerasi Terapan';
    } else if (isScience) {
      if (/ekosistem|lingkungan/.test(combined)) inferredTopic = 'Dinamika Ekosistem & Kelestarian Lingkungan Hidup';
      else if (/wujud zat|zat/.test(combined)) inferredTopic = 'Wujud Zat dan Transformasi Perubahan Materi';
      else if (/energi|listrik/.test(combined)) inferredTopic = 'Energi Terbarukan dan Konservasi Sumber Daya';
      else inferredTopic = 'Inkuiri Ilmiah dan Gejala Sains Kontekstual';
    } else if (isSocial) {
      if (/sosiologi|masalah sosial/.test(combined)) inferredTopic = 'Analisis Permasalahan Sosial dan Dinamika Komunitas';
      else if (/ekonomi|pasar/.test(combined)) inferredTopic = 'Literasi Finansial dan Rantai Ekonomi Kerakyatan';
      else if (/sejarah/.test(combined)) inferredTopic = 'Jejak Peradaban dan Refleksi Sejarah Bangsa';
      else inferredTopic = 'Interaksi Sosial, Kearifan Lokal, dan Budaya';
    } else if (isCivic) {
      inferredTopic = 'Harmonisasi Hak, Kewajiban, dan Nilai Luhur Pancasila';
    } else if (isInformatics) {
      inferredTopic = 'Berpikir Komputasional dan Inovasi Digital Beretika';
    } else if (isSport) {
      inferredTopic = 'Kebugaran Jasmani, Sportivitas, dan Gaya Hidup Sehat';
    } else if (isArt) {
      inferredTopic = 'Eksplorasi Ekspresi Seni dan Apresiasi Budaya Visual';
    } else if (isVocational) {
      inferredTopic = 'Perencanaan Inovasi Produk Kreatif Berdaya Jual';
    } else if (isPaud) {
      inferredTopic = 'Eksplorasi Lingkungan Ceria dan Pengenalan Diri';
    } else {
      inferredTopic = 'Penerapan Konsep Esensial dan Penyelidikan Kontekstual';
    }
  }

  // Elemen CP deduction
  let inferredElemen = elemenCP.trim();
  if (!inferredElemen) {
    if (isLanguage) inferredElemen = 'Membaca dan Memirsa, Menulis Kreatif Multimodal';
    else if (isMath) inferredElemen = 'Bilangan, Aljabar, Analisis Data dan Peluang';
    else if (isScience) inferredElemen = 'Pemahaman Sains & Keterampilan Proses Inkuiri';
    else if (isSocial) inferredElemen = 'Pemahaman Konsep Sosial & Penyelidikan Kontekstual';
    else if (isCivic) inferredElemen = 'Pancasila, UUD NRI 1945, Bhinneka Tunggal Ika';
    else if (isInformatics) inferredElemen = 'Berpikir Komputasional, Algoritma & Dampak Sosial TIK';
    else if (isSport) inferredElemen = 'Terampil Bergerak, Belajar Melalui Gerak, Pola Hidup Sehat';
    else if (isArt) inferredElemen = 'Mengalami, Menciptakan, Merefleksikan Karya Seni';
    else if (isVocational) inferredElemen = 'Kewirausahaan dan Produksi Kreatif Berkelanjutan';
    else if (isPaud) inferredElemen = 'Nilai Agama & Budi Pekerti, Jati Diri, Literasi & STEAM';
    else inferredElemen = 'Pemahaman Konsep & Penalaran Kritis Bermakna';
  }

  // 1. Pemahaman Bermakna (Big Idea / Enduring Understanding)
  let pemahamanBermakna = '';
  if (isLanguage) {
    pemahamanBermakna = `Bahasa dan karya sastra (${inferredTopic}) adalah cermin peradaban; melaluinya kita belajar menyelami sudut pandang orang lain, mengasah empati kemanusiaan, serta menyuarakan kebenaran secara artikulatif dan beretika.`;
  } else if (isMath) {
    pemahamanBermakna = `Matematika (${inferredTopic}) bukanlah sekadar rumus mekanistik, melainkan bahasa universal dan kacamata logika untuk memetakan keteraturan alam semesta, menganalisis fakta objektif, dan mengambil keputusan hidup yang rasional.`;
  } else if (isScience) {
    pemahamanBermakna = `Setiap fenomena sains dalam ${inferredTopic} saling terhubung dengan kelangsungan hidup; kesadaran akan hukum alam memicu tanggung jawab etis kita untuk menjaga keseimbangan ekologis dan berinovasi demi keselamatan bumi.`;
  } else if (isSocial || isCivic) {
    pemahamanBermakna = `Masyarakat yang berkeadilan tumbuh saat individu memahami akar dinamika sosial (${inferredTopic}), merawat modal toleransi keberagaman, dan bersedia mengupayakan aksi nyata gotong royong bagi kemaslahatan bersama.`;
  } else if (isInformatics) {
    pemahamanBermakna = `Teknologi dan algoritma (${inferredTopic}) adalah pengungkit potensi peradaban; pemanfaatan cerdas berlandaskan etika digital mampu mentransformasi tantangan rumit menjadi solusi inklusif yang memanusiakan manusia.`;
  } else if (isSport) {
    pemahamanBermakna = `Kesehatan raga dan kebiasaan gerak (${inferredTopic}) membentuk fondasi ketahanan mental, disiplin diri, serta sportivitas bermartabat dalam mengarungi dinamika kehidupan bermasyarakat.`;
  } else if (isArt) {
    pemahamanBermakna = `Karya seni (${inferredTopic}) adalah bahasa jiwa yang melampaui sekat formal; melalui kreativitas berkesadaran, kita mengabadikan nilai luhur kehidupan dan memperkaya kepekaan estetika peradaban.`;
  } else if (isVocational) {
    pemahamanBermakna = `Kewirausahaan dan keahlian kerja (${inferredTopic}) berakar pada kepekaan membaca kebutuhan masyarakat; inovasi sejati tidak hanya mengejar profit, tetapi juga menciptakan nilai tambah dan kebermanfaatan sosial.`;
  } else {
    pemahamanBermakna = `Penguasaan mendalam atas materi ${inferredTopic} melatih daya nalar kritis dan kebijaksanaan kontekstual murid untuk mengurai persoalan nyata serta memberikan kontribusi solutif di lingkungannya.`;
  }

  // 2. Pertanyaan Pemantik HOTS (3 Butir Esensial C4 - C6)
  let pertanyaanPemantik: string[] = [];
  if (isLanguage) {
    pertanyaanPemantik = [
      `Bagaimana nilai moral dan pesan yang tersirat dalam ${inferredTopic} mampu merefleksikan dinamika kehidupan sosial yang kita saksikan sehari-hari di sekitar kita?`,
      `Mengapa cara kita menyusun argumen dan memilih media komunikasi sangat menentukan apakah gagasan kita dapat diterima atau justru memicu kesalahpahaman?`,
      `Karya kreatif multimodal apa (video pendek, podcast naratif, atau komik strip) yang dapat kalian ciptakan untuk mengampanyekan pesan positif dari topik ini kepada generasi sebaya?`,
    ];
  } else if (isMath) {
    pertanyaanPemantik = [
      `Bagaimana data dan pemodelan matematis pada ${inferredTopic} membantu kita membedakan antara fakta riil di masyarakat dengan opini atau asumsi yang keliru?`,
      `Mengapa kesalahan kecil dalam perhitungan atau interpretasi data dapat berdampak fatal dalam perencanaan finansial, sains, maupun kebijakan publik?`,
      `Bagaimanakah kalian dapat merancang solusi nyata berbasis perhitungan matematis untuk mengoptimalkan efisiensi sumber daya di lingkungan sekolah atau tempat tinggal?`,
    ];
  } else if (isScience) {
    pertanyaanPemantik = [
      `Gejala atau bukti nyata apa di lingkungan tempat tinggal kita yang menunjukkan langsung berlakunya prinsip ilmiah ${inferredTopic}?`,
      `Bagaimana campur tangan aktivitas manusia selama ini memengaruhi siklus alam terkait konsep ini, dan apa risiko jangka panjangnya bagi generasi mendatang?`,
      `Inovasi sederhana atau eksperimen ramah lingkungan apa yang dapat kalian uji coba untuk menjawab persoalan riil terkait topik ini di sekitar kita?`,
    ];
  } else if (isSocial || isCivic) {
    pertanyaanPemantik = [
      `Faktor struktural dan budaya apa yang sesungguhnya memicu dinamika/masalah terkait ${inferredTopic} di tengah masyarakat kita saat ini?`,
      `Bagaimana kita dapat mendudukkan perbedaan kepentingan dan pandangan sosial secara berkesadaran (mindful) tanpa mengorbankan prinsip keadilan serta persatuan?`,
      `Aksi kolaboratif berkesinambungan apa yang dapat kalian rintis di tingkat kelas atau komunitas lokal untuk mewujudkan transformasi sosial yang positif?`,
    ];
  } else if (isInformatics) {
    pertanyaanPemantik = [
      `Bagaimana logika algoritma dan berpikir komputasional pada ${inferredTopic} mempermudah kita membedah masalah yang tampak sangat rumit?`,
      `Dilema etika atau keamanan siber apa yang paling krusial diantisipasi saat kita mengembangkan atau memanfaatkan teknologi ini?`,
      `Purwarupa produk digital atau program kreatif apa yang dapat kelompokmu kembangkan untuk memecahkan kebutuhan harian di sekolah?`,
    ];
  } else {
    pertanyaanPemantik = [
      `Bagaimanakah keterkaitan langsung antara konsep ${inferredTopic} dengan peristiwa atau tantangan nyata yang kalian temui dalam kehidupan sehari-hari?`,
      `Mengapa pemahaman mendalam tentang materi ini menjadi bekal penting dalam kehidupan masa kini dan masa depan kalian?`,
      `Karya kreatif, inovasi, atau aksi nyata apa yang dapat tim Anda rancang untuk menyelesaikan persoalan terkait topik ini di lingkungan sekitar?`,
    ];
  }

  // 3. Diferensiasi Pembelajaran & Sarana
  let diferensiasiKonten = '';
  let diferensiasiProses = '';
  let diferensiasiProduk = '';
  let saranaPrasarana = '';

  if (isLanguage) {
    diferensiasiKonten = `Ragam bahan ajar multimodal: Murid visual diberikan infografis struktur teks dan peta konsep beranotasi; murid auditori menyimak siniar/rekaman audio dramatisasi narasi; murid kinestetik mengeksplorasi kartu kalimat interaktif dan observasi artefak lingkungan.`;
    diferensiasiProses = `Scaffolding berjenjang: Murid kategori 'Baru Memulai' didampingi intensif dengan lembar panduan kalimat pemantik (sentence starter); murid 'Cakap' berdiskusi mandiri dalam kelompok investigasi teks; murid 'Mahir' memimpin sesi kritik sastra sebaya dan eksplorasi teks kompleks.`;
    diferensiasiProduk = `Pilihan medium unjuk karya bermakna: Murid dapat memilih menyusun infografis digital (Canva), memproduksi siniar narasi audio/reels pendek berdurasi 2 menit, menerbitkan komik strip digital, atau menyajikan pementasan monolog/deklamasi ekspresif.`;
    saranaPrasarana = `Proyektor LCD, gawai/laptop murid, perpustakaan digital/antologi teks, aplikasi desain (Canva/CapCut), papan ide fisik/sticky notes, dan ruang kelas yang ditata fleksibel.`;
  } else if (isMath) {
    diferensiasiKonten = `Materi berjenjang konkret-piktorial-abstrak: Murid visual mengkaji grafik diagram interaktif dan manipulatif digital; murid kinestetik memanfaatkan benda konkret/kartu data riil di kelas; murid analitis menelaah studi kasus numerasi terbuka.`;
    diferensiasiProses = `Pendampingan bertingkat: Murid 'Baru Memulai' dibimbing dengan panduan kalkulasi berpetunjuk visual langkah-demi-langkah; murid 'Cakap' memecahkan tantangan studi kasus kontekstual; murid 'Mahir' merancang model matematika sendiri dan bertindak sebagai konsultan numerasi sebaya.`;
    diferensiasiProduk = `Pilihan karya hasil analisis: Infografis visual ringkasan data, laporan investigasi numerasi komparatif, purwarupa grafik interaktif (GeoGebra/Google Sheets), atau presentasi video tutorial pemecahan masalah.`;
    saranaPrasarana = `Perangkat laptop/smartphone, lembar aktivitas inkuiri data, kalkulator ilmiah/aplikasi GeoGebra, proyektor, papan pajang hasil investigasi kelompok.`;
  } else if (isScience) {
    diferensiasiKonten = `Media multi-modal bertingkat: Murid visual menyimak simulasi animasi interaktif (PhET) dan diagram alur; murid auditori mendengarkan rekaman wawancara ahli/siniar sains; murid kinestetik melakukan eksperimen mini langsung menggunakan bahan ramah lingkungan di laboratorium/halaman sekolah.`;
    diferensiasiProses = `Scaffolding inkuiri: Murid 'Baru Memulai' dipandu dengan lembar kerja terstruktur berisi variabel terbimbing; murid 'Cakap' merancang hipotesis dan prosedur pengujian secara kolaboratif; murid 'Mahir' melakukan analisis variasi data lanjutan dan menganalisis anomali eksperimen.`;
    diferensiasiProduk = `Karya saintifik fleksibel: Laporan mini riset berformat infografis poster, video dokumenter eksperimen 3 menit, maket purwarupa model fisik dari bahan daur ulang, atau artikel ilmiah populer.`;
    saranaPrasarana = `Alat dan bahan percobaan ramah lingkungan, kit sains sederhana, sensor/gawai murid, proyektor LCD, aplikasi simulasi sains, dan spesimen lingkungan sekitar.`;
  } else {
    diferensiasiKonten = `Penyediaan media multi-modal bertingkat: Teks bacaan berjenjang (ringkas vs mendalam), infografis visual tematik, audio penjelasan konsep, serta studi kasus riil yang berakar pada kehidupan masyarakat lokal.`;
    diferensiasiProses = `Scaffolding bertingkat: Kelompok 'Baru Memulai' mendapatkan fasilitasi langsung guru melalui pertanyaan penuntun; kelompok 'Cakap' mengeksplorasi studi kasus kelompok secara mandiri; kelompok 'Mahir' meneliti sudut pandang kritis alternatif dan menjadi mentor sebaya.`;
    diferensiasiProduk = `Kebebasan ekspresi karya kontekstual: Desain poster kampanye digital, rekaman siniar/video edukasi berdurasi 2 menit, presentasi purwarupa visual/maket, atau penulisan esai reflektif tematik.`;
    saranaPrasarana = `Papan pajang kelas (Sticky Board), gawai/laptop murid, proyektor, lembar inkuiri kolaboratif, serta sumber belajar lingkungan nyata di sekeliling sekolah.`;
  }

  // 4. Profil Murid (Minat, Cara Belajar, Lingkungan)
  let profilMinat = 'Media sosial, audio visual & musik, sains terapan, desain grafis/fotografi, game edukatif, dan kewirausahaan lokal.';
  let profilCaraBelajar = 'Visual spasial, diskusi kelompok terarah, kinestetik (praktik langsung), dan eksplorasi mandiri berbasis proyek.';
  let profilLingkungan = 'Kawasan permukiman masyarakat dinamis, dekat sentra kegiatan warga/UMKM, dan lingkungan alam sekitar satuan pendidikan.';

  if (isLanguage) {
    profilMinat = 'Membaca komik/cerita fiksi, media sosial (Instagram/TikTok), pembuatan konten video, siniar naratif, dan musik.';
    profilCaraBelajar = 'Visual dan auditori, diskusi kolaboratif kelompok heterogen, menyimak cerita, dan berekspresi bebas melalui tulisan multimodal.';
    profilLingkungan = 'Masyarakat dengan kekayaan tradisi lisan, kearifan lokal daerah, serta interaksi sosial warga yang guyub.';
  } else if (isMath) {
    profilMinat = 'Game strategi, teka-teki logika, teknologi komputer, analisis tren media sosial, dan kegiatan wirausaha muda.';
    profilCaraBelajar = 'Visual diagramatis, penalaran bertahap, eksplorasi pola hands-on, dan pemecahan masalah berbasis skenario riil.';
    profilLingkungan = 'Sentra aktivitas perdagangan/pasar tradisional, lingkungan keluarga wirausaha, dan sentra industri kreatif.';
  } else if (isScience) {
    profilMinat = 'Eksperimen sains, hewan/tumbuhan, isu kelestarian alam dan lingkungan, fotografi alam, serta teknologi ramah lingkungan.';
    profilCaraBelajar = 'Kinestetik aktif, observasi lapangan langsung, inkuiri laboratorium, serta simulasi digital interaktif.';
    profilLingkungan = 'Kawasan ekosistem lokal (pesisir pantai, perdesaan agraris persawahan, perbukitan/pegunungan, atau taman kota).';
  } else if (isSocial || isCivic) {
    profilMinat = 'Diskusi isu aktual/berita viral, fotografi humaniora, aksi sosial kepemudaan, sejarah lokal, dan organisasi sekolah.';
    profilCaraBelajar = 'Diskusi dialogis dua arah, bermain peran (role-playing), studi kasus kontekstual, dan wawancara lapangan.';
    profilLingkungan = 'Masyarakat heterogen dengan beragam latar belakang sosial ekonomi, budaya tradisi, serta dinamika perkotaan/pedesaan.';
  }

  // 5. 8 Dimensi Profil Lulusan (DPL)
  let selectedDpl: number[] = [3, 4, 5, 8];
  let alasanDpl = '';

  if (isLanguage) {
    selectedDpl = [3, 4, 5, 8];
    alasanDpl = `Menguatkan Penalaran Kritis (DPL 3) dalam membedah makna teks, Kreativitas (DPL 4) dalam merancang karya multimodal, Kolaborasi (DPL 5) saat investigasi kelompok, dan Komunikasi (DPL 8) dalam mempresentasikan karya di depan audiens.`;
  } else if (isMath) {
    selectedDpl = [3, 4, 6, 8];
    alasanDpl = `Mengasah Penalaran Kritis (DPL 3) melalui pemodelan logis, Kreativitas (DPL 4) mencari ragam strategi penyelesaian, Kemandirian (DPL 6) dalam ketekunan berhitung, dan Komunikasi (DPL 8) dalam menyajikan argumen berbasis data.`;
  } else if (isScience) {
    selectedDpl = [1, 3, 5, 7];
    alasanDpl = `Menumbuhkan Keimanan & Ketakwaan (DPL 1) atas keteraturan ciptaan Tuhan, Penalaran Kritis (DPL 3) dalam inkuiri sains, Kolaborasi (DPL 5) saat eksperimen tim, dan Kesehatan (DPL 7) melalui kepedulian pada ekologi lingkungan hidup.`;
  } else if (isSocial) {
    selectedDpl = [2, 3, 5, 8];
    alasanDpl = `Memperkokoh Kewargaan (DPL 2) terhadap isu sosial masyarakat, Penalaran Kritis (DPL 3) dalam membedah relasi sebab-akibat, Kolaborasi (DPL 5) saat investigasi bersama, dan Komunikasi (DPL 8) dalam merumuskan advokasi solutif.`;
  } else if (isCivic) {
    selectedDpl = [1, 2, 3, 5];
    alasanDpl = `Menanamkan Ketakwaan & Integritas (DPL 1), Kewargaan (DPL 2) cinta tanah air dan Bhinneka Tunggal Ika, Penalaran Kritis (DPL 3) menganalisis hak-kewajiban, dan Kolaborasi (DPL 5) dalam semangat gotong royong.`;
  } else if (isSport) {
    selectedDpl = [5, 6, 7, 8];
    alasanDpl = `Mengedepankan Kesehatan raga (DPL 7), Kemandirian (DPL 6) dalam kedisiplinan berlatih, Kolaborasi (DPL 5) dalam sportivitas regu, dan Komunikasi (DPL 8) dalam koordinasi taktis.`;
  } else if (isArt) {
    selectedDpl = [2, 3, 4, 8];
    alasanDpl = `Mengembangkan Kreativitas (DPL 4) orisinalitas unjuk seni, Kewargaan (DPL 2) pelestarian seni budaya bangsa, Penalaran Kritis (DPL 3) dalam apresiasi estetika, dan Komunikasi (DPL 8) melalui pesan artistik.`;
  } else {
    selectedDpl = [3, 4, 5, 8];
    alasanDpl = `CP ini menuntut penguatan sinergis antara Penalaran Kritis (DPL 3), Kreativitas (DPL 4), Kolaborasi kelompok (DPL 5), dan Komunikasi artikulatif (DPL 8).`;
  }

  return {
    topikSaran: inferredTopic,
    elemenCP: inferredElemen,
    pemahamanBermakna,
    pertanyaanPemantik,
    diferensiasiKonten,
    diferensiasiProses,
    diferensiasiProduk,
    saranaPrasarana,
    profilMurid: {
      minat: profilMinat,
      caraBelajar: profilCaraBelajar,
      lingkungan: profilLingkungan,
    },
    selectedDpl,
    alasanDpl,
  };
}
