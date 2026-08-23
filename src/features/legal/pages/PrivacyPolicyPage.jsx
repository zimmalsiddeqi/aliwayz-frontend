import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * PrivacyPolicyPage - Google Play & App Store compliant privacy disclosures for Aliwayz.
 * Audited for exact application features (meetup marketplace, no internal payments),
 * third-party integrations (if enabled), CCPA, international usage, and data deletion.
 */
export default function PrivacyPolicyPage() {
  return (
    <LegalLayout slug="privacy-policy">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This Privacy Policy describes our policies and procedures on the collection, use, and disclosure of your information.
        </p>
      </div>

      <LegalSection id="information-we-collect" title="1. Information We Collect">
        <p className="mb-4">
          Aliwayz collects user data to provide a local marketplace connecting buyers and sellers. 
          Below is a detailed audit of the specific data points we collect, their collection purpose, 
          necessity status, and retention timelines.
        </p>

        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-primary)' }}>
          A. Personal Data You Provide Directly
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y border text-xs sm:text-sm text-left" style={{ borderColor: 'var(--color-border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                <th className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Data Item</th>
                <th className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Purpose</th>
                <th className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required / Optional</th>
                <th className="px-4 py-2">Retention Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Name</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Account personalization, public user profile display.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required</td>
                <td className="px-4 py-2">Permanently deleted immediately from database and authentication servers upon account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Email Address</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Account login, critical system alerts, email verifications.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required</td>
                <td className="px-4 py-2">Permanently deleted immediately from database and authentication servers upon account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Phone Number</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional verification and account recovery.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Permanently deleted immediately from database and authentication servers upon account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Profile Photo</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Customizes your public marketplace profile.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Permanently deleted immediately from database and storage servers upon account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Marketplace Listings</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Publishing items, vehicles, or properties for local sale.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required to sell</td>
                <td className="px-4 py-2">Permanently deleted immediately from database servers upon listing or account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Uploaded Images</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Product display images associated with listings.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Permanently deleted immediately from database and storage servers upon listing or account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Chat Messages</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Real-time communication between buyers and sellers.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Retained in the inbox of communication partners to preserve transaction records and security history.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Favorites</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Bookmarking items for convenient reference.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Permanently deleted immediately upon account deletion.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Reports</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Reporting inappropriate listings or guidelines violations.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Held for up to 90 days for investigation.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Authentication Information</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Tokens and secure hashes to maintain user sessions.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required</td>
                <td className="px-4 py-2">Revoked immediately upon logout or account deletion.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-primary)' }}>
          B. Data Collected Automatically
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y border text-xs sm:text-sm text-left" style={{ borderColor: 'var(--color-border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                <th className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Data Item</th>
                <th className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Purpose</th>
                <th className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required / Optional</th>
                <th className="px-4 py-2">Retention Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Device & Browser Info</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Operating system, browser type, device identifiers, and access logs. Used for fraud prevention and system diagnostic monitoring.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required (Automatic)</td>
                <td className="px-4 py-2">Retained in server logs for up to 90 days for cybersecurity purposes.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>IP Address</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Geolocation mapping to determine appropriate regional views and prevent spam.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Required (Automatic)</td>
                <td className="px-4 py-2">Retained in firewall and audit logs for up to 90 days.</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-r font-semibold" style={{ borderColor: 'var(--color-border)' }}>Analytics Data & Preferences</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Traffic paths, category views, and interface choices. Used to optimize search results and feed stability.</td>
                <td className="px-4 py-2 border-r" style={{ borderColor: 'var(--color-border)' }}>Optional</td>
                <td className="px-4 py-2">Retained per analytics provider settings (such as Google Analytics, if enabled).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="how-we-use-information" title="2. How We Use Your Information">
        <p className="mb-4">
          We use collected data solely to deliver the core features of the Aliwayz local meetup marketplace.
          We do not sell, rent, or monetize your personal information. Data is used for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Authentication & Profiles:</strong> Enabling registration, password management, and Google Sign-In options.</li>
          <li><strong>Listing Distribution:</strong> Displaying vehicle details, property details, and products to nearby users.</li>
          <li><strong>In-App Communication:</strong> Securing real-time text chat between buyer and seller accounts.</li>
          <li><strong>QR verification:</strong> Authorizing meetup confirmations using encrypted in-person single-use scan codes.</li>
          <li><strong>Fraud & Safety Enforcement:</strong> Reviewing reported listings to block malicious accounts and spam.</li>
          <li><strong>Operational Analytics:</strong> Inspecting server loads, interface bottlenecks, and search efficiency to refine user experience.</li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-share-information" title="3. How We Share Your Information">
        <p className="mb-4">
          <strong>We share personal data only in the following limited circumstances:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Public Marketplace Details:</strong> Any items, pricing, photos, description coordinates, and profile titles 
            published by you are visible publicly to let neighboring users interact with your listings.
          </li>
          <li>
            <strong>Operational Cloud Platforms:</strong> We transfer data securely to third-party databases, caching layers, 
            and hosting platforms to ensure server stability. These services process your data under strict contract obligations.
          </li>
          <li>
            <strong>Legal and Protection Frameworks:</strong> We disclose personal data only when required to do so under 
            applicable US law, judicial order, or to defend platform integrity, combat fraud, and safeguard user wellness.
          </li>
        </ul>
        <p className="mt-4">
          Aliwayz does not process transactions. All sales, payments, and product handovers occur physically between 
          individual parties outside the platform. We never share financial data because we never collect it.
        </p>
      </LegalSection>

      <LegalSection id="third-party-services" title="4. Third-Party Services">
        <p className="mb-4">
          We work with verified partners to maintain system runtime. The service integrations utilized in Aliwayz include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Supabase:</strong> Serves as our primary database cloud solution and handles secure authentication.</li>
          <li><strong>Google Sign-In:</strong> Integrates identity verification via optional user OAuth prompts.</li>
          <li><strong>Vercel:</strong> Hosts our static web files and executes edge server distributions.</li>
          <li><strong>Redis:</strong> Supports server side memory caching and socket communication state.</li>
          <li><strong>Socket.IO:</strong> Establishes WebSocket channels for in-app instant messaging.</li>
          <li>
            <strong>Cloudinary (if enabled):</strong> Integrates image upload and resizing storage pipelines. References to Cloudinary 
            only apply when Cloudinary is actively enabled in production to process media.
          </li>
          <li>
            <strong>Google Analytics (if enabled):</strong> Collects diagnostic metrics and application crash data to prevent downtime. 
            References to Google Analytics only apply when enabled in the production application build.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="data-retention" title="5. Data Retention">
        <p className="mb-4">
          We hold personal information only for the minimum duration required to operate the platform:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account Information:</strong> Permanently hard-deleted from our databases and authentication servers immediately upon user account deletion.</li>
          <li><strong>Product Listings & Media:</strong> Permanently hard-deleted from all systems immediately when deleted by the user or upon account closure.</li>
          <li><strong>Inbox Chats:</strong> Retained for conversation partners to preserve transaction records and security history.</li>
          <li><strong>Security & Firewall Logs:</strong> Held for up to 90 days to verify safety audits and investigate abuse.</li>
          <li><strong>Backup Files:</strong> Cleared incrementally according to automated database backup retention schedules.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-security" title="6. Data Security">
        <p className="mb-4">
          The protection of your user data is a top priority. We use standard physical and operational measures to protect it:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All platform connections require TLS/HTTPS encryption to protect data in transit.</li>
          <li>Authentication records and account security keys are stored under modern salting and hashing protocols.</li>
          <li>Internal API access is guarded by secure token configurations.</li>
          <li>Firewall systems undergo automated testing to mitigate malicious scans.</li>
        </ul>
        <p className="mt-4">
          No internet-connected system is completely secure. We encourage users to configure secure account passwords 
          and keep their credentials confidential.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="7. Your Rights">
        <p className="mb-4">
          We provide clear controls to help you manage your personal information:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Access & Copying:</strong> You can request a summary of the personal information stored in your account.</li>
          <li><strong>Updating Details:</strong> You can modify your name, email, phone number, and photo at any time under your profile configuration.</li>
          <li><strong>Account Deletion:</strong> You can permanently delete your account to hard-delete your data immediately from all production and authentication systems.</li>
          <li><strong>Location Controls:</strong> You can decline browser location prompts or modify search coordinates in the location selector.</li>
        </ul>
        <p className="mt-4">
          To exercise your rights, please email us at <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="underline text-[var(--color-brand)]">privacy@aliwayz.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="california-privacy" title="8. US State Privacy Rights (CCPA/CPRA)">
        <p className="mb-4">
          Under US state laws, including the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), residents 
          have specific rights regarding their personal information. These include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Right to Know:</strong> The right to request disclosure of the categories and specific pieces of personal data collected.</li>
          <li><strong>Right to Delete:</strong> The right to request the permanent hard-deletion of personal information collected from you across all our systems.</li>
          <li><strong>Right to Opt-Out:</strong> The right to opt out of the sale or sharing of personal data. 
          <em> Note: Aliwayz does not sell your personal data.</em></li>
          <li><strong>Right to Non-Discrimination:</strong> The right to receive equal service regardless of whether you choose to exercise your privacy rights.</li>
        </ul>
        <p className="mt-4">
          If you wish to submit a privacy request under these regulations, please contact us at{' '}
          <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="underline text-[var(--color-brand)]">privacy@aliwayz.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="international-users" title="9. International Users">
        <p className="mb-4">
          <strong>Aliwayz is hosted in Vercel servers and intended primarily for users located within the United States of America.</strong>
        </p>
        <p>
          If you access the marketplace from outside the United States, please be aware that your personal information 
          will be transferred to and processed in the US, where privacy regulations may differ from those in your jurisdiction. 
          By registering an account and using the platform, you acknowledge and agree to this transfer and processing.
        </p>
      </LegalSection>

      <LegalSection id="account-deletion" title="10. Account Deletion">
        <p className="mb-4">
          We provide a self-service option to permanently hard-delete your account directly inside the application:
        </p>
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          <li>Log in to your account.</li>
          <li>Navigate to your <strong>Profile Settings</strong> or click <strong>Edit Profile</strong>.</li>
          <li>Scroll down to the <strong>Danger Zone</strong>.</li>
          <li>Click <strong>Delete Account</strong> and confirm the action.</li>
        </ol>
        <p className="mb-4">
          When you delete your account, your profile and all associated data (including listings, store data, media, and authentication records) 
          are permanently hard-deleted from our databases and authentication servers immediately. To ensure communication history is not broken, your sent chat messages 
          will remain visible on the screens of users you contacted.
        </p>
        <p>
          For more information, please see our dedicated <Link to="/legal/account-deletion" className="underline text-[var(--color-brand)]">Account Deletion Policy</Link> 
          {' '}and our <Link to="/legal/data-deletion" className="underline text-[var(--color-brand)]">Data Deletion Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="childrens-privacy" title="11. Children's Privacy">
        <p>
          Aliwayz is intended for users 18 years of age or older. We do not knowingly collect, request, or retain 
          data from individuals under 18. If we identify that a user under the age of 18 has registered an account, 
          we will close the account and remove all associated data immediately.
        </p>
      </LegalSection>

      <LegalSection id="changes-to-policy" title="12. Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy to reflect changes in our app behavior, hosting platforms, or US state laws. 
          When modifications are made, we will update the &quot;Last Updated&quot; and &quot;Effective Date&quot; at the top of this page. 
          We encourage you to review this document regularly to remain informed about how we safeguard your data.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="13. How to Contact Us">
        <p className="mb-4">
          If you have questions about this policy, data collection, or wish to exercise your privacy rights, please contact our team:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">General Support</h4>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              <a href={`mailto:${SUPPORT_EMAILS.general}`} className="hover:underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>For general inquiries and app troubleshooting.</p>
          </div>
          
          <div className="p-4 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Privacy Requests</h4>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="hover:underline text-[var(--color-brand)]">{SUPPORT_EMAILS.privacy}</a>
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>For exercising data deletion or CCPA rights.</p>
          </div>
          
          <div className="p-4 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Legal Notices</h4>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="hover:underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>For legal inquiries or regulatory compliance issues.</p>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
