import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * SellerPolicyPage - Rules and guidelines for sellers on the Aliwayz marketplace.
 * Outlines eligibility, item listing rules, QR transaction verifications, and account compliance.
 */
export default function SellerPolicyPage() {
  return (
    <LegalLayout slug="seller-policy">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This Seller Policy details the standards and rules required of all sellers listing items on Aliwayz.
        </p>
      </div>

      <LegalSection id="seller-eligibility" title="1. Seller Eligibility">
        <p className="mb-4">
          To list items for sale, create a seller store profile, or interact with buyers on Aliwayz, 
          you must satisfy our seller eligibility requirements:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be at least 18 years of age.</li>
          <li>You must have a fully registered and validated user account in good standing.</li>
          <li>You must reside and operate within the United States of America.</li>
          <li>You must comply with all state and local business licensing regulations if selling as a business entity.</li>
        </ul>
      </LegalSection>

      <LegalSection id="listing-requirements" title="2. Listing Requirements">
        <p className="mb-4">
          Sellers must ensure their listings are accurate, clean, and representative of the actual item. 
          When creating a listing on Aliwayz, you agree to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Truthful Descriptions:</strong> Provide complete and honest details regarding the item&apos;s condition, 
            make, model, features, size, and any defects or wear.
          </li>
          <li>
            <strong>Original Media:</strong> Upload clear, actual photos of the item in your physical possession. 
            Do not upload stock photos, catalog images, or media copyrighted by third parties.
          </li>
          <li>
            <strong>Correct Categorization:</strong> Place listings in their appropriate categories: 
            Vehicles (under Cars/Vehicles), Properties (under Real Estate), or Everyday Items (under Essentials).
          </li>
          <li>
            <strong>Availability:</strong> Delete or archive listings immediately if the item is no longer available 
            for sale or has been sold outside of the platform.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="pricing-and-payments" title="3. Pricing and Payments">
        <p className="mb-4">
          Aliwayz does not act as an escrow agent, payment gateway, or financial intermediary. 
          Please align your pricing with the following rules:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Accurate Pricing:</strong> The listed price must represent the actual transaction price you expect. 
            Do not use misleading placeholder prices (e.g., $1 or $12,345) to manipulate search parameters.
          </li>
          <li>
            <strong>Offline Peer-to-Peer Transactions:</strong> All financial exchanges occur directly between the buyer 
            and seller in person, offline. You are responsible for deciding on secure cash exchanges, cashier check deposits, 
            or third-party peer-to-peer mobile apps (like Venmo, Zelle, or Cash App) at the meetup.
          </li>
          <li>
            <strong>Fee Disclaimers:</strong> Aliwayz does not charge listing or transaction fees. Any transaction costs 
            or payment provider fees incurred at the meetup are the sole responsibility of the transacting parties.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="seller-conduct" title="4. Seller Conduct">
        <p className="mb-4">
          Sellers must maintain high standards of integrity and respect during interactions. You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Communicate politely through our in-app chat channels.</li>
          <li>Honor scheduled meetups and provide prompt updates if scheduling issues occur.</li>
          <li>Refrain from redirecting buyers to external online stores or alternative bidding websites.</li>
          <li>Provide a safe and reasonable opportunity for the buyer to inspect the item before taking payment.</li>
        </ul>
      </LegalSection>

      <LegalSection id="qr-verification" title="5. QR Verification">
        <p className="mb-4">
          We provide an in-person meetup verification process using secure QR codes to confirm that transactions 
          and meetups occurred:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Handshake Completion:</strong> Once you meet the buyer, agree on pricing, and complete the physical handover, 
            the buyer will present a unique transaction QR code on their screen.
          </li>
          <li>
            <strong>Scanning to Confirm:</strong> Use the camera scanner built into your Aliwayz app to scan the buyer&apos;s QR code. 
            This logs the transaction meetup as completed in our system, updates your seller badges, and prompts the buyer 
            to leave a profile review.
          </li>
          <li>
            <strong>No Guarantee:</strong> This QR scan is an administrative record showing the meetup took place. 
            It does not act as a financial receipt, escrow completion, or product warranty.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="prohibited-activities" title="6. Prohibited Activities">
        <p className="mb-4">
          Sellers are strictly prohibited from listing items or engaging in conduct that violates our marketplace rules:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Banned Listings:</strong> Do not list weapons, firearms, illegal drugs, prescription medications, 
            alcohol, tobacco, adult services, counterfeit goods, or dangerous chemical agents. For the complete list, 
            please see our <Link to="/legal/prohibited-items" className="underline text-[var(--color-brand)]">Prohibited Items Policy</Link>.
          </li>
          <li>
            <strong>Impersonation & Phishing:</strong> Do not use your store profile to impersonate other brands, businesses, 
            or individuals. Do not solicit buyers&apos; Social Security numbers, banking passwords, or personal login information.
          </li>
          <li>
            <strong>Abusive Communication:</strong> Do not use in-app chat to threaten, harass, or insult users.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="account-standing" title="7. Account Standing">
        <p className="mb-4">
          We actively review reported listings, low star ratings, and guidelines violations to maintain marketplace safety. 
          Consequences of violating this Seller Policy include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Formal warnings sent to your registered email.</li>
          <li>Temporary removal of specific listings or store editing privileges.</li>
          <li>Loss of seller badges or placement in search recommendations.</li>
          <li>Permanent account suspension and store deletion.</li>
        </ul>
        <p className="mt-4">
          Sellers with suspended accounts are prohibited from registering new profiles. To learn how user reviews and 
          badging work, please consult our <Link to="/legal/community-guidelines" className="underline text-[var(--color-brand)]">Community Guidelines</Link>.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="8. Contact Us">
        <p className="mb-4">
          If you have questions regarding seller registration, store settings, or listing compliance, please reach out to us:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Seller Support Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Compliance Operations:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
