import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Menu } from 'lucide-react';
import { cn } from '@lib/utils';

/**
 * LegalTableOfContents - Responsive Table of Contents component.
 * Displays a sticky vertical list of sections on desktop and a collapsible dropdown on mobile.
 * Tracks current active section using a scroll spy IntersectionObserver.
 */
export default function LegalTableOfContents({ sections, className = '' }) {
  const [activeId, setActiveId] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Active section scroll spy
  useEffect(() => {
    if (!sections || sections.length === 0) return;

    // Default to the first section initially
    setActiveId(sections[0].id);

    const observerOptions = {
      root: null, // viewport
      rootMargin: '-10% 0px -70% 0px', // triggers when section is in the top-middle third of screen
      threshold: 0,
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setIsMobileOpen(false);

    const targetEl = document.getElementById(id);
    if (targetEl) {
      // Direct focus for accessibility
      targetEl.focus({ preventScroll: true });

      // Smooth scroll to the element (browser uses scroll-mt-24 from LegalSection)
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL hash without breaking history reload states
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };

  if (!sections || sections.length === 0) return null;

  const activeSection = sections.find((s) => s.id === activeId) || sections[0];

  return (
    <nav
      aria-label="Table of contents"
      className={cn('w-full print:hidden', className)}
    >
      {/* ── Mobile TOC Dropdown ────────────────────────────────── */}
      <div className="lg:hidden w-full relative">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-toc-list"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <span className="flex items-center gap-2">
            <Menu size={16} style={{ color: 'var(--color-brand)' }} />
            <span>On this page: <strong className="font-bold text-[var(--color-brand)]">{activeSection.title}</strong></span>
          </span>
          <ChevronDown
            size={16}
            className={cn('transition-transform duration-200', isMobileOpen && 'transform rotate-180')}
            style={{ color: 'var(--color-text-muted)' }}
          />
        </button>

        {isMobileOpen && (
          <ul
            id="mobile-toc-list"
            className="absolute left-0 right-0 mt-1 z-30 max-h-60 overflow-y-auto rounded-xl shadow-lg border p-2 space-y-1"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-border-strong)',
            }}
          >
            {sections.map((section) => {
              const isActive = section.id === activeId;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => handleLinkClick(e, section.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'block w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white'
                        : 'hover:bg-[var(--glass-bg-strong)]'
                    )}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))'
                        : undefined,
                      color: isActive ? 'white' : 'var(--color-text-secondary)',
                    }}
                  >
                    {section.title}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Desktop Sticky Sidebar List ────────────────────────── */}
      <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Table of Contents
        </h2>
        <ul className="space-y-1.5 border-l" style={{ borderColor: 'var(--color-border)' }}>
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id} className="relative">
                {/* Active Indicator Bar */}
                <div
                  className={cn(
                    'absolute left-[-1.5px] top-0 bottom-0 w-[2px] transition-all duration-200',
                    isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                  )}
                  style={{
                    backgroundColor: 'var(--color-brand)',
                    transformOrigin: 'center',
                  }}
                />
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleLinkClick(e, section.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'block pl-4 py-1.5 text-sm font-medium transition-all hover:translate-x-0.5',
                    isActive ? 'font-bold' : ''
                  )}
                  style={{
                    color: isActive ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                  }}
                >
                  {section.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

LegalTableOfContents.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};
