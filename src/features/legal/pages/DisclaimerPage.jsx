import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * DisclaimerPage - Outlines limitations of liability, no-warranty disclaimers,
 * and transaction disclaimer parameters for Aliwayz.
 */
export default function DisclaimerPage() {
  return (
    <LegalLayout slug="disclaimer">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This page contains critical disclaimers limiting our liability regarding your use of Aliwayz.
        </p>
      </div>

      <LegalSection id="general-disclaimer" title="1. General Disclaimer">
        <p className="mb-4">
          The information, listings, and services provided through Aliwayz are for general information and 
          peer-to-peer connection purposes only. By using the platform, you acknowledge and agree that your 
          access is entirely at your own risk.
        </p>
        <p>
          We do not guarantee the accuracy, completeness, or reliability of any listings, user profiles, 
          or message content on the site.
        </p>
      </LegalSection>

      <LegalSection id="no-warranty" title="2. No Warranty">
        <p className="mb-4 uppercase font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
          Aliwayz and its developer, Shawkat Ali, provide the platform on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. 
          We disclaim all warranties of any kind, whether express or implied.
        </p>
        <p>
          We make no warranties regarding: the security, reliability, timeliness, or performance of the platform; 
          that the application will operate error-free, uninterrupted, or without data loss; or that any items 
          advertised on the marketplace are authentic, functional, or legal.
        </p>
      </LegalSection>

      <LegalSection id="marketplace-transactions" title="3. Marketplace Transactions">
        <p className="mb-4">
          Aliwayz is solely a communication platform connecting buyers and sellers. 
          <strong> We do not act as transaction intermediaries, banks, payment processors, or escrow agents:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>We do not process, clear, or handle financial transactions. All payments occur directly between buyers and sellers offline.</li>
          <li>We do not inspect, verify, ship, or store any items listed for sale.</li>
          <li>We hold no liability for physical safety, scams, defaults, or product defects during meetups.</li>
        </ul>
        <p className="mt-4">
          All meetups and exchanges are conducted at your own risk. Please follow the recommendations in our{' '}
          <Link to="/legal/safety-guidelines" className="underline text-[var(--color-brand)]">Safety Guidelines</Link> 
          {' '}to protect yourself during in-person handovers.
        </p>
      </LegalSection>

      <LegalSection id="user-content" title="4. User Content">
        <p className="mb-4">
          Listings, titles, prices, descriptions, and images are uploaded entirely by users. 
          Aliwayz does not pre-screen or authenticate user content for accuracy:
        </p>
        <p>
          We do not endorse any statements, listings, or profiles. If you find inaccurate or illegal content, 
          please report it immediately using the listing report buttons, as explained in our{' '}
          <Link to="/legal/report-abuse" className="underline text-[var(--color-brand)]">Report Abuse</Link> guidelines.
        </p>
      </LegalSection>

      <LegalSection id="third-party-links" title="5. Third-Party Links">
        <p className="mb-4">
          Our platform may contain links to external, third-party websites or services that are not owned 
          or controlled by Aliwayz.
        </p>
        <p>
          We hold no responsibility for the content, privacy policies, or business practices of any third-party 
          sites. We encourage you to inspect the terms of any external links you choose to click.
        </p>
      </LegalSection>

      <LegalSection id="limitation-of-liability" title="6. Limitation of Liability">
        <p className="mb-4 uppercase font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
          To the maximum extent permitted by applicable US law, in no event shall Aliwayz, its developer Shawkat Ali, 
          or related infrastructure operators be liable for any direct, indirect, incidental, special, consequential, 
          or punitive damages.
        </p>
        <p>
          This limitation applies to any loss of profits, loss of data, property damage, bodily injury, theft, 
          fraud, or transaction disputes arising from your use of the marketplace, listings, in-app chat systems, 
          or your physical conduct during meetups.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="7. Contact Us">
        <p className="mb-4">
          If you have questions regarding these disclaimers or require compliance information, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Legal Operations Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
          <p className="text-xs">
            <strong>General Support:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
