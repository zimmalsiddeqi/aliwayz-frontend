import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * IntellectualPropertyPage - Outlines trademark, patent, and brand property policies
 * for Aliwayz.
 */
export default function IntellectualPropertyPage() {
  return (
    <LegalLayout slug="intellectual-property">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This policy details how Aliwayz handles intellectual property ownership, license parameters, and infringement claims.
        </p>
      </div>

      <LegalSection id="overview" title="1. Overview">
        <p className="mb-4">
          Aliwayz respects the intellectual property (IP) rights of others and expects our users to do the same. 
          We do not allow listings or user profiles that violate third-party trademarks, copyrights, patents, 
          or proprietary information.
        </p>
        <p>
          This policy outlines the ownership parameters of platform IP, the licenses granted when users upload media, 
          and the processes for submitting infringement notices.
        </p>
      </LegalSection>

      <LegalSection id="aliwayz-ip" title="2. Aliwayz Intellectual Property">
        <p className="mb-4">
          The Aliwayz platform, its brand name, logo, custom code, styles, graphics, layouts, search mechanics, 
          database configurations, and user interface elements are the exclusive intellectual property of the developer, 
          <strong> Shawkat Ali</strong>.
        </p>
        <p>
          You are granted a limited, personal, non-transferable, and revocable license to access the marketplace 
          solely for buying and selling listings. You are strictly prohibited from copying, scraping, decompiling, 
          or utilizing any brand elements or codebase components for external commercial purposes without express written consent.
        </p>
      </LegalSection>

      <LegalSection id="user-content-rights" title="3. User Content Rights">
        <p className="mb-4">
          When you upload product descriptions, listings, coordinates, or images, you retain full copyright ownership 
          of your original materials. However:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>
            <strong>License to Display:</strong> You grant Aliwayz a worldwide, non-exclusive, royalty-free, sub-licensable, 
            and perpetual license to host, display, resize, distribute, and format your uploaded content to operate 
            the marketplace feed.
          </li>
          <li>
            <strong>Warranty of Rights:</strong> By listing an item, you represent and warrant that you hold all necessary 
            intellectual property rights to the uploaded media and descriptions.
          </li>
        </ul>
        <p>
          This license is necessary for us to display your items to browsing users and index your listings in search queries.
        </p>
      </LegalSection>

      <LegalSection id="reporting-infringement" title="4. Reporting Infringement">
        <p className="mb-4">
          If you believe a user listing infringes your trademark, patent, or proprietary rights, please submit 
          a formal notice to our Legal Operations desk:
        </p>
        <div className="p-4 rounded-xl border space-y-2 mb-4 text-xs" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Infringement Notice Requirements:</p>
          <ul className="list-decimal pl-4 space-y-1">
            <li>Your full name, company name (if applicable), and contact details (email and address).</li>
            <li>A detailed description of the trademark, patent, or proprietary right being infringed.</li>
            <li>The registration number and jurisdiction of the intellectual property (if registered).</li>
            <li>Direct links (URLs) to the specific infringing listings on Aliwayz.</li>
            <li>A statement made under penalty of perjury that the information provided is accurate and that you are the rights holder or authorized agent.</li>
          </ul>
        </div>
        <p>
          Submit these requests directly to <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">legal@aliwayz.com</a>. 
          For copyright (DMCA) claims, please consult our dedicated <Link to="/legal/copyright" className="underline text-[var(--color-brand)]">Copyright Notice</Link>.
        </p>
      </LegalSection>

      <LegalSection id="counter-notification" title="5. Counter-Notification">
        <p className="mb-4">
          If your listing was removed due to an IP infringement report and you believe it was removed in error, 
          you may file a counter-notification:
        </p>
        <p className="mb-4">
          Your counter-notice must include your account details, an explanation of why you hold the right to list 
          the item (such as verification of authenticity or purchase invoice), and a statement consenting to the 
          jurisdiction of the federal court systems.
        </p>
        <p>
          Submit your counter-notification email to <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">legal@aliwayz.com</a>. 
          We will review the materials and resolve the dispute according to applicable regulations.
        </p>
      </LegalSection>

      <LegalSection id="repeat-infringers" title="6. Repeat Infringers">
        <p className="mb-4">
          We protect intellectual property actively to comply with US legal guidelines and maintain a clean marketplace. 
          Accounts that receive multiple verified infringement reports will face permanent suspension:
        </p>
        <p>
          Our system logs warnings against user profiles. If a seller profile accumulates three separate trademark 
          or copyright removals, the store is deactivated, active listings are removed, and the user is banned 
          from registering future profiles.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="7. Contact Us">
        <p className="mb-4">
          If you have questions regarding brand licensing, trademark guidelines, or reporting procedures, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Legal Operations Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
          <p className="text-xs">
            <strong>IP Moderation:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
