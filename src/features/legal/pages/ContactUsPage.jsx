import { Link } from 'react-router-dom';
import toast from '@lib/toast';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * ContactUsPage - Support directories, bug reports, and SLA expectations
 * for Aliwayz.
 */
export default function ContactUsPage() {
  const handleEmailClick = (e, email) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied "${email}" to clipboard!`);
  };

  return (
    <LegalLayout slug="contact">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Contact Operations Guide
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Please direct inquiries to the appropriate department to ensure a rapid response.
        </p>
      </div>

      <LegalSection id="general-support" title="1. General Support">
        <p className="mb-4">
          For help with your account settings, store configuration, listing creations, password recovery, 
          or troubleshooting app issues, contact our Customer Support desk:
        </p>
        <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Email: <a href={`mailto:${SUPPORT_EMAILS.general}`} onClick={(e) => handleEmailClick(e, SUPPORT_EMAILS.general)} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Typical Response Time: 1–2 business days.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="privacy-inquiries" title="2. Privacy Inquiries">
        <p className="mb-4">
          If you wish to submit a CCPA data delete request, request a copy of the personal information stored 
          in your account, or ask questions about our data collection procedures:
        </p>
        <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Email: <a href={`mailto:${SUPPORT_EMAILS.privacy}`} onClick={(e) => handleEmailClick(e, SUPPORT_EMAILS.privacy)} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.privacy}</a>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Typical Response Time: 2–3 business days.
          </p>
        </div>
        <p>
          For more information, please see our <Link to="/legal/data-deletion" className="underline text-[var(--color-brand)]">Data Deletion Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="legal-notices" title="3. Legal Notices">
        <p className="mb-4">
          Direct all formal legal notifications, regulatory compliance filings, trademark claims, or DMCA copyright 
          takedown notices to our Legal Operations department:
        </p>
        <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Email: <a href={`mailto:${SUPPORT_EMAILS.legal}`} onClick={(e) => handleEmailClick(e, SUPPORT_EMAILS.legal)} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Typical Response Time: 2–3 business days.
          </p>
        </div>
        <p>
          To review our intellectual property rules, see our <Link to="/legal/intellectual-property" className="underline text-[var(--color-brand)]">Intellectual Property Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="report-an-issue" title="4. Report an Issue">
        <p className="mb-4">
          We encourage users to report any bugs, software anomalies, security vulnerabilities, or interface issues:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Bug Reports:</strong> You can submit bug reports and feedback directly inside the app footer 
            using the <strong>Report an Issue</strong> or <strong>Give Feedback</strong> links. This opens an interactive submission modal.
          </li>
          <li>
            <strong>Security Vulnerabilities:</strong> If you identify a security leak or database vulnerability, 
            please write immediately to <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">legal@aliwayz.com</a>. 
            Do not publish details of the leak until we have fixed the security threat.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="response-times" title="5. Response Times">
        <p className="mb-4">
          We inspect all incoming emails in the order received. Our standard hours of operation are:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Monday through Friday, 9:00 AM to 5:00 PM Eastern Standard Time.</li>
          <li>Closed on US Federal Holidays.</li>
        </ul>
        <p>
          We make every effort to respond to critical security, privacy, and account access issues within 24 hours. 
          General questions may take longer depending on report volumes.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
