import React, { useState, useEffect } from 'react';
import { RPPData, RPPInputFormState } from './types/rpp';
import { PRESETS } from './data/presets';
import { DEFAULT_LOGO_SEKOLAH, DEFAULT_LOGO_PEMDA } from './data/defaultLogos';
import { generateRPP } from './services/rppService';
import { Header } from './components/Header';
import { RppInputForm } from './components/RppInputForm';
import { OfficialTableView } from './components/OfficialTableView';
import { InteractiveCardView } from './components/InteractiveCardView';
import { MarkdownView } from './components/MarkdownView';
import { GeminiPromptView } from './components/GeminiPromptView';
import { DeepLearningGuideModal } from './components/DeepLearningGuideModal';
import { RefineSectionModal } from './components/RefineSectionModal';
import { GenerationProgressModal } from './components/GenerationProgressModal';
import { AppOnboardingTourModal } from './components/AppOnboardingTourModal';
import { TokenLoginModal } from './components/TokenLoginModal';
import { AdminTokenManagerModal } from './components/AdminTokenManagerModal';
import { InactivityWarningModal } from './components/InactivityWarningModal';
import { useInactivityAutoLogout } from './hooks/useInactivityAutoLogout';
import { tokenService } from './services/tokenService';
import { webhookService } from './services/webhookService';
import { supabaseService } from './services/supabaseService';
import { TokenSession, AdminConfig } from './types/token';
import {
  Sparkles,
  SlidersHorizontal,
  Key,
} from 'lucide-react';

export const createDefaultInputState = (session?: TokenSession | null): RPPInputFormState => ({
  namaGuru: session?.label && !session.label.startsWith('Voucher') && !session.label.startsWith('Akses Dewan Guru') ? session.label : '',
  nipGuru: '',
  satuanPendidikan: session?.schoolName || '',
  namaDinas: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
  alamatSekolah: '',
  kontakSekolah: '',
  tampilkanKop: true,
  logoKiri: DEFAULT_LOGO_SEKOLAH,
  logoKanan: DEFAULT_LOGO_PEMDA,
  namaKepalaSekolah: '',
  nipKepalaSekolah: '',
  tempatPenetapan: '',
  tanggalPenetapan: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  kelas: 'Fase D (Kelas 7 SMP)',
  fase: 'Fase D',
  semester: 'Ganjil',
  mapel: '',
  topik: '',
  alokasiWaktu: '2 x 45 Menit (1 Pertemuan)',
  minat: '',
  caraBelajar: '',
  lingkungan: '',
  selectedDpl: [3, 4, 5],
  capaianPembelajaran: '',
  elemenCP: '',
  pemahamanBermakna: '',
  pertanyaanPemantik: '',
  diferensiasiKonten: '',
  diferensiasiProses: '',
  diferensiasiProduk: '',
  saranaPrasarana: '',
});

