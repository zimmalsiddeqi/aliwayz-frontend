import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * SafetyGuidelinesPage - Comprehensive safety best practices for Aliwayz marketplace users.
 * Explains secure meetup zones, transaction safety, vehicle inspection, and scam recognition.
 */
export default function SafetyGuidelinesPage() {
  return (
    <LegalLayout slug="safety-guidelines">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This guide provides crucial recommendations to keep you safe during offline, face-to-face transactions.
        </p>
      </div>

      <LegalSection id="general-safety" title="1. General Safety">
        <p className="mb-4">
          Because Aliwayz connects users for offline, in-person meetups, user safety is our highest priority. 
          While the vast majority of local interactions are positive, always apply common sense and follow 
          standard safety precautions.
        </p>
        <p>
          Never agree to meetups in private, unverified, or secluded areas. If a buyer or seller refuses to follow 
          basic safety protocols, cancel the transaction immediately.
        </p>
      </LegalSection>

      <LegalSection id="meeting-in-person" title="2. Meeting in Person">
        <p className="mb-4">
          When arranging a meetup to inspect or exchange goods, follow these guidelines:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Public Exchange Zones:</strong> Always meet in busy, highly visible, public locations. 
            Excellent locations include local police department parking lots (which often have dedicated, camera-monitored 
            &quot;safe exchange zones&quot;), bank lobbies, or crowded grocery store parking lots.
          </li>
          <li>
            <strong>Daylight Hours:</strong> Schedule meetings during daylight hours. Avoid late-night meetups.
          </li>
          <li>
            <strong>Bring Someone:</strong> Bring a friend or family member with you. If you must go alone, inform 
            someone exactly where you are going, who you are meeting, and when you expect to return.
          </li>
          <li>
            <strong>Keep Your Phone Handy:</strong> Ensure your mobile device is fully charged and accessible.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="payment-safety" title="3. Payment Safety">
        <p className="mb-4">
          Aliwayz does not process payments or act as financial escrow. You are responsible for conducting 
          payments securely:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>In-Person Exchanges Only:</strong> Do not send wire transfers, bank deposits, or mail cashier checks 
            prior to inspecting the item. Only complete payments physically at the meetup.
          </li>
          <li>
            <strong>Cash Handling:</strong> If paying in cash, meet inside a bank lobby where cash can be counted and verified 
            securely. Avoid carrying large amounts of cash to unmonitored locations.
          </li>
          <li>
            <strong>Digital Transfers:</strong> If using peer-to-peer mobile apps (such as Venmo, Zelle, or Cash App), 
            verify the funds have cleared in your account ledger before releasing the item. Do not rely on email receipts 
            presented by the buyer.
          </li>
          <li>
            <strong>No Cashier Check Scams:</strong> Be cautious of buyers presenting overpaid cashier checks. 
            Verify cashier checks directly with the issuing bank branch before finalizing transactions.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="protecting-your-information" title="4. Protecting Your Information">
        <p className="mb-4">
          Guard your privacy and personal data when negotiating:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Keep negotiations within the Aliwayz in-app chat system. Do not give out your home address or phone number prematurely.</li>
          <li>Do not share photocopies of your driver&apos;s license, bank statements, or identity documents in chat.</li>
          <li>Sellers should blur license plates or street numbers visible in listed images.</li>
        </ul>
      </LegalSection>

      <LegalSection id="recognizing-scams" title="5. Recognizing Scams">
        <p className="mb-4">
          Watch out for common marketplace warning signs:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Bargain Prices:</strong> Items listed significantly below market value are often fraudulent.
          </li>
          <li>
            <strong>Urgency:</strong> Be suspicious of users who pressure you to transact quickly, claim to be out of the country, 
            or request deposits to &quot;hold&quot; the item.
          </li>
          <li>
            <strong>Off-Platform Redirects:</strong> Never click on external links sent in chat claiming to be escrow protection, 
            delivery partners, or payment gateways.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="vehicle-transactions" title="6. Vehicle Transactions">
        <p className="mb-4">
          Purchasing or selling a vehicle requires additional validation:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>VIN and History:</strong> Verify the Vehicle Identification Number (VIN) physically on the car and request 
            a vehicle history report (such as CARFAX) to check for salvage titles or odometer fraud.
          </li>
          <li>
            <strong>Inspect at a Mechanic:</strong> Arrange to meet at a local auto shop to have a certified mechanic inspect the car 
            before you purchase it.
          </li>
          <li>
            <strong>Title Transfer:</strong> Complete title transfers and notary documentation inside a local DMV branch or bank lobby. 
            Do not accept titles with smudges, corrections, or signatures that do not match the seller&apos;s photo ID.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="property-transactions" title="7. Property Transactions">
        <p className="mb-4">
          Real estate transactions involve substantial investments. Ensure proper verification:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Ownership Verification:</strong> Verify the seller&apos;s legal title and identity through official county 
            land registry records before signing agreements.
          </li>
          <li>
            <strong>Physical Tour:</strong> Always tour the property in person. Do not make decisions based solely on online images.
          </li>
          <li>
            <strong>Professional Escrow:</strong> Always use licensed title companies and escrow attorneys to process real estate closures. 
            Never hand over funds directly to an individual without escrow oversight.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="reporting-concerns" title="8. Reporting Concerns">
        <p className="mb-4">
          If you encounter suspicious listings or feel unsafe during a transaction:
        </p>
        <p className="mb-4">
          Cancel the meeting and report the listing immediately using the <strong>Report</strong> link on the listing page. 
          For details, see our <Link to="/legal/report-abuse" className="underline text-[var(--color-brand)]">Report Abuse</Link> guide.
        </p>
        <p className="p-3 rounded-xl text-xs border bg-red-500/5 border-red-500/20" style={{ color: 'var(--color-error)' }}>
          <strong>Note:</strong> Aliwayz does not provide active security dispatch. In any emergency situation or threat 
          to physical safety, contact local law enforcement immediately by calling <strong>911</strong>.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="9. Contact Us">
        <p className="mb-4">
          If you have questions about transaction safety or wish to report a safety concern, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Trust & Safety:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
          <p className="text-xs">
            <strong>Customer Support:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
