import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * BuyerPolicyPage - Rules and guidelines for buyers on the Aliwayz marketplace.
 * Outlines buyer responsibilities, transaction models, QR verifications, and safety tips.
 */
export default function BuyerPolicyPage() {
  return (
    <LegalLayout slug="buyer-policy">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This Buyer Policy outlines the guidelines, safety recommendations, and expectations for buyers on Aliwayz.
        </p>
      </div>

      <LegalSection id="buyer-responsibilities" title="1. Buyer Responsibilities">
        <p className="mb-4">
          To maintain a safe and reliable marketplace, buyers must satisfy the following responsibilities:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Eligibility:</strong> You must be at least 18 years of age to register, browse, or contact sellers.</li>
          <li><strong>Thorough Inspection:</strong> Because all transactions occur in person, you are responsible for inspecting the item, vehicle, or property thoroughly before exchanging any funds. All sales are final between you and the seller.</li>
          <li><strong>Fair Conduct:</strong> Honor scheduled meetups and maintain respectful communication. Do not submit speculative offers or ghost sellers after agreeing on terms.</li>
        </ul>
      </LegalSection>

      <LegalSection id="browsing-and-purchasing" title="2. Browsing and Purchasing">
        <p className="mb-4">
          Buyers browse listings and connect directly with sellers. Please remember our platform transaction model:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>No In-App Checkout:</strong> Aliwayz does not have a shopping cart, virtual checkout, credit card processor, 
            or online payment system. We never process, hold, or guarantee transaction funds.
          </li>
          <li>
            <strong>Peer-to-Peer Settlement:</strong> All payments are completed directly between you and the seller offline. 
            You agree on the payment method (cash, cashier&apos;s check, or mobile peer-to-peer apps) prior to meeting.
          </li>
          <li>
            <strong>As-Is Purchasing:</strong> Unless explicitly agreed otherwise with the seller in writing, items are 
            purchased in &quot;as-is&quot; condition. Aliwayz does not offer refunds, buyer protection plans, or product warranties.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="communication" title="3. Communication with Sellers">
        <p className="mb-4">
          For your safety, we strongly recommend keeping all initial negotiations and communications within the Aliwayz 
          in-app chat system:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Do not share sensitive personal information (such as bank details or home address) in public listing comments.</li>
          <li>Report any sellers who pressure you to communicate outside the platform or request deposit payments before a meeting.</li>
          <li>Be clear and honest about your offers and purchasing intent.</li>
        </ul>
      </LegalSection>

      <LegalSection id="qr-verification" title="4. QR Verification">
        <p className="mb-4">
          Our in-person transaction verification system uses secure QR codes to confirm that the meeting and handover took place:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Generating Code:</strong> When you meet the seller, inspect the item, and complete the physical payment, 
            navigate to the active listing in your app and generate your unique transaction QR code.
          </li>
          <li>
            <strong>Scan Confirmation:</strong> Present the QR code on your screen for the seller to scan using their device. 
            This scan records the meetup as completed, updates your transaction history, and prompts you to leave a profile review.
          </li>
          <li>
            <strong>Limit of Records:</strong> This verification is an administrative log of a completed meetup. 
            It is not a receipt of funds, a bill of sale, or a contract.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="safety-tips" title="5. Safety Tips for Buyers">
        <p className="mb-4">
          Because sales occur offline, safety is paramount. Always apply the following best practices:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Public Meetup Locations:</strong> Meet in busy, well-lit, public locations, such as local police department 
            &quot;safe exchange zones,&quot; grocery stores, or bank lobbies. Never meet in secluded areas or invite strangers to your home.
          </li>
          <li>
            <strong>Bring a Friend:</strong> Whenever possible, bring a friend or family member with you to the meetup.
          </li>
          <li>
            <strong>Vehicle Checks:</strong> When buying a car or vehicle, verify the VIN, request title records, and inspect 
            the vehicle at a mechanic before purchasing.
          </li>
          <li>
            <strong>Property Inspections:</strong> When inspecting real estate, confirm the seller&apos;s identity and property 
            documentation through official county recorders.
          </li>
        </ul>
        <p className="mt-4">
          For a complete list of recommendations, please see our dedicated{' '}
          <Link to="/legal/safety-guidelines" className="underline text-[var(--color-brand)]">Safety Guidelines</Link>.
        </p>
      </LegalSection>

      <LegalSection id="reporting-issues" title="6. Reporting Issues">
        <p className="mb-4">
          If you encounter problematic listings or suspicious user behavior, please report it immediately:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the <strong>Report</strong> button on any listing to report counterfeit, illegal, or prohibited goods.</li>
          <li>Report sellers who act abusively in chat or display fraudulent listings.</li>
          <li>For detailed instructions, see our <Link to="/legal/report-abuse" className="underline text-[var(--color-brand)]">Report Abuse</Link> guide.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contact-us" title="7. Contact Us">
        <p className="mb-4">
          If you have questions regarding buyer safety, transaction verifications, or reporting guidelines, please reach out:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Customer Support Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Trust & Safety Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
