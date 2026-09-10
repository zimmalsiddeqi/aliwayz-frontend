import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check } from 'lucide-react';
import toast from '@lib/toast';

/**
 * ContactEmailLink - Renders an interactive email link with mailto trigger,
 * instant clipboard copy fallback, and feedback toast notification.
 */
export default function ContactEmailLink({
  email,
  children,
  className = '',
  showCopyIcon = false,
  onClick,
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    
    // Copy to clipboard
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setCopied(true);
        toast.success(`Copied "${email}" to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        toast.success(`Email: ${email}`);
      });
    } else {
      toast.success(`Email: ${email}`);
    }
  };

  const displayText = children || email;

  return (
    <span className="inline-flex items-center gap-1 group/email">
      <a
        href={`mailto:${email}`}
        onClick={handleClick}
        title={`Click to copy & open email client: ${email}`}
        className={`underline text-[var(--color-brand)] hover:opacity-80 transition-opacity font-medium cursor-pointer ${className}`}
      >
        {displayText}
      </a>
      {showCopyIcon && (
        <button
          type="button"
          onClick={handleClick}
          title="Copy email to clipboard"
          aria-label={`Copy ${email}`}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
        >
          {copied ? (
            <Check size={13} className="text-[var(--color-success)] animate-in zoom-in-50 duration-200" />
          ) : (
            <Copy size={13} className="group-hover/email:opacity-100 opacity-60 transition-opacity" />
          )}
        </button>
      )}
    </span>
  );
}

ContactEmailLink.propTypes = {
  email: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  showCopyIcon: PropTypes.bool,
  onClick: PropTypes.func,
};
