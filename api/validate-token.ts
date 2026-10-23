import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || 'https://ozprerxcoxyhfclnbioc.supabase.co').replace(/\/+$/, '');
const SUPABASE_KEY = (process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cHJlcnhjb3h5aGZjbG5iaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mzc5MjIsImV4cCI6MjEwNzExMzkyMn0.Bye79O7mcfz6gjHGDAFcqUihGW03mpUxy4QkALrbl9s').trim();
const TABLE_NAME = 'app_tokens';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  const token = (req.body?.token || '').trim();
  if (!token) {
    return res.status(400).json({ valid: false, message: 'Kode token wajib diisi.' });
  }

  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?token=ilike.${encodeURIComponent(token)}&select=*`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(200).json({
        valid: false,
        message: `Koneksi Supabase error (${response.status})`,
      });
    }

    const rows: any = await response.json();
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(200).json({
        valid: false,
        message: 'Token tidak valid atau tidak terdaftar dalam sistem database.',
      });
    }

    const row = rows[0];
    const appToken = {
      id: row.id,
      token: row.token,
      label: row.label,
      schoolName: row.school_name || '',
      role: row.role || 'guru',
      maxUses: typeof row.max_uses === 'number' ? row.max_uses : -1,
      usedCount: typeof row.used_count === 'number' ? row.used_count : 0,
      expiresAt: row.expires_at || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at || new Date().toISOString(),
      notes: row.notes || '',
    };

    if (!appToken.isActive) {
      return res.status(200).json({
        valid: false,
        message: 'Token ini telah dinonaktifkan oleh Administrator.',
        tokenData: appToken,
      });
    }

    if (appToken.expiresAt && new Date() > new Date(appToken.expiresAt)) {
      return res.status(200).json({
        valid: false,
        message: `Masa berlaku token telah habis pada ${new Date(appToken.expiresAt).toLocaleDateString('id-ID')}.`,
        tokenData: appToken,
      });
    }

    if (appToken.maxUses > 0 && appToken.usedCount >= appToken.maxUses) {
      return res.status(200).json({
        valid: false,
        message: `Batas kuota penggunaan token (${appToken.maxUses}x) telah habis.`,
        tokenData: appToken,
      });
    }

    // Update usage asynchronously in background
    fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?token=eq.${encodeURIComponent(row.token)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ used_count: appToken.usedCount + 1 }),
    }).catch(console.warn);

    return res.status(200).json({
      valid: true,
      message: `Akses berhasil diverifikasi! Selamat datang, ${appToken.label}.`,
      tokenData: { ...appToken, usedCount: appToken.usedCount + 1 },
    });
  } catch (err: any) {
    return res.status(200).json({
      valid: false,
      message: `Gagal memverifikasi token ke Supabase: ${err?.message || 'Koneksi terputus'}`,
    });
  }
}
