import React, { useState, useRef } from 'react';
import {
  RPPData,
  LKPDData,
  RefleksiMuridData,
  RefleksiGuruData,
  DiferensiasiPembelajaran,
  BahanAjarData,
  InstrumenAsesmenData,
  WaktuAlurM3,
} from '../types/rpp';
import { DPL_LIST } from '../data/dplData';
import { P3_LIST, mapDplToP3 } from '../data/p3Data';
import { DEFAULT_LOGO_SEKOLAH, DEFAULT_LOGO_PEMDA } from '../data/defaultLogos';
import { KELAS_FASE_OPTIONS } from '../data/kelasData';
import { DraftManagerModal } from './DraftManagerModal';
import {
  Printer,
  Copy,
  Check,
  Edit3,
  Wand2,
  FileDown,
  FileSpreadsheet,
  Loader2,
  FileCheck,
  AlertCircle,
  Building2,
  Sparkles,
  Upload,
  X,
  RotateCcw,
  FileText,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Lightbulb,
  HelpCircle,
  SlidersHorizontal,
  Layers,
  ListChecks,
  FolderOpen,
  Timer,
  BookMarked,
  Bookmark,
  Compass,
} from 'lucide-react';
import { exportToWord, exportToExcel, downloadMarkdown, rppToMarkdown, downloadAsPDF, generateGeminiPrompt } from '../utils/exportUtils';
import { webhookService } from '../services/webhookService';

export const getDefaultBahanAjar = (rpp: RPPData): BahanAjarData => {
  if (rpp.bahanAjar) return rpp.bahanAjar;
  return {
    judulMateri: `Materi Esensial: ${rpp.identitas.topik}`,
    ringkasanMateri: `Pembelajaran mengenai ${rpp.identitas.topik} menekankan pada pemahaman holistik atas prinsip dasar, keterkaitan kausalitas fenomena, dan relevansi penerapannya dalam kehidupan bermasyarakat. Peserta didik diajak tidak sekadar mengingat teori, melainkan menalar secara mendalam bagaimana konsep ini bekerja dalam ekosistem nyata dan dapat menjadi instrumen untuk memecahkan persoalan kontekstual secara berkesadaran, bermakna, dan menyenangkan.`,
    poinKunci: [
      `Konsep fundamental dan karakteristik utama dari ${rpp.identitas.topik}.`,
      'Korelasi antara teori keilmuan dengan fenomena kontekstual di lingkungan sekitar peserta didik.',
      'Penerapan etika, penalaran kritis, dan inovasi solutif dalam pemanfaatan ilmu pengetahuan.',
    ],
    glosarium: [
      {
        istilah: 'Mindful Learning',
        definisi: 'Pembelajaran berkesadaran penuh yang melibatkan pemusatan perhatian, rasa ingin tahu alami, dan kesadaran diri.',
      },
      {
        istilah: 'Meaningful Learning',
        definisi: 'Pembelajaran bermakna yang mengaitkan pengetahuan baru dengan struktur kognitif dan konteks kehidupan nyata peserta didik.',
      },
      {
        istilah: 'Scaffolding',
        definisi: 'Bentuk dukungan terstruktur berjenjang yang diberikan pendidik dan dikurangi bertahap seiring bertambahnya kemandirian murid.',
      },
      {
        istilah: 'HOTS (Higher-Order Thinking)',
        definisi: 'Kemampuan berpikir tingkat tinggi mencakup analisis (C4), evaluasi (C5), dan kreasi inovatif (C6).',
      },
    ],
    daftarPustaka: [
      'Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP). (2024). Panduan Pembelajaran dan Asesmen Kurikulum Merdeka. Jakarta: Kemendikbudristek.',
      `Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2024). Buku Panduan Guru & Siswa: ${rpp.identitas.mapel} ${rpp.identitas.kelas}. Jakarta: Pusat Perbukuan.`,
      'Fullan, M., Quinn, J., & McEachen, J. (2018). Deep Learning: Engage the World Change the World. Corwin Press.',
    ],
  };
};

export const getDefaultInstrumenAsesmen = (rpp: RPPData): InstrumenAsesmenData => {
  if (rpp.instrumenAsesmen) return rpp.instrumenAsesmen;
  return {
    soalDiagnostikAwal: [
      {
        nomor: 1,
        tipe: 'Diagnostik',
        pertanyaan: `Pernahkah Anda mengamati atau mengalami langsung fenomena terkait ${rpp.identitas.topik} di lingkungan sekitar Anda? Ceritakan secara singkat pengalaman atau pengamatan Anda.`,
        kunciJawaban: 'Jawaban terbuka berbasis pengalaman autentik murid. Dinilai berdasarkan kepekaan konteks dan kesadaran awal.',
        pedomanSkor: 'Skor 1-4 berdasarkan kejelasan deskripsi dan relevansi fenomena.',
      },
      {
        nomor: 2,
        tipe: 'Diagnostik',
        pertanyaan: `Menurut pemahaman Anda saat ini, mengapa topik ${rpp.identitas.topik} penting untuk dipelajari dan bagaimana dampaknya bagi kehidupan sehari-hari?`,
        kunciJawaban: 'Jawaban mencerminkan penalaran logis mengenai fungsi dan manfaat konsep dalam kehidupan nyata.',
        pedomanSkor: 'Skor 1-4 berdasarkan argumen logis dan kebermaknaan.',
      },
    ],
    soalFormatifSumatifHOTS: [
      {
        nomor: 1,
        tipe: 'Formatif',
        pertanyaan: `Analisis keterkaitan antara prinsip utama ${rpp.identitas.topik} dengan salah satu tantangan atau masalah nyata yang terjadi di daerah tempat tinggal Anda!`,
        kunciJawaban: 'Peserta didik mengidentifikasi masalah nyata, mengaitkannya dengan 2-3 konsep materi, dan menyajikan argumen kausalitas yang valid.',
        pedomanSkor: 'Rubrik 4 Skala: Baru Memulai (1), Berkembang (2), Cakap (3), Sangat Berkembang (4).',
      },
      {
        nomor: 2,
        tipe: 'Sumatif',
        pertanyaan: `Rancanglah sebuah solusi orisinal atau produk karya kreatif yang dapat membantu mengatasi tantangan terkait ${rpp.identitas.topik}! Jelaskan langkah konkret implementasinya!`,
        kunciJawaban: 'Rancangan memuat ide inovatif, kelayakan implementasi, kolaborasi tim, dan estimasi dampak positif bagi lingkungan sekitar.',
        pedomanSkor: 'Rubrik 4 Skala: Orisinalitas (25%), Kelayakan (25%), Kedalaman Analisis (25%), Kejelasan Paparan (25%).',
      },
    ],
    pedomanPenskoran: 'Skor Akhir = (Total Skor Perolehan / Total Skor Maksimal) x 100. Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): Minimal predikat "Cakap" (Skor >= 75).',
  };
};

export const getDefaultWaktuM3 = (rpp: RPPData): WaktuAlurM3 => {
  if (rpp.waktuAlurM3) return rpp.waktuAlurM3;
  return {
    memahamiMenit: 15,
    mengaplikasikanMenit: 55,
    merefleksikanMenit: 20,
  };
};

export const getDefaultLkpd = (rpp: RPPData): LKPDData => {
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
};

export const getDefaultRefleksiMurid = (rpp: RPPData): RefleksiMuridData => {
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
};

