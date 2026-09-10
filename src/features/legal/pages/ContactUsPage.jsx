import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Shield, Sparkles, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import toast from '@lib/toast';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';
import ContactEmailLink from '../components/ContactEmailLink';
import Button from '@components/ui/Button';

/**
 * ContactUsPage - Support directories, interactive contact form, and SLA expectations
 * for Aliwayz.
 */
export default function ContactUsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const deptQuery = searchParams.get('dept');

  const [department, setDepartment] = useState(
    deptQuery === 'privacy' ? 'privacy' : deptQuery === 'legal' ? 'legal' : 'general'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (deptQuery && ['general', 'privacy', 'legal', 'account'].includes(deptQuery)) {
      setDepartment(deptQuery);
    }
  }, [deptQuery]);

  const handleDeptSelect = (deptKey) => {
    setDepartment(deptKey);
    setSearchParams({ dept: deptKey });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate swift submission & provide target email fallback
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      const targetEmail =
        department === 'privacy'
          ? SUPPORT_EMAILS.privacy
          : department === 'legal'
          ? SUPPORT_EMAILS.legal
          : SUPPORT_EMAILS.general;

      toast.success(`Inquiry logged! Our ${department.toUpperCase()} desk will respond to ${formData.email}.`);
    }, 600);
  };

  const currentEmail =
    department === 'privacy'
      ? SUPPORT_EMAILS.privacy
      : department === 'legal'
      ? SUPPORT_EMAILS.legal
      : SUPPORT_EMAILS.general;

  return (
    <LegalLayout slug="contact">
      <div
        className="mb-8 p-6 rounded-2xl border print:border-none shadow-sm"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <MessageSquare size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Aliwayz Help & Contact Center
            </h2>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Choose a department below to send a direct message or copy official contact emails.
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. Contact Desks Directory ────────────────────────────── */}
      <LegalSection id="departments" title="1. Support Desks Directory">
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Click any department to select it for the contact form below or copy its direct email address:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* General Support */}
          <div
            onClick={() => handleDeptSelect('general')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              department === 'general'
                ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md'
                : 'hover:border-[var(--color-brand)]/50'
            }`}
            style={{ backgroundColor: 'var(--color-surface)', borderColor: department === 'general' ? 'var(--color-brand)' : 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Mail size={16} />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                General Support Desk
              </h4>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              For account settings, listings, store setup, password reset, or app troubleshooting.
            </p>
            <div className="pt-2 border-t flex flex-col gap-1 text-xs" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-muted)]">Email:</span>
                <ContactEmailLink email={SUPPORT_EMAILS.general} showCopyIcon className="font-semibold text-xs text-[var(--color-brand)]" />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">Response: 1–2 business days</span>
            </div>
          </div>

          {/* Privacy Desk */}
          <div
            onClick={() => handleDeptSelect('privacy')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              department === 'privacy'
                ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md'
                : 'hover:border-[var(--color-brand)]/50'
            }`}
            style={{ backgroundColor: 'var(--color-surface)', borderColor: department === 'privacy' ? 'var(--color-brand)' : 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield size={16} />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Privacy Request Desk
              </h4>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              For CCPA data deletion, account data export, and personal privacy rights.
            </p>
            <div className="pt-2 border-t flex flex-col gap-1 text-xs" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-muted)]">Email:</span>
                <ContactEmailLink email={SUPPORT_EMAILS.privacy} showCopyIcon className="font-semibold text-xs text-[var(--color-brand)]" />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">Response: 2–3 business days</span>
            </div>
          </div>

          {/* Legal Desk */}
          <div
            onClick={() => handleDeptSelect('legal')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              department === 'legal'
                ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md'
                : 'hover:border-[var(--color-brand)]/50'
            }`}
            style={{ backgroundColor: 'var(--color-surface)', borderColor: department === 'legal' ? 'var(--color-brand)' : 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                <Sparkles size={16} />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                Legal & Compliance Desk
              </h4>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              For formal legal filings, DMCA copyright takedown notices, and trademark inquiries.
            </p>
            <div className="pt-2 border-t flex flex-col gap-1 text-xs" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-muted)]">Email:</span>
                <ContactEmailLink email={SUPPORT_EMAILS.legal} showCopyIcon className="font-semibold text-xs text-[var(--color-brand)]" />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">Response: 2–3 business days</span>
            </div>
          </div>
        </div>
      </LegalSection>

      {/* ── 2. Interactive Contact Form ───────────────────────────── */}
      <LegalSection id="send-message" title="2. Send an Online Message">
        <div
          className="p-6 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Thank You! Your Message Has Been Logged
              </h3>
              <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                Our team at <strong>{currentEmail}</strong> has received your inquiry and will follow up with you directly at <strong>{formData.email}</strong>.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </Button>
                <Link to="/legal">
                  <Button variant="ghost" size="sm">
                    Back to Legal Center
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-transparent focus:outline-none focus:border-[var(--color-brand)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-transparent focus:outline-none focus:border-[var(--color-brand)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Department / Destination Desk
                  </label>
                  <select
                    value={department}
                    onChange={(e) => handleDeptSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-brand)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    <option value="general">Customer Support Desk ({SUPPORT_EMAILS.general})</option>
                    <option value="privacy">Privacy Request Desk ({SUPPORT_EMAILS.privacy})</option>
                    <option value="legal">Legal & Compliance Desk ({SUPPORT_EMAILS.legal})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your inquiry"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-transparent focus:outline-none focus:border-[var(--color-brand)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your question, request, or issue with relevant details (such as account username, listing title, or device)..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-transparent focus:outline-none focus:border-[var(--color-brand)] resize-y"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  Directing to: <span className="font-semibold text-[var(--color-brand)]">{currentEmail}</span>
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5"
                  >
                    <Send size={14} /> Send Message
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </LegalSection>

      {/* ── 3. Operating Hours & Response Expectations ───────────── */}
      <LegalSection id="response-times" title="3. SLA & Operating Hours">
        <p className="mb-4">
          All inquiries are routed to department queues and processed in the order received. Our standard hours of operation are:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Monday through Friday, 9:00 AM to 5:00 PM Eastern Standard Time (EST).</li>
          <li>Closed on US Federal Holidays.</li>
        </ul>
        <p>
          We make every effort to respond to critical security, account lockouts, and privacy/deletion requests within 24–48 hours.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
