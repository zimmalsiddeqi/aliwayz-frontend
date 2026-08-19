import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * ReportAbusePage - Explains user reporting mechanisms, moderation processes,
 * and support channels for reporting abuse or fraud on Aliwayz.
 */
export default function ReportAbusePage() {
  return (
    <LegalLayout slug="report-abuse">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This page explains how to report marketplace fraud, abuse, harassment, or listing violations.
        </p>
      </div>

      <LegalSection id="what-to-report" title="1. What to Report">
        <p className="mb-4">
          Aliwayz aims to maintain a safe, clean, and trusted marketplace. We rely on our users to flag 
          content or conduct that violates our policies. Please report the following items:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Fraud and Scams:</strong> Sellers requesting advance deposits, bank wire transfers, or displaying counterfeit titles.</li>
          <li><strong>Prohibited Items:</strong> Any active listings for items banned under our <Link to="/legal/prohibited-items" className="underline text-[var(--color-brand)]">Prohibited Items Policy</Link> (such as weapons, drugs, or alcohol).</li>
          <li><strong>Abusive Conduct:</strong> User threats, harassment, hate speech, or offensive media sent via in-app chat.</li>
          <li><strong>Bait-and-Switch Listings:</strong> Listings where the descriptions, photos, or prices differ from the actual item presented.</li>
          <li><strong>IP Infringements:</strong> Listings containing images or text that violate third-party trademarks or copyrights.</li>
        </ul>
      </LegalSection>

      <LegalSection id="how-to-report" title="2. How to Report">
        <p className="mb-4">
          We provide simple reporting channels depending on the nature of the violation:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Reporting a Listing:</strong> Navigate to the listing detail page, click the <strong>Report Listing</strong> 
            {' '}link, select the violation reason from the dropdown, and submit your report.
          </li>
          <li>
            <strong>Reporting a User:</strong> Navigate to the user&apos;s public profile page, click <strong>Report User</strong>, 
            and specify the reason.
          </li>
          <li>
            <strong>Reporting Chat Abuse:</strong> Flag specific messages in the chat panel or take screenshots and email them 
            to <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>.
          </li>
          <li>
            <strong>Reporting IP Infringements:</strong> Submit formal copyright or trademark infringement reports to{' '}
            <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="what-happens-next" title="3. What Happens Next">
        <p className="mb-4">
          When a report is submitted, our moderation team reviews the case:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Review Phase:</strong> We inspect the reported listing, chat logs, or profile details for terms violations.</li>
          <li><strong>Enforcement:</strong> If a violation is confirmed, we take action immediately, which may include removing the listing, restricting store settings, or suspending the account.</li>
          <li><strong>Confidentiality:</strong> All user reports are confidential. We never reveal the identity of the reporting user to the reported party.</li>
        </ul>
      </LegalSection>

      <LegalSection id="false-reports" title="4. False Reports">
        <p className="mb-4">
          Our reporting system exists to protect the community. Abuse of this system is strictly prohibited:
        </p>
        <p>
          Submitting false, malicious, or retaliatory reports against other users to disrupt their sales or manipulate 
          the search system violates our <Link to="/legal/community-guidelines" className="underline text-[var(--color-brand)]">Community Guidelines</Link>. 
          Accounts found abusing the reporting tool will face warnings or suspension.
        </p>
      </LegalSection>

      <LegalSection id="emergency-situations" title="5. Emergency Situations">
        <p className="mb-4">
          <strong>Aliwayz does not provide emergency intervention services.</strong>
        </p>
        <p>
          If you experience an immediate safety threat, physical harassment, or suspect criminal activity during an in-person meetup, 
          do not wait for our moderation team. Move to a safe public location immediately and contact local emergency services 
          or call <strong>911</strong>. Once you are safe, please report the incident to us so we can suspend the offender.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="6. Contact Us">
        <p className="mb-4">
          If you have questions about our reporting processes or wish to follow up on a submitted report, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Moderation Operations:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Compliance Operations:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
