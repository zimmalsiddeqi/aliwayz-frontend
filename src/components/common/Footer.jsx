import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Star, Send, CheckCircle,
  Mail, MapPin, MessageSquare,
  ChevronRight, ExternalLink,
  Github, Twitter,
} from 'lucide-react';
import FeedbackService from '@api/services/feedback.service';
import useAuthStore from '@store/auth.store';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';
import { cn, getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function Footer() {
  const { user, isAuthenticated } = useAuthStore();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [rating, setRating]       = useState(0);
  const [hoveredStar, setHovered] = useState(0);
  const [name, setName]           = useState(user?.full_name || '');
  const [email, setEmail]         = useState(user?.email || '');
  const [message, setMessage]     = useState('');
  const [feedbackType, setType]   = useState('feedback');

  const TYPES = [
    { value: 'feedback',   label: '💬 Feedback',   color: 'var(--color-brand)' },
    { value: 'suggestion', label: '💡 Suggestion', color: 'var(--color-warning)' },
    { value: 'bug',        label: '🐛 Bug Report', color: 'var(--color-error)' },
    { value: 'praise',     label: '🎉 Praise',     color: 'var(--color-success)' },
    { value: 'complaint',  label: '😤 Complaint',  color: '#EF4444' },
  ];

  const submitMutation = useMutation({
    mutationFn: () =>
      FeedbackService.submit({
        name:    name.trim() || undefined,
        email:   email.trim() || undefined,
        type:    feedbackType,
        rating:  rating || undefined,
        message: message.trim(),
      }),
    onSuccess: () => {
      setFeedbackSent(true);
      setRating(0);
      setMessage('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleReset = () => {
    setFeedbackSent(false);
    setShowFeedback(false);
    setRating(0);
    setMessage('');
    setType('feedback');
  };

  const currentYear = new Date().getFullYear();

  const QUICK_LINKS = [
  { label: 'Everyday Essentials', to: '/essentials' },
  { label: 'Vehicles',           to: '/vehicles' },
  { label: 'Real Estate',        to: '/real-estate' },
  { label: 'All Listings',       to: '/marketplace' },
];

  const COMPANY_LINKS = [
  { label: 'About Us',       to: '#' },
  { label: 'FAQ',            to: '/faq' },
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Use',   to: '#' },
  { label: 'Contact',        to: '#', onClick: () => setShowFeedback(true) },
];

  const SUPPORT_LINKS = [
  { label: 'Help Center',     to: '/faq' },
  { label: 'FAQ',             to: '/faq' },
  { label: 'Safety Tips',     to: '/faq#safety' },
  { label: 'Report an Issue', to: '#', onClick: () => { setType('bug'); setShowFeedback(true); } },
  { label: 'Give Feedback',   to: '#', onClick: () => setShowFeedback(true) },
];

  return (
    <>
      <footer
        className="relative mt-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* ── Feedback CTA Banner ─────────────────────────── */}
        {/* <div
          className="py-8 sm:py-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(91,110,245,0.08), rgba(139,92,246,0.05))',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="container-app text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-lg mx-auto space-y-3"
            >
              <span className="text-3xl">💭</span>
              <h3
                className="text-lg sm:text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                How's your experience?
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Your feedback helps us improve Aliwayz for everyone.
              </p>
              <Button
                onClick={() => setShowFeedback(true)}
                leftIcon={<MessageSquare size={16} />}
              >
                Share Your Thoughts
              </Button>
            </motion.div>
          </div>
        </div> */}

        {/* ── Main Footer Content ─────────────────────────── */}
        <div className="container-app py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                    boxShadow: '0 0 15px var(--color-brand-glow)',
                  }}
                >
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <span className="text-lg font-bold text-gradient-brand">
                  Aliwayz
                </span>
              </Link>
              <p
                className="text-xs leading-relaxed max-w-[200px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Buy & sell locally with QR verified transactions.
                Cars, Property & Daily Essentials.
              </p>

              {/* Contact info */}
              <div className="space-y-2">
                <a
                  href="mailto:support@aliwayz.com"
                  className="flex items-center gap-2 text-xs transition-colors hover:underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Mail size={12} />
                  support@aliwayz.com
                </a>
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <MapPin size={12} />
                  Worldwide
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Browse
              </h4>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Company
              </h4>
              <ul className="space-y-2.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sm transition-colors hover:underline text-left"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm transition-colors hover:underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Support
              </h4>
              <ul className="space-y-2.5">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-sm transition-colors hover:underline text-left"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm transition-colors hover:underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────── */}
        <div
          className="py-5"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3">
            <p
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              © {currentYear} Aliwayz. Made with
              <Heart size={10} fill="var(--color-error)" style={{ color: 'var(--color-error)' }} />
              for local communities.
            </p>

            <div className="flex items-center gap-4">
              <span
                className="text-[10px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                QR Verified Marketplace
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>·</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ FEEDBACK MODAL ═══════════════════════════════ */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleReset}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xl)',
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Drag handle mobile */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-border-strong)' }}
                />
              </div>

              <div className="p-5 sm:p-6">
                {feedbackSent ? (
                  /* ── Success State ──────────────────────── */
                  <motion.div
                    className="text-center py-6 space-y-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                    >
                      <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Thank you! 🎉
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Your feedback has been submitted. Our team will review it.
                    </p>
                    <Button onClick={handleReset}>Done</Button>
                  </motion.div>
                ) : (
                  /* ── Feedback Form ──────────────────────── */
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="text-center">
                      <span className="text-3xl">💭</span>
                      <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--color-text-primary)' }}>
                        Share Your Feedback
                      </h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Help us improve Aliwayz
                      </p>
                    </div>

                    {/* Type selector */}
                    <div className="flex flex-wrap gap-1.5">
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setType(t.value)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={{
                            backgroundColor: feedbackType === t.value ? `${t.color}15` : 'var(--color-surface-elevated)',
                            border: `1px solid ${feedbackType === t.value ? t.color : 'var(--color-border)'}`,
                            color: feedbackType === t.value ? t.color : 'var(--color-text-secondary)',
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Star rating */}
                    <div className="text-center space-y-1">
                      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Rate your experience (optional)
                      </label>
                      <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <motion.button
                            key={s}
                            type="button"
                            whileTap={{ scale: 0.85 }}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(s)}
                          >
                            <Star
                              size={28}
                              fill={s <= (hoveredStar || rating) ? 'var(--color-warning)' : 'none'}
                              style={{
                                color: s <= (hoveredStar || rating) ? 'var(--color-warning)' : 'var(--color-border-strong)',
                                transition: 'all 0.1s',
                              }}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {(hoveredStar || rating) > 0 && (
                        <p className="text-xs font-medium" style={{ color: 'var(--color-warning)' }}>
                          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][hoveredStar || rating]}
                        </p>
                      )}
                    </div>

                    {/* Name + Email */}
                    {!isAuthenticated && (
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Name"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                          label="Email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Message */}
                    <Textarea
                      label="Your message *"
                      placeholder="Tell us what you think, report a bug, or share a suggestion..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={2000}
                      className="min-h-[100px]"
                    />

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={handleReset}
                      >
                        Cancel
                      </Button>
                      <Button
                        fullWidth
                        disabled={!message.trim() || message.trim().length < 5}
                        isLoading={submitMutation.isPending}
                        loadingText="Sending..."
                        leftIcon={<Send size={16} />}
                        onClick={() => submitMutation.mutate()}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}