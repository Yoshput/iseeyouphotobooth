"use client";

import { useState } from "react";
import { Link as LinkIcon, Share2, Check } from "lucide-react";

export default function ShareButtons({ title, slug }: { title: string, slug: string }) {
  const [copied, setCopied] = useState(false);
  
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : `https://optikiseeyou.com/blog/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareWA = () => {
    const text = encodeURIComponent(`*${title}*\n\nBaca informasi lengkap agenda booth di Rita SuperMall Purwokerto:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareNative = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Informasi booth Optik I See You di Rita SuperMall Purwokerto: ${title}`,
          url,
        });
      } catch {
        // User dismissed or cancelled share dialog
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-b border-isy-line py-6 my-10">
      <span className="font-semibold text-isy-ink flex items-center text-sm mr-2">
        <Share2 className="w-4 h-4 mr-2 text-isy-green-deep" /> Bagikan:
      </span>
      <button 
        onClick={copyLink}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-isy-line bg-white hover:bg-isy-mist active:scale-95 transition-all text-xs font-semibold text-isy-ink shadow-2xs cursor-pointer"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
        <span>{copied ? 'Tautan Tersalin' : 'Salin Tautan'}</span>
      </button>
      <button 
        onClick={shareWA}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#25D366] text-white hover:bg-[#20b858] active:scale-95 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        <span>WhatsApp</span>
      </button>
      <button 
        onClick={shareNative}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-isy-line bg-white hover:bg-isy-mist active:scale-95 transition-all text-xs font-semibold text-isy-green-deep shadow-2xs cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Menu Bagikan</span>
      </button>
    </div>
  );
}
