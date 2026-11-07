import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import { uploadArticleImage } from '../../lib/supabaseStorage';
import { dataService } from '../../lib/dataService';
import { useApp } from '../../context/AppContext';
import { normalizeImageUrl } from '../../lib/imageUtils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo2,
  Redo2,
  RemoveFormatting,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Info,
  Layers,
  Eye,
  Edit3,
  Smartphone,
  Monitor,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Video,
  Grid
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  language?: 'en' | 'hi';
  placeholder?: string;
}

// Custom Font Size & Font Family Extension using TextStyle
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
      fontFamily: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontFamily,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.fontFamily) return {};
          return { style: `font-family: ${attributes.fontFamily}` };
        },
      },
    };
  },
});

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  language = 'en',
  placeholder = 'Write your article here...'
}) => {
  const { showToast } = useApp();
  const isHindi = language === 'hi';

  // Mode: 'edit' or 'preview'
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Modals & Popovers
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState<'100%' | '75%' | '50%' | '33%'>('100%');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [directImageUrl, setDirectImageUrl] = useState('');

  const [aiToolModalOpen, setAiToolModalOpen] = useState(false);
  const [toolName, setToolName] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [toolDesc, setToolDesc] = useState('');
  const [toolLogo, setToolLogo] = useState('');
  const [toolBtnText, setToolBtnText] = useState(isHindi ? 'वेबसाइट देखें' : 'Visit Website');

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Active custom color picker
  const [textColor, setTextColor] = useState('#0f172a');
  const [highlightColor, setHighlightColor] = useState('#fef08a');

  // Word count and auto-save indicator
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string>('Ready');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      CustomTextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2 hover:text-indigo-700',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto shadow-sm',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Calculate words
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setLastSaved('Autosaved just now');
    },
  });

  // Keep editor content in sync when changing language tabs or loading an article
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>');
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        Initializing rich text editor...
      </div>
    );
  }

  // --- ACTIONS ---

  // Font Size
  const handleFontSizeChange = (size: string) => {
    if (!size) {
      (editor.chain().focus() as any).unsetMark('textStyle').run();
      return;
    }
    (editor.chain().focus() as any).setMark('textStyle', { fontSize: size }).run();
  };

  // Font Family
  const handleFontFamilyChange = (font: string) => {
    if (!font) {
      (editor.chain().focus() as any).unsetMark('textStyle').run();
      return;
    }
    (editor.chain().focus() as any).setMark('textStyle', { fontFamily: font }).run();
  };

  // Heading Select
  const handleHeadingChange = (value: string) => {
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value, 10) as 1 | 2 | 3 | 4;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  // Link Dialog
  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setLinkModalOpen(true);
  };

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const cleanUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('/')
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;

      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: cleanUrl,
          target: linkOpenNewTab ? '_blank' : null,
          rel: linkOpenNewTab ? 'noopener noreferrer' : null,
        })
        .run();
      showToast('Link attached to selected text!', 'success');
    }
    setLinkModalOpen(false);
  };

  // Multiple Image Upload & Insertion
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploadProgress(10);

    try {
      const fileList = Array.from(files);
      let count = 0;

      for (const file of fileList) {
        setUploadProgress(Math.round(((count + 1) / fileList.length) * 85));
        const res = await uploadArticleImage(file);

        // Build HTML figure with alignment, width, and caption
        const alignClass = imageAlign === 'left'
          ? 'float-left mr-6 mb-4'
          : imageAlign === 'right'
          ? 'float-right ml-6 mb-4'
          : 'mx-auto block';

        const captionHtml = imageCaption
          ? `<figcaption style="text-align:center; font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">${imageCaption}</figcaption>`
          : '';

        const figureHtml = `
<figure class="article-image-figure my-6 ${alignClass}" style="width: ${imageWidth}; max-width: 100%;">
  <img src="${res.url}" alt="${imageAlt || file.name}" title="${file.name}" style="width: 100%; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); object-fit: cover;" />
  ${captionHtml}
</figure>
<p></p>
`;
        editor.chain().focus().insertContent(figureHtml).run();
        count++;
      }

      setUploadProgress(100);
      showToast(`${count} image${count > 1 ? 's' : ''} inserted successfully!`, 'success');
      setTimeout(() => {
        setImageModalOpen(false);
        setUploadProgress(null);
        setImageCaption('');
        setImageAlt('');
      }, 500);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed');
      setUploadProgress(null);
      showToast(`Upload error: ${err.message}`, 'error');
    }
  };

  const handleInsertDirectImage = () => {
    if (!directImageUrl.trim()) return;

    const normalizedUrl = normalizeImageUrl(directImageUrl.trim());

    const alignClass = imageAlign === 'left'
      ? 'float-left mr-6 mb-4'
      : imageAlign === 'right'
      ? 'float-right ml-6 mb-4'
      : 'mx-auto block';

    const captionHtml = imageCaption
      ? `<figcaption style="text-align:center; font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">${imageCaption}</figcaption>`
      : '';

    const figureHtml = `
<figure class="article-image-figure my-6 ${alignClass}" style="width: ${imageWidth}; max-width: 100%;">
  <img src="${normalizedUrl}" alt="${imageAlt || 'Article image'}" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/article_fallback.svg';" style="width: 100%; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); object-fit: cover;" />
  ${captionHtml}
</figure>
<p></p>
`;
    editor.chain().focus().insertContent(figureHtml).run();
    setImageModalOpen(false);
    setDirectImageUrl('');
    setImageCaption('');
    setImageAlt('');
    showToast('Image inserted at cursor position!', 'success');
  };

  // AI Tool Card Block
  const handleInsertAiToolCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !toolUrl.trim()) {
      showToast('Tool Name and URL are required', 'error');
      return;
    }

    const cleanUrl = toolUrl.startsWith('http') ? toolUrl.trim() : `https://${toolUrl.trim()}`;
    const logoHtml = toolLogo.trim()
      ? `<img src="${toolLogo.trim()}" alt="${toolName}" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(99,102,241,0.2);" />`
      : `<div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.25rem;">${toolName.charAt(0).toUpperCase()}</div>`;

    const cardHtml = `
<div class="ai-tool-card my-8 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/40 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 shadow-md">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
    <div style="display: flex; align-items: center; gap: 1rem;">
      ${logoHtml}
      <div>
        <h4 style="font-size: 1.15rem; font-weight: 800; color: #1e1b4b; margin: 0; line-height: 1.2;">${toolName}</h4>
        <span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.05em;">AI Power Tool</span>
      </div>
    </div>
    <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; background-color: #4f46e5; color: white; font-size: 0.875rem; font-weight: 600; border-radius: 0.75rem; text-decoration: none; box-shadow: 0 2px 4px rgba(79,70,229,0.3); transition: background-color 0.2s;">
      <span>${toolBtnText || 'Visit Website'}</span>
      <span aria-hidden="true">→</span>
    </a>
  </div>
  <p style="margin-top: 1rem; margin-bottom: 0; font-size: 0.875rem; line-height: 1.6; color: #475569;">${toolDesc || 'Leading artificial intelligence platform for professional productivity, automation, and research.'}</p>
</div>
<p></p>
`;
    editor.chain().focus().insertContent(cardHtml).run();
    setAiToolModalOpen(false);
    setToolName('');
    setToolUrl('');
    setToolDesc('');
    setToolLogo('');
    showToast('AI Tool Card block inserted!', 'success');
  };

  // Callout Notice Boxes
  const insertCallout = (type: 'tip' | 'info' | 'warning') => {
    let title = 'Pro Tip';
    let borderColor = '#10b981';
    let bgColor = 'rgba(16, 185, 129, 0.08)';
    let textColor = '#065f46';
    let icon = '💡';

    if (type === 'info') {
      title = 'Important Note';
      borderColor = '#3b82f6';
      bgColor = 'rgba(59, 130, 246, 0.08)';
      textColor = '#1e40af';
      icon = 'ℹ️';
    } else if (type === 'warning') {
      title = 'Warning / Caution';
      borderColor = '#f59e0b';
      bgColor = 'rgba(245, 158, 11, 0.08)';
      textColor = '#92400e';
      icon = '⚠️';
    }

    if (isHindi) {
      if (type === 'tip') title = 'विशेष सुझाव (Tip)';
      if (type === 'info') title = 'महत्वपूर्ण सूचना';
      if (type === 'warning') title = 'सावधानी / चेतावनी';
    }

    const calloutHtml = `
<div class="callout-box callout-${type} my-6 p-5 rounded-xl border" style="border-color: ${borderColor}; background-color: ${bgColor}; color: ${textColor};">
  <div style="font-weight: 700; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
    <span>${icon}</span>
    <span>${title}</span>
  </div>
  <p style="margin: 0; font-size: 0.875rem; line-height: 1.6;">${isHindi ? 'यहाँ अपनी विशेष जानकारी या चेतावनी लिखें...' : 'Add your contextual advice or note for readers here...'}</p>
</div>
<p></p>
`;
    editor.chain().focus().insertContent(calloutHtml).run();
    showToast(`${title} block inserted!`, 'info');
  };

  // Table Insert
  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
    setTableModalOpen(false);
    showToast(`Table inserted (${tableRows}x${tableCols})!`, 'success');
  };

  // Video Embed Insert
  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    let embedSrc = videoUrl.trim();
    if (embedSrc.includes('youtube.com/watch?v=')) {
      const id = embedSrc.split('watch?v=')[1]?.split('&')[0];
      embedSrc = `https://www.youtube.com/embed/${id}`;
    } else if (embedSrc.includes('youtu.be/')) {
      const id = embedSrc.split('youtu.be/')[1]?.split('?')[0];
      embedSrc = `https://www.youtube.com/embed/${id}`;
    }

    const videoHtml = `
<div class="video-embed my-8 aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-black" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0;">
  <iframe src="${embedSrc}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
<p></p>
`;
    editor.chain().focus().insertContent(videoHtml).run();
    setVideoModalOpen(false);
    setVideoUrl('');
    showToast('Video embedded successfully!', 'success');
  };

  // Image Gallery Insert
  const handleInsertImageGallery = () => {
    const media = dataService.getMedia().slice(0, 3);
    const galleryHtml = `
<div class="image-gallery my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  ${media.map(m => `
    <div style="border-radius: 0.75rem; overflow: hidden; border: 1px solid rgba(148,163,184,0.3); background-color: #f8fafc;">
      <img src="${normalizeImageUrl(m.file_url)}" alt="${m.title}" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/article_fallback.svg';" style="width: 100%; height: 180px; object-fit: cover;" />
      <div style="padding: 0.5rem; font-size: 0.75rem; color: #64748b; text-align: center;">${m.title}</div>
    </div>
  `).join('')}
</div>
<p></p>
`;
    editor.chain().focus().insertContent(galleryHtml).run();
    showToast('3-Image Gallery block inserted!', 'success');
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      
      {/* 1. Editor Sub-Header: Mode Switch (Edit vs Live Preview) + Meta Stats */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Mode Toggle (Segmented control) */}
        <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg font-semibold">
          <button
            type="button"
            onClick={() => setEditorMode('edit')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              editorMode === 'edit'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'संपादन मोड (Edit)' : 'Edit Mode'}</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorMode('preview')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              editorMode === 'preview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isHindi ? 'लाइव पूर्वावलोकन (Preview)' : 'Live Preview'}</span>
          </button>
        </div>

        {/* Preview Device Controls (Only in preview mode) */}
        {editorMode === 'preview' && (
          <div className="flex items-center gap-1 p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-md ${previewDevice === 'desktop' ? 'bg-white dark:bg-slate-900 text-indigo-600' : 'text-slate-500'}`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-md ${previewDevice === 'mobile' ? 'bg-white dark:bg-slate-900 text-indigo-600' : 'text-slate-500'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Word count & Autosave Status */}
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span>{wordCount} {isHindi ? 'शब्द' : 'words'}</span>
          <span>·</span>
          <span>~{Math.max(1, Math.ceil(wordCount / 200))} {isHindi ? 'मिनट' : 'min read'}</span>
          <span>·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{lastSaved}</span>
        </div>

      </div>

      {/* 2. Full Formatting Toolbar (Shown in Edit Mode) */}
      {editorMode === 'edit' && (
        <div className="p-2.5 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 sticky top-0 z-20 shadow-2xs">
          
          {/* History Undo / Redo */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-700 dark:text-slate-300"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-700 dark:text-slate-300"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Heading / Paragraph Selector */}
          <select
            onChange={e => handleHeadingChange(e.target.value)}
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' :
              editor.isActive('heading', { level: 4 }) ? '4' : 'p'
            }
            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="p">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>

          {/* Font Family Selector */}
          <select
            onChange={e => handleFontFamilyChange(e.target.value)}
            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Font: Default</option>
            <option value="'Outfit', sans-serif">Outfit (Editorial Sans)</option>
            <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
            <option value="'Newsreader', Georgia, serif">Newsreader (Serif)</option>
            <option value="'Noto Sans Devanagari', sans-serif">Noto Sans Devanagari (हिन्दी)</option>
            <option value="ui-monospace, monospace">Monospace (Code)</option>
          </select>

          {/* Font Size Selector */}
          <select
            onChange={e => handleFontSizeChange(e.target.value)}
            className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="">Size: Normal (16px)</option>
            <option value="12px">Extra Small (12px)</option>
            <option value="14px">Small (14px)</option>
            <option value="18px">Medium-Large (18px)</option>
            <option value="22px">Large (22px)</option>
            <option value="28px">Extra Large (28px)</option>
            <option value="36px">Huge (36px)</option>
          </select>

          {/* Basic Text Formatting */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-md ${editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-md ${editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-md ${editor.isActive('underline') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded-md ${editor.isActive('strike') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Color & Highlight Picker */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 gap-1.5">
            {/* Color dropdown / picker */}
            <label className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold" title="Text Color">
              <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: textColor }} />
              <span className="text-[11px] text-slate-600 dark:text-slate-300">Color</span>
              <input
                type="color"
                value={textColor}
                onChange={e => {
                  setTextColor(e.target.value);
                  editor.chain().focus().setColor(e.target.value).run();
                }}
                className="opacity-0 w-0 h-0"
              />
            </label>

            {/* Highlight picker */}
            <label className="flex items-center gap-1 cursor-pointer px-1.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold" title="Highlight Color">
              <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: highlightColor }} />
              <span className="text-[11px] text-slate-600 dark:text-slate-300">Highlight</span>
              <input
                type="color"
                value={highlightColor}
                onChange={e => {
                  setHighlightColor(e.target.value);
                  editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
                }}
                className="opacity-0 w-0 h-0"
              />
            </label>
          </div>

          {/* Alignment */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`p-1.5 rounded-md ${editor.isActive({ textAlign: 'justify' }) ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Justify"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded-md ${editor.isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded-md ${editor.isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded-md ${editor.isActive('blockquote') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1.5 rounded-md ${editor.isActive('codeBlock') ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Code Block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Horizontal Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Links & Rich Blocks Insertion */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-0.5 gap-1">
            {/* Link button */}
            <button
              type="button"
              onClick={openLinkDialog}
              className={`p-1.5 rounded-md flex items-center gap-1 ${editor.isActive('link') ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              title="Insert / Edit Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold hidden sm:inline">Link</span>
            </button>

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => setImageModalOpen(true)}
              className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Upload Multiple Images"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image / Gallery</span>
            </button>

            {/* AI Tool Card Button */}
            <button
              type="button"
              onClick={() => setAiToolModalOpen(true)}
              className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 flex items-center gap-1.5 text-xs font-bold transition-colors"
              title="Insert AI Tool Card"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tool Card</span>
            </button>

            {/* Blocks Dropdown (Callouts, Tables, Video, Galleries) */}
            <div className="relative group">
              <button
                type="button"
                className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-xs font-bold"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Blocks ▾</span>
              </button>

              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 hidden group-hover:block z-30 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => insertCallout('tip')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tip Callout Box</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertCallout('info')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>Info Notice Box</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertCallout('warning')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Warning Box</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTableModalOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80"
                >
                  <TableIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Insert Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span>Video Embed</span>
                </button>
                <button
                  type="button"
                  onClick={handleInsertImageGallery}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Grid className="w-3.5 h-3.5 text-violet-500" />
                  <span>3-Image Photo Grid</span>
                </button>
              </div>
            </div>

            {/* Clear Formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
              title="Clear Formatting"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 3. Editor Canvas / Live Preview Container */}
      {editorMode === 'edit' ? (
        <div className="p-6 md:p-8 min-h-[420px] bg-white dark:bg-[#0b1329] text-slate-900 dark:text-slate-100">
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-h1:text-3xl sm:prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
              prose-h4:text-lg sm:prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2
              prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:my-4 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-[#0f172a] prose-blockquote:rounded-r-lg
              prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              focus:outline-none"
          />
        </div>
      ) : (
        /* Live Preview Mode (Rendered exactly as visitors see it) */
        <div className="p-6 md:p-10 bg-slate-100 dark:bg-[#070b16] flex justify-center">
          <div
            className={`w-full bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl transition-all ${
              previewDevice === 'mobile' ? 'max-w-[390px] border-4 border-slate-700 rounded-[2.5rem]' : 'max-w-4xl'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Live Reader View ({previewDevice.toUpperCase()})
            </div>
            <div
              className="article-prose prose dark:prose-invert max-w-none text-base leading-relaxed
                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                prose-p:mb-4 prose-p:text-slate-700 dark:prose-p:text-slate-300"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Link Inserter Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span>Attach Hyperlink to Selected Text</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter an external URL or an internal DigiSeekho route.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://chatgpt.com or /category/ai-tools"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Quick internal links */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Quick Internal Links:
                </label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {['/category/ai-tools', '/category/technology', '/category/blogging-seo', '/about', '/contact'].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setLinkUrl(q)}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-mono text-slate-600 dark:text-slate-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-2">
                <input
                  type="checkbox"
                  checked={linkOpenNewTab}
                  onChange={e => setLinkOpenNewTab(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Open in new tab (target="_blank" rel="noopener noreferrer")</span>
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setLinkModalOpen(false);
                      showToast('Link removed', 'info');
                    }}
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Unlink className="w-3 h-3" />
                    <span>Remove Link</span>
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSetLink}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Apply Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Multiple Image Upload Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Insert Photos at Cursor Position</span>
            </h3>

            {/* Error Notification */}
            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Upload from Device Gallery / Desktop (Select multiple allowed)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all"
              >
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Tap to upload from mobile gallery or click to browse
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPEG, PNG, WebP, GIF, SVG (Up to 10MB each)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploading & processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-4 text-[10px] text-slate-400 uppercase font-semibold">Or Direct Image URL</span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <input
                  type="text"
                  value={directImageUrl}
                  onChange={e => setDirectImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg or /assets/images/..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Formatting Controls for the Image */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Image Formatting Options:
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Width / Size
                    </label>
                    <select
                      value={imageWidth}
                      onChange={e => setImageWidth(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    >
                      <option value="100%">Full Width (100%)</option>
                      <option value="75%">Wide (75%)</option>
                      <option value="50%">Medium (50%)</option>
                      <option value="33%">Small Column (33%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Alignment
                    </label>
                    <select
                      value={imageAlign}
                      onChange={e => setImageAlign(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    >
                      <option value="center">Center</option>
                      <option value="left">Float Left (Wrap text)</option>
                      <option value="right">Float Right (Wrap text)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Caption (Displayed beneath photo)
                  </label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={e => setImageCaption(e.target.value)}
                    placeholder="e.g. Fig 1. Neural network model diagram"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    Alt Text (For Google Image SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={e => setImageAlt(e.target.value)}
                    placeholder="Detailed description of what is visible in the photo..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                {directImageUrl && (
                  <button
                    type="button"
                    onClick={handleInsertDirectImage}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Insert Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Tool Card Inserter Modal */}
      {aiToolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Insert AI Tool Showcase Card</span>
            </h3>
            <p className="text-xs text-slate-500">
              Renders an attractive, high-converting tool badge with logo, description, and direct external link button.
            </p>

            <form onSubmit={handleInsertAiToolCard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  required
                  value={toolName}
                  onChange={e => setToolName(e.target.value)}
                  placeholder="e.g. ChatGPT, Midjourney, Claude 3.5, Perplexity"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Website URL *
                </label>
                <input
                  type="text"
                  required
                  value={toolUrl}
                  onChange={e => setToolUrl(e.target.value)}
                  placeholder="https://chatgpt.com/"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logo / Icon Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={toolLogo}
                  onChange={e => setToolLogo(e.target.value)}
                  placeholder="https://... or leave empty for styled letter badge"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={toolDesc}
                  onChange={e => setToolDesc(e.target.value)}
                  placeholder="Briefly explain what this tool does best..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={toolBtnText}
                  onChange={e => setToolBtnText(e.target.value)}
                  placeholder="Visit Website / Try Free"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAiToolModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                >
                  Insert Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Video Embed Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-600" />
              <span>Embed Video Player</span>
            </h3>
            <form onSubmit={handleInsertVideo} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  YouTube / Video URL *
                </label>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Embed Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Table Configuration Modal */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xs w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-indigo-600" />
              <span>Insert Data Table</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={e => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={tableCols}
                  onChange={e => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