export const getDefaultRefleksiGuru = (rpp: RPPData): RefleksiGuruData => {
  if (rpp.refleksiGuru) return rpp.refleksiGuru;
  return {
    pertanyaanRefleksi: [
      'Apakah seluruh peserta didik menunjukkan keterlibatan berkesadaran (mindful engagement) dalam alur M3?',
      'Seberapa efektif diferensiasi konten, proses, dan produk dalam memfasilitasi keragaman gaya belajar siswa?',
      'Apakah asesmen formatif yang dilakukan mampu memotret penguasaan kompetensi bernalar kritis secara objektif?',
    ],
    tindakLanjut: `Memberikan pendampingan tambahan (remedial scaffolding) untuk peserta didik yang masih berproses pada kriteria baru memulai, serta memperkaya tantangan kontekstual (pengayaan) bagi murid yang telah mencapai tingkat sangat berkembang pada topik ${rpp.identitas.topik}.`,
  };
};

export const getDefaultDiferensiasi = (rpp: RPPData): DiferensiasiPembelajaran => {
  return {
    konten: rpp.diferensiasiPembelajaran?.konten || `Bahan ajar multi-modal: infografis ringkas, teks bacaan bertingkat, audio-visual interaktif, dan artefak/studi kasus riil terkait ${rpp.identitas.topik}.`,
    proses: rpp.diferensiasiPembelajaran?.proses || 'Scaffolding bertingkat: pendampingan intensif bagi murid yang baru memulai, bimbingan berkala bagi murid cakap, dan tantangan mandiri serta mentoring sebaya bagi murid mahir.',
    produk: rpp.diferensiasiPembelajaran?.produk || 'Pilihan unjuk karya sesuai minat: poster infografis digital/manual, siniar (podcast)/video pendek, esai reflektif, atau peragaan purwarupa/simulasi.',
  };
};

interface OfficialTableViewProps {
  rpp: RPPData;
  onUpdateRpp: (updated: RPPData) => void;
  onOpenRefine: (sectionName: string, content: any) => void;
  onOpenGeminiPrompt?: () => void;
}

