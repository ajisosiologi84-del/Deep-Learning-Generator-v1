import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  Scissors,
  QrCode,
  Check,
  CheckSquare,
  Square,
  Eye,
  Sparkles,
  Shield,
  School,
  User,
  Key,
  Calendar,
  Layers,
  Sliders,
  Palette,
  X,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertCircle,
  Copy,
  BookOpen,
  FileDown,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { AppToken } from '../types/token';
import { downloadTokenCardsAsPDF } from '../utils/exportUtils';

export type PaperSize = 'F4' | 'A4';
export type CardDensity = '8' | '10' | '6' | '4' | '1';
export type CardTheme = 'kemdikbud' | 'sapphire' | 'purple' | 'monochrome';
export type PaperOrientation = 'portrait' | 'landscape';

interface TokenCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: AppToken[];
  preSelectedTokenId?: string | null;
}

export const TokenCardPrintModal: React.FC<TokenCardPrintModalProps> = ({
  isOpen,
  onClose,
  tokens,
  preSelectedTokenId,
}) => {
  // Print Settings State
  const [paperSize, setPaperSize] = useState<PaperSize>('F4');
  const [orientation, setOrientation] = useState<PaperOrientation>('portrait');
  const [cardDensity, setCardDensity] = useState<CardDensity>('8');
  const [theme, setTheme] = useState<CardTheme>('kemdikbud');

  // Institution & Event Branding
  const [institutionName, setInstitutionName] = useState<string>('KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH');
  const [subInstitutionName, setSubInstitutionName] = useState<string>('Badan Standar, Kurikulum, dan Asesmen Pendidikan (BSKAP)');
  const [eventTitle, setEventTitle] = useState<string>('IMPLEMENTASI RPP DEEP LEARNING (KURIKULUM MERDEKA)');
  const [appUrl, setAppUrl] = useState<string>('https://dmgenerator.vercel.app');

  // Display Toggles
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showValidity, setShowValidity] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  // Token Selection State
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [activePreviewPage, setActivePreviewPage] = useState<number>(1);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  // Export State
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>('');
  const [printStatusNotice, setPrintStatusNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // DOM Ref to printable container
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Initialize selected tokens when modal opens
  useEffect(() => {
    if (isOpen) {
      if (preSelectedTokenId) {
        setSelectedTokenIds([preSelectedTokenId]);
      } else {
        const activeIds = tokens.filter((t) => t.isActive).map((t) => t.id);
        setSelectedTokenIds(activeIds.length > 0 ? activeIds : tokens.map((t) => t.id));
      }
      setActivePreviewPage(1);
      setPrintStatusNotice(null);
    }
  }, [isOpen, preSelectedTokenId, tokens]);

  // Generate QR codes for all selected tokens
  useEffect(() => {
    if (!isOpen || !showQrCode) return;

    let isMounted = true;
    setIsGeneratingQr(true);

    const generateQrs = async () => {
      const urls: Record<string, string> = {};
      const baseAppUrl = appUrl.trim() || 'https://dmgenerator.vercel.app';

      for (const token of tokens) {
        if (selectedTokenIds.includes(token.id)) {
          try {
            const targetUrl = `${baseAppUrl.replace(/\/+$/, '')}?token=${encodeURIComponent(token.token)}`;
            const qrDataUrl = await QRCode.toDataURL(targetUrl, {
              width: 180,
              margin: 1,
              color: {
                dark: theme === 'kemdikbud' ? '#064e3b' : theme === 'sapphire' ? '#1e3a8a' : theme === 'purple' ? '#581c87' : '#0f172a',
                light: '#ffffff',
              },
              errorCorrectionLevel: 'M',
            });
            urls[token.id] = qrDataUrl;
          } catch (err) {
            console.warn('QR code gen failed for token:', token.token, err);
          }
        }
      }

      if (isMounted) {
        setQrCodeUrls(urls);
        setIsGeneratingQr(false);
      }
    };

    generateQrs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, showQrCode, selectedTokenIds, tokens, appUrl, theme]);

  // Filtered tokens to print
  const tokensToPrint = useMemo(() => {
    return tokens.filter((t) => selectedTokenIds.includes(t.id));
  }, [tokens, selectedTokenIds]);

  // Cards per sheet calculation
  const cardsPerPage = parseInt(cardDensity, 10);
  const totalPages = Math.max(1, Math.ceil(tokensToPrint.length / cardsPerPage));

  // Tokens for current preview page
  const currentPreviewTokens = useMemo(() => {
    const startIndex = (activePreviewPage - 1) * cardsPerPage;
    return tokensToPrint.slice(startIndex, startIndex + cardsPerPage);
  }, [tokensToPrint, activePreviewPage, cardsPerPage]);

  // Selection handlers
  const handleSelectAll = () => {
    setSelectedTokenIds(tokens.map((t) => t.id));
  };

  const handleSelectActiveOnly = () => {
    setSelectedTokenIds(tokens.filter((t) => t.isActive).map((t) => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTokenIds([]);
  };

  const handleToggleToken = (id: string) => {
    setSelectedTokenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 1. Direct PDF Export (Works 100% reliably in any environment)
  const handleDownloadPdf = async () => {
    if (!printContainerRef.current || isExportingPdf || tokensToPrint.length === 0) return;

    setIsExportingPdf(true);
    setPdfProgressText('Mempersiapkan dokumen PDF...');
    setPrintStatusNotice(null);

    try {
      const fileName = `KARTU_TOKEN_RPP_${paperSize}_${orientation}_${new Date().toISOString().slice(0, 10)}.pdf`;
      await downloadTokenCardsAsPDF(
        printContainerRef.current,
        fileName,
        paperSize,
        orientation,
        (status) => setPdfProgressText(status)
      );

      setPrintStatusNotice({
        type: 'success',
        text: `Berkas "${fileName}" berhasil diunduh! Siap dicetak langsung ke printer.`,
      });
      setTimeout(() => setPrintStatusNotice(null), 5000);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setPrintStatusNotice({
        type: 'error',
        text: 'Gagal membuat berkas PDF otomatis. Silakan gunakan tombol "Cetak ke Printer" atau "Buka di Tab Baru".',
      });
    } finally {
      setIsExportingPdf(false);
      setPdfProgressText('');
    }
  };

  // 2. Browser Print Dialog (via Isolated Hidden Iframe & Fallback)
  const handlePrint = () => {
    if (!printContainerRef.current || tokensToPrint.length === 0) return;

    setPrintStatusNotice({
      type: 'info',
      text: 'Membuka jendela cetak... Pastikan memilih ukuran kertas ' + paperSize + ' dan mencentang "Grafik Latar Belakang".',
    });

    const pageDimensions = paperSize === 'F4' ? '215mm 330mm' : '210mm 297mm';

    // Attempt 1: Try printing via isolated hidden iframe with complete CSS
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.zIndex = '-999';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        let styles = '';
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
          styles += el.outerHTML;
        });

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Cetak Kartu Token - ${paperSize}</title>
              ${styles}
              <style>
                @page {
                  size: ${pageDimensions} ${orientation};
                  margin: 6mm;
                }
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .token-print-sheet {
                  display: block !important;
                  page-break-after: always !important;
                  break-after: page !important;
                  box-sizing: border-box !important;
                  padding: 6mm !important;
                  width: 100% !important;
                  background: #ffffff !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .token-print-sheet:last-child {
                  page-break-after: avoid !important;
                  break-after: avoid !important;
                }
              </style>
            </head>
            <body>
              ${printContainerRef.current.innerHTML}
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print blocked, falling back to direct window.print:', e);
            runDirectWindowPrint();
          } finally {
            setTimeout(() => {
              iframe.remove();
            }, 3000);
          }
        }, 350);
        return;
      }
    } catch (err) {
      console.warn('Iframe print initialization failed, running direct print:', err);
    }

    runDirectWindowPrint();
  };

  // Fallback direct window.print
  const runDirectWindowPrint = () => {
    document.body.classList.add('printing-token-cards-active');

    let styleEl = document.getElementById('dynamic-token-print-style') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-token-print-style';
      document.head.appendChild(styleEl);
    }
    const pageDimensions = paperSize === 'F4' ? '215mm 330mm' : '210mm 297mm';
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${pageDimensions} ${orientation};
          margin: 6mm;
        }
      }
    `;

    const cleanUp = () => {
      document.body.classList.remove('printing-token-cards-active');
      window.removeEventListener('afterprint', cleanUp);
    };
    window.addEventListener('afterprint', cleanUp);

    window.focus();
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error('window.print error:', e);
        handleDownloadPdf();
      }
      setTimeout(cleanUp, 1500);
    }, 150);
  };

  // 3. Open in Clean New Tab (Bypasses iframe sandbox restrictions)
  const handleOpenNewTab = () => {
    if (!printContainerRef.current || tokensToPrint.length === 0) return;

    const pageDimensions = paperSize === 'F4' ? '215mm 330mm' : '210mm 297mm';
    let styles = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML;
    });

    const newWin = window.open('', '_blank');
    if (!newWin) {
      alert('Pop-up terblokir oleh peramban. Silakan gunakan tombol "Unduh File PDF" atau izinkan pop-up.');
      return;
    }

    newWin.document.open();
    newWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cetak Kartu Token - ${paperSize} (${tokensToPrint.length} Kartu)</title>
          ${styles}
          <style>
            @page {
              size: ${pageDimensions} ${orientation};
              margin: 6mm;
            }
            body {
              margin: 0;
              padding: 0;
              background: #f1f5f9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .token-print-sheet {
              display: block !important;
              page-break-after: always !important;
              break-after: page !important;
              box-sizing: border-box !important;
              padding: 6mm !important;
              background: #ffffff !important;
              margin: 20px auto;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              max-width: ${orientation === 'portrait' ? '820px' : '1080px'};
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .token-print-sheet:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            .top-action-bar {
              position: sticky;
              top: 0;
              z-index: 1000;
              background: #0f172a;
              color: white;
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .btn-print {
              background: #f59e0b;
              color: #020617;
              border: none;
              padding: 8px 20px;
              font-weight: 800;
              font-size: 14px;
              border-radius: 8px;
              cursor: pointer;
            }
            .btn-print:hover {
              background: #d97706;
            }
            @media print {
              .top-action-bar {
                display: none !important;
              }
              body {
                background: #ffffff !important;
              }
              .token-print-sheet {
                margin: 0 !important;
                box-shadow: none !important;
                max-width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="top-action-bar print:hidden">
            <div>
              <strong>Studio Cetak Kartu Token - Kertas ${paperSize} (${orientation.toUpperCase()})</strong>
              <div style="font-size: 12px; color: #94a3b8;">Total ${tokensToPrint.length} kartu terpilih</div>
            </div>
            <button class="btn-print" onclick="window.print()">🖨️ CETAK SEKARANG / SIMPAN PDF</button>
          </div>
          ${printContainerRef.current.innerHTML}
        </body>
      </html>
    `);
    newWin.document.close();
  };

  if (!isOpen) return null;

  // Grid styling based on card density and orientation
  const getGridClasses = (density: CardDensity) => {
    switch (density) {
      case '10':
        return 'grid grid-cols-2 grid-rows-5 gap-2.5';
      case '8':
        return 'grid grid-cols-2 grid-rows-4 gap-3';
      case '6':
        return 'grid grid-cols-2 grid-rows-3 gap-3.5';
      case '4':
        return 'grid grid-cols-2 grid-rows-2 gap-4';
      case '1':
      default:
        return 'grid grid-cols-1 grid-rows-1 gap-4';
    }
  };

  // Card Theme Classes
  const getThemeStyles = (t: CardTheme) => {
    switch (t) {
      case 'kemdikbud':
        return {
          cardBorder: 'border-emerald-600',
          headerBg: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white',
          badgeRole: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          tokenBox: 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400/40',
          tokenLabel: 'text-emerald-700',
          accentText: 'text-emerald-800',
          footerBg: 'bg-emerald-50/60 border-emerald-200 text-emerald-800',
          watermarkText: 'text-emerald-700/10',
          ribbonColor: 'bg-amber-400 text-slate-950',
        };
      case 'sapphire':
        return {
          cardBorder: 'border-blue-600',
          headerBg: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white',
          badgeRole: 'bg-blue-100 text-blue-900 border-blue-300',
          tokenBox: 'bg-blue-50/90 border-blue-500 text-blue-950 ring-1 ring-blue-400/40',
          tokenLabel: 'text-blue-700',
          accentText: 'text-blue-800',
          footerBg: 'bg-blue-50/60 border-blue-200 text-blue-800',
          watermarkText: 'text-blue-700/10',
          ribbonColor: 'bg-amber-400 text-slate-950',
        };
      case 'purple':
        return {
          cardBorder: 'border-purple-600',
          headerBg: 'bg-gradient-to-r from-purple-900 via-fuchsia-900 to-slate-900 text-white',
          badgeRole: 'bg-purple-100 text-purple-900 border-purple-300',
          tokenBox: 'bg-purple-50/90 border-purple-500 text-purple-950 ring-1 ring-purple-400/40',
          tokenLabel: 'text-purple-700',
          accentText: 'text-purple-800',
          footerBg: 'bg-purple-50/60 border-purple-200 text-purple-800',
          watermarkText: 'text-purple-700/10',
          ribbonColor: 'bg-amber-400 text-slate-950',
        };
      case 'monochrome':
      default:
        return {
          cardBorder: 'border-slate-800',
          headerBg: 'bg-slate-900 text-white',
          badgeRole: 'bg-slate-100 text-slate-900 border-slate-400',
          tokenBox: 'bg-slate-100 border-slate-700 text-slate-950 ring-1 ring-slate-400/40',
          tokenLabel: 'text-slate-700',
          accentText: 'text-slate-900',
          footerBg: 'bg-slate-50 border-slate-300 text-slate-800',
          watermarkText: 'text-slate-500/10',
          ribbonColor: 'bg-slate-200 text-slate-900 border border-slate-400',
        };
    }
  };

  const themeStyle = getThemeStyles(theme);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Main Modal Container */}
      <div className="token-card-modal-chrome bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden animate-slideInUp">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-emerald-800 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/15 shadow-inner">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Pencetakan Kartu Token Akses Resmi</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Format {paperSize}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cetak kartu fisik rapi lengkap dengan QR Code, Kode Akses, Kop Resmi, dan Garis Potong gunting
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={tokensToPrint.length === 0 || isExportingPdf}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              title="Unduh langsung berkas PDF F4/A4 ke perangkat Anda"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{pdfProgressText || 'Membuat PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-emerald-200" />
                  <span>Unduh File PDF (.pdf)</span>
                </>
              )}
            </button>

            {/* Direct Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={tokensToPrint.length === 0}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              title="Cetak langsung menggunakan printer atau dialog cetak peramban"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak ke Printer ({tokensToPrint.length})</span>
            </button>

            {/* Open New Tab Option */}
            <button
              type="button"
              onClick={handleOpenNewTab}
              disabled={tokensToPrint.length === 0}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center disabled:opacity-50"
              title="Buka tampilan cetak di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Alert if triggered */}
        {printStatusNotice && (
          <div
            className={`px-4 py-2 text-xs flex items-center gap-2 border-b animate-fadeIn shrink-0 ${
              printStatusNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : printStatusNotice.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {printStatusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : printStatusNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-medium flex-1">{printStatusNotice.text}</span>
          </div>
        )}

        {/* Modal Body: Left Controls Panel & Right Live Paper Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
          
          {/* LEFT: Settings, Configuration & Token Selector (Scrollable) */}
          <div className="w-full lg:w-96 xl:w-[410px] bg-white border-r border-slate-200 p-4 sm:p-5 overflow-y-auto space-y-5 shrink-0">
            
            {/* Paper Size & Layout Group */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Ukuran Kertas & Format</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {paperSize === 'F4' ? 'Folio (215 × 330 mm)' : 'A4 (210 × 297 mm)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperSize('F4')}
                  className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                    paperSize === 'F4'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Kertas F4 / Folio</span>
                    {paperSize === 'F4' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    215 × 330 mm (Standar Sekolah & Madrasah Indonesia)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                    paperSize === 'A4'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">Kertas A4</span>
                    {paperSize === 'A4' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    210 × 297 mm (Standar Printer Internasional)
                  </p>
                </button>
              </div>

              {/* Orientation & Cards Per Page */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Orientasi:
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as PaperOrientation)}
                    className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="portrait">Potret (Tegak)</option>
                    <option value="landscape">Lanskap (Mendatar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Kartu per Lembar:
                  </label>
                  <select
                    value={cardDensity}
                    onChange={(e) => {
                      setCardDensity(e.target.value as CardDensity);
                      setActivePreviewPage(1);
                    }}
                    className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="8">8 Kartu / Lembar (Format Standar ID)</option>
                    <option value="10">10 Kartu / Lembar (Hemat Kertas)</option>
                    <option value="6">6 Kartu / Lembar (Sedang Eksklusif)</option>
                    <option value="4">4 Kartu / Lembar (Besar / VIP)</option>
                    <option value="1">1 Kartu Tunggal (Piagam Akses)</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Visual Theme Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-600" />
                <span>2. Tema Desain Kartu</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('kemdikbud')}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition cursor-pointer ${
                    theme === 'kemdikbud'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-700 shrink-0 border border-white shadow-2xs" />
                  <span className="text-xs">Emerald Kemdikbud</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('sapphire')}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition cursor-pointer ${
                    theme === 'sapphire'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-700 shrink-0 border border-white shadow-2xs" />
                  <span className="text-xs">Biru Safir Edukasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('purple')}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition cursor-pointer ${
                    theme === 'purple'
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-purple-700 shrink-0 border border-white shadow-2xs" />
                  <span className="text-xs">Ungu Inovatif</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('monochrome')}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition cursor-pointer ${
                    theme === 'monochrome'
                      ? 'border-slate-800 bg-slate-100 text-slate-950 font-bold ring-1 ring-slate-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-900 shrink-0 border border-white shadow-2xs" />
                  <span className="text-xs">Hitam-Putih (Hemat Tinta)</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Institution & Event Customization */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Kustomisasi Teks Kop & Acara</span>
              </label>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Nama Instansi / Dinas:
                  </span>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Contoh: KEMENTERIAN PENDIDIKAN / DINAS PENDIDIKAN"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Sub-Instansi / Lembaga / Sekolah:
                  </span>
                  <input
                    type="text"
                    value={subInstitutionName}
                    onChange={(e) => setSubInstitutionName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Contoh: SMA NEGERI 1 / BSKAP KEMENDIKBUD"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                    Judul Kegiatan / Keterangan:
                  </span>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    placeholder="Contoh: IMPLEMENTASI RPP DEEP LEARNING (KURIKULUM MERDEKA)"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Display Options Toggles */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>4. Elemen Tampilan Kartu</span>
              </label>

              <div className="space-y-1.5 text-xs">
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tampilkan QR Code Login Cepat</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={(e) => setShowQrCode(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-slate-600" />
                    <span>Garis Potong Gunting (✂ Dashed)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showCutLines}
                    onChange={(e) => setShowCutLines(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Masa Berlaku & Batas Kuota</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showValidity}
                    onChange={(e) => setShowValidity(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Petunjuk Cara Pakai Singkat</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showInstructions}
                    onChange={(e) => setShowInstructions(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </label>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Token Selector List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5. Pilih Token Dicetak ({selectedTokenIds.length}/{tokens.length})</span>
                </label>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 text-[11px] font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleSelectActiveOnly}
                  className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                >
                  Hanya yang Aktif
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>

              {/* Scrollable Token Checklist */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                {tokens.map((t) => {
                  const isChecked = selectedTokenIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-white border border-emerald-300 shadow-2xs'
                          : 'bg-transparent hover:bg-white/60 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleToken(t.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {t.token}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {t.isActive ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 truncate">
                          {t.label} {t.schoolName ? `• ${t.schoolName}` : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: Live Interactive Print Preview Container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Preview Toolbar */}
            <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Kertas {paperSize} ({orientation === 'portrait' ? 'Potret' : 'Lanskap'}):</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  Halaman {activePreviewPage} dari {totalPages}
                </span>
                <span className="text-[11px] text-slate-500">
                  • Total {tokensToPrint.length} kartu ({totalPages} lembar kertas)
                </span>
              </div>

              {/* Pagination controls for preview & quick actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActivePreviewPage((p) => Math.max(1, p - 1))}
                  disabled={activePreviewPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-1">
                  {activePreviewPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePreviewPage((p) => Math.min(totalPages, p + 1))}
                  disabled={activePreviewPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Direct PDF Download */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={tokensToPrint.length === 0 || isExportingPdf}
                  className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  <span>Unduh PDF</span>
                </button>

                {/* Print button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={tokensToPrint.length === 0}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>

            {/* Scrollable Canvas Area (Virtual Paper Sheet) */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start bg-slate-200/80">
              
              {tokensToPrint.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-300 shadow-sm max-w-md my-auto">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Belum Ada Token yang Dipilih
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Silakan centang token pada panel sebelah kiri untuk melihat kartu dan mencetaknya.
                  </p>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  >
                    Pilih Semua Token ({tokens.length})
                  </button>
                </div>
              ) : (
                /* The Virtual Paper Sheet Container (Scaled representation) */
                <div
                  className="bg-white shadow-2xl rounded-sm transition-all duration-200 relative overflow-hidden"
                  style={{
                    width: orientation === 'portrait' ? '760px' : '980px',
                    minHeight: orientation === 'portrait'
                      ? (paperSize === 'F4' ? '1160px' : '1070px')
                      : (paperSize === 'F4' ? '760px' : '690px'),
                    padding: '24px',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Subtle Paper Header Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-200 pb-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-slate-700">LEMBAR CETAK KARTU TOKEN - {paperSize} {orientation.toUpperCase()}</span>
                    </div>
                    <span>Halaman {activePreviewPage} dari {totalPages} • {tokensToPrint.length} Token Terdaftar</span>
                  </div>

                  {/* Cards Grid */}
                  <div className={getGridClasses(cardDensity)}>
                    {currentPreviewTokens.map((tokenItem) => (
                      <div
                        key={tokenItem.id}
                        className={`relative rounded-xl border-2 ${themeStyle.cardBorder} bg-white flex flex-col justify-between overflow-hidden shadow-xs transition ${
                          showCutLines ? 'border-dashed' : 'border-solid'
                        }`}
                        style={{
                          minHeight: cardDensity === '10' ? '185px' : cardDensity === '8' ? '230px' : cardDensity === '6' ? '280px' : '320px',
                        }}
                      >
                        {/* Scissor Cut Mark if enabled */}
                        {showCutLines && (
                          <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5 text-[9px] text-slate-400 font-mono select-none">
                            <Scissors className="w-2.5 h-2.5" />
                          </div>
                        )}

                        {/* Card Header Banner */}
                        <div className={`p-2.5 ${themeStyle.headerBg} flex items-center justify-between gap-2 shrink-0 border-b ${themeStyle.cardBorder}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-amber-300 shrink-0 border border-white/20">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight truncate leading-tight">
                                {subInstitutionName || institutionName}
                              </h5>
                              <p className="text-[9px] text-white/80 font-medium truncate leading-tight">
                                {eventTitle}
                              </p>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${themeStyle.ribbonColor}`}>
                            KARTU RESMI
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-3 flex-1 flex flex-col justify-between gap-2 relative bg-gradient-to-b from-white to-slate-50/50">
                          
                          {/* Top Row: Recipient Info & Role Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                                Pemegang Akses:
                              </span>
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-tight">
                                {tokenItem.label || 'Guru / Pengguna'}
                              </h4>
                              {tokenItem.schoolName && (
                                <p className="text-[10px] text-slate-600 truncate font-medium">
                                  {tokenItem.schoolName}
                                </p>
                              )}
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border shrink-0 ${themeStyle.badgeRole}`}>
                              {tokenItem.role.toUpperCase()}
                            </span>
                          </div>

                          {/* Middle Row: Token Code Box & QR Code */}
                          <div className="flex items-center justify-between gap-3 my-1">
                            {/* Left: Token Highlight Box */}
                            <div className="flex-1 min-w-0">
                              <span className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${themeStyle.tokenLabel}`}>
                                KODE TOKEN RPP:
                              </span>
                              <div className={`p-2 rounded-xl border-2 font-mono font-black text-center tracking-wider text-base sm:text-lg select-all shadow-xs ${themeStyle.tokenBox}`}>
                                {tokenItem.token}
                              </div>
                              <span className="text-[8px] text-slate-500 font-mono mt-0.5 block text-center">
                                Masukkan kode di atas pada kolom Login Token
                              </span>
                            </div>

                            {/* Right: QR Code */}
                            {showQrCode && (
                              <div className="shrink-0 flex flex-col items-center">
                                <div className="p-1 bg-white rounded-xl border border-slate-300 shadow-2xs">
                                  {qrCodeUrls[tokenItem.id] ? (
                                    <img
                                      src={qrCodeUrls[tokenItem.id]}
                                      alt={`QR ${tokenItem.token}`}
                                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 bg-slate-100 flex items-center justify-center">
                                      <QrCode className="w-6 h-6 text-slate-400 animate-pulse" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-[8px] font-bold text-slate-600 mt-0.5 tracking-tight">
                                  Scan & Masuk
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Validity & Usage Info */}
                          {showValidity && (
                            <div className="flex items-center justify-between text-[9px] text-slate-600 border-t border-slate-200/80 pt-1.5 font-medium">
                              <span>
                                Berlaku:{' '}
                                <strong className="text-slate-800 font-bold">
                                  {tokenItem.expiresAt
                                    ? new Date(tokenItem.expiresAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'Selamanya'}
                                </strong>
                              </span>
                              <span>
                                Kuota:{' '}
                                <strong className="text-slate-800 font-bold">
                                  {tokenItem.maxUses > 0 ? `${tokenItem.maxUses} Kali` : 'Tanpa Batas'}
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Access URL & Instructions */}
                        {showInstructions && (
                          <div className={`px-2.5 py-1.5 border-t text-[8.5px] flex items-center justify-between gap-2 shrink-0 ${themeStyle.footerBg}`}>
                            <div className="flex items-center gap-1 truncate">
                              <span className="font-bold">Akses:</span>
                              <span className="font-mono underline truncate">{appUrl.replace(/^https?:\/\//, '')}</span>
                            </div>
                            <span className="font-bold text-[8px] uppercase tracking-wider shrink-0 text-slate-600">
                              BSKAP VERIFIED
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Cut Lines Footer Notice on preview sheet */}
                  {showCutLines && (
                    <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400 font-mono">
                      ✂ Garis pemotong: Potong kartu mengikuti garis putus-putus untuk membagikan kepada bapak/ibu guru
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Pilihan Ekspor:</strong> Anda dapat langsung mencetak via <strong>Cetak ke Printer</strong> atau mengunduh berkas <strong>Unduh File PDF (.pdf)</strong> untuk disimpan dan dicetak nanti.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Tutup
            </button>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={tokensToPrint.length === 0 || isExportingPdf}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{pdfProgressText || 'Membuat PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Unduh File PDF (.pdf)</span>
                </>
              )}
            </button>

            {/* Direct Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={tokensToPrint.length === 0}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak ke Printer ({tokensToPrint.length} Kartu)</span>
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FULL PRINT DOM CONTAINER: Ref attached for jsPDF and iframe print */}
      {/* Kept mounted so html-to-image and print iframes can read full DOM dimensions */}
      {/* ============================================================ */}
      <div
        id="token-card-print-container"
        ref={printContainerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: orientation === 'portrait' ? (paperSize === 'F4' ? '215mm' : '210mm') : (paperSize === 'F4' ? '330mm' : '297mm'),
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -100,
        }}
      >
        {Array.from({ length: totalPages }).map((_, pageIdx) => {
          const pageTokens = tokensToPrint.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage);
          return (
            <div
              key={`print-sheet-${pageIdx}`}
              className="token-print-sheet"
              style={{
                pageBreakAfter: pageIdx === totalPages - 1 ? 'avoid' : 'always',
                breakAfter: pageIdx === totalPages - 1 ? 'avoid' : 'page',
                padding: '6mm',
                boxSizing: 'border-box',
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#000000',
              }}
            >
              {/* Header on printed sheet */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#64748b', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800 }}>KARTU TOKEN AKSES RESMI - {paperSize} {orientation.toUpperCase()}</span>
                <span>Lembar {pageIdx + 1} dari {totalPages} • BSKAP Deep Learning</span>
              </div>

              {/* Card Grid on physical paper */}
              <div className={getGridClasses(cardDensity)}>
                {pageTokens.map((tokenItem) => (
                  <div
                    key={`print-${tokenItem.id}`}
                    className={`rounded-xl border-2 ${themeStyle.cardBorder} bg-white flex flex-col justify-between overflow-hidden relative ${
                      showCutLines ? 'border-dashed' : 'border-solid'
                    }`}
                    style={{
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      minHeight: cardDensity === '10' ? '180px' : cardDensity === '8' ? '220px' : cardDensity === '6' ? '270px' : '310px',
                    }}
                  >
                    {/* Scissor Cut Mark */}
                    {showCutLines && (
                      <div className="absolute top-1 right-1 z-20 flex items-center text-[9px] text-slate-400 font-mono">
                        ✂
                      </div>
                    )}

                    {/* Header */}
                    <div className={`p-2.5 ${themeStyle.headerBg} flex items-center justify-between gap-2 shrink-0 border-b ${themeStyle.cardBorder}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-amber-300 shrink-0 font-bold text-[10px]">
                          DL
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[10px] font-black uppercase tracking-tight truncate leading-tight">
                            {subInstitutionName || institutionName}
                          </h5>
                          <p className="text-[8.5px] text-white/90 font-medium truncate leading-tight">
                            {eventTitle}
                          </p>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ${themeStyle.ribbonColor}`}>
                        KARTU RESMI
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2 bg-white">
                      
                      {/* Recipient */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 block">
                            Pemegang Akses:
                          </span>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-tight">
                            {tokenItem.label || 'Guru / Pengguna'}
                          </h4>
                          {tokenItem.schoolName && (
                            <p className="text-[9.5px] text-slate-600 truncate font-medium">
                              {tokenItem.schoolName}
                            </p>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase border shrink-0 ${themeStyle.badgeRole}`}>
                          {tokenItem.role.toUpperCase()}
                        </span>
                      </div>

                      {/* Token Box & QR Code */}
                      <div className="flex items-center justify-between gap-3 my-1">
                        <div className="flex-1 min-w-0">
                          <span className={`text-[8.5px] font-bold uppercase tracking-wider block mb-0.5 ${themeStyle.tokenLabel}`}>
                            KODE TOKEN RPP:
                          </span>
                          <div className={`p-2 rounded-xl border-2 font-mono font-black text-center tracking-wider text-base sm:text-lg ${themeStyle.tokenBox}`}>
                            {tokenItem.token}
                          </div>
                          <span className="text-[7.5px] text-slate-500 font-mono mt-0.5 block text-center">
                            Masukkan kode di atas pada menu Login Token
                          </span>
                        </div>

                        {showQrCode && qrCodeUrls[tokenItem.id] && (
                          <div className="shrink-0 flex flex-col items-center">
                            <div className="p-1 bg-white rounded-lg border border-slate-300">
                              <img
                                src={qrCodeUrls[tokenItem.id]}
                                alt={`QR ${tokenItem.token}`}
                                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                              />
                            </div>
                            <span className="text-[7.5px] font-bold text-slate-600 mt-0.5">
                              Scan & Masuk
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Validity */}
                      {showValidity && (
                        <div className="flex items-center justify-between text-[8.5px] text-slate-600 border-t border-slate-200 pt-1 font-medium">
                          <span>
                            Berlaku:{' '}
                            <strong className="text-slate-800 font-bold">
                              {tokenItem.expiresAt
                                ? new Date(tokenItem.expiresAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Selamanya'}
                            </strong>
                          </span>
                          <span>
                            Kuota:{' '}
                            <strong className="text-slate-800 font-bold">
                              {tokenItem.maxUses > 0 ? `${tokenItem.maxUses} Kali` : 'Tanpa Batas'}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {showInstructions && (
                      <div className={`px-2.5 py-1.5 border-t text-[8px] flex items-center justify-between gap-2 shrink-0 ${themeStyle.footerBg}`}>
                        <div className="flex items-center gap-1 truncate">
                          <span className="font-bold">Akses:</span>
                          <span className="font-mono underline truncate">{appUrl.replace(/^https?:\/\//, '')}</span>
                        </div>
                        <span className="font-bold uppercase tracking-wider shrink-0 text-slate-600">
                          BSKAP VERIFIED
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
