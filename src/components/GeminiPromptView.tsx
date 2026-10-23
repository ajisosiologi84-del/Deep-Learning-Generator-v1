import React, { useState } from 'react';
import { RPPData } from '../types/rpp';
import {
  generateGeminiPrompt,
  rppToMarkdown,
  exportToWord,
  exportToExcel,
  downloadMarkdown,
  downloadAsPDF,
} from '../utils/exportUtils';
import {
  Copy,
  Check,
  Download,
  FileDown,
  ExternalLink,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
  Printer,
  Table,
  FileCode2,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface GeminiPromptViewProps {
  rpp: RPPData;
}

export const GeminiPromptView: React.FC<GeminiPromptViewProps> = ({ rpp }) => {
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'doc' | 'excel' | 'python' | 'pdf' | 'templateWajib' | 'matriksRubrik'>('standard');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const promptStandard = generateGeminiPrompt(rpp, 'standard');
  const promptDoc = generateGeminiPrompt(rpp, 'doc');
  const promptExcel = generateGeminiPrompt(rpp, 'excel');
  const promptPython = generateGeminiPrompt(rpp, 'python');
  const promptPdf = generateGeminiPrompt(rpp, 'pdf');
  const templateWajibText = rppToMarkdown(rpp);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTriggerPdf = async () => {
    const officialDoc = document.getElementById('official-rpp-document');
    if (!officialDoc) {
      window.print();
      return;
    }
    setIsExportingPdf(true);
    setPdfSuccess(false);
    try {
      const fileName = `RPP_DeepLearning_${(rpp.identitas.topik || 'KurikulumMerdeka').replace(/\s+/g, '_')}.pdf`;
      await downloadAsPDF(officialDoc, fileName, (msg) => setPdfStatus(msg));
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (e) {
      console.error('PDF export error:', e);
      window.print();
    } finally {
      setIsExportingPdf(false);
      setPdfStatus('');
    }
  };

  const getCurrentText = () => {
    switch (selectedFormat) {
      case 'doc':
        return promptDoc;
      case 'excel':
        return promptExcel;
      case 'python':
        return promptPython;
      case 'pdf':
        return promptPdf;
      case 'templateWajib':
        return templateWajibText;
      case 'standard':
      default:
        return promptStandard;
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner with Chat Gemini Direct Integration */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Master Prompt Gemini: Format Keluaran Lengkap DOC & Excel
              </h2>
            </div>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Master prompt terbaik berstandar <strong>BSKAP Kemendikbudristek</strong> untuk <strong>Chat Gemini</strong> (gemini.google.com). Dirancang menghasilkan dokumen lengkap <strong>Word (.doc / .docx)</strong> dan spreadsheet <strong>Excel (.xlsx)</strong> lengkap rumus otomatis & rubrik 4 skala.
            </p>
          </div>

          <a
            href="https://gemini.google.com/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow-sm shrink-0 active:scale-95 cursor-pointer"
          >
            <span>Buka Chat Gemini</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
          </a>
        </div>

        {/* Quick Export Hub across all formats */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-200/90 mr-1">
            Unduh Berkas Jadi:
          </span>

          {/* Unduh DOC */}
          <button
            type="button"
            onClick={() => exportToWord(rpp)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white text-xs font-semibold transition cursor-pointer"
            title="Unduh dokumen Word (.doc) lengkap dengan Kop Surat & TTD Pengesahan"
          >
            <FileText className="w-3.5 h-3.5 text-blue-300" />
            <span>Unduh DOC (.doc)</span>
          </button>

          {/* Unduh PDF */}
          <button
            type="button"
            onClick={handleTriggerPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            title="Unduh format PDF A4 resmi standar dinas pendidikan"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-rose-300" />
            )}
            <span>{isExportingPdf ? (pdfStatus || 'Membuat PDF...') : pdfSuccess ? 'PDF Terunduh!' : 'Unduh PDF (.pdf)'}</span>
          </button>

          {/* Unduh Excel */}
          <button
            type="button"
            onClick={() => exportToExcel(rpp)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-white text-xs font-semibold transition cursor-pointer"
            title="Unduh format spreadsheet Excel (.xls) dengan rubrik 4 skala"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>Unduh Excel (.xls)</span>
          </button>

          {/* Unduh Markdown */}
          <button
            type="button"
            onClick={() => downloadMarkdown(rpp)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Markdown (.md)</span>
          </button>

          {/* Cetak Langsung */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Cetak Dialog</span>
          </button>
        </div>
      </div>

      {/* Panduan Integrasi Langsung di Gemini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-xl border border-blue-200/80 text-blue-950">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
            <h4 className="font-bold text-xs">Keluaran File Word / DOC</h4>
          </div>
          <p className="text-[11px] text-blue-900/80 leading-relaxed">
            Prompt menginstruksikan Gemini menyusun RPP utuh ber-Kop Surat resmi, Tabel Identitas, Desain, Alur M3, & Lembar Pengesahan NIP yang siap diekspor via tombol <strong>"Ekspor ke Google Dokumen"</strong> atau disalin ke MS Word (.docx).
          </p>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-xl border border-emerald-200/80 text-emerald-950">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h4 className="font-bold text-xs">Keluaran File Excel / Sheets</h4>
          </div>
          <p className="text-[11px] text-emerald-900/80 leading-relaxed">
            Prompt menginstruksikan Gemini membuat Matriks Rubrik 4 Skala dan Format Rekap Nilai Siswa dengan rumus aktif <code>=AVERAGE()</code>, <code>=ROUND()</code>, dan <code>=IF()</code> yang siap diekspor via tombol <strong>"Ekspor ke Google Spreadsheet"</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-gradient-to-br from-purple-50 to-fuchsia-50/60 rounded-xl border border-purple-200/80 text-purple-950">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</span>
            <h4 className="font-bold text-xs">Otomasi Unduh File Nyata</h4>
          </div>
          <p className="text-[11px] text-purple-900/80 leading-relaxed">
            Menyertakan instruksi kode Python (<code>python-docx</code> & <code>openpyxl</code>) agar Gemini Advanced / Code Interpreter dapat langsung mengeksekusi dan menyediakan link unduh file <code>.docx</code> dan <code>.xlsx</code> nyata di chat.
          </p>
        </div>
      </div>

      {/* Main Selector & Preview Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Format Selector Tabs */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-medium flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedFormat('standard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'standard'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Master Prompt Gemini (DOC & Excel)</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Terbaik
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('doc')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'doc'
                  ? 'bg-white text-blue-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3 h-3 text-blue-600" />
              <span>2. Prompt File DOC (Word)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('excel')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'excel'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
              <span>3. Prompt File Excel (Rubrik & Rumus)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('python')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'python'
                  ? 'bg-white text-purple-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode2 className="w-3 h-3 text-purple-600" />
              <span>4. Prompt Otomasi Python (.docx & .xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('pdf')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'pdf'
                  ? 'bg-white text-rose-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileDown className="w-3 h-3 text-rose-600" />
              <span>5. Prompt Format PDF (A4)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('templateWajib')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'templateWajib'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3 h-3 text-slate-600" />
              <span>6. Hasil Output Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFormat('matriksRubrik')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFormat === 'matriksRubrik'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3 h-3 text-teal-600" />
              <span>7. Matriks Rubrik</span>
            </button>
          </div>

          {/* Quick Copy / Export Trigger */}
          <div className="flex items-center gap-2">
            {selectedFormat === 'matriksRubrik' ? (
              <button
                type="button"
                onClick={() => exportToExcel(rpp)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Unduh File Excel (.xls)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleCopy(getCurrentText(), selectedFormat)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {copiedKey === selectedFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>
                  {copiedKey === selectedFormat
                    ? 'Tersalin ke Clipboard!'
                    : selectedFormat === 'standard'
                    ? 'Salin Master Prompt (DOC & Excel) ke Gemini'
                    : selectedFormat === 'doc'
                    ? 'Salin Prompt untuk DOC'
                    : selectedFormat === 'excel'
                    ? 'Salin Prompt untuk Excel'
                    : selectedFormat === 'python'
                    ? 'Salin Prompt Otomasi Python'
                    : selectedFormat === 'pdf'
                    ? 'Salin Prompt untuk PDF'
                    : 'Salin Teks Output'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-5 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto">
          {/* Master Prompt Info */}
          {selectedFormat === 'standard' && (
            <div className="mb-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-sans space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Master Prompt Terbaik: Menghasilkan Format DOC dan EXCEL Sekaligus di Gemini</span>
              </div>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                Prompt ini memandu Gemini secara komprehensif untuk merumuskan pedagogi Pembelajaran Mendalam (<em>Mindful, Meaningful, Joyful</em>), mengaitkan Profil Murid dengan alur M3, dan membagi hasil ke dalam 2 format siap pakai:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-800">📄 Bagian 1 (Format Word / DOCX / Docs):</strong>
                  <p className="text-slate-600 mt-0.5">Kop Kedinasan, 8 DPL BSKAP, Desain Pedagogis, Skenario M3 menit-ke-menit, Asesmen 3 Dimensi, & Lembar Pengesahan NIP Kepala Sekolah & Guru.</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <strong className="text-emerald-800">📊 Bagian 2 (Format Excel / XLSX / Sheets):</strong>
                  <p className="text-slate-600 mt-0.5">Matriks Rubrik 4 Skala dan Format Buku Rekap Nilai Siswa lengkap dengan formula aktif <code>=AVERAGE()</code>, <code>=ROUND()</code>, dan <code>=IF()</code>.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-700">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cara Pakai: Salin prompt &rarr; Tempel di <a href="https://gemini.google.com/app" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">gemini.google.com</a> &rarr; Gunakan tombol bawaan Gemini <strong>"Ekspor ke Google Dokumen"</strong> dan <strong>"Ekspor ke Google Spreadsheet"</strong> di bawah respon Gemini!</span>
              </div>
            </div>
          )}

          {/* Format Doc Info */}
          {selectedFormat === 'doc' && (
            <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-sans flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-blue-950">Prompt Khusus Format Dokumen Word (.doc / .docx):</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                  Prompt ini memerintahkan Chat Gemini menyusun tata letak dokumen resmi berstandar dinas pendidikan lengkap dengan garis batas kop surat ganda, tabel identitas, skenario pembelajaran M3, asesmen, dan lembar tanda tangan pengesahan NIP yang siap langsung disalin ke Microsoft Word atau Google Docs.
                </p>
              </div>
            </div>
          )}

          {/* Format Excel Info */}
          {selectedFormat === 'excel' && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-sans flex items-start gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-emerald-950">Prompt Khusus Format Spreadsheet / Excel:</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                  Prompt ini memerintahkan Gemini menyusun tabel-tabel tabular murni mencakup Matriks Rubrik 4 Skala dan Daftar Rekapitulasi Nilai Siswa yang dilengkapi rumus fungsi Excel: <code>=AVERAGE()</code>, <code>=ROUND()</code>, dan <code>=IF()</code> untuk otomatisasi predikat capaian.
                </p>
              </div>
            </div>
          )}

          {/* Format Python Info */}
          {selectedFormat === 'python' && (
            <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-sans flex items-start gap-2.5">
              <FileCode2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-purple-950">Prompt Generator Python (Eksekusi Otomatis Berkas .docx & .xlsx di Gemini):</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                  Gunakan prompt ini di Gemini Advanced / Fitur Eksekusi Kode. Gemini akan langsung menjalankan script Python dengan modul <code>python-docx</code> dan <code>openpyxl</code> untuk membuat file nyata <strong>.docx</strong> dan <strong>.xlsx</strong> serta memberikan link unduhan langsung di percakapan!
                </p>
              </div>
            </div>
          )}

          {/* Format PDF Info */}
          {selectedFormat === 'pdf' && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-sans flex items-start gap-2.5">
              <FileDown className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-rose-950">Prompt Khusus Format Dokumen PDF A4 (3 Halaman BSKAP):</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                  Prompt ini mengunci keluaran AI ke dalam 3 Halaman Presisi: Halaman 1 (Kop & Desain), Halaman 2 (Alur M3), Halaman 3 (Asesmen & Pengesahan NIP) sehingga tidak terjadi loncatan halaman saat diekspor ke PDF.
                </p>
              </div>
            </div>
          )}

          {/* Template Wajib Info */}
          {selectedFormat === 'templateWajib' && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-sans flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-emerald-950">Format Output Bersih (Template Wajib BSKAP):</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                  Format murni teks mencakup Kop Sekolah, Identitas, Profil Murid, Dimensi DPL, Desain Pembelajaran, Alur M3, Asesmen, Rubrik 4 Skala, dan Lembar Pengesahan NIP tanpa pengantar naratif.
                </p>
              </div>
            </div>
          )}

          {/* Matriks Rubrik View */}
          {selectedFormat === 'matriksRubrik' ? (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Pratinjau Matriks Rubrik Penilaian (4 Skala Standar BSKAP):
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Siap diunduh sebagai Excel (.xls)
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-700 text-white font-bold">
                      <th className="p-2.5 w-[20%] border-r border-emerald-600">Kriteria Penilaian</th>
                      <th className="p-2.5 w-[20%] border-r border-emerald-600">Baru Memulai</th>
                      <th className="p-2.5 w-[20%] border-r border-emerald-600">Berkembang</th>
                      <th className="p-2.5 w-[20%] border-r border-emerald-600">Cakap</th>
                      <th className="p-2.5 w-[20%]">Sangat Berkembang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {rpp.rubrikPenilaian?.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2.5 font-bold border-r border-slate-200 bg-slate-50/50 align-top">
                          {row.kriteria}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top leading-relaxed">
                          {row.baruMemulai}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top leading-relaxed">
                          {row.berkembang}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top leading-relaxed">
                          {row.cakap}
                        </td>
                        <td className="p-2.5 bg-emerald-50/50 align-top leading-relaxed font-medium text-emerald-950">
                          {row.sangatBerkembang}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto selection:bg-emerald-600 selection:text-white border border-slate-800">
              {getCurrentText()}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
