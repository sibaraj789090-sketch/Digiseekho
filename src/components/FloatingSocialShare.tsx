import React, { useState } from 'react';
import { Share2, Check, Copy, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FloatingSocialShareProps {
  title: string;
  url?: string;
  isHindi?: boolean;
}

export const FloatingSocialShare: React.FC<FloatingSocialShareProps> = ({
  title,
  url,
  isHindi = false
}) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const getTargetUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return 'https://digiseekho.com';
  };

  const handleCopyLink = () => {
    const currentUrl = getTargetUrl();
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast(isHindi ? 'लिंक क्लिपबोर्ड पर कॉपी हो गया!' : 'Article link copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const currentUrl = getTargetUrl();
    const text = encodeURIComponent(`${title}\n\nRead more on DigiSeekho: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleTwitter = () => {
    const currentUrl = getTargetUrl();
    const text = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(currentUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}&via=digiseekho`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleFacebook = () => {
    const currentUrl = getTargetUrl();
    const encodedUrl = encodeURIComponent(currentUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleInstagram = () => {
    const currentUrl = getTargetUrl();
    navigator.clipboard.writeText(currentUrl);
    showToast(
      isHindi
        ? 'लिंक कॉपी हो गया! अपनी इंस्टाग्राम स्टोरी या बायो में शेयर करें।'
        : 'Link copied! Paste into your Instagram Story, Bio, or DM.',
      'info'
    );
    // Open Instagram in a new tab for reader convenience
    window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* 1. Desktop Floating Vertical Rail (Sticky to left of viewport) */}
      <aside 
        aria-label="Social sharing"
        className="hidden lg:flex fixed left-5 xl:left-8 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2.5 p-2 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl transition-all"
      >
        {/* Rail Header Icon / Label */}
        <div className="flex flex-col items-center py-1 text-slate-400">
          <Share2 className="w-4 h-4 mb-0.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider scale-90">
            {isHindi ? 'शेयर' : 'Share'}
          </span>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          title={isHindi ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}
          aria-label="Share on WhatsApp"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#25D366] bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#25D366] hover:text-white transition-all transform hover:scale-108 active:scale-95 shadow-2xs group"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 2C6.5 2 2 6.5 2 12.031c0 2.222.723 4.275 1.954 5.941L2.617 22l4.168-1.341c1.604 1.077 3.528 1.698 5.614 1.698 5.531 0 10.031-4.5 10.031-10.031S17.562 2 12.031 2zm0 18.24c-1.854 0-3.578-.578-5.006-1.564l-.358-.246-2.477.797.809-2.414-.265-.378a8.218 8.218 0 0 1-1.345-4.404c0-4.544 3.7-8.24 8.24-8.24 4.544 0 8.24 3.696 8.24 8.24 0 4.544-3.696 8.24-8.24 8.24zm4.516-6.177c-.247-.124-1.464-.723-1.691-.806-.227-.082-.392-.124-.557.124-.165.247-.64 1.109-.784 1.274-.144.165-.289.186-.536.062-.247-.124-1.044-.385-1.989-1.227-.735-.655-1.231-1.464-1.376-1.711-.144-.247-.015-.381.108-.504.111-.111.247-.289.371-.433.124-.144.165-.247.247-.412.082-.165.041-.309-.021-.433-.062-.124-.557-1.341-.763-1.836-.201-.482-.405-.417-.557-.425l-.474-.008c-.165 0-.433.062-.66.309-.227.247-.866.846-.866 2.063s.887 2.393 1.011 2.558c.124.165 1.745 2.664 4.228 3.737.591.256 1.052.409 1.412.523.593.188 1.133.161 1.559.097.475-.071 1.464-.598 1.67-1.176.206-.577.206-1.072.144-1.175-.062-.103-.227-.165-.474-.289z" />
          </svg>
        </button>

        {/* Twitter / X Button */}
        <button
          onClick={handleTwitter}
          title={isHindi ? 'X (ट्विटर) पर शेयर करें' : 'Share on X (Twitter)'}
          aria-label="Share on X"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all transform hover:scale-108 active:scale-95 shadow-2xs group"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook Button */}
        <button
          onClick={handleFacebook}
          title={isHindi ? 'फेसबुक पर शेयर करें' : 'Share on Facebook'}
          aria-label="Share on Facebook"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1877F2] bg-blue-50 dark:bg-blue-950/40 hover:bg-[#1877F2] hover:text-white transition-all transform hover:scale-108 active:scale-95 shadow-2xs group"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* Instagram Button */}
        <button
          onClick={handleInstagram}
          title={isHindi ? 'इंस्टाग्राम पर शेयर करें' : 'Share on Instagram'}
          aria-label="Share on Instagram"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#E4405F] bg-rose-50 dark:bg-rose-950/40 hover:bg-linear-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all transform hover:scale-108 active:scale-95 shadow-2xs group"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          title={isHindi ? 'लिंक कॉपी करें' : 'Copy link'}
          aria-label="Copy link"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all transform hover:scale-108 active:scale-95 shadow-2xs group"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* 2. Mobile Floating Bottom Action Bar (Docked cleanly within 15% sticky limit) */}
      <nav 
        aria-label="Mobile social sharing bar"
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 shadow-2xl transition-all"
      >
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-1 pr-1.5 flex items-center gap-1">
          <Share2 className="w-3 h-3 text-indigo-500" />
          <span>{isHindi ? 'शेयर' : 'Share'}</span>
        </span>

        {/* WhatsApp Mobile */}
        <button
          onClick={handleWhatsApp}
          aria-label="Share on WhatsApp"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#25D366] bg-emerald-50 dark:bg-emerald-950/50 hover:bg-[#25D366] hover:text-white transition-all active:scale-90"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 2C6.5 2 2 6.5 2 12.031c0 2.222.723 4.275 1.954 5.941L2.617 22l4.168-1.341c1.604 1.077 3.528 1.698 5.614 1.698 5.531 0 10.031-4.5 10.031-10.031S17.562 2 12.031 2zm0 18.24c-1.854 0-3.578-.578-5.006-1.564l-.358-.246-2.477.797.809-2.414-.265-.378a8.218 8.218 0 0 1-1.345-4.404c0-4.544 3.7-8.24 8.24-8.24 4.544 0 8.24 3.696 8.24 8.24 0 4.544-3.696 8.24-8.24 8.24z" />
          </svg>
        </button>

        {/* Twitter / X Mobile */}
        <button
          onClick={handleTwitter}
          aria-label="Share on X"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-black hover:text-white transition-all active:scale-90"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook Mobile */}
        <button
          onClick={handleFacebook}
          aria-label="Share on Facebook"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#1877F2] bg-blue-50 dark:bg-blue-950/50 hover:bg-[#1877F2] hover:text-white transition-all active:scale-90"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>

        {/* Instagram Mobile */}
        <button
          onClick={handleInstagram}
          aria-label="Share on Instagram"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#E4405F] bg-rose-50 dark:bg-rose-950/50 hover:bg-[#E4405F] hover:text-white transition-all active:scale-90"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </button>

        {/* Copy Link Mobile */}
        <button
          onClick={handleCopyLink}
          aria-label="Copy link"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </nav>
    </>
  );
};