export const createDefaultRPPData = (input: RPPInputFormState): RPPData => ({
  identitas: {
    nama: input.namaGuru || 'Guru Pengampu',
    kelas: input.kelas || 'Fase D (Kelas 7 SMP)',
    fase: input.fase || 'Fase D',
    semester: input.semester || 'Ganjil',
    mapel: input.mapel || 'Mata Pelajaran',
    topik: input.topik || 'Topik Pembelajaran',
    alokasiWaktu: input.alokasiWaktu || '2 x 45 Menit',
    satuanPendidikan: input.satuanPendidikan || 'Satuan Pendidikan',
  },
  kopSekolah: {
    tampilkanKop: input.tampilkanKop ?? true,
    namaDinas: input.namaDinas || 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    namaSekolah: input.satuanPendidikan || 'SEKOLAH PENGGERAK',
    alamatSekolah: input.alamatSekolah || '',
    kontakSekolah: input.kontakSekolah || '',
    logoKiri: input.logoKiri || DEFAULT_LOGO_SEKOLAH,
    logoKanan: input.logoKanan || DEFAULT_LOGO_PEMDA,
  },
  pengesahan: {
    tempatPenetapan: input.tempatPenetapan || 'Ditetapkan',
    tanggalPenetapan: input.tanggalPenetapan || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    namaKepalaSekolah: input.namaKepalaSekolah || 'Kepala Sekolah, M.Pd.',
    nipKepalaSekolah: input.nipKepalaSekolah || '-',
    namaGuru: input.namaGuru || 'Guru Pengampu',
    nipGuru: input.nipGuru || '-',
  },
  profilMurid: {
    minat: input.minat || 'Eksplorasi kontekstual, media digital, dan diskusi kelompok',
    caraBelajar: input.caraBelajar || 'Visual, kinestetik, dan kolaborasi',
    lingkungan: input.lingkungan || 'Lingkungan masyarakat sekolah dan sekitarnya',
  },
  dplTerpilih: [
    { id: 3, nama: 'Penalaran Kritis', alasan: 'Menganalisis sebab-akibat secara mendalam.' },
    { id: 4, nama: 'Kreativitas', alasan: 'Menghasilkan inovasi karya yang kontekstual.' },
    { id: 5, nama: 'Kolaborasi', alasan: 'Bekerja sama dalam kelompok heterogen secara inklusif.' },
  ],
  capaianPembelajaran: input.capaianPembelajaran || '',
  elemenCP: input.elemenCP || '',
  pemahamanBermakna: input.pemahamanBermakna || '',
  pertanyaanPemantik: input.pertanyaanPemantik ? input.pertanyaanPemantik.split('\n').filter(Boolean) : [],
  diferensiasiPembelajaran: {
    konten: input.diferensiasiKonten || 'Bahan ajar multi-modal (teks, visual, audio) disesuaikan dengan profil dan kesiapan belajar murid.',
    proses: input.diferensiasiProses || 'Scaffolding bertingkat: pendampingan intensif bagi murid yang baru memulai dan tantangan mandiri bagi yang cakap.',
    produk: input.diferensiasiProduk || 'Kebebasan memilih bentuk unjuk kerja kontekstual (infografis, rekaman narasi, unjuk karya fisik).',
  },
  saranaPrasarana: input.saranaPrasarana || 'Media ajar multi-modal, perangkat TIK, lembar kerja inkuiri, dan sumber belajar autentik.',
  desainPembelajaran: {
    tujuanPembelajaran: 'Peserta didik mampu memahami konsep esensial dan mengaplikasikannya dalam memecahkan masalah kontekstual secara berkesadaran.',
    praktikPedagogis: 'Model pembelajaran berbasis masalah (PBL) dan berbasis proyek kontekstual (PjBL) yang mengintegrasikan alur M3.',
    kemitraanPembelajaran: 'Melibatkan rekan sejawat, lingkungan keluarga, dan komunitas sekolah sebagai sumber belajar autentik.',
    lingkunganPembelajaran: 'Pengaturan kelas dinamis, aman secara psikologis, menghargai keberagaman, dan mendorong rasa ingin tahu.',
    pemanfaatanDigital: 'Aplikasi presentasi, media audio-visual interaktif, dan lembar kolaborasi digital.',
  },
  pengalamanBelajar: {
    memahami: {
      judul: 'Memahami (Mindful)',
      langkahLangkah: [
        'Guru menghadirkan stimulus kontekstual yang memantik perhatian dan kesadaran berkesadaran murid.',
        'Murid mengeksplorasi pertanyaan pemantik dan mendiskusikan konsep kunci dalam kelompok kecil.',
        'Guru bersama murid menyimpulkan esensi pemahaman konsep dasar dan mengonfirmasi pemahaman.',
      ],
    },
    mengaplikasikan: {
      judul: 'Mengaplikasikan (Meaningful, Joyful)',
      langkahLangkah: [
        'Murid melakukan investigasi dan menghubungkan materi dengan tantangan riil di lingkungan sekitar.',
        'Kelompok merancang karya atau solusi nyata secara kolaboratif dalam suasana menyenangkan.',
        'Gelar karya / unjuk kerja: Setiap tim memamerkan hasil karya dan menerima umpan balik apresiatif.',
      ],
    },
    merefleksikan: {
      judul: 'Merefleksikan (Mindful, Meaningful)',
      pertanyaanRefleksi: [
        'Apa hal paling berharga dan bermakna yang kalian pelajari hari ini?',
        'Bagaimana pembelajaran ini mengubah cara pandang kalian terhadap situasi di sekitar?',
        'Aksi konkret apa yang akan kalian lakukan setelah memahami konsep ini?',
      ],
      aktivitasRefleksi: 'Murid menuliskan refleksi metakognisi pada lembar refleksi diri secara hening dan berkesadaran.',
    },
  },
  asesmen: {
    awal: 'Assessment of Learning (Awal): Pemetaan diagnostik kesiapan dan apersepsi kontekstual.',
    proses: 'Assessment as Learning (Proses): Lembar observasi keterlibatan, self-assessment, dan peer-feedback.',
    akhir: 'Assessment for Learning (Akhir): Asesmen unjuk karya kontekstual dan presentasi solusi tim.',
  },
  rubrikPenilaian: [
    {
      kriteria: '1. Penguasaan Konsep Esensial',
      baruMemulai: 'Mampu mengenali konsep dasar dengan bimbingan penuh fasilitator.',
      berkembang: 'Mampu menjelaskan konsep pokok namun belum konsisten mengaitkannya dengan konteks.',
      cakap: 'Mampu menguraikan konsep secara mandiri dan mengaitkannya dengan situasi nyata secara logis.',
      sangatBerkembang: 'Mampu menganalisis secara kritis, menghubungkan lintas konsep, dan merumuskan wawasan baru.',
    },
    {
      kriteria: '2. Penalaran Kritis & Pemecahan Masalah',
      baruMemulai: 'Mengikuti alur pemecahan masalah dengan instruksi langsung.',
      berkembang: 'Mulai mengidentifikasi alternatif solusi dengan pendampingan bertahap.',
      cakap: 'Mampu merumuskan argumen kausalitas dan solusi yang aplikatif secara mandiri.',
      sangatBerkembang: 'Menunjukkan analisis mendalam, orisinalitas tinggi, dan solusi bernilai manfaat nyata.',
    },
    {
      kriteria: '3. Kolaborasi & Komunikasi Berkesadaran',
      baruMemulai: 'Berpartisipasi pasif dalam diskusi kelompok.',
      berkembang: 'Aktif menyampaikan gagasan dan mulai menghargai sudut pandang anggota lain.',
      cakap: 'Berkontribusi nyata, mendengarkan secara aktif, dan menyatukan perbedaan ide dalam tim.',
      sangatBerkembang: 'Menunjukkan kepemimpinan empatik, menginspirasi kerja sama inklusif, dan mengomunikasikan ide persuasif.',
    },
  ],
});

