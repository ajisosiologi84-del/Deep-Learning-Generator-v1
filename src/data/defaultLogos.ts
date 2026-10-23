/**
 * Default SVG Data URIs for official Kop Surat:
 * 1. Logo Sekolah (Kiri) - Lambang pendidikan nasional / sekolah
 * 2. Logo Pemda (Kanan) - Lambang pemerintah daerah / dinas pendidikan (menggantikan BSKAP 2024)
 */

export const DEFAULT_LOGO_SEKOLAH = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Outer Shield -->
  <path d="M 50 5 L 88 20 C 88 60 50 92 50 95 C 50 92 12 60 12 20 Z" fill="#0284c7" stroke="#0369a1" stroke-width="2.5"/>
  <!-- Inner Shield -->
  <path d="M 50 11 L 82 24 C 82 56 50 85 50 87 C 50 85 18 56 18 24 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
  <!-- Gold Sun / Star of Excellence -->
  <polygon points="50,16 53,24 61,24 55,29 57,37 50,32 43,37 45,29 39,24 47,24" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
  <!-- Torch / Obor Pendidikan -->
  <path d="M 47 48 L 53 48 L 51 68 L 49 68 Z" fill="#b45309"/>
  <path d="M 45 44 C 45 36 50 32 50 32 C 50 32 55 36 55 44 C 55 47 53 48 50 48 C 47 48 45 47 45 44 Z" fill="#ef4444"/>
  <path d="M 48 44 C 48 39 50 36 50 36 C 50 36 52 39 52 44 Z" fill="#facc15"/>
  <!-- Open Book / Buku Terbuka -->
  <path d="M 50 56 C 42 52 30 54 26 58 L 26 73 C 32 69 42 68 50 71 C 58 68 68 69 74 73 L 74 58 C 70 54 58 52 50 56 Z" fill="#0284c7"/>
  <path d="M 50 58 C 43 54 32 56 28 60 L 28 71 C 34 67 43 66 50 69 C 57 66 66 67 72 71 L 72 60 C 68 56 57 54 50 58 Z" fill="#ffffff"/>
  <!-- Ribbon / Pita -->
  <path d="M 24 76 Q 50 83 76 76 L 79 83 Q 50 91 21 83 Z" fill="#eab308" stroke="#ca8a04" stroke-width="0.8"/>
  <text x="50" y="81" font-family="Arial, sans-serif" font-size="5" font-weight="bold" text-anchor="middle" fill="#1e293b">TUT WURI</text>
</svg>
`)}`;

export const DEFAULT_LOGO_PEMDA = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Outer Pentagon / Segi Lima Pemda -->
  <polygon points="50,6 92,36 76,88 24,88 8,36" fill="#047857" stroke="#065f46" stroke-width="2.5"/>
  <!-- Inner Pentagon -->
  <polygon points="50,12 86,38 72,83 28,83 14,38" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Golden Star -->
  <polygon points="50,17 53,25 61,25 55,30 57,38 50,33 43,38 45,30 39,25 47,25" fill="#f59e0b" stroke="#d97706" stroke-width="0.8"/>
  <!-- Rice and Cotton Wreath (Padi & Kapas) -->
  <!-- Left: Rice (Padi) -->
  <path d="M 32 68 C 26 56 27 42 34 32" fill="none" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
  <circle cx="28" cy="40" r="2.2" fill="#eab308"/>
  <circle cx="27" cy="48" r="2.2" fill="#eab308"/>
  <circle cx="28" cy="56" r="2.2" fill="#eab308"/>
  <circle cx="31" cy="63" r="2.2" fill="#eab308"/>
  <!-- Right: Cotton (Kapas) -->
  <path d="M 68 68 C 74 56 73 42 66 32" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
  <circle cx="72" cy="40" r="2.5" fill="#ffffff" stroke="#10b981" stroke-width="1.2"/>
  <circle cx="73" cy="48" r="2.5" fill="#ffffff" stroke="#10b981" stroke-width="1.2"/>
  <circle cx="72" cy="56" r="2.5" fill="#ffffff" stroke="#10b981" stroke-width="1.2"/>
  <circle cx="69" cy="63" r="2.5" fill="#ffffff" stroke="#10b981" stroke-width="1.2"/>
  <!-- Center Shield (Perisai Pancasila / Lambang Daerah) -->
  <path d="M 50 37 L 62 44 C 62 60 50 67 50 68 C 50 67 38 60 38 44 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <path d="M 50 40 L 59 46 C 59 58 50 64 50 65 C 50 64 41 58 41 46 Z" fill="#ffffff"/>
  <!-- Banyan tree / Rantai / Keris center -->
  <circle cx="50" cy="52" r="5" fill="#047857"/>
  <!-- Banner Ribbon / Pita Pemda -->
  <path d="M 28 75 Q 50 82 72 75 L 75 81 Q 50 89 25 81 Z" fill="#f59e0b" stroke="#d97706" stroke-width="0.8"/>
  <text x="50" y="80" font-family="Arial, sans-serif" font-size="4.5" font-weight="900" text-anchor="middle" fill="#0f172a">PEMDA</text>
</svg>
`)}`;
