import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * DataDeletionPage - Explains data rights, manual data purge requests,
 * and data deletion processing timelines.
 */
export default function DataDeletionPage() {
  return (
    <LegalLayout slug="data-deletion">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This Data Deletion Policy explains how to exercise your right to be forgotten and details our data purge processes.
        </p>
      </div>

      <LegalSection id="your-data-rights" title="1. Your Data Rights">
        <p className="mb-4">
          Aliwayz respects your privacy and provides tools to control how your personal data is handled. 
          Under US state regulations (including CCPA and general privacy guidelines), you have the right to 
          request the deletion of any personal data we have collected and retained.
        </p>
        <p>
          This policy details how you can submit a request, the categories of data that are purged, 
          and the timelines for complete data removal.
        </p>
      </LegalSection>

      <LegalSection id="how-to-request" title="2. How to Request Data Deletion">
        <p className="mb-4">
          We offer two methods to request the deletion of your personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Self-Service Account Deletion:</strong> The fastest way to purge your data is to use our self-service 
            tool. Follow the steps detailed in our <Link to="/legal/account-deletion" className="underline text-[var(--color-brand)]">Account Deletion Policy</Link> 
            {' '}to close your profile. This triggers automated data removal.
          </li>
          <li>
            <strong>Manual Data Purge Request:</strong> You can submit a manual deletion request by sending an email 
            to our Privacy Request Desk at <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="underline text-[var(--color-brand)]">privacy@aliwayz.com</a>. 
            Please include your account username and the registered email address.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="what-data-is-deleted" title="3. What Data Is Deleted">
        <p className="mb-4">
          When an account deletion or manual purge request is executed, the following information is permanently 
          removed from our production databases:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your full name, registered email address, and hashed password.</li>
          <li>Your verified phone number and profile photo.</li>
          <li>Your active marketplace listings, pricing details, and uploaded product images.</li>
          <li>Your favorites list and account preferences.</li>
          <li>Active authentication session tokens.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-we-may-retain" title="4. Data We May Retain">
        <p className="mb-4">
          Specific transaction logs and user logs are retained after account closure due to legal obligations, 
          fraud investigations, and system integrity:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>In-App Chat Histories:</strong> Chat messages are shared communications. To preserve 
            the transaction records of users you contacted, your chat messages remain visible to those users.
          </li>
          <li>
            <strong>Firewall and Security Audits:</strong> Firewall logs, IP addresses associated with security incidents, 
            and abuse report tickets are retained for up to 90 days.
          </li>
          <li>
            <strong>Archived Backups:</strong> Database backup files are cleared incrementally per our automated 
            backup rotation schedule.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="processing-timeline" title="5. Processing Timeline">
        <p className="mb-4">
          We process data deletion requests as quickly as possible:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Self-Service Deletion:</strong> Production databases are updated immediately. Public listings are hidden instantly.</li>
          <li><strong>Manual Deletion Requests:</strong> Manual requests submitted via email are verified and processed within 30 days of receipt.</li>
        </ul>
      </LegalSection>

      <LegalSection id="verification" title="6. Verification">
        <p className="mb-4">
          To protect user privacy and account security, we must verify your identity before processing any manual email request. 
          To do this:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must send the request from the email address registered to the account.</li>
          <li>We may request confirmation of recent listing titles or account activity dates to verify ownership.</li>
        </ul>
        <p className="mt-4">
          If we cannot verify account ownership, we will reject the deletion request to prevent unauthorized access.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="7. Contact Us">
        <p className="mb-4">
          If you have questions about our data deletion practices or wish to submit a privacy request, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Privacy Request Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.privacy}</a>
          </p>
          <p className="text-xs">
            <strong>General Support:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