export default function App() {
  const [activeSession, setActiveSession] = useState<TokenSession | null>(() => tokenService.getActiveSession());
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [inputState, setInputState] = useState<RPPInputFormState>(() => createDefaultInputState(tokenService.getActiveSession()));
  const [rppData, setRppData] = useState<RPPData>(() => createDefaultRPPData(createDefaultInputState(tokenService.getActiveSession())));
  const [activeTab, setActiveTab] = useState<'official' | 'interactive' | 'gemini' | 'markdown'>('official');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => tokenService.getAdminConfig());
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [inactivityNotice, setInactivityNotice] = useState<boolean>(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(() => {
    try {
      const hidden = localStorage.getItem('hide_rpp_onboarding_guide');
      return hidden !== 'true';
    } catch {
      return true;
    }
  });

  // Automatically sync Supabase & Google Apps Script configuration and all cloud tokens from global server
  // Ensures any browser, new teacher device, or incognito session connects automatically and has all 33 tokens
  useEffect(() => {
    supabaseService.syncFromGlobalServer().catch(() => {});
    webhookService.syncFromGlobalServer().catch(() => {});
    tokenService.syncCloudTokens().catch(() => {});

    // Check for ?token=... in URL (e.g. from scanned printed Token Card QR code)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl && !activeSession) {
      const validateFromUrl = async () => {
        try {
          const res = await tokenService.validateTokenAsync(tokenFromUrl);
          if (res.valid && res.tokenData) {
            const session: TokenSession = {
              token: res.tokenData.token,
              label: res.tokenData.label,
              role: res.tokenData.role,
              schoolName: res.tokenData.schoolName,
              loginTime: new Date().toISOString(),
              isAdmin: res.isAdminPasscode || false,
            };
            tokenService.setActiveSession(session);
            setActiveSession(session);
            setLoginModalOpen(false);
            // Record login activity
            webhookService.logActivity({
              actionType: 'LOGIN',
              userLabel: session.label,
              tokenCode: session.token,
              schoolName: session.schoolName,
              role: session.role,
              details: `Login otomatis via scan QR Kartu Token: ${session.token}`,
              status: 'SUCCESS',
            });
            // Clean up the URL query parameter without reloading page
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (e) {
          console.warn('Auto-login from URL token failed:', e);
        }
      };
      validateFromUrl();
    }
  }, []);

  // Handle User Logout explicitly or automatically
  const handleLogout = (reason?: 'inactivity' | 'user') => {
    tokenService.clearActiveSession();
    setActiveSession(null);
    if (reason === 'inactivity') {
      setInactivityNotice(true);
    }
    // Always open login modal if token is required or on session close
    setLoginModalOpen(true);
  };

  // 15-Minute Inactivity Auto-Logout Hook
  const { remainingSeconds, isWarning, resetTimer } = useInactivityAutoLogout({
    timeoutMs: 15 * 60 * 1000, // 15 minutes
    warningBeforeMs: 60 * 1000, // 60 seconds countdown modal warning
    enabled: !!activeSession, // only active when a session is logged in
    onLogout: () => {
      handleLogout('inactivity');
    },
  });

  // Refine section modal state
  const [refineModalOpen, setRefineModalOpen] = useState<boolean>(false);
  const [refineTarget, setRefineTarget] = useState<{ sectionName: string; content: any }>({
    sectionName: '',
    content: null,
  });

  const handleGenerate = async (overrideState?: RPPInputFormState) => {
    const stateToUse = overrideState || inputState;
    setIsLoading(true);
    setIsGenerating(true);
    setIsGenerationComplete(false);

    const startTime = Date.now();
    try {
      const result = await generateRPP(stateToUse);

      // Ensure at least 2.2 seconds of pedagogical animation for user clarity
      const elapsed = Date.now() - startTime;
      if (elapsed < 2200) {
        await new Promise((resolve) => setTimeout(resolve, 2200 - elapsed));
      }

      if (result.success && result.data) {
        const enriched: RPPData = {
          ...result.data,
          kopSekolah: {
            tampilkanKop: result.data.kopSekolah?.tampilkanKop ?? stateToUse.tampilkanKop ?? true,
            namaDinas: result.data.kopSekolah?.namaDinas || stateToUse.namaDinas || 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
            namaSekolah: result.data.kopSekolah?.namaSekolah || stateToUse.satuanPendidikan || 'SEKOLAH PENGGERAK',
            alamatSekolah: result.data.kopSekolah?.alamatSekolah || stateToUse.alamatSekolah || '',
            kontakSekolah: result.data.kopSekolah?.kontakSekolah || stateToUse.kontakSekolah || '',
            logoKiri: result.data.kopSekolah?.logoKiri || stateToUse.logoKiri,
            logoKanan: result.data.kopSekolah?.logoKanan || stateToUse.logoKanan,
          },
          pengesahan: result.data.pengesahan || {
            tempatPenetapan: stateToUse.tempatPenetapan || 'Kota',
            tanggalPenetapan: stateToUse.tanggalPenetapan || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            namaKepalaSekolah: stateToUse.namaKepalaSekolah || 'Drs. H. Bambang Sudiro, M.Pd.',
            nipKepalaSekolah: stateToUse.nipKepalaSekolah || '19720412 199802 1 004',
            namaGuru: stateToUse.namaGuru || result.data.identitas.nama,
            nipGuru: stateToUse.nipGuru || '19890615 201503 1 002',
          },
        };
        setRppData(enriched);

        // Record to Google Sheets Webhook and local history (Hybrid Model)
        webhookService.logActivity({
          actionType: 'GENERATE_RPP',
          userLabel: enriched.identitas.nama || 'Guru',
          schoolName: enriched.identitas.satuanPendidikan,
          subject: enriched.identitas.mapel,
          gradeLevel: `${enriched.identitas.kelas} (${enriched.identitas.fase || '-'})`,
          details: `Penyusunan RPP Deep Learning: "${enriched.identitas.topik}" [Alokasi: ${enriched.identitas.alokasiWaktu || '-'}]`,
          status: 'SUCCESS',
        });
        setHasGenerated(true);
      }
      setIsGenerationComplete(true);
    } catch (err) {
      console.error('Error generating RPP:', err);
      setIsGenerationComplete(true);
    }
  };

  const handleResetCleanForm = () => {
    const clean = createDefaultInputState(activeSession);
    setInputState(clean);
    setRppData(createDefaultRPPData(clean));
    setHasGenerated(false);
  };

  const handleLoadPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setInputState(found.formInput);
      setRppData(found.rppData);
      setHasGenerated(true);
    }
  };

  const handleOpenRefine = (sectionName: string, content: any) => {
    setRefineTarget({ sectionName, content });
    setRefineModalOpen(true);
  };

  const handleApplyRevised = (sectionName: string, revised: any) => {
    setRppData((prev) => {
      if (sectionName === 'Desain Pembelajaran' && typeof revised === 'object') {
        return { ...prev, desainPembelajaran: { ...prev.desainPembelajaran, ...revised } };
      }
      if (sectionName === 'Asesmen' && typeof revised === 'object') {
        return { ...prev, asesmen: { ...prev.asesmen, ...revised } };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        onOpenGuide={() => setGuideModalOpen(true)}
        onOpenOnboarding={() => setOnboardingModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGenerated={hasGenerated}
        activeSession={activeSession}
        onOpenAdminToken={() => {
          if (activeSession?.isAdmin) {
            setAdminModalOpen(true);
          } else {
            setLoginModalOpen(true);
          }
        }}
        onOpenLoginToken={() => setLoginModalOpen(true)}
        onLogoutToken={() => handleLogout('user')}
        inactivityRemainingSeconds={activeSession ? remainingSeconds : undefined}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Quick Context Alert */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                AI Perancang Pembelajaran Mendalam (Deep Learning) Kurikulum Merdeka BSKAP
              </p>
              <p className="text-xs text-slate-500">
                Lengkap dengan Kop Sekolah, Lembar TTD & NIP, Alur M3 (Memahami, Mengaplikasikan, Merefleksikan), serta Ekspor Word, PDF, Excel & Prompt Gemini.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setOnboardingModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition shadow-2xs"
              title="Buka animasi panduan langkah awal penggunaan"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>🎬 Panduan Awal</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isSidebarOpen ? 'Tutup Formulir' : 'Buka Formulir'}</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Input Form (collapsible) */}
          {isSidebarOpen && (
            <div className="lg:col-span-5 space-y-4 print:hidden transition-all animate-fadeIn">
              <RppInputForm
                inputState={inputState}
                setInputState={setInputState}
                onSubmit={handleGenerate}
                isLoading={isLoading}
                onLoadPreset={handleLoadPreset}
                onResetCleanForm={handleResetCleanForm}
              />
            </div>
          )}

          {/* Right Column: Output Viewer */}
          <div className={`${isSidebarOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4 transition-all`}>
            
            {/* Guide banner when starting fresh */}
            {!hasGenerated && (
              <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden animate-fadeIn">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-wider text-emerald-200">
                      Aplikasi Siap Digunakan
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold">Formulir RPP Baru Aktif</h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/90">
                    Isi identitas guru, CP & materi Anda di formulir sebelah kiri, lalu klik &quot;Rancang RPP Deep Learning&quot;.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('gurindam-pesisir')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-bold hover:bg-emerald-50 transition cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  Lihat Contoh Dokumen BSKAP
                </button>
              </div>
            )}
            
            {/* Official Table View (Always kept in DOM for PDF export and printing reliability) */}
            <div className={activeTab === 'official' ? 'block' : 'fixed -left-[9999px] top-0 pointer-events-none w-[794px]'}>
              <OfficialTableView
                rpp={rppData}
                onUpdateRpp={setRppData}
                onOpenRefine={handleOpenRefine}
                onOpenGeminiPrompt={() => setActiveTab('gemini')}
              />
            </div>

            {activeTab === 'interactive' && (
              <InteractiveCardView
                rpp={rppData}
                onOpenRefine={handleOpenRefine}
                onSwitchToOfficial={() => setActiveTab('official')}
                onSwitchToGemini={() => setActiveTab('gemini')}
              />
            )}

            {activeTab === 'gemini' && (
              <GeminiPromptView rpp={rppData} />
            )}

            {activeTab === 'markdown' && (
              <MarkdownView rpp={rppData} />
            )}
          </div>

        </div>
      </main>

      {/* Initial App Animated Onboarding Guide Tour */}
      <AppOnboardingTourModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        onStartCreating={() => setIsSidebarOpen(true)}
      />

      {/* Guide Modal */}
      <DeepLearningGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* AI Refine Section Modal */}
      <RefineSectionModal
        isOpen={refineModalOpen}
        onClose={() => setRefineModalOpen(false)}
        sectionName={refineTarget.sectionName}
        currentContent={refineTarget.content}
        onApplyRevised={handleApplyRevised}
      />

      {/* Animated Generation Progress Modal (Percentage & Pedagogical Stepper) */}
      <GenerationProgressModal
        isOpen={isGenerating}
        isComplete={isGenerationComplete}
        onFinishAnimation={() => {
          setIsGenerating(false);
          setIsLoading(false);
        }}
        topicTitle={inputState.topik}
      />

      {/* Inactivity Auto-Logout Warning Countdown Modal (shows at 60s before 15 mins) */}
      <InactivityWarningModal
        isOpen={isWarning && !!activeSession}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={resetTimer}
        onLogoutNow={() => handleLogout('user')}
      />

      {/* Token Login Gate Modal */}
      <TokenLoginModal
        isOpen={loginModalOpen || (adminConfig.requireTokenLogin && !activeSession)}
        canDismiss={!adminConfig.requireTokenLogin || !!activeSession}
        onClose={() => setLoginModalOpen(false)}
        inactivityLogoutNotice={inactivityNotice}
        onDismissNotice={() => setInactivityNotice(false)}
        onSuccess={(session) => {
          setActiveSession(session);
          setInactivityNotice(false);
          setLoginModalOpen(false);
          resetTimer();
        }}
        onOpenAdminPanel={() => {
          setLoginModalOpen(false);
          setAdminModalOpen(true);
        }}
      />

      {/* Admin Token Manager Modal */}
      <AdminTokenManagerModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onConfigChanged={() => {
          setAdminConfig(tokenService.getAdminConfig());
        }}
      />
    </div>
  );
}
