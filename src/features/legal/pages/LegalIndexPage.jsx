import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  ShieldCheck,
  Lock,
  UserCheck,
  UserX,
  Mail,
  BookOpen,
} from 'lucide-react';
import Card, { CardContent } from '@components/ui/Card';
import toast from '@lib/toast';
import {
  LEGAL_PAGES,
  LEGAL_CATEGORIES,
  LEGAL_BASE_URL,
  LAST_UPDATED,
  SUPPORT_EMAILS,
  SITE_URL,
} from '../data/legalPages';

export default function LegalIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleEmailClick = (e, email) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied "${email}" to clipboard!`);
  };

  // Breadcrumb Schema markup
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': SITE_URL,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Legal Center',
        'item': LEGAL_BASE_URL,
      },
    ],
  };

  // Helper to calculate estimated reading time
  const getEstimatedReadingTime = (page) => {
    // Approx 1.25 minutes per section as a solid baseline
    return Math.max(2, Math.ceil(page.sections.length * 1.25));
  };

  // Highlighted FAQs/Frequently visited documents
  const frequentlyVisited = useMemo(() => {
    const targetSlugs = ['privacy-policy', 'terms', 'account-deletion', 'community-guidelines'];
    return targetSlugs
      .map((slug) => LEGAL_PAGES.find((p) => p.slug === slug))
      .filter(Boolean);
  }, []);

  // Filter legal pages by search query and category
  const filteredPages = useMemo(() => {
    return LEGAL_PAGES.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || page.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.priority - b.priority);
  }, [searchQuery, selectedCategory]);

  return (
    <>
      {/* ── SEO Metadata ─────────────────────────────────────── */}
      <Helmet>
        <title>Legal Center — Aliwayz</title>
        <meta name="description" content="Access the Aliwayz Legal Center. Review our Privacy Policy, Terms & Conditions, Buyer/Seller Policies, Community Guidelines, and safety tips." />
        <link rel="canonical" href={LEGAL_BASE_URL} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Legal Center — Aliwayz" />
        <meta property="og:description" content="Access the Aliwayz Legal Center. Review our Privacy Policy, Terms & Conditions, Buyer/Seller Policies, and community guidelines." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={LEGAL_BASE_URL} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Legal Center — Aliwayz" />
        <meta name="twitter:description" content="Access the Aliwayz Legal Center. Review our Privacy Policy, Terms & Conditions, Buyer/Seller Policies, and safety tips." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* ── Page Layout ──────────────────────────────────────── */}
      <div className="container-app py-6 sm:py-10 pb-24 md:pb-16 max-w-6xl">
        
        {/* ── Breadcrumbs ──────────────────────────────────────── */}
        <nav 
          aria-label="Breadcrumb" 
          className="flex items-center gap-1.5 text-xs font-semibold mb-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Link to="/" className="hover:text-[var(--color-brand)] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-text-secondary)' }} aria-current="page">Legal Center</span>
        </nav>

        {/* ── Premium Hero Section ─────────────────────────────── */}
        <motion.section
          className="relative rounded-3xl p-6 sm:p-10 border overflow-hidden mb-12"
          style={{
            background: 'linear-gradient(135deg, rgba(91,110,245,0.06), rgba(139,92,246,0.03))',
            borderColor: 'var(--color-border)',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-3xl space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold hover:text-[var(--color-brand)] transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft size={12} /> Back to Home
            </Link>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Aliwayz <span className="text-gradient-brand">Legal Center</span>
            </h1>
            
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Welcome to the central legal hub for Aliwayz. These disclosures and guidelines are established 
              to maintain a transparent, safe, and trust-centered local marketplace. Aliwayz only connects 
              local buyers and sellers physically; we do not process financial transactions or act as intermediaries.
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              <span>Last Updated: {LAST_UPDATED}</span>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[var(--color-success)]" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Google Play Policy Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-[var(--color-brand)]" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Privacy Focused</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-[var(--color-success)]" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Secure Marketplace</span>
              </div>
              <div className="flex items-center gap-2">
                <UserX size={16} className="text-[var(--color-error)]" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>Account Deletion Ready</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Search Input ─────────────────────────────────────── */}
        <div className="max-w-md mx-auto relative mb-12">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies, terms, guidelines..."
            className="input-base pl-10 pr-4 py-2.5 rounded-xl text-sm"
            aria-label="Search legal documents"
          />
        </div>

        {/* ── Frequently Visited Section (Conditional) ─────────── */}
        {!searchQuery && selectedCategory === 'all' && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Most Frequently Visited
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {frequentlyVisited.map((page) => {
                const PageIcon = page.icon || HelpCircle;
                return (
                  <Link key={page.slug} to={page.canonicalPath} className="block group">
                    <Card variant="flat" hoverable className="h-full border group-hover:border-[var(--color-brand)] transition-colors">
                      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-brand-glow)] text-[var(--color-brand)]">
                            <PageIcon size={16} />
                          </div>
                          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
                            <Clock size={10} /> {getEstimatedReadingTime(page)}m read
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                            {page.shortTitle}
                          </h3>
                          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                            {page.description}
                          </p>
                        </div>
                        <div className="text-[10px] font-bold text-[var(--color-brand)] flex items-center gap-0.5">
                          View Policy <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── Category Filter Tabs ─────────────────────────────── */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none justify-start md:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border"
            style={{
              backgroundColor: selectedCategory === 'all' ? 'var(--color-brand)' : 'var(--color-surface)',
              borderColor: selectedCategory === 'all' ? 'var(--color-brand)' : 'var(--color-border)',
              color: selectedCategory === 'all' ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            All Documents
          </button>
          
          {LEGAL_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border"
                style={{
                  backgroundColor: isSelected ? category.color : 'var(--color-surface)',
                  borderColor: isSelected ? category.color : 'var(--color-border)',
                  color: isSelected ? 'white' : 'var(--color-text-secondary)',
                  boxShadow: isSelected ? `0 4px 12px ${category.color}25` : undefined,
                }}
              >
                {category.title}
              </button>
            );
          })}
        </motion.div>

        {/* ── Documents Grid ───────────────────────────────────── */}
        <AnimatePresence mode="popLayout">
          {filteredPages.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredPages.map((page, index) => {
                const PageIcon = page.icon || HelpCircle;
                const catInfo = LEGAL_CATEGORIES.find((c) => c.id === page.category);
                const themeColor = catInfo?.color || 'var(--color-brand)';
                const readTime = getEstimatedReadingTime(page);

                return (
                  <motion.div
                    key={page.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="h-full"
                  >
                    <Card
                      variant="interactive"
                      className="h-full flex flex-col justify-between"
                    >
                      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-3">
                          {/* Header Icon + Category */}
                          <div className="flex items-center justify-between">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor: `${themeColor}12`,
                                color: themeColor,
                              }}
                            >
                              <PageIcon size={20} />
                            </div>
                            
                            {/* Estimated Reading Time */}
                            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
                              <Clock size={10} /> {readTime}m read
                            </span>
                          </div>

                          {/* Document Title */}
                          <h2
                            className="text-base sm:text-lg font-bold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {page.title}
                          </h2>

                          {/* Description */}
                          <p
                            className="text-xs sm:text-sm line-clamp-3 leading-relaxed"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {page.description}
                          </p>
                        </div>

                        {/* Badges / Navigation */}
                        <div className="space-y-3 pt-2">
                          {/* Compliance Badges */}
                          {(page.googlePlayRelevant || page.appStoreRelevant) && (
                            <div className="flex flex-wrap gap-1.5">
                              {page.googlePlayRelevant && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                                  Google Play Required
                                </span>
                              )}
                              {page.appStoreRelevant && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-brand)]/10 text-[var(--color-brand)] border border-[var(--color-brand)]/20">
                                  App Store Ready
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <Link
                              to={page.canonicalPath}
                              className="inline-flex items-center gap-1 text-xs font-bold transition-all hover:translate-x-1"
                              style={{ color: themeColor }}
                            >
                              Read Policy <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* ── Empty State ─────────────────────────────────── */
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-4xl block mb-3">🔍</span>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                No policies found matching your search.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Try different keywords or clear the filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn-secondary rounded-xl text-xs px-4 py-2 mt-4 inline-block"
              >
                Clear Search & Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Premium Need Help? / Contact CTA ─────────────────── */}
        <motion.div
          className="mt-16 p-8 sm:p-10 rounded-3xl text-center border relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(91,110,245,0.06), rgba(139,92,246,0.04))',
            borderColor: 'var(--color-border)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-3xl">⚖️</span>
            <h3
              className="text-xl sm:text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Need Help with Our Policies?
            </h3>
            <p
              className="text-xs sm:text-sm leading-relaxed max-w-lg mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              For general support, data privacy requests, or legal notices, please reach out to our dedicated channels.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a 
                href={`mailto:${SUPPORT_EMAILS.general}`}
                onClick={(e) => handleEmailClick(e, SUPPORT_EMAILS.general)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border hover:border-[var(--color-brand)] transition-all bg-[var(--color-surface)] hover:-translate-y-0.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Mail size={18} className="text-[var(--color-brand)]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)]">General Support</span>
                <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">{SUPPORT_EMAILS.general}</span>
              </a>
              
              <a 
                href={`mailto:${SUPPORT_EMAILS.privacy}`}
                onClick={(e) => handleEmailClick(e, SUPPORT_EMAILS.privacy)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border hover:border-[var(--color-brand)] transition-all bg-[var(--color-surface)] hover:-translate-y-0.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Lock size={18} className="text-[var(--color-brand)]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Privacy Requests</span>
                <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">{SUPPORT_EMAILS.privacy}</span>
              </a>
              
              <a 
                href={`mailto:${SUPPORT_EMAILS.legal}`}
                onClick={(e) => handleEmailClick(e, SUPPORT_EMAILS.legal)}
                className="flex flex-col items-center gap-1.5 p-4 rounded-2xl border hover:border-[var(--color-brand)] transition-all bg-[var(--color-surface)] hover:-translate-y-0.5"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <BookOpen size={18} className="text-[var(--color-brand)]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Legal Operations</span>
                <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-full">{SUPPORT_EMAILS.legal}</span>
              </a>
            </div>

            <div className="text-[10px] pt-4" style={{ color: 'var(--color-text-muted)' }}>
              Last updated site-wide: {LAST_UPDATED}
            </div>
          </div>
        </motion.div>

      </div>
    </>
  );
}
