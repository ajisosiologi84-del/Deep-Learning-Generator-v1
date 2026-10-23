import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || 'https://ozprerxcoxyhfclnbioc.supabase.co').replace(/\/+$/, '');
const SUPABASE_KEY = (process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cHJlcnhjb3h5aGZjbG5iaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1Mzc5MjIsImV4cCI6MjEwNzExMzkyMn0.Bye79O7mcfz6gjHGDAFcqUihGW03mpUxy4QkALrbl9s').trim();
const TABLE_NAME = 'app_tokens';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&order=created_at.desc`;
    const response = await fetch(endpoint, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const rows = await response.json();
      return res.status(200).json({ success: true, tokens: rows });
    }
    return res.status(200).json({ success: false, tokens: [] });
  } catch (err) {
    return res.status(200).json({ success: false, tokens: [] });
  }
}
