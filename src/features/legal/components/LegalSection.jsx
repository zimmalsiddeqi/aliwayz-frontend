import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ChevronDown } from 'lucide-react';
import toast from '@lib/toast';
import { cn, slugify } from '@lib/utils';

/**
 * LegalSection - A highly accessible, responsive, and interactive section component
 * for legal documents. Supports anchor links, collapsible panels, sub-headings,
 * and print mode optimizations.
 */
export default function LegalSection({
  id,
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  className = '',
  lastUpdated,
  collapsible = false,
  defaultExpanded = true,
  showDivider = true,
  level = 2,
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Generate ID if missing
  const sectionId = id || (title ? slugify(title) : undefined);
  const headingId = sectionId ? `${sectionId}-heading` : undefined;
  const contentId = sectionId ? `${sectionId}-content` : undefined;

  // Determine Heading Tag
  const HeadingTag = level === 3 ? 'h3' : level === 4 ? 'h4' : 'h2';

  // Heading style mapping based on level
  const headingStyles = {
    2: 'text-lg sm:text-xl font-bold',
    3: 'text-base sm:text-lg font-semibold',
    4: 'text-sm sm:text-base font-semibold',
  };

  const handleCopyLink = (e) => {
    e.stopPropagation(); // Avoid triggering collapse when copying link
    if (!sectionId) return;

    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Section link copied!');
      })
      .catch(() => {
        toast.error('Failed to copy link.');
      });
  };

  const toggleCollapse = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={cn(
        'scroll-mt-24 py-6 border-b print:py-4 print:border-b-0',
        showDivider ? 'border-[var(--color-border-subtle)]' : 'border-transparent',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-4 select-none',
          collapsible && 'cursor-pointer hover:opacity-90'
        )}
        onClick={toggleCollapse}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
        aria-controls={collapsible ? contentId : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleCollapse();
          }
        }}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Heading wrapper */}
          <div className="flex items-center flex-wrap gap-2.5">
            {Icon && (
              <Icon
                size={level === 2 ? 20 : 16}
                className="flex-shrink-0"
                style={{ color: 'var(--color-brand)' }}
                aria-hidden="true"
              />
            )}
            
            <HeadingTag
              id={headingId}
              className={cn(headingStyles[level] || headingStyles[2], 'relative group flex items-center gap-1.5')}
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
              
              {/* Copy link button (hidden on print / mobile touch focus) */}
              {sectionId && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1 rounded-md transition-opacity hover:bg-[var(--glass-bg-strong)] text-[var(--color-text-muted)] hover:text-[var(--color-brand)] print:hidden"
                  aria-label={`Copy link to section: ${title}`}
                  title="Copy link to this section"
                >
                  <Link2 size={14} />
                </button>
              )}
            </HeadingTag>

            {/* Optional Badge */}
            {badge && (
              <span
                className="badge badge-brand text-[10px] uppercase font-bold py-0.5 px-2 tracking-wider"
                style={{ verticalAlign: 'middle' }}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="text-xs sm:text-sm font-medium"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}

          {/* Last Updated for specific section */}
          {lastUpdated && (
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Section last updated: {lastUpdated}
            </p>
          )}
        </div>

        {/* Accordion trigger icon (hidden on print) */}
        {collapsible && (
          <ChevronDown
            size={18}
            className={cn(
              'flex-shrink-0 transition-transform duration-200 mt-1 print:hidden',
              isExpanded && 'transform rotate-180'
            )}
            style={{ color: 'var(--color-text-muted)' }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content wrapper */}
      <AnimatePresence initial={false}>
        {(isExpanded || !collapsible) && (
          <motion.div
            id={contentId}
            role={collapsible ? 'region' : undefined}
            aria-labelledby={headingId}
            initial={collapsible ? { height: 0, opacity: 0 } : undefined}
            animate={collapsible ? { height: 'auto', opacity: 1 } : undefined}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden print:!block print:!h-auto print:!opacity-100"
          >
            <div
              className={cn(
                'prose prose-sm sm:prose-base max-w-none text-sm sm:text-base leading-relaxed mt-4 print:mt-2 print:text-xs print:leading-normal',
                collapsible && 'pl-2 border-l-2 border-[var(--color-border)]'
              )}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

LegalSection.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  badge: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  lastUpdated: PropTypes.string,
  collapsible: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
  showDivider: PropTypes.bool,
  level: PropTypes.oneOf([2, 3, 4]),
};
