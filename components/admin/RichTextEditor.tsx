"use client";

import { useState, useRef } from "react";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  FileText,
} from "lucide-react";
import MediaPickerModal from "./MediaPickerModal";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label = "Isi Konten Artikel (HTML / Rich Text)",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate words and reading time
  const wordCount = value
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const insertSnippet = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleInsertImage = (url: string, altText?: string) => {
    const figureHtml = `
<figure>
  <img src="${url}" alt="${altText || "Gambar Artikel"}" loading="lazy" />
  <figcaption>${altText || "Keterangan gambar"}</figcaption>
</figure>
`;
    insertSnippet(figureHtml);
  };

  const handleInsertLink = () => {
    const url = prompt("Masukkan URL tujuan tautan (link):", "https://");
    if (!url) return;
    insertSnippet(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, "</a>", "teks tautan");
  };

  return (
    <div className="flex flex-col rounded-2xl border border-isy-line bg-white shadow-xs overflow-hidden">
      {/* Top Header & Tab Switch */}
      <div className="flex flex-wrap items-center justify-between border-b border-isy-line bg-isy-ivory/60 px-4 py-2.5 gap-2">
        <label className="text-xs font-bold text-isy-emerald">{label}</label>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-semibold text-isy-text-secondary">
            {wordCount} kata • ±{readingTime} menit baca
          </div>

          <div className="flex rounded-lg border border-isy-line bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                activeTab === "write"
                  ? "bg-isy-emerald text-white"
                  : "text-isy-text-secondary hover:text-isy-emerald"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Tulis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                activeTab === "preview"
                  ? "bg-isy-emerald text-white"
                  : "text-isy-text-secondary hover:text-isy-emerald"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Pratinjau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formatting Toolbar (Only in write mode) */}
      {activeTab === "write" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-isy-line bg-white px-3 py-2">
          <button
            type="button"
            onClick={() => insertSnippet("<h2>", "</h2>", "Subjudul H2")}
            title="Heading 2"
            className="flex items-center gap-1 rounded-lg p-1.5 text-xs font-bold text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<h3>", "</h3>", "Subjudul H3")}
            title="Heading 3"
            className="flex items-center gap-1 rounded-lg p-1.5 text-xs font-bold text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-isy-line mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet("<strong>", "</strong>", "teks tebal")}
            title="Teks Tebal (Bold)"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<em>", "</em>", "teks miring")}
            title="Teks Miring (Italic)"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-isy-line mx-1" />
          <button
            type="button"
            onClick={handleInsertLink}
            title="Sisipkan Tautan (Link)"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            title="Sisipkan Gambar dari Media Library"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-isy-emerald bg-isy-mist hover:bg-isy-green-bright hover:text-white transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Sisipkan Gambar</span>
          </button>
          <div className="h-4 w-[1px] bg-isy-line mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet("<ul>\n  <li>", "</li>\n</ul>", "Poin daftar")}
            title="Daftar Bullet"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<ol>\n  <li>", "</li>\n</ol>", "Langkah nomor")}
            title="Daftar Bernomor"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<blockquote>\n  ", "\n</blockquote>", "Kutipan penting...")}
            title="Kutipan (Blockquote)"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("<p>", "</p>", "Teks paragraf baru")}
            title="Paragraf"
            className="rounded-lg p-1.5 text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald text-xs font-bold"
          >
            P
          </button>
        </div>
      )}

      {/* Editor Area */}
      {activeTab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          placeholder="Tulis artikel di sini menggunakan format teks atau HTML..."
          className="w-full resize-y p-5 font-mono text-xs sm:text-sm text-isy-ink leading-relaxed focus:outline-none admin-scrollbar"
        />
      ) : (
        <div className="p-6 bg-isy-ivory/30 min-h-[380px] overflow-y-auto admin-scrollbar">
          {value ? (
            <div
              className="article-content max-w-none prose prose-headings:font-sans prose-headings:text-isy-emerald prose-p:text-isy-ink/80 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-isy-text-secondary gap-2">
              <FileText className="h-8 w-8 text-isy-line" />
              <span className="text-sm">Belum ada konten untuk dipratinjau.</span>
            </div>
          )}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleInsertImage}
        defaultCategory="blog"
      />
    </div>
  );
}
