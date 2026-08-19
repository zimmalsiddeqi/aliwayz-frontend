import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Printer,
  Share2,
  ChevronUp,
  ArrowLeft,
  ChevronRight,
  Mail,
  Calendar,
  Clock,
} from 'lucide-react';
import Button from '@components/ui/Button';
import Card, { CardContent } from '@components/ui/Card';
import toast from '@lib/toast';
import {
  getLegalPageBySlug,
  getRelatedPages,
  getAllLegalPagesSorted,
  getLegalPageUrl,
  LAST_UPDATED,
  LAST_UPDATED_ISO,
  SUPPORT_EMAILS,
  DEVELOPER,
  SITE_URL,
} from '../data/legalPages';
import LegalTableOfContents from './LegalTableOfContents';

// Helper to calculate reading time dynamically from children text nodes
function calculateReadingTime(children) {
  let wordCount = 0;

  const countWords = (node) => {
    if (typeof node === 'string') {
      wordCount += node.split(/\s+/).filter(Boolean).length;
    } else if (Array.isArray(node)) {
      node.forEach(countWords);
    } else if (node && node.props && node.props.children) {
      countWords(node.props.children);
    }
  };

  countWords(children);
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * LegalLayout - Single reusable layout wrapper for all legal document pages.
 * Handles SEO, accessibility (skip link, landmark regions), reading progress,
 * printing, sharing, navigation (prev/next/related), and CTAs.
 */
export default function LegalLayout({ slug, children }) {
  const contentRef = useRef(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch page metadata from registry
  const page = useMemo(() => getLegalPageBySlug(slug), [slug]);
  const relatedPages = useMemo(() => getRelatedPages(slug), [slug]);
  const sortedPages = useMemo(() => getAllLegalPagesSorted(), []);

  // Find previous and next pages
  const { prevPage, nextPage } = useMemo(() => {
    const idx = sortedPages.findIndex((p) => p.slug === slug);
    return {
      prevPage: idx > 0 ? sortedPages[idx - 1] : null,
      nextPage: idx < sortedPages.length - 1 ? sortedPages[idx + 1] : null,
    };
  }, [sortedPages, slug]);

  // Calculate dynamic reading time
  const readingTime = useMemo(() => calculateReadingTime(children), [children]);

  // Scroll listener for reading progress & scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!page) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-red-500 font-semibold">Error: Legal page configuration not found for &quot;{slug}&quot;.</p>
        <Link to="/legal" className="btn-brand inline-block mt-4 rounded-xl px-6 py-2">
          Back to Legal Center
        </Link>
      </div>
    );
  }

  const pageUrl = getLegalPageUrl(slug);

  // Schema.org WebPage structured data markup
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.seoTitle,
    description: page.seoDescription,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Aliwayz',
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: 'Aliwayz Legal and Privacy Disclosures',
    },
    publisher: {
      '@type': 'Person',
      name: DEVELOPER,
    },
    dateModified: LAST_UPDATED_ISO,
    lastReviewed: LAST_UPDATED_ISO,
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: page.seoTitle,
          text: page.description,
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback copy
        await navigator.clipboard.writeText(pageUrl);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── SEO Metadata & Schema ─────────────────────────────── */}
      <Helmet>
        <title>{page.seoTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={page.seoTitle} />
        <meta property="og:description" content={page.seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Aliwayz" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={page.seoTitle} />
        <meta name="twitter:description" content={page.seoDescription} />
        
        {/* Keywords */}
        {page.keywords && <meta name="keywords" content={page.keywords.join(', ')} />}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      {/* ── Reading Progress Bar ─────────────────────────────── */}
      <div 
        className="fixed top-16 left-0 right-0 h-[3px] z-50 transition-all duration-100 print:hidden"
        style={{
          background: 'var(--color-border)',
        }}
      >
        <div 
          className="h-full"
          style={{
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, var(--color-brand), #8B5CF6)',
            boxShadow: '0 0 8px var(--color-brand-glow)',
          }}
        />
      </div>

      {/* ── Skip to Content Link ─────────────────────────────── */}
      <a
        href="#legal-content-start"
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl transition-all print:hidden"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-strong)',
          color: 'var(--color-text-primary)',
        }}
      >
        Skip to main content
      </a>

      {/* ── Page Layout Outer Wrapper ────────────────────────── */}
      <div className="container-app py-6 sm:py-10 pb-24 md:pb-16 max-w-6xl">
        
        {/* ── Breadcrumbs & Back Navigation ────────────────────── */}
        <nav 
          aria-label="Breadcrumbs"
          className="flex flex-wrap items-center gap-1.5 text-xs font-medium mb-6 print:hidden"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Link to="/" className="hover:text-[var(--color-brand)] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link to="/legal" className="hover:text-[var(--color-brand)] transition-colors">
            Legal Center
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-text-secondary)' }} aria-current="page">
            {page.breadcrumbTitle}
          </span>
        </nav>

        {/* ── Header Area ──────────────────────────────────────── */}
        <motion.header
          className="border-b pb-6 mb-8 print:pb-4 print:mb-6"
          style={{ borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {page.icon && (
                  <page.icon 
                    size={28} 
                    className="flex-shrink-0"
                    style={{ color: 'var(--color-brand)' }}
                    aria-hidden="true"
                  />
                )}
                <span className="badge badge-brand text-[10px] uppercase font-bold py-0.5 px-2 tracking-wider">
                  {page.pageCategory}
                </span>
              </div>
              
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {page.title}
              </h1>

              {page.description && (
                <p 
                  className="text-sm sm:text-base leading-relaxed max-w-3xl"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {page.description}
                </p>
              )}

              {/* Meta stats bar */}
              <div 
                className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold pt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Last Updated: {LAST_UPDATED}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Est. Reading Time: {readingTime} min
                </span>
              </div>
            </div>

            {/* Action buttons (Print/Share) */}
            <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer size={14} />}
                className="rounded-xl"
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 size={14} />}
                className="rounded-xl"
              >
                {copied ? 'Copied' : 'Share'}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* ── Two-Column Layout (TOC + Article) ────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Sidebar Table of Contents */}
          <aside className="lg:w-64 flex-shrink-0 print:hidden">
            <LegalTableOfContents sections={page.sections} />
          </aside>

          {/* Right Column: Main Legal Content */}
          <main 
            id="legal-content-start" 
            ref={contentRef}
            className="flex-1 min-w-0"
            tabIndex="-1" // Allow direct keyboard focus for skip link
          >
            <motion.article 
              className="prose prose-sm sm:prose-base max-w-none prose-headings:scroll-mt-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {children}
            </motion.article>

            {/* ── Previous & Next Navigation ──────────────────── */}
            {(prevPage || nextPage) && (
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t print:hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {prevPage ? (
                  <Link 
                    to={prevPage.canonicalPath}
                    className="flex flex-col items-start gap-1 p-4 rounded-xl border text-left group hover:border-[var(--color-brand)] transition-colors"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors flex items-center gap-1">
                      <ArrowLeft size={10} /> Previous
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {prevPage.shortTitle}
                    </span>
                  </Link>
                ) : <div />}

                {nextPage ? (
                  <Link 
                    to={nextPage.canonicalPath}
                    className="flex flex-col items-end gap-1 p-4 rounded-xl border text-right group hover:border-[var(--color-brand)] transition-colors"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors flex items-center gap-1">
                      Next <ChevronRight size={10} />
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {nextPage.shortTitle}
                    </span>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* ── Related Legal Documents ─────────────────────── */}
            {relatedPages.length > 0 && (
              <section className="mt-12 pt-8 border-t print:hidden" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  Related Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPages.map((related) => (
                    <Card key={related.slug} variant="flat" hoverable className="h-full">
                      <CardContent className="flex flex-col h-full justify-between">
                        <div>
                          <h4 className="text-sm font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                            {related.icon && <related.icon size={14} className="text-[var(--color-brand)]" />}
                            {related.shortTitle}
                          </h4>
                          <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {related.description}
                          </p>
                        </div>
                        <Link 
                          to={related.canonicalPath}
                          className="text-xs font-bold mt-3 text-[var(--color-brand)] hover:underline flex items-center gap-1"
                        >
                          View Document <ChevronRight size={12} />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* ── Support CTA ─────────────────────────────────── */}
            <section 
              className="mt-12 p-6 sm:p-8 rounded-2xl text-center border print:hidden"
              style={{ 
                background: 'linear-gradient(135deg, rgba(91,110,245,0.06), rgba(139,92,246,0.04))',
                borderColor: 'var(--color-border)'
              }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Questions or Feedback?
              </h3>
              <p className="text-sm max-w-lg mx-auto mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                If you have questions about our policies, guidelines, or need legal clarification, please contact our team.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a 
                  href={`mailto:${SUPPORT_EMAILS.general}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border hover:border-[var(--color-brand)] transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <Mail size={16} className="text-[var(--color-brand)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">General Support</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">{SUPPORT_EMAILS.general}</span>
                </a>
                <a 
                  href={`mailto:${SUPPORT_EMAILS.privacy}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border hover:border-[var(--color-brand)] transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <Mail size={16} className="text-[var(--color-brand)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Privacy Requests</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">{SUPPORT_EMAILS.privacy}</span>
                </a>
                <a 
                  href={`mailto:${SUPPORT_EMAILS.legal}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border hover:border-[var(--color-brand)] transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <Mail size={16} className="text-[var(--color-brand)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Legal Notices</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">{SUPPORT_EMAILS.legal}</span>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link to="/legal" className="btn-secondary rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5">
                  <ArrowLeft size={14} /> Back to Legal Center
                </Link>
                <Link to="/" className="btn-ghost rounded-xl text-xs sm:text-sm">
                  Go Home
                </Link>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* ── Scroll to Top Button ─────────────────────────────── */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-xl shadow-2xl z-40 transition-all hover:-translate-y-1 hover:scale-105 active:translate-y-0 focus:outline-none print:hidden border hover:border-[var(--color-brand)]"
          style={{
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-xl)',
            color: 'var(--color-text-secondary)',
          }}
          aria-label="Scroll to top of page"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </>
  );
}

LegalLayout.propTypes = {
  slug: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
