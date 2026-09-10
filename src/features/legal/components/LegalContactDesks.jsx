import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Mail, MessageSquareText, Shield, Sparkles } from 'lucide-react';
import { SUPPORT_EMAILS } from '../data/legalPages';
import ContactEmailLink from './ContactEmailLink';

/**
 * LegalContactDesks - Renders interactive contact desk cards for legal & support inquiries.
 * Supports email copy, mailto launch, and direct contact form navigation.
 */
export default function LegalContactDesks({ 
  desks = ['general', 'privacy', 'legal'],
  showFormLink = true,
  className = ''
}) {
  const DESK_CONFIG = {
    general: {
      id: 'general',
      title: 'Customer Support Desk',
      email: SUPPORT_EMAILS.general || 'support@aliwayz.com',
      desc: 'For account issues, app troubleshooting, and general questions.',
      icon: MessageSquareText,
      deptParam: 'general',
    },
    privacy: {
      id: 'privacy',
      title: 'Privacy Request Desk',
      email: SUPPORT_EMAILS.privacy || 'privacy@aliwayz.com',
      desc: 'For data deletion requests, CCPA/CPRA rights, and privacy queries.',
      icon: Shield,
      deptParam: 'privacy',
    },
    legal: {
      id: 'legal',
      title: 'Legal & Compliance',
      email: SUPPORT_EMAILS.legal || 'legal@aliwayz.com',
      desc: 'For formal notices, intellectual property/DMCA claims, and compliance.',
      icon: Sparkles,
      deptParam: 'legal',
    },
  };

  const selectedDesks = desks.map((key) => (typeof key === 'string' ? DESK_CONFIG[key] : key)).filter(Boolean);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`grid grid-cols-1 ${selectedDesks.length > 2 ? 'md:grid-cols-3' : selectedDesks.length === 2 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {selectedDesks.map((desk) => {
          const Icon = desk.icon || Mail;
          return (
            <div
              key={desk.id || desk.title}
              className="p-4 rounded-xl border flex flex-col justify-between transition-all hover:border-[var(--color-brand)]/50"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <Icon size={16} />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                    {desk.title}
                  </h4>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  {desk.desc}
                </p>
              </div>

              <div className="pt-2 border-t flex flex-col gap-2" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Email:</span>
                  <ContactEmailLink email={desk.email} showCopyIcon className="font-semibold text-xs text-[var(--color-brand)]" />
                </div>
                {showFormLink && (
                  <Link
                    to={`/legal/contact?dept=${desk.deptParam || 'general'}`}
                    className="mt-1 text-[11px] font-medium text-center py-1.5 px-2 rounded-lg bg-[var(--color-brand)]/10 text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-colors"
                  >
                    Send Direct Message →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

LegalContactDesks.propTypes = {
  desks: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  showFormLink: PropTypes.bool,
  className: PropTypes.string,
};