export const OfficialTableView: React.FC<OfficialTableViewProps> = ({
  rpp,
  onUpdateRpp,
  onOpenRefine,
  onOpenGeminiPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const logoKiriInputRef = useRef<HTMLInputElement>(null);
  const logoKananInputRef = useRef<HTMLInputElement>(null);

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>, position: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const currentKop = rpp.kopSekolah || {
          tampilkanKop: true,
          namaDinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
          namaSekolah: rpp.identitas.satuanPendidikan || 'SEKOLAH PENGGERAK',
          alamatSekolah: '',
          kontakSekolah: '',
        };
        onUpdateRpp({
          ...rpp,
          kopSekolah: {
            ...currentKop,
            [position === 'kiri' ? 'logoKiri' : 'logoKanan']: dataUrl,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = (position: 'kiri' | 'kanan') => {
    const currentKop = rpp.kopSekolah || {
      tampilkanKop: true,
      namaDinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      namaSekolah: rpp.identitas.satuanPendidikan || 'SEKOLAH PENGGERAK',
      alamatSekolah: '',
      kontakSekolah: '',
    };
    onUpdateRpp({
      ...rpp,
      kopSekolah: {
        ...currentKop,
        [position === 'kiri' ? 'logoKiri' : 'logoKanan']: undefined,
      },
    });
  };

  const logExportActivity = (format: string) => {
    webhookService.logActivity({
      actionType: 'EXPORT_DOC',
      subject: rpp.identitas.mapel,
      gradeLevel: `${rpp.identitas.kelas} (${rpp.identitas.fase || '-'})`,
      details: `Ekspor dokumen RPP format ${format}: "${rpp.identitas.topik}"`,
      schoolName: rpp.identitas.satuanPendidikan,
      status: 'SUCCESS',
    });
  };

  const handleCopyMarkdown = () => {
    const text = rppToMarkdown(rpp);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyGeminiPrompt = () => {
    const prompt = generateGeminiPrompt(rpp);
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfSuccess(false);
    setPrintNotice(null);
    const fileName = `RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.pdf`;

    try {
      await downloadAsPDF(documentRef.current, fileName, (status) => {
        setPdfProgressText(status);
      });
      setPdfSuccess(true);
      logExportActivity('PDF Resmi A4');
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setPrintNotice('Gagal mengunduh PDF secara otomatis. Silakan gunakan tombol "Cetak Dialog" untuk menyimpan sebagai PDF melalui peramban.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  const handlePrintDialog = () => {
    logExportActivity('Cetak / Print Dialog');
    setShowPrintModal(true);
  };

  const executeBrowserPrint = () => {
    setShowPrintModal(false);
    window.focus();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const isDplChecked = (id: number) => {
    return rpp.dplTerpilih?.some((d) => d.id === id);
  };

  const toggleDpl = (id: number, nama: string) => {
    const current = rpp.dplTerpilih || [];
    const exists = current.some((d) => d.id === id);
    let updated;
    if (exists) {
      updated = current.filter((d) => d.id !== id);
    } else {
      updated = [...current, { id, nama, alasan: 'Penguatan kompetensi esensial' }];
    }
    onUpdateRpp({
      ...rpp,
      dplTerpilih: updated,
    });
  };

  const kop = rpp.kopSekolah || {
    tampilkanKop: true,
    namaDinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    namaSekolah: rpp.identitas.satuanPendidikan || 'SEKOLAH PENGGERAK',
    alamatSekolah: 'Jl. Pendidikan Nasional No. 1',
    kontakSekolah: 'Telp: (021) 1234567 • Email: sekolah@sch.id',
  };

  const pengesahan = rpp.pengesahan || {
    tempatPenetapan: 'Kota',
    tanggalPenetapan: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
    namaKepalaSekolah: 'Drs. H. Bambang Sudiro, M.Pd.',
    nipKepalaSekolah: '19720412 199802 1 004',
    namaGuru: rpp.identitas.nama || 'Nama Guru Pengampu',
    nipGuru: '19890615 201503 1 002',
  };

  const diferensiasi = getDefaultDiferensiasi(rpp);
  const lkpdData = getDefaultLkpd(rpp);
  const refleksiMuridData = getDefaultRefleksiMurid(rpp);
  const refleksiGuruData = getDefaultRefleksiGuru(rpp);
  const bahanAjarData = getDefaultBahanAjar(rpp);
  const instrumenData = getDefaultInstrumenAsesmen(rpp);
  const waktuM3 = getDefaultWaktuM3(rpp);
  const p3List = rpp.dimensiP3 && rpp.dimensiP3.length > 0 ? rpp.dimensiP3 : mapDplToP3(rpp.dplTerpilih?.map((d) => d.id) || []);

  const pemantikList: string[] = (() => {
    if (Array.isArray(rpp.pertanyaanPemantik) && rpp.pertanyaanPemantik.length > 0) {
      return rpp.pertanyaanPemantik;
    }
    if (typeof (rpp as any).pertanyaanPemantik === 'string' && (rpp as any).pertanyaanPemantik.trim()) {
      return (rpp as any).pertanyaanPemantik.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    return [
      `Mengapa pemahaman tentang ${rpp.identitas.topik} sangat penting dalam menyikapi persoalan di lingkungan sekitar kita?`,
      `Bagaimana keterkaitan konsep materi ini dengan fenomena nyata yang dihadapi peserta didik dalam kehidupan sehari-hari?`,
      `Karya atau aksi nyata apa yang dapat tim Anda ciptakan untuk memberikan dampak positif berkelanjutan?`,
    ];
  })();

  return (
    <div className="space-y-5">
      {/* Action Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
            Format: Modul Ajar Resmi BSKAP (6 Halaman Lengkap + Bahan Bacaan & Glosarium)
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
              isEditing
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Selesai Edit' : 'Edit Konten'}
          </button>
          <button
            type="button"
            onClick={() => setShowDraftModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Kelola & Buka Draft RPP Tersimpan"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
            Draft RPP
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Copy Gemini Prompt */}
          <button
            type="button"
            onClick={handleCopyGeminiPrompt}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold flex items-center gap-1.5 transition shadow-2xs"
            title="Salin Master Prompt Gemini untuk menghasilkan berkas DOC dan EXCEL"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
            {copiedPrompt ? 'Master Prompt Tersalin!' : 'Salin Master Prompt (DOC & Excel)'}
          </button>

          {/* Copy Markdown Text */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Teks'}
          </button>

          {/* Unduh Word */}
          <button
            type="button"
            onClick={() => {
              logExportActivity('Word (.doc)');
              exportToWord(rpp);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-medium flex items-center gap-1.5 transition shadow-2xs"
            title="Unduh format Microsoft Word (.doc) lengkap dengan Kop & TTD"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            Word (.doc)
          </button>

          {/* Unduh Excel */}
          <button
            type="button"
            onClick={() => {
              logExportActivity('Excel (.xls)');
              exportToExcel(rpp);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-medium flex items-center gap-1.5 transition shadow-2xs"
            title="Unduh seluruh struktur RPP & matriks rubrik penilaian ke format Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Excel (.xls)
          </button>

          {/* Unduh Markdown */}
          <button
            type="button"
            onClick={() => downloadMarkdown(rpp)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            Unduh (.md)
          </button>

          {/* Download as PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
              pdfSuccess
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-75'
            }`}
            title="Unduh dokumen RPP sebagai berkas PDF A4 berkualitas tinggi (3 Halaman rapi)"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{pdfProgressText || 'Membuat PDF...'}</span>
              </>
            ) : pdfSuccess ? (
              <>
                <FileCheck className="w-3.5 h-3.5 text-white" />
                <span>PDF Terunduh!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span>Unduh PDF (.pdf)</span>
              </>
            )}
          </button>

          {/* Print Dialog Button */}
          <button
            type="button"
            onClick={handlePrintDialog}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 border border-slate-900 text-white font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Buka dialog cetak peramban untuk cetak langsung ke printer fisik atau Simpan PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-200" />
            <span>Cetak Dialog</span>
          </button>
        </div>
      </div>

      {/* Progress banner during PDF generation */}
      {isGeneratingPdf && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 animate-fadeIn print:hidden">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <span className="font-semibold">
              Menyiapkan dokumen PDF standar A4... ({pdfProgressText})
            </span>
            <span className="text-emerald-600 text-[11px]">Format 3 halaman A4 resmi</span>
          </div>
        </div>
      )}

      {/* Print notice helper if needed */}
      {printNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-2.5 text-xs text-amber-900 animate-fadeIn print:hidden">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{printNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setPrintNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* DOCUMENT WRAPPER (Captured for PDF and Printed) */}
      <div ref={documentRef} id="official-rpp-document" className="space-y-6 max-w-5xl mx-auto">
        
        {/* ========================================================================= */}
        {/* HALAMAN 1: KOP SEKOLAH, IDENTITAS, PROFIL MURID, DPL, & DESAIN PEMBELAJARAN */}
        {/* ========================================================================= */}
        <div className="pdf-page print-page bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
          
          {/* KOP SEKOLAH RESMI */}
          {kop.tampilkanKop && (
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                {/* LOGO SEKOLAH (KIRI) */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-white">
                    <img
                      src={kop.logoKiri || DEFAULT_LOGO_SEKOLAH}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                    />
                    {/* Hover Upload Overlay */}
                    <div className="absolute inset-0 bg-slate-950/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer print:hidden">
                      <button
                        type="button"
                        onClick={() => logoKiriInputRef.current?.click()}
                        className="text-[8px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-1 py-0.5 rounded shadow-2xs cursor-pointer"
                        title="Unggah Logo Sekolah"
                      >
                        Ganti
                      </button>
                      {kop.logoKiri && (
                        <button
                          type="button"
                          onClick={() => handleResetLogo('kiri')}
                          className="text-[7px] text-slate-200 hover:text-white underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <input
                      ref={logoKiriInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUploadLogo(e, 'kiri')}
                    />
                  </div>
                </div>

                {/* TEKS KOP SURAT */}
                <div className="flex-1 text-center">
                  {isEditing ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        className="text-xs font-bold uppercase text-center w-full border border-slate-300 p-0.5 rounded"
                        value={kop.namaDinas}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            kopSekolah: { ...kop, namaDinas: e.target.value },
                          })
                        }
                        placeholder="Nama Dinas / Yayasan"
                      />
                      <input
                        type="text"
                        className="text-sm font-black uppercase text-center w-full border border-slate-300 p-0.5 rounded"
                        value={kop.namaSekolah}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            kopSekolah: { ...kop, namaSekolah: e.target.value },
                          })
                        }
                        placeholder="Nama Satuan Pendidikan"
                      />
                      <input
                        type="text"
                        className="text-[10px] text-center w-full border border-slate-300 p-0.5 rounded"
                        value={kop.alamatSekolah}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            kopSekolah: { ...kop, alamatSekolah: e.target.value },
                          })
                        }
                        placeholder="Alamat Sekolah"
                      />
                      <input
                        type="text"
                        className="text-[10px] text-center w-full border border-slate-300 p-0.5 rounded"
                        value={kop.kontakSekolah}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            kopSekolah: { ...kop, kontakSekolah: e.target.value },
                          })
                        }
                        placeholder="Kontak, Telp, Website, Email"
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-800 leading-tight">
                        {kop.namaDinas}
                      </h4>
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-950 mt-0.5">
                        {kop.namaSekolah}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 leading-tight">
                        {kop.alamatSekolah}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">
                        {kop.kontakSekolah}
                      </p>
                    </>
                  )}
                </div>

                {/* LOGO PEMDA / DINAS (KANAN - MENGGANTIKAN BSKAP 2024) */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative group w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center p-0.5 rounded-lg bg-white">
                    <img
                      src={kop.logoKanan || DEFAULT_LOGO_PEMDA}
                      alt="Logo Pemda"
                      className="w-full h-full object-contain"
                    />
                    {/* Hover Upload Overlay */}
                    <div className="absolute inset-0 bg-slate-950/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer print:hidden">
                      <button
                        type="button"
                        onClick={() => logoKananInputRef.current?.click()}
                        className="text-[8px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-1 py-0.5 rounded shadow-2xs cursor-pointer"
                        title="Unggah Logo Pemda"
                      >
                        Ganti
                      </button>
                      {kop.logoKanan && (
                        <button
                          type="button"
                          onClick={() => handleResetLogo('kanan')}
                          className="text-[7px] text-slate-200 hover:text-white underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <input
                      ref={logoKananInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleUploadLogo(e, 'kanan')}
                    />
                  </div>
                </div>
              </div>

              {/* Upload Helper Banner in Edit Mode */}
              {isEditing && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 print:hidden bg-slate-50 p-2 rounded-lg">
                  <button
                    type="button"
                    onClick={() => logoKiriInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    Ganti Logo Kiri
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Mendukung berkas PNG, JPG, WebP, SVG
                  </span>
                  <button
                    type="button"
                    onClick={() => logoKananInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    Ganti Logo Kanan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Document Title Header */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-3">
            <h2 className="text-xs sm:text-sm font-black tracking-wide uppercase text-slate-950">
              Rencana Pelaksanaan Pembelajaran (RPP) Pembelajaran Mendalam
            </h2>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mt-0.5">
              Kurikulum Merdeka — Pendekatan Deep Learning (Mindful, Meaningful, & Joyful)
            </p>
            <div className="flex items-center justify-center gap-3 mt-1 text-[9px] sm:text-[10px] text-slate-500">
              <span>Alur M3: Memahami, Mengaplikasikan, Merefleksikan</span>
              <span>•</span>
              <span>Standar BSKAP Kemendikbudristek</span>
            </div>
          </div>

          {/* Master Table Page 1 */}
          <div className="border-2 border-slate-900 rounded-none overflow-hidden text-xs sm:text-xs text-slate-900">
            
            {/* ROW 1: IDENTITAS */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-center">
                Identitas
              </div>
              <div className="col-span-9 p-2.5 bg-white">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-600">Nama Guru : </span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={rpp.identitas.nama}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            identitas: { ...rpp.identitas, nama: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <span className="font-semibold">{rpp.identitas.nama}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">NIP Guru : </span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={pengesahan.nipGuru}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            pengesahan: { ...pengesahan, nipGuru: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <span className="font-semibold">{pengesahan.nipGuru || '-'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Satuan Pendidikan : </span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={rpp.identitas.satuanPendidikan || ''}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            identitas: { ...rpp.identitas, satuanPendidikan: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <span className="font-semibold">{rpp.identitas.satuanPendidikan || '-'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Kelas / Fase : </span>
                    {isEditing ? (
                      <div className="flex gap-1.5 mt-0.5">
                        <input
                          type="text"
                          className="border border-slate-300 px-1.5 py-0.5 rounded text-xs flex-1 bg-white"
                          value={rpp.identitas.kelas}
                          list="table-kelas-datalist"
                          onChange={(e) =>
                            onUpdateRpp({
                              ...rpp,
                              identitas: { ...rpp.identitas, kelas: e.target.value },
                            })
                          }
                          placeholder="Pilih atau ketik kelas..."
                        />
                        <select
                          className="border border-slate-300 bg-slate-50 text-[11px] rounded px-1 text-slate-700 max-w-[130px]"
                          value={KELAS_FASE_OPTIONS.some((o) => o.value === rpp.identitas.kelas) ? rpp.identitas.kelas : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              onUpdateRpp({
                                ...rpp,
                                identitas: { ...rpp.identitas, kelas: e.target.value },
                              });
                            }
                          }}
                        >
                          <option value="">Pilih Fase</option>
                          <optgroup label="PAUD / TK (Fondasi)">
                            {KELAS_FASE_OPTIONS.filter((o) => o.jenjang === 'TK').map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="SD / MI (Fase A, B, C)">
                            {KELAS_FASE_OPTIONS.filter((o) => o.jenjang === 'SD').map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="SMP / MTs (Fase D)">
                            {KELAS_FASE_OPTIONS.filter((o) => o.jenjang === 'SMP').map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="SMA / MA (Fase E & F)">
                            {KELAS_FASE_OPTIONS.filter((o) => o.jenjang === 'SMA').map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="SMK / MAK (Fase E & F)">
                            {KELAS_FASE_OPTIONS.filter((o) => o.jenjang === 'SMK').map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="SLB (Pendidikan Khusus)">
                            {KELAS_FASE_OPTIONS.filter((o) => o.jenjang === 'SLB').map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </optgroup>
                        </select>
                        <datalist id="table-kelas-datalist">
                          {KELAS_FASE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value} />
                          ))}
                        </datalist>
                      </div>
                    ) : (
                      <span className="font-semibold">
                        {rpp.identitas.kelas} {rpp.identitas.fase ? `• ${rpp.identitas.fase}` : ''}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Mata Pelajaran : </span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={rpp.identitas.mapel}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            identitas: { ...rpp.identitas, mapel: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <span className="font-semibold">{rpp.identitas.mapel}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Alokasi Waktu : </span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={rpp.identitas.alokasiWaktu || ''}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            identitas: { ...rpp.identitas, alokasiWaktu: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <span className="font-semibold">{rpp.identitas.alokasiWaktu || '2 x 45 Menit'}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-slate-600">Topik Materi : </span>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={rpp.identitas.topik}
                        onChange={(e) =>
                          onUpdateRpp({
                            ...rpp,
                            identitas: { ...rpp.identitas, topik: e.target.value },
                          })
                        }
                      />
                    ) : (
                      <span className="font-semibold">{rpp.identitas.topik}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: PROFIL MURID */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-center">
                Profil Murid
              </div>
              <div className="col-span-9 p-2.5 space-y-1.5 bg-white text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Minat : </span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                      value={rpp.profilMurid.minat}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          profilMurid: { ...rpp.profilMurid, minat: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <span>{rpp.profilMurid.minat}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Cara Belajar : </span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                      value={rpp.profilMurid.caraBelajar}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          profilMurid: { ...rpp.profilMurid, caraBelajar: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <span>{rpp.profilMurid.caraBelajar}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Lingkungan tempat tinggal : </span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                      value={rpp.profilMurid.lingkungan}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          profilMurid: { ...rpp.profilMurid, lingkungan: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <span>{rpp.profilMurid.lingkungan}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 3: IDENTIFIKASI DIMENSI PROFIL LULUSAN (8 BOXES) */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                Identifikasi
              </div>
              <div className="col-span-9 p-2.5 bg-white">
                <div className="font-bold text-slate-900 mb-1.5 text-xs">
                  Dimensi Profil Lulusan :
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {DPL_LIST.map((dpl) => {
                    const checked = isDplChecked(dpl.id);
                    return (
                      <div
                        key={dpl.id}
                        onClick={() => toggleDpl(dpl.id, dpl.nama)}
                        className={`border border-slate-900 p-1.5 flex flex-col justify-between min-h-[72px] cursor-pointer select-none transition ${
                          checked ? 'bg-emerald-50/60' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-black text-[10px] text-slate-900 uppercase">
                            {dpl.code}
                          </span>
                          <div
                            className={`w-4 h-4 border border-slate-900 flex items-center justify-center text-[11px] ${
                              checked ? 'bg-emerald-600 text-white font-bold' : 'bg-white'
                            }`}
                          >
                            {checked && '✓'}
                          </div>
                        </div>
                        <p className="text-[10px] font-semibold leading-tight text-slate-800 mt-1">
                          {dpl.nama}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Integrasi 6 Dimensi Profil Pelajar Pancasila (P3) */}
                <div className="mt-2.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      Integrasi Profil Pelajar Pancasila (P3):
                    </span>
                    <span className="text-[9px] text-slate-500 font-normal">
                      Selaras 8 Dimensi Profil Lulusan
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p3List.map((p3Name) => (
                      <span
                        key={p3Name}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        {p3Name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4: CAPAIAN PEMBELAJARAN (CP) & PERTANYAAN PEMANTIK HOTS */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <div>
                    Capaian
                    <br />
                    Pembelajaran (CP)
                    <br />
                    & Pemantik HOTS
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('Capaian Pembelajaran & Pemantik HOTS', {
                      elemenCP: rpp.elemenCP,
                      capaianPembelajaran: rpp.capaianPembelajaran,
                      pemahamanBermakna: rpp.pemahamanBermakna,
                      pertanyaanPemantik: pemantikList,
                    })}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan CP & HOTS"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                {/* Elemen & Rumusan CP */}
                <div className="p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      Elemen & Rumusan Capaian Pembelajaran (CP) BSKAP:
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Standar Kompetensi
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong className="text-slate-800">Elemen CP: </strong>
                    {isEditing ? (
                      <input
                        type="text"
                        className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                        value={rpp.elemenCP || ''}
                        onChange={(e) => onUpdateRpp({ ...rpp, elemenCP: e.target.value })}
                        placeholder="Elemen CP (misal: Membaca & Memirsa, Menulis Kreatif)"
                      />
                    ) : (
                      <span className="font-semibold text-emerald-900">{rpp.elemenCP || 'Pemahaman Konsep & Penalaran Kritis'}</span>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.capaianPembelajaran || ''}
                      onChange={(e) => onUpdateRpp({ ...rpp, capaianPembelajaran: e.target.value })}
                      placeholder="Rumusan Capaian Pembelajaran (CP) BSKAP..."
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px]">
                      {rpp.capaianPembelajaran || 'Peserta didik menganalisis konsep dan mengaplikasikan pengetahuan secara kontekstual untuk memecahkan persoalan nyata secara berkesadaran dan mandiri.'}
                    </p>
                  )}
                </div>

                {/* Pemahaman Bermakna (Big Idea) */}
                <div className="p-2.5 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Pemahaman Bermakna (Big Idea / Enduring Understanding):
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.pemahamanBermakna || ''}
                      onChange={(e) => onUpdateRpp({ ...rpp, pemahamanBermakna: e.target.value })}
                      placeholder="Gagasan esensial yang bermakna bagi kehidupan murid..."
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed italic text-[11px] border-l-2 border-amber-400 pl-2">
                      “{rpp.pemahamanBermakna || `Pembelajaran ${rpp.identitas.topik} memberikan pondasi berpikir kritis dan moralitas dalam menyikapi fenomena lingkungan sekitar.`}”
                    </p>
                  )}
                </div>

                {/* Pertanyaan Pemantik HOTS */}
                <div className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                      Pertanyaan Pemantik HOTS (Higher-Order Thinking Skills):
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                      Level C4 - C6
                    </span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded font-sans"
                      value={Array.isArray(rpp.pertanyaanPemantik) ? rpp.pertanyaanPemantik.join('\n') : (rpp.pertanyaanPemantik || '')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        onUpdateRpp({ ...rpp, pertanyaanPemantik: lines });
                      }}
                      placeholder="Satu pertanyaan HOTS per baris..."
                    />
                  ) : (
                    <ol className="list-decimal pl-4 space-y-1 text-slate-800 leading-relaxed text-[11px]">
                      {pemantikList.map((q, idx) => (
                        <li key={idx} className="font-medium text-slate-900">
                          {q}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

              </div>
            </div>

            {/* ROW 5: BLOK DIFERENSIASI PEMBELAJARAN & SARANA PRASARANA */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <div>
                    Diferensiasi
                    <br />
                    Pembelajaran
                    <br />
                    & Sarana
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('Diferensiasi Pembelajaran', diferensiasi)}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan Diferensiasi"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                {/* Diferensiasi Konten */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900">1. Diferensiasi Konten (Ragam Bahan Ajar)</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Kesiapan & Modalitas
                    </span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={diferensiasi.konten}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        diferensiasiPembelajaran: { ...diferensiasi, konten: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px]">
                      {diferensiasi.konten}
                    </p>
                  )}
                </div>

                {/* Diferensiasi Proses */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900">2. Diferensiasi Proses (Scaffolding & Bimbingan)</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                      Tingkat Pendampingan
                    </span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={diferensiasi.proses}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        diferensiasiPembelajaran: { ...diferensiasi, proses: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px]">
                      {diferensiasi.proses}
                    </p>
                  )}
                </div>

                {/* Diferensiasi Produk */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-900">3. Diferensiasi Produk (Pilihan Unjuk Karya)</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                      Minat & Ekspresi
                    </span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={diferensiasi.produk}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        diferensiasiPembelajaran: { ...diferensiasi, produk: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px]">
                      {diferensiasi.produk}
                    </p>
                  )}
                </div>

                {/* Sarana & Prasarana */}
                <div className="p-2.5 bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-0.5">Sarana & Prasarana Pembelajaran:</div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full"
                      value={rpp.saranaPrasarana || ''}
                      onChange={(e) => onUpdateRpp({ ...rpp, saranaPrasarana: e.target.value })}
                      placeholder="Media ajar, perangkat TIK, alat peraga, sumber belajar lingkungan..."
                    />
                  ) : (
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {rpp.saranaPrasarana || 'Media multi-modal (infografis/video), lembar kerja kontekstual, perangkat proyektor/TIK, serta lingkungan belajar autentik.'}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* ROW 6: DESAIN PEMBELAJARAN */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <span>Desain Pembelajaran</span>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('Desain Pembelajaran', rpp.desainPembelajaran)}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan dengan AI"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">Tujuan Pembelajaran</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.desainPembelajaran.tujuanPembelajaran}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          desainPembelajaran: {
                            ...rpp.desainPembelajaran,
                            tujuanPembelajaran: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed">
                      {rpp.desainPembelajaran.tujuanPembelajaran}
                    </p>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">Praktik Pedagogis</div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.desainPembelajaran.praktikPedagogis}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          desainPembelajaran: {
                            ...rpp.desainPembelajaran,
                            praktikPedagogis: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                      {rpp.desainPembelajaran.praktikPedagogis}
                    </p>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">Kemitraan Pembelajaran</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.desainPembelajaran.kemitraanPembelajaran}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          desainPembelajaran: {
                            ...rpp.desainPembelajaran,
                            kemitraanPembelajaran: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed">
                      {rpp.desainPembelajaran.kemitraanPembelajaran}
                    </p>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">Lingkungan Pembelajaran</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.desainPembelajaran.lingkunganPembelajaran}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          desainPembelajaran: {
                            ...rpp.desainPembelajaran,
                            lingkunganPembelajaran: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed">
                      {rpp.desainPembelajaran.lingkunganPembelajaran}
                    </p>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">Pemanfaatan Digital</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={rpp.desainPembelajaran.pemanfaatanDigital}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          desainPembelajaran: {
                            ...rpp.desainPembelajaran,
                            pemanfaatanDigital: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed">
                      {rpp.desainPembelajaran.pemanfaatanDigital}
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>

          <div className="text-right text-[10px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-200">
            Halaman 1 dari 5 — Dokumen Induk RPP Pembelajaran Mendalam BSKAP
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HALAMAN 2: PENGALAMAN BELAJAR (ALUR M3) & ASESMEN                        */}
        {/* ========================================================================= */}
        <div className="pdf-page print-page bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
          
          {/* Continuation Header Page 2 */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-3">
            <h3 className="text-xs sm:text-sm font-black uppercase text-slate-950">
              Pengalaman Belajar (Alur M3) & Asesmen Pembelajaran Mendalam
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
              Mata Pelajaran: {rpp.identitas.mapel} | Topik: {rpp.identitas.topik} | Kelas: {rpp.identitas.kelas}
            </p>
          </div>

          {/* Master Table Page 2 */}
          <div className="border-2 border-slate-900 rounded-none overflow-hidden text-xs sm:text-xs text-slate-900">
            
            {/* ROW 5: PENGALAMAN BELAJAR (M3) */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <div>
                    Pengalaman
                    <br />
                    Belajar (M3)
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('Pengalaman Belajar M3', rpp.pengalamanBelajar)}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan Pengalaman Belajar M3"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white">
                
                {/* M1: Memahami (Mindful) */}
                <div className="p-2.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                      Memahami (Mindful)
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Berkesadaran
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-relaxed text-[11px]">
                    {rpp.pengalamanBelajar.memahami.langkahLangkah.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* M2: Mengaplikasikan (Meaningful, Joyful) */}
                <div className="p-2.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                      Mengaplikasikan (Meaningful, Joyful)
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                      Bermakna & Menyenangkan
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-relaxed text-[11px]">
                    {rpp.pengalamanBelajar.mengaplikasikan.langkahLangkah.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* M3: Merefleksikan (Mindful, Meaningful) */}
                <div className="p-2.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600 inline-block"></span>
                      Merefleksikan (Mindful, Meaningful)
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                      Refleksi Mendalam
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-600 mb-0.5">
                    Guru memandu diskusi reflektif dengan pertanyaan:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-800 leading-relaxed text-[11px] mb-1.5">
                    {rpp.pengalamanBelajar.merefleksikan.pertanyaanRefleksi.map((q, idx) => (
                      <li key={idx} className="italic text-slate-900">“{q}”</li>
                    ))}
                  </ul>
                  {rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi && (
                    <p className="text-[10px] text-slate-600 border-l-2 border-sky-500 pl-2 py-0.2">
                      {rpp.pengalamanBelajar.merefleksikan.aktivitasRefleksi}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* ROW 6: ASESMEN */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <span>Asesmen</span>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('Asesmen', rpp.asesmen)}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan Asesmen"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">
                    Assessment of Learning (Awal)
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full text-xs p-1 border border-slate-300 rounded"
                      value={rpp.asesmen.awal}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          asesmen: { ...rpp.asesmen, awal: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed">{rpp.asesmen.awal}</p>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">
                    Assessment as Learning (Proses)
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full text-xs p-1 border border-slate-300 rounded"
                      value={rpp.asesmen.proses}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          asesmen: { ...rpp.asesmen, proses: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed">{rpp.asesmen.proses}</p>
                  )}
                </div>

                <div className="p-2.5">
                  <div className="font-bold text-slate-900 mb-0.5">
                    Assessment for Learning (Akhir)
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1 border border-slate-300 rounded"
                      value={rpp.asesmen.akhir}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          asesmen: { ...rpp.asesmen, akhir: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line">{rpp.asesmen.akhir}</p>
                  )}
                </div>

              </div>
            </div>

          </div>

          <div className="text-right text-[10px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-200">
            Halaman 2 dari 5 — Pengalaman Belajar (Alur M3) & Asesmen
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HALAMAN 3: RUBRIK PENILAIAN (4 SKALA BSKAP) & PENGESAHAN LENGKAP         */}
        {/* ========================================================================= */}
        <div className="pdf-page print-page bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
          
          {/* Header Page 3 */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-3">
            <h3 className="text-xs sm:text-sm font-black uppercase text-slate-950">
              Rubrik Penilaian (4 Skala Standar BSKAP) & Pengesahan
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
              Mata Pelajaran: {rpp.identitas.mapel} | Topik: {rpp.identitas.topik}
            </p>
          </div>

          {/* Rubrik Penilaian Table - table-fixed to guarantee zero horizontal overflow */}
          <div className="border-2 border-slate-900 w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-[10px] sm:text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900 font-bold text-slate-900 text-center">
                  <th className="p-2 border-r-2 border-slate-900 w-[20%] text-left">
                    Kriteria
                  </th>
                  <th className="p-2 border-r-2 border-slate-900 w-[20%]">
                    Baru Memulai
                  </th>
                  <th className="p-2 border-r-2 border-slate-900 w-[20%]">
                    Berkembang
                  </th>
                  <th className="p-2 border-r-2 border-slate-900 w-[20%]">
                    Cakap
                  </th>
                  <th className="p-2 w-[20%]">
                    Sangat Berkembang
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900 text-slate-800">
                {rpp.rubrikPenilaian?.map((rubrik, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="p-2 font-bold border-r-2 border-slate-900 bg-slate-50/70 leading-snug">
                      {rubrik.kriteria}
                    </td>
                    <td className="p-2 border-r-2 border-slate-900 leading-snug">
                      {rubrik.baruMemulai}
                    </td>
                    <td className="p-2 border-r-2 border-slate-900 leading-snug">
                      {rubrik.berkembang}
                    </td>
                    <td className="p-2 border-r-2 border-slate-900 leading-snug">
                      {rubrik.cakap}
                    </td>
                    <td className="p-2 leading-snug bg-emerald-50/20">
                      {rubrik.sangatBerkembang}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lembar Tanda Tangan Pengesahan Resmi (Lengkap NIP Guru & Kepala Sekolah) */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-6 text-xs text-slate-900">
            <div>
              <p className="text-slate-700">Mengetahui,</p>
              <p className="font-bold text-slate-950 mt-0.5 text-xs">Kepala Sekolah</p>
              <div className="h-16 flex items-center">
                <span className="text-[10px] text-slate-300 italic">TTD / Stempel Resmi</span>
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    className="border border-slate-300 p-0.5 rounded text-xs font-bold w-full"
                    value={pengesahan.namaKepalaSekolah}
                    onChange={(e) =>
                      onUpdateRpp({
                        ...rpp,
                        pengesahan: { ...pengesahan, namaKepalaSekolah: e.target.value },
                      })
                    }
                    placeholder="Nama Kepala Sekolah"
                  />
                  <input
                    type="text"
                    className="border border-slate-300 p-0.5 rounded text-[11px] w-full"
                    value={pengesahan.nipKepalaSekolah}
                    onChange={(e) =>
                      onUpdateRpp({
                        ...rpp,
                        pengesahan: { ...pengesahan, nipKepalaSekolah: e.target.value },
                      })
                    }
                    placeholder="NIP Kepala Sekolah"
                  />
                </div>
              ) : (
                <>
                  <p className="font-bold underline text-slate-950">
                    {pengesahan.namaKepalaSekolah || 'Drs. H. Bambang Sudiro, M.Pd.'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    NIP. {pengesahan.nipKepalaSekolah || '-'}
                  </p>
                </>
              )}
            </div>

            <div className="text-right">
              {isEditing ? (
                <div className="space-y-1">
                  <div className="flex gap-1 justify-end">
                    <input
                      type="text"
                      className="border border-slate-300 p-0.5 rounded text-xs text-right w-28"
                      value={pengesahan.tempatPenetapan}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          pengesahan: { ...pengesahan, tempatPenetapan: e.target.value },
                        })
                      }
                      placeholder="Tempat"
                    />
                    <span>,</span>
                    <input
                      type="text"
                      className="border border-slate-300 p-0.5 rounded text-xs text-right w-36"
                      value={pengesahan.tanggalPenetapan}
                      onChange={(e) =>
                        onUpdateRpp({
                          ...rpp,
                          pengesahan: { ...pengesahan, tanggalPenetapan: e.target.value },
                        })
                      }
                      placeholder="Tanggal"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-slate-700">
                  {pengesahan.tempatPenetapan || 'Ditetapkan'}, {pengesahan.tanggalPenetapan || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}

              <p className="font-bold text-slate-950 mt-0.5 text-xs">Guru Mata Pelajaran</p>
              <div className="h-16 flex items-center justify-end">
                <span className="text-[10px] text-slate-300 italic">TTD Guru Pengampu</span>
              </div>
              
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    className="border border-slate-300 p-0.5 rounded text-xs font-bold text-right w-full"
                    value={pengesahan.namaGuru || rpp.identitas.nama}
                    onChange={(e) =>
                      onUpdateRpp({
                        ...rpp,
                        pengesahan: { ...pengesahan, namaGuru: e.target.value },
                      })
                    }
                    placeholder="Nama Guru"
                  />
                  <input
                    type="text"
                    className="border border-slate-300 p-0.5 rounded text-[11px] text-right w-full"
                    value={pengesahan.nipGuru}
                    onChange={(e) =>
                      onUpdateRpp({
                        ...rpp,
                        pengesahan: { ...pengesahan, nipGuru: e.target.value },
                      })
                    }
                    placeholder="NIP Guru"
                  />
                </div>
              ) : (
                <>
                  <p className="font-bold underline text-slate-950">
                    {pengesahan.namaGuru || rpp.identitas.nama || 'Nama Guru Pengampu'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    NIP. {pengesahan.nipGuru || '-'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-400 mt-3 pt-1.5 border-t border-slate-200">
            Halaman 3 dari 5 — Rubrik Penilaian (4 Skala Standar BSKAP) & Pengesahan Resmi
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HALAMAN 4: LAMPIRAN 1 - LEMBAR KERJA PESERTA DIDIK (LKPD) TEMATIK        */}
        {/* ========================================================================= */}
        <div className="pdf-page print-page bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
          
          {/* Header Lampiran 1 */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-3">
            <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider mb-1">
              Lampiran 1 — Perangkat Asesmen Proses & Lembar Kerja Siswa
            </div>
            <h3 className="text-xs sm:text-sm font-black uppercase text-slate-950">
              Lembar Kerja Peserta Didik (LKPD) Pembelajaran Mendalam
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
              Topik: {rpp.identitas.topik} | Kelas / Fase: {rpp.identitas.kelas} {rpp.identitas.fase ? `• ${rpp.identitas.fase}` : ''}
            </p>
          </div>

          {/* Master Table LKPD */}
          <div className="border-2 border-slate-900 rounded-none overflow-hidden text-xs sm:text-xs text-slate-900">
            
            {/* ROW 1: IDENTITAS KELOMPOK / PESERTA DIDIK */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-center">
                Identitas Kelompok
              </div>
              <div className="col-span-9 p-2.5 bg-white text-xs space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-slate-600">Nama Anggota Kelompok:</span>
                    <p className="border-b border-dotted border-slate-400 pb-0.5 text-slate-500 italic mt-0.5">
                      1. ..................................................... 2. .....................................................
                    </p>
                    <p className="border-b border-dotted border-slate-400 pb-0.5 text-slate-500 italic mt-0.5">
                      3. ..................................................... 4. .....................................................
                    </p>
                  </div>
                  <div>
                    <p><span className="font-semibold text-slate-600">Mata Pelajaran:</span> {rpp.identitas.mapel}</p>
                    <p><span className="font-semibold text-slate-600">Kelas / Semester:</span> {rpp.identitas.kelas} / {rpp.identitas.semester || 'Ganjil'}</p>
                    <p><span className="font-semibold text-slate-600">Alokasi Waktu:</span> {rpp.identitas.alokasiWaktu || '2 x 45 Menit'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: JUDUL & TUJUAN AKTIVITAS */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <span>Judul & Tujuan</span>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('LKPD & Aktivitas', lkpdData)}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan LKPD"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 p-2.5 bg-white space-y-1.5 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-[11px] block">Aktivitas Belajar:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      className="border border-slate-300 px-1.5 py-0.5 rounded text-xs w-full mt-0.5"
                      value={lkpdData.judul}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        lkpd: { ...lkpdData, judul: e.target.value }
                      })}
                    />
                  ) : (
                    <span className="font-bold text-emerald-900">{lkpdData.judul}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700 text-[11px] block">Tujuan Pembelajaran:</span>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={lkpdData.tujuanAktivitas}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        lkpd: { ...lkpdData, tujuanAktivitas: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px]">{lkpdData.tujuanAktivitas}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 3: PETUNJUK KERJA & STUDI KASUS TANTANGAN */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                Petunjuk & Kasus
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                {/* Petunjuk Kerja */}
                <div className="p-2.5 space-y-1">
                  <div className="font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                    Petunjuk Pengerjaan Proyek / Eksplorasi:
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-800 text-[11px] leading-relaxed">
                    {lkpdData.petunjukKerja.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Studi Kasus Tantangan Nyata */}
                <div className="p-2.5 bg-amber-50/30 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      Tantangan Kontekstual / Studi Kasus Riil:
                    </span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      Problem-Based Learning
                    </span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={lkpdData.studiKasusTantangan}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        lkpd: { ...lkpdData, studiKasusTantangan: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px] italic border-l-2 border-amber-500 pl-2">
                      “{lkpdData.studiKasusTantangan}”
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* ROW 4: PERTANYAAN PANDUAN PENYELIDIKAN */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                Pertanyaan Inkuiri
              </div>
              <div className="col-span-9 p-2.5 bg-white text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                  Pertanyaan Panduan Penyelidikan & Analisis:
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-800 text-[11px] leading-relaxed">
                  {lkpdData.pertanyaanPanduan.map((q, idx) => (
                    <li key={idx} className="font-medium text-slate-900">
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ROW 5: RUANG KERJA & SOLUSI TIM (SIAP CETAK) */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                Ruang Hasil Kerja Kelompok
              </div>
              <div className="col-span-9 p-2.5 bg-white text-xs space-y-2">
                <div className="border border-slate-300 rounded p-2 bg-slate-50/50 min-h-[90px] flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 italic">
                    [Tuliskan poin-poin kesimpulan analisis dan rancangan solusi inovatif tim Anda di sini]
                  </span>
                  <div className="border-b border-dashed border-slate-300 my-1"></div>
                  <div className="border-b border-dashed border-slate-300 my-1"></div>
                  <div className="border-b border-dashed border-slate-300 my-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1">
                  <div>
                    <span className="font-bold text-slate-800">Catatan Fasilitator / Guru:</span>
                    <p className="border-b border-dotted border-slate-300 mt-1 h-5"></p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">Nilai / Paraf Guru:</span>
                    <p className="text-[11px] font-bold text-emerald-800 mt-1">Skor: ................ / Paraf: ................</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="text-right text-[10px] text-slate-400 mt-3 pt-1.5 border-t border-slate-200">
            Halaman 4 dari 5 — Lampiran 1: Lembar Kerja Peserta Didik (LKPD) Pembelajaran Mendalam
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HALAMAN 5: LAMPIRAN 2 - LEMBAR REFLEKSI PEMBELAJARAN (MURID & GURU)      */}
        {/* ========================================================================= */}
        <div className="pdf-page print-page bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 font-sans">
          
          {/* Header Lampiran 2 */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-3">
            <div className="inline-block px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-bold uppercase tracking-wider mb-1">
              Lampiran 2 — Evaluasi Diri & Metakognisi
            </div>
            <h3 className="text-xs sm:text-sm font-black uppercase text-slate-950">
              Lembar Refleksi Pembelajaran Mendalam (Model 3-2-1 & Metakognisi)
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
              Refleksi Berkesadaran Peserta Didik & Evaluasi Berkelanjutan Guru Pengampu
            </p>
          </div>

          {/* Master Table Refleksi */}
          <div className="border-2 border-slate-900 rounded-none overflow-hidden text-xs sm:text-xs text-slate-900">
            
            {/* BAGIAN A: REFLEKSI MURID MODEL 3-2-1 */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                <div className="w-full flex items-center justify-between">
                  <div>
                    Refleksi Murid
                    <br />
                    (Model 3-2-1)
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRefine('Lembar Refleksi', { murid: refleksiMuridData, guru: refleksiGuruData })}
                    className="print:hidden text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Sempurnakan Refleksi"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                {/* 3 Hal yang dipahami */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                      Hal Baru yang Saya Pahami Secara Mendalam:
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Pemahaman</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={refleksiMuridData.model321.tigaHalDipahami}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        refleksiMurid: {
                          ...refleksiMuridData,
                          model321: { ...refleksiMuridData.model321, tigaHalDipahami: e.target.value }
                        }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px] pl-6">
                      {refleksiMuridData.model321.tigaHalDipahami}
                    </p>
                  )}
                </div>

                {/* 2 Hal yang ingin didalami */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                      Hal yang Masih Menantang & Ingin Saya Dalami:
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">Eksplorasi</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={refleksiMuridData.model321.duaHalDidalami}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        refleksiMurid: {
                          ...refleksiMuridData,
                          model321: { ...refleksiMuridData.model321, duaHalDidalami: e.target.value }
                        }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px] pl-6">
                      {refleksiMuridData.model321.duaHalDidalami}
                    </p>
                  )}
                </div>

                {/* 1 Aksi nyata */}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                      Aksi Nyata yang Akan Segera Saya Praktikkan:
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">Aksi Nyata</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={refleksiMuridData.model321.satuAksiNyata}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        refleksiMurid: {
                          ...refleksiMuridData,
                          model321: { ...refleksiMuridData.model321, satuAksiNyata: e.target.value }
                        }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px] pl-6 font-medium text-emerald-950">
                      {refleksiMuridData.model321.satuAksiNyata}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* BAGIAN B: PERTANYAAN METAKOGNISI MURID */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                Metakognisi Murid
              </div>
              <div className="col-span-9 p-2.5 bg-white text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  Pertanyaan Pemandu Kesadaran Diri (Self-Awareness & Growth Mindset):
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-800 text-[11px] leading-relaxed">
                  {refleksiMuridData.pertanyaanMetakognisi.map((q, idx) => (
                    <li key={idx} className="italic text-slate-800">
                      “{q}”
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BAGIAN C: LEMBAR REFLEKSI & TINDAK LANJUT GURU */}
            <div className="grid grid-cols-12">
              <div className="col-span-3 bg-slate-100 font-bold p-2.5 border-r-2 border-slate-900 flex items-start">
                Refleksi & Rencana Tindak Lanjut Guru
              </div>
              <div className="col-span-9 divide-y-2 divide-slate-900 bg-white text-xs">
                
                <div className="p-2.5 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                    Fokus Evaluasi Proses Pembelajaran Guru:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-800 text-[11px] leading-relaxed">
                    {refleksiGuruData.pertanyaanRefleksi.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-slate-50/50 space-y-1">
                  <div className="font-bold text-slate-900">Rencana Tindak Lanjut Modul Ajar Berikutnya:</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      value={refleksiGuruData.tindakLanjut}
                      onChange={(e) => onUpdateRpp({
                        ...rpp,
                        refleksiGuru: { ...refleksiGuruData, tindakLanjut: e.target.value }
                      })}
                    />
                  ) : (
                    <p className="text-slate-800 leading-relaxed text-[11px]">
                      {refleksiGuruData.tindakLanjut}
                    </p>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Pengesahan Lembar Lampiran */}
          <div className="mt-5 pt-3 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-700">
            <div>
              <p className="font-bold text-slate-950">Disahkan oleh Guru Pengampu,</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sebagai bukti dokumen asesmen dan refleksi mendalam.</p>
            </div>
            <div className="text-right">
              <p className="font-bold underline text-slate-950">{pengesahan.namaGuru || rpp.identitas.nama}</p>
              <p className="text-[11px] text-slate-500">NIP. {pengesahan.nipGuru || '-'}</p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-400 mt-3 pt-1.5 border-t border-slate-200">
            Halaman 5 dari 5 — Lampiran 2: Lembar Refleksi Murid (Model 3-2-1) & Refleksi Guru
          </div>
        </div>

      </div>

      {/* In-App Print Dialog Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Dialog Cetak Dokumen RPP Resmi</h3>
                  <p className="text-[11px] text-slate-300">Standar Format A4 BSKAP Kemendikbudristek (5 Halaman Lengkap)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Spesifikasi Tata Letak Dokumen:
                </span>
                <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-0.5">
                  <li>Ukuran Kertas: <strong>A4 Portrait (210 x 297 mm)</strong></li>
                  <li>Margin: <strong>10 mm</strong> standar kedinasan resmi</li>
                  <li>Struktur: <strong>Dokumen Inti & Lampiran Lengkap (5 Halaman)</strong> (Hal 1: Identitas & Desain, Hal 2: Alur M3, Hal 3: Rubrik & TTD NIP, Hal 4: Lampiran LKPD, Hal 5: Lembar Refleksi Murid & Guru)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Pilih Tindakan Cetak / Unduh:</span>
                
                {/* Action 1: Browser Print Dialog */}
                <button
                  type="button"
                  onClick={executeBrowserPrint}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between transition cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Buka Dialog Cetak Sistem (Peramban / Ctrl+P)</span>
                      <span className="text-[11px] text-slate-300">Langsung ke printer fisik atau cetak peramban</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Action 2: Direct PDF download */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    handleDownloadPdf();
                  }}
                  className="w-full p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-between transition cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileDown className="w-4 h-4 text-white" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Simpan Langsung sebagai Berkas PDF (.pdf)</span>
                      <span className="text-[11px] text-emerald-100">Render A4 kualitas tinggi tanpa tergantung dialog printer</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-200" />
                </button>

                {/* Action 3: Word DOC */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    exportToWord(rpp);
                  }}
                  className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div className="text-left">
                      <span className="font-bold text-xs block">Unduh Berkas Word (.doc)</span>
                      <span className="text-[11px] text-blue-700">Dilengkapi Kop Surat, Tabel Resmi & Tanda Tangan NIP</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">💡 Tips Cetak Optimal di Peramban:</span>
                <p>
                  Pada jendela print yang muncul, centang opsi <strong>"Background graphics"</strong> (Grafik latar belakang) agar warna dan garis tabel tercetak sempurna.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-xs px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
