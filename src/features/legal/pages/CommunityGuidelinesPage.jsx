import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * CommunityGuidelinesPage - Operational rules, safety compliance, and behavior standards
 * for Aliwayz marketplace users.
 */
export default function CommunityGuidelinesPage() {
  return (
    <LegalLayout slug="community-guidelines">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          These guidelines outline the standards of safety, honesty, and respect expected of everyone in the Aliwayz community.
        </p>
      </div>

      <LegalSection id="our-community" title="1. Our Community">
        <p className="mb-4">
          Aliwayz was created to foster local commerce and trust. By offering a platform that connects neighbors 
          for physical face-to-face transactions, we aim to make local buying and selling simple and secure.
        </p>
        <p>
          To maintain this environment, all members must cooperate in keeping the platform safe, respectful, 
          and compliant with our behavioral guidelines.
        </p>
      </LegalSection>

      <LegalSection id="respectful-behavior" title="2. Respectful Behavior">
        <p className="mb-4">
          We have a zero-tolerance policy for harassment, discrimination, or abusive communication:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Zero Harassment:</strong> Do not use in-app chat to threaten, intimidate, stalk, or insult other users.</li>
          <li><strong>No Discrimination:</strong> Respect all community members regardless of race, ethnicity, national origin, religion, gender, sexual orientation, disability, or age.</li>
          <li><strong>Civil Communication:</strong> Keep discussions focused on transaction logistics. Do not spam, post unsolicited advertisements, or send offensive media.</li>
        </ul>
      </LegalSection>

      <LegalSection id="honest-listings" title="3. Honest Listings">
        <p className="mb-4">
          Trust begins with honesty. Sellers must accurately describe what they are offering:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>No Bait-and-Switch:</strong> Do not advertise one item and deliver a different or lower-quality version at the meetup.</li>
          <li><strong>Truthful Condition:</strong> Disclose any damage, wear, or functional defects clearly in the description.</li>
          <li><strong>Real Photos:</strong> Only upload actual photos of the item in your possession. Stock photos are prohibited.</li>
          <li><strong>No Price Manipulation:</strong> Always list the true purchase price. Do not list items at $1 or $0 to spam search feeds.</li>
        </ul>
      </LegalSection>

      <LegalSection id="safe-transactions" title="4. Safe Transactions">
        <p className="mb-4">
          Because transactions happen in person and offline, you are responsible for prioritizing safety:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Public Exchanges:</strong> Always meet in well-lit, public environments, such as police department exchange points or grocery store parking lots.</li>
          <li><strong>Examine First:</strong> Buyers must thoroughly inspect the item, check vehicle titles, or confirm property details before exchanging payment.</li>
          <li><strong>QR Verification:</strong> Always present or scan the transaction QR code at the meetup to log that the transaction occurred.</li>
        </ul>
      </LegalSection>

      <LegalSection id="prohibited-behavior" title="5. Prohibited Behavior">
        <p className="mb-4">
          To maintain platform security, the following activities are strictly prohibited:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Registering multiple accounts, creating dummy listings, or inflating ratings using fake reviews.</li>
          <li>Selling, listing, or purchasing items that violate our <Link to="/legal/prohibited-items" className="underline text-[var(--color-brand)]">Prohibited Items Policy</Link>.</li>
          <li>Attempting to hack, exploit, or disrupt our backend infrastructure or Supabase database configuration.</li>
          <li>Redirecting users to external online shops, auction pages, or outside payment systems.</li>
        </ul>
      </LegalSection>

      <LegalSection id="reporting-violations" title="6. Reporting Violations">
        <p className="mb-4">
          If you witness guidelines violations or suspicious behavior, please notify us immediately:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Report Listing:</strong> Click the <strong>Report</strong> button on any listing that violates our rules or lists banned items.</li>
          <li><strong>Report User:</strong> Report abusive behavior in in-app chat. For detailed instructions, review our <Link to="/legal/report-abuse" className="underline text-[var(--color-brand)]">Report Abuse Policy</Link>.</li>
        </ul>
      </LegalSection>

      <LegalSection id="enforcement" title="7. Enforcement">
        <p className="mb-4">
          We investigate all reports of guidelines violations and take appropriate action. Enforcement measures include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Formal email warnings.</li>
          <li>Temporary suspension of listing or chat privileges.</li>
          <li>Removal of specific listings from the search index.</li>
          <li>Permanent account termination and ban from registering new profiles.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contact-us" title="8. Contact Us">
        <p className="mb-4">
          If you have questions regarding community safety, seller badges, or behavioral expectations, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Community Support:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Safety & Compliance:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
