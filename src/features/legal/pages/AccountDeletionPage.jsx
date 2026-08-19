
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * AccountDeletionPage - Details self-service account deletion and data retention schedules.
 * Required to satisfy Google Play & Apple App Store review rules.
 */
export default function AccountDeletionPage() {
  return (
    <LegalLayout slug="account-deletion">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This page explains how to delete your Aliwayz account and details what happens to your data after deletion.
        </p>
      </div>

      <LegalSection id="how-to-delete" title="1. How to Delete Your Account">
        <p className="mb-4">
          Aliwayz provides a straightforward self-service option to permanently delete your account directly 
          within your account panel. Follow these steps:
        </p>
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          <li>Log in to your account on the Aliwayz app or website.</li>
          <li>Navigate to your <strong>Profile Settings</strong> or click <strong>Edit Profile</strong>.</li>
          <li>Scroll down to the bottom of the settings page to find the <strong>Danger Zone</strong>.</li>
          <li>Click the <strong>Delete Account</strong> button.</li>
          <li>Verify your credentials or confirm the action on the confirmation modal.</li>
        </ol>
        <p>
          If you are unable to access your profile or need assistance, you can also submit a manual deletion 
          request by emailing us at <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="underline text-[var(--color-brand)]">privacy@aliwayz.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="what-happens" title="2. What Happens When You Delete">
        <p className="mb-4">
          Once you confirm the deletion of your account, the following actions occur immediately:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Your profile is deactivated, and you are logged out of all active browser sessions.</li>
          <li>Your public profile page is disabled, and your username will no longer appear in search queries.</li>
          <li>All active marketplace listings associated with your account are permanently removed from public feeds.</li>
          <li>Your profile metadata (such as profile photo, phone number, and location preferences) is marked for immediate purging.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-retention" title="3. Data Retention After Deletion">
        <p className="mb-4">
          To comply with legal obligations, prevent fraud, and maintain transaction logs, specific records 
          are retained according to our schedule:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Chat Messages:</strong> In-app chat histories are shared between participants. 
            To preserve conversation history and protect the records of users you messaged, your chat logs 
            will remain visible on their screens.
          </li>
          <li>
            <strong>Security & Firewall Logs:</strong> Security logs, firewall audits, and fraud-monitoring data 
            (including IP addresses and abuse reports) are retained for up to 90 days for investigation.
          </li>
          <li>
            <strong>Database Backups:</strong> Archived system backup copies are cleared incrementally per our 
            automated database backup schedules.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="before-you-delete" title="4. Before You Delete">
        <p className="mb-4">
          Please review the following considerations prior to deleting your account:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Make sure you have completed any pending meetups or in-person transactions.</li>
          <li>Ensure you have saved any seller statistics or listing details you wish to keep.</li>
          <li>Any outstanding ratings, feedback reviews, or seller badges will be permanently lost.</li>
        </ul>
      </LegalSection>

      <LegalSection id="reactivation" title="5. Account Reactivation">
        <p className="mb-4">
          <strong>Account deletion is permanent and irreversible.</strong>
        </p>
        <p>
          Once your account is deleted, it cannot be reactivated, restored, or retrieved. 
          If you wish to return to the marketplace, you must register a brand-new profile using 
          an email address or Google Sign-In account.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="6. Contact Us">
        <p className="mb-4">
          If you have questions regarding data removal or need assistance deleting your account, please reach out:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Privacy Request Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.privacy}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.privacy}</a>
          </p>
          <p className="text-xs">
            <strong>Support Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
