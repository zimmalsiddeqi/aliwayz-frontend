import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * TermsPage - The Terms & Conditions governing the use of the Aliwayz local meetup marketplace.
 * Explicitly structures user conduct, peer-to-peer transaction risks, zero-payment processing liability,
 * and intellectual property terms.
 */
export default function TermsPage() {
  return (
    <LegalLayout slug="terms">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Please read these Terms and Conditions carefully before using the Aliwayz marketplace platform.
        </p>
      </div>

      <LegalSection id="acceptance-of-terms" title="1. Acceptance of Terms">
        <p className="mb-4">
          By creating an account, browsing listings, uploading images, or utilizing the in-app chat systems 
          on Aliwayz (collectively, the &quot;Services&quot;), you agree to be bound by these Terms & Conditions 
          and all applicable policies, guidelines, and federal, state, and local laws of the United States.
        </p>
        <p>
          If you do not agree to all of these terms, you are not authorized to use the Services. 
          Your continued use of the platform constitutes ongoing acceptance of any modifications we may publish.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Eligibility">
        <p className="mb-4">
          The Aliwayz marketplace is intended solely for users who are at least 18 years of age. 
          By registering an account, you represent and warrant that you are 18 years old or older and possess 
          the legal capacity to enter into binding agreements.
        </p>
        <p>
          If you are under 18, you are strictly prohibited from registering an account, browsing, 
          listing items, or utilizing our communication channels.
        </p>
      </LegalSection>

      <LegalSection id="account-registration" title="3. Account Registration">
        <p className="mb-4">
          To list items or send messages, you must register an account using an email and password or 
          by authenticating through Google Sign-In. You agree to:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Provide accurate, current, and complete profile information.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>Promptly update profile details to keep them accurate.</li>
          <li>Notify support immediately of any unauthorized access to your account.</li>
        </ul>
        <p>
          You are solely responsible for all activities that occur under your account. We reserve the right to 
          terminate or suspend accounts that contain misleading, fraudulent, or impersonated information.
        </p>
      </LegalSection>

      <LegalSection id="marketplace-services" title="4. Marketplace Services">
        <p className="mb-4">
          Aliwayz is a local marketplace platform that connects buyers and sellers. 
          <strong> Please review our operational model carefully:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>No Payment Processing:</strong> Aliwayz is not a payment processor. 
            We do not facilitate, handle, clear, or process financial transactions inside the application. 
            We do not hold money, offer escrow, or act as financial intermediaries.
          </li>
          <li>
            <strong>Physical Handover:</strong> All financial exchanges, product handovers, and negotiations 
            occur directly between buyers and sellers in person, offline, and at their own discretion.
          </li>
          <li>
            <strong>QR meetup verification:</strong> We provide a single-use QR meetup verification system 
            solely to allow users to document that a physical meeting occurred. This system does not process, 
            guarantee, or warrant any financial transaction.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="user-conduct" title="5. User Conduct">
        <p className="mb-4">
          All users must interact respectfully. When using our Services, you agree NOT to:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Violate any local, state, or federal laws of the United States.</li>
          <li>Harass, abuse, stalk, threaten, or defame other marketplace participants.</li>
          <li>List, sell, or advertise items that violate our <Link to="/legal/prohibited-items" className="underline text-[var(--color-brand)]">Prohibited Items Policy</Link>.</li>
          <li>Create fake accounts, impersonate any person, or execute duplicate account configurations.</li>
          <li>Deploy automated scripts, bots, scrapers, or indexers to access platform databases.</li>
          <li>Post spam, bulk solicitations, or link out to external online stores or alternative payment networks.</li>
        </ul>
        <p>
          Failure to adhere to these rules violates our <Link to="/legal/community-guidelines" className="underline text-[var(--color-brand)]">Community Guidelines</Link> 
          {' '}and will result in permanent account termination.
        </p>
      </LegalSection>

      <LegalSection id="listings-and-content" title="6. Listings and Content">
        <p className="mb-4">
          Sellers are solely responsible for the content of their listings. By uploading descriptions, pricing, 
          and product images, you represent and warrant that:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>The listing information is complete, truthful, and accurate.</li>
          <li>You hold the legal title and permission to sell the item.</li>
          <li>The photos uploaded are actual images of the item in its current condition.</li>
          <li>The listing does not infringe upon any third-party intellectual property or copyright.</li>
        </ul>
        <p>
          We reserve the right to remove any listing at any time, without prior notice, if it is flagged as inaccurate, 
          prohibited, or inappropriate.
        </p>
      </LegalSection>

      <LegalSection id="transactions" title="7. Transactions">
        <p className="mb-4">
          All transactions are conducted entirely at your own risk. 
          <strong> You acknowledge and agree that:</strong>
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>
            Aliwayz is not a party to any contract, transaction, or sale between buyers and sellers. We do not 
            have control over, inspect, or guarantee the quality, safety, legality, or description of listed items.
          </li>
          <li>
            We are not responsible for any fraudulent listings, misrepresentations, or buyer/seller defaults.
          </li>
          <li>
            Meetups occur in public or private settings. You are responsible for following basic safety practices 
            outlined in our <Link to="/legal/safety-guidelines" className="underline text-[var(--color-brand)]">Safety Guidelines</Link>, 
            such as meeting in well-lit, public locations and verifying items before exchange.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="intellectual-property" title="8. Intellectual Property">
        <p className="mb-4">
          The Aliwayz brand name, logo, codebase, visual layouts, styling, icons, database architecture, 
          and assets are the exclusive property of Shawkat Ali. You are granted a limited, non-exclusive, 
          revocable license to access the site for personal, non-commercial use.
        </p>
        <p className="mb-4">
          By posting images or descriptions on the marketplace, you grant Aliwayz a non-exclusive, royalty-free, 
          worldwide, perpetual license to display, host, and crop your content to facilitate search visibility. 
          You retain full copyright ownership of your original uploaded images.
        </p>
        <p>
          For copyright claims or takedown requests, please review our <Link to="/legal/copyright" className="underline text-[var(--color-brand)]">Copyright Notice</Link> 
          {' '}and our <Link to="/legal/intellectual-property" className="underline text-[var(--color-brand)]">Intellectual Property Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="limitation-of-liability" title="9. Limitation of Liability">
        <p className="mb-4 uppercase font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
          To the maximum extent permitted by applicable US law, the Aliwayz platform, its developer (Shawkat Ali), 
          and related infrastructure operators are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, 
          without warranties of any kind.
        </p>
        <p className="mb-4">
          We do not warrant that the Services will run uninterrupted, error-free, or secure. We disclaim any liability 
          for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to 
          loss of profits, loss of data, safety incidents, fraud, or property damage arising out of your marketplace interactions.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion or limitation of certain damages, so the above limitations 
          may not apply to you.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="10. Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless Aliwayz, its developer Shawkat Ali, and operational service providers 
          from and against any claims, liabilities, damages, judgments, losses, costs, or expenses (including reasonable attorney fees) 
          arising out of your violation of these Terms & Conditions, your use of the marketplace, your uploaded content, 
          or your physical conduct during transactions.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="11. Termination">
        <p className="mb-4">
          We reserve the right, in our sole discretion and without prior notice, to suspend or terminate your account 
          and block your access to the platform for:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Violating these Terms & Conditions or associated policies.</li>
          <li>Engaging in fraudulent, deceptive, or illegal marketplace practices.</li>
          <li>Threatening, harassing, or spamming other users.</li>
          <li>Extended periods of account inactivity.</li>
        </ul>
        <p>
          Upon termination, all listings are removed from public search feeds, and your authorization to use the site is revoked. 
          Terms that by their nature should survive termination (including disclaimers, liability limits, and indemnity) will remain active.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="12. Governing Law">
        <p>
          These Terms & Conditions and any disputes arising out of your use of the platform are governed by the laws of 
          the State of Delaware, United States, without regard to conflict of law principles. Any legal actions or proceedings 
          associated with the platform must be brought exclusively in the state or federal courts located in the United States.
        </p>
      </LegalSection>

      <LegalSection id="changes-to-terms" title="13. Changes to These Terms">
        <p>
          We reserve the right to modify these Terms & Conditions at any time. When updates are published, we will 
          update the &quot;Last Updated&quot; and &quot;Effective Date&quot; at the top of this page. Your continued use of the platform 
          following the publication of modifications constitutes your acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="14. Contact Us">
        <p className="mb-4">
          If you have questions, feedback, or need clarification regarding these Terms & Conditions, please contact us:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Developer:</strong> Shawkat Ali
          </p>
          <p className="text-xs">
            <strong>General Support Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Legal Operations:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
