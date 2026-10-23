import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sectionName, currentContent, instruction } = req.body || {};

  if (!ai) {
    return res.status(400).json({
      error: 'Fitur penyempurnaan AI membutuhkan GEMINI_API_KEY aktif di environment variables.',
    });
  }

  try {
    const prompt = `Anda adalah pakar Kurikulum Merdeka BSKAP untuk Pembelajaran Mendalam (Deep Learning).
Perbaiki atau kembangkan bagian "${sectionName}" berikut berdasarkan instruksi: "${instruction}".

Konten saat ini:
${typeof currentContent === 'object' ? JSON.stringify(currentContent, null, 2) : currentContent}

Kembalikan hasil revisi yang telah disesuaikan dan siap pakai, mempertahankan nuansa Mindful, Meaningful, dan Joyful serta konteks murid.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah konsultan ahli kurikulum Deep Learning BSKAP.',
        temperature: 0.7,
      },
    });

    return res.status(200).json({ success: true, revisedContent: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Gagal memproses perbaikan.' });
  }
}
