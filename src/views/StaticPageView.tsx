import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Mail, MapPin, Send, CheckCircle2, Shield, FileText, Info } from 'lucide-react';
import { updatePageSEO, BASE_SITE_URL } from '../lib/seo';

interface StaticPageViewProps {
  page: 'about' | 'contact' | 'privacy-policy' | 'terms' | 'disclaimer';
  language: Language;
  onNavigate: (path: string) => void;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ page, language, onNavigate }) => {
  const { showToast } = useApp();
  const isHindi = language === 'hi';

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    const titles: Record<string, { en: string; hi: string }> = {
      about: { en: 'About DigiSeekho – Our Mission & Editorial Standards', hi: 'DigiSeekho के बारे में – हमारा मिशन और मानक' },
      contact: { en: 'Contact Us – DigiSeekho Editorial Office', hi: 'संपर्क करें – DigiSeekho संपादकीय कार्यालय' },
      'privacy-policy': { en: 'Privacy Policy – DigiSeekho', hi: 'गोपनीयता नीति – DigiSeekho' },
      terms: { en: 'Terms of Service – DigiSeekho', hi: 'सेवा की शर्तें – DigiSeekho' },
      disclaimer: { en: 'Disclaimer – DigiSeekho', hi: 'अस्वीकरण – DigiSeekho' }
    };

    const currentTitle = titles[page]?.[language] || 'DigiSeekho';
    updatePageSEO({
      title: `${currentTitle} – DigiSeekho`,
      description: `Official ${page} documentation and information for DigiSeekho readers in India and worldwide.`,
      canonicalUrl: `${BASE_SITE_URL}/${isHindi ? 'hi/' : ''}${page}`,
      hreflangEn: `${BASE_SITE_URL}/${page}`,
      hreflangHi: `${BASE_SITE_URL}/hi/${page}`
    });
  }, [page, language, isHindi]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setSentSuccess(true);
    showToast(isHindi ? 'आपका संदेश प्राप्त हो गया है!' : 'Your message has been sent successfully!', 'success');
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8">
        <button
          onClick={() => onNavigate(isHindi ? '/hi' : '/')}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {isHindi ? 'होम' : 'Home'}
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 capitalize">{page.replace('-', ' ')}</span>
      </nav>

      {/* ABOUT US */}
      {page === 'about' && (
        <div className="space-y-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              {isHindi ? 'हमारा मिशन' : 'Editorial Mission'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {isHindi ? 'DigiSeekho के बारे में' : 'About DigiSeekho'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {isHindi
                ? 'DigiSeekho की स्थापना भारत और दुनिया भर के पाठकों को सरल, निष्पक्ष और उच्च-स्तरीय तकनीकी ज्ञान हिंदी और अंग्रेजी दोनों में सुलभ कराने के उद्देश्य से की गई है।'
                : 'DigiSeekho was founded with a singular conviction: technical excellence and artificial intelligence should be accessible to everyone, natively in both English and Hindi.'}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'हमारा दृष्टिकोण' : 'Our Editorial Standards'}
            </h2>
            <p>
              {isHindi
                ? 'हम केवल सतही खबरें नहीं लिखते, बल्कि हर टूल को खुद टेस्ट करते हैं, उसके कोड और प्रॉम्प्ट्स की जांच करते हैं और पाठकों को व्यावहारिक जानकारी प्रदान करते हैं।'
                : 'Every guide published on DigiSeekho undergoes rigorous real-world testing. We run the prompts, inspect the APIs, audit the security claims, and present original insights rather than syndicated fluff.'}
            </p>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">
              {isHindi ? 'द्विभाषी प्रतिबद्धता' : 'Bilingual Commitment'}
            </h2>
            <p>
              {isHindi
                ? 'भाषा कभी ज्ञान में बाधा नहीं बननी चाहिए। इसलिए DigiSeekho पर हर लेख हिंदी और अंग्रेजी दोनों में मूल रूप से लिखा जाता है ताकि तकनीक से जुड़ा हर व्यक्ति अपनी भाषा में सीख सके।'
                : 'Language should never be a gatekeeper to technological literacy. By maintaining equal editorial rigor across Hindi and English, we empower developers, students, and businesses across Tier 1, 2, and 3 regions.'}
            </p>
          </div>
        </div>
      )}

      {/* CONTACT US */}
      {page === 'contact' && (
        <div className="space-y-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              {isHindi ? 'संपर्क करें' : 'Get In Touch'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {isHindi ? 'संपादकीय टीम से संपर्क करें' : 'Contact DigiSeekho'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              {isHindi
                ? 'लेख सुझाव, सुधार, साझेदारी या किसी तकनीकी सवाल के लिए हमें संदेश भेजें।'
                : 'Have an editorial pitch, technical question, or partnership inquiry? Reach out directly.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="md:col-span-7 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              {sentSuccess ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                    {isHindi ? 'संदेश प्राप्त हुआ!' : 'Message Received!'}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {isHindi
                      ? 'हमारी टीम 24 से 48 घंटों में आपके ईमेल पर जवाब देगी।'
                      : 'Our editorial desk will review your inquiry within 24 to 48 hours.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'पूरा नाम' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Anand Sharma"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'ईमेल पता' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="anand@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'विषय' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={e => setContactSubject(e.target.value)}
                      placeholder={isHindi ? 'संदेश का विषय...' : 'Inquiry subject...'}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'संदेश' : 'Message'}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder={isHindi ? 'अपना संदेश विस्तार से लिखें...' : 'How can we help you?...'}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isHindi ? 'संदेश भेजें' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Info Column */}
            <div className="md:col-span-5 space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  contact@digiseekho.com
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  editorial@digiseekho.com
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Location
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  DigiSeekho Media Bureau
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Connaught Place, New Delhi, India 110001
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {page === 'privacy-policy' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isHindi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
          </h1>
          <p className="text-xs text-slate-400">Last updated: March 2026 · Complies with IT Rules (India) & GDPR</p>
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            <p>
              At DigiSeekho (accessible from https://digiseekho.com), the privacy of our visitors is one of our main priorities. This Privacy Policy document outlines the types of information that is collected and recorded by DigiSeekho and how we use it.
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
            <p>
              When you voluntarily subscribe to our newsletter, leave comments, or contact us through our portal, you may be asked to provide your name and email address. We do not sell, rent, or share personal contact information with third parties.
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Log Files & Analytics</h2>
            <p>
              DigiSeekho follows standard log file procedures. These files log visitors when they visit websites. We utilize Google Analytics (GA4) with IP anonymization enabled to analyze reader trends and optimize site load performance.
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Cookies & Web Beacons</h2>
            <p>
              Like any other website, DigiSeekho uses cookies to store information including visitors preferences, and the pages on the website that the visitor accessed or visited.
            </p>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE */}
      {page === 'terms' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isHindi ? 'सेवा की शर्तें (Terms of Service)' : 'Terms of Service'}
          </h1>
          <p className="text-xs text-slate-400">Effective Date: March 2026</p>
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            <p>
              By accessing the website at https://digiseekho.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Content License</h2>
            <p>
              Permission is granted to read, share via provided social share links, and print articles from DigiSeekho for personal, non-commercial transitory viewing only. You may not republish full article text without explicit written attribution and a canonical backlink to digiseekho.com.
            </p>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      {page === 'disclaimer' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isHindi ? 'अस्वीकरण (Disclaimer)' : 'Disclaimer'}
          </h1>
          <p className="text-xs text-slate-400">Notice for all readers</p>
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            <p>
              All information on DigiSeekho is published in good faith and for general information, education, and research purposes only. DigiSeekho does not make any warranties about the completeness, reliability, and accuracy of this information.
            </p>
            <p>
              Technology, AI model outputs, search engine algorithms, and software interfaces change rapidly. Any action you take upon the information you find on this website is strictly at your own risk.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
