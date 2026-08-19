
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * CookiePolicyPage - Explains cookie usage, browser storage (localStorage, session),
 * and session state management in Aliwayz.
 */
export default function CookiePolicyPage() {
  return (
    <LegalLayout slug="cookie-policy">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This Cookie Policy explains how Aliwayz uses cookies, local storage, and similar technologies to run our marketplace.
        </p>
      </div>

      <LegalSection id="what-are-cookies" title="1. What Are Cookies">
        <p className="mb-4">
          Cookies are small text files placed on your device by websites you visit. 
          Along with standard HTTP cookies, Aliwayz utilizes local browser storage (localStorage and sessionStorage) 
          and similar identifier technologies to cache static application preferences.
        </p>
        <p>
          These technologies let us remember your active session, keep you logged in across browser updates, 
          and load local search queries efficiently without sending constant database queries.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use-cookies" title="2. How We Use Cookies">
        <p className="mb-4">
          We use cookies and browser storage solely to enable core marketplace operations. We do not use cookies 
          to deliver target ads or sell user browsing records. These technologies are used to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Verify your authentication credentials and login state.</li>
          <li>Retain your interface preferences, specifically light mode or dark mode settings.</li>
          <li>Save search filter metrics, including selected radius miles, categories, and regional ZIP codes.</li>
          <li>Maintain real-time chat histories temporarily in active sessions for faster loading.</li>
          <li>Gather diagnostic data to audit server load and page response times.</li>
        </ul>
      </LegalSection>

      <LegalSection id="types-of-cookies" title="3. Types of Cookies">
        <p className="mb-4">
          We classify the technologies we use into two categories:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Essential / Strictly Necessary:</strong> These are required to operate the platform. 
            They include authentication tokens (such as cookies or local storage keys holding session identifiers) 
            to protect account security. The application cannot function without these.
          </li>
          <li>
            <strong>Preferences & Interface:</strong> These are used to remember user interface adjustments, 
            such as whether you toggled dark mode or set a specific location filter. They are optional but 
            highly recommended to avoid resetting options on every visit.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="third-party-cookies" title="4. Third-Party Cookies">
        <p className="mb-4">
          Certain services we integrate may set cookies on your browser. 
          <strong> These third-party cookies include:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Google OAuth:</strong> If you use Google Sign-In, Google sets cookies on your device 
            to manage authentication states, verify identity, and prevent profile phishing.
          </li>
          <li>
            <strong>Google Analytics (if enabled):</strong> If active in the production build, Google Analytics 
            sets cookies to analyze platform traffic patterns and diagnostic performance. 
            No identifying personal data is stored inside these statistics.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="managing-cookies" title="5. Managing Your Cookies">
        <p className="mb-4">
          You can control, restrict, or clear cookies and local storage directly within your browser settings:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Most browsers allow you to reject cookies or delete them from history.</li>
          <li>You can configure private browsing modes (Incognito) which clear cookies automatically when you close windows.</li>
          <li>You can manually clear localStorage data through your browser developer panel.</li>
        </ul>
        <p>
          Please note that if you disable essential cookies or block local storage, you will not be able to log in, 
          manage your account, publish listings, or communicate with other users via in-app chat.
        </p>
      </LegalSection>

      <LegalSection id="changes-to-policy" title="6. Changes to This Policy">
        <p>
          We may update this Cookie Policy from time to time to reflect modifications in our tracking technologies. 
          When changes are published, we will modify the &quot;Effective Date&quot; and &quot;Last Updated&quot; at the top of this page. 
          Your continued use of the platform constitutes agreement to the updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="7. Contact Us">
        <p className="mb-4">
          If you have questions about how we use cookies, local storage, or security identifiers, please contact:
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
