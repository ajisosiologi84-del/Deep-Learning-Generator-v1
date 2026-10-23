import type { VercelRequest, VercelResponse } from '@vercel/node';

// Fallback in-memory store for serverless environment
let globalConfig = {
  supabase: {
    supabaseUrl: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim(),
    supabaseAnonKey: (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim(),
    tableName: 'app_tokens',
    enabled: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
  },
  webhook: {
    webhookUrl: (process.env.VITE_GOOGLE_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_WEBHOOK_URL || '').trim(),
    enabled: Boolean(process.env.VITE_GOOGLE_SCRIPT_WEBHOOK_URL || process.env.GOOGLE_SCRIPT_WEBHOOK_URL),
    logOnLogin: true,
    logOnGenerateRpp: true,
    logOnExportDoc: true,
  },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const body = req.body || {};
    globalConfig = {
      supabase: { ...globalConfig.supabase, ...(body.supabase || {}) },
      webhook: { ...globalConfig.webhook, ...(body.webhook || {}) },
    };
    return res.status(200).json({ success: true, config: globalConfig });
  }

  // GET
  return res.status(200).json(globalConfig);
}
