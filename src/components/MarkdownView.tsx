import React, { useState } from 'react';
import { RPPData } from '../types/rpp';
import { rppToMarkdown, downloadMarkdown } from '../utils/exportUtils';
import { Copy, Check, Download, Code, Eye } from 'lucide-react';

interface MarkdownViewProps {
  rpp: RPPData;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ rpp }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const markdownText = rppToMarkdown(rpp);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Format Markdown Murni Standar BSKAP
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
            Siap Salin & Tempel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 font-medium transition"
          >
            {showRaw ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            {showRaw ? 'Lihat Tampilan Rapi' : 'Lihat Raw Markdown'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Markdown'}
          </button>

          <button
            type="button"
            onClick={() => downloadMarkdown(rpp)}
            className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh .md
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 font-mono text-xs text-slate-800 leading-relaxed overflow-x-auto bg-slate-900 text-slate-100 max-h-[700px] overflow-y-auto">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed selection:bg-emerald-600 selection:text-white">
          {markdownText}
        </pre>
      </div>
    </div>
  );
};
