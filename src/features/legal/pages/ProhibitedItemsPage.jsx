import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * ProhibitedItemsPage - Lists items, goods, and services banned from the Aliwayz marketplace.
 * Required for Google Play and App Store content compliance.
 */
export default function ProhibitedItemsPage() {
  return (
    <LegalLayout slug="prohibited-items">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This policy details the items, products, and services that are strictly prohibited from being listed or traded on Aliwayz.
        </p>
      </div>

      <LegalSection id="overview" title="1. Overview">
        <p className="mb-4">
          To maintain a safe, trusted, and legally compliant marketplace, Aliwayz restricts the sale of specific 
          types of items. As a peer-to-peer meetup platform, users are solely responsible for ensuring that all 
          listed items are legal, safe, and comply with this Prohibited Items Policy.
        </p>
        <p>
          By creating a listing, you represent and warrant that the item complies with these guidelines. 
          We actively moderate listings and disable accounts that violate these rules.
        </p>
      </LegalSection>

      <LegalSection id="illegal-items" title="2. Illegal Items">
        <p className="mb-4">
          You are strictly prohibited from listing any item that is illegal under local, state, or federal law 
          in the United States. This includes, but is not limited to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Illicit Drugs and Paraphernalia:</strong> Recreational drugs, narcotics, prescription-only drugs, synthetic substances, and tools designed for drug use.</li>
          <li><strong>Stolen Goods:</strong> Items obtained through theft, burglary, or unauthorized duplication.</li>
          <li><strong>Weapons and Firearms:</strong> Firearms, ammunition, silencers, explosive components, switchblades, tasers, and tactical weapons.</li>
          <li><strong>Illegal Wildlife and Plant Products:</strong> Endangered species, animal parts (such as ivory), and restricted plant materials.</li>
        </ul>
      </LegalSection>

      <LegalSection id="regulated-items" title="3. Regulated Items">
        <p className="mb-4">
          We do not allow the sale of products that are subject to government licensing, registration, or age-control regulations:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Alcohol and Tobacco:</strong> Alcoholic beverages, cigarettes, cigars, e-cigarettes, vaporizers, and related accessories.</li>
          <li><strong>Prescription Medications and Healthcare:</strong> Prescription drugs, medical devices requiring a prescription, and medical services.</li>
          <li><strong>Live Animals:</strong> We prohibit the listing of pets, livestock, or any live animals for sale or adoption.</li>
          <li><strong>Adult Content and Novelties:</strong> Pornography, sexually explicit media, and adult novelty items.</li>
        </ul>
      </LegalSection>

      <LegalSection id="dangerous-items" title="4. Dangerous Items">
        <p className="mb-4">
          Items that pose immediate safety hazards, combustion risks, or bodily harm are prohibited:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Fireworks and Explosives:</strong> Commercial and consumer fireworks, smoke bombs, and gunpowder.</li>
          <li><strong>Hazardous Chemicals:</strong> Pesticides, toxic cleaning agents, industrial acids, and radioactive materials.</li>
          <li><strong>Recalled Goods:</strong> Any item that has been recalled by the Consumer Product Safety Commission (CPSC) or other regulatory agencies.</li>
        </ul>
      </LegalSection>

      <LegalSection id="prohibited-services" title="5. Prohibited Services">
        <p className="mb-4">
          Aliwayz is a marketplace for physical items, vehicles, and real estate. We do not allow listings for 
          services that are illegal, financial in nature, or deceptive:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Adult Services:</strong> Prostitution, escort services, or adult entertainment listings.</li>
          <li><strong>Financial Services:</strong> Bidding services, lending schemes, currency exchange, investment opportunities, or crypto trading.</li>
          <li><strong>Job Postings and Multi-Level Marketing:</strong> Standard employment listings, work-from-home leads, or pyramid marketing schemes.</li>
          <li><strong>Payment Transfer Services:</strong> Promoting external payment checking, cash advances, or escrow links.</li>
        </ul>
      </LegalSection>

      <LegalSection id="counterfeit-goods" title="6. Counterfeit Goods">
        <p className="mb-4">
          We protect intellectual property rights. You are prohibited from listing:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Replica or Fake Items:</strong> Counterfeit designer clothing, handbags, accessories, or electronics marketed as authentic.</li>
          <li><strong>Pirated Media:</strong> Unauthorized copies of software, video games, movies, music, or ebooks.</li>
          <li><strong>Modding Devices:</strong> Tools designed to bypass copyright protection systems on game consoles or hardware.</li>
        </ul>
      </LegalSection>

      <LegalSection id="reporting-prohibited-items" title="7. Reporting Prohibited Items">
        <p className="mb-4">
          If you find a listing that violates this policy, please report it immediately:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click the <strong>Report</strong> link/button visible on the item listing detail page.</li>
          <li>Select the appropriate reporting category (such as Illegal Content, Counterfeit, or Prohibited Item).</li>
          <li>Provide any additional context to help our moderation team inspect the listing.</li>
        </ul>
      </LegalSection>

      <LegalSection id="consequences" title="8. Consequences">
        <p className="mb-4">
          Listing prohibited items violates our <Link to="/legal/terms" className="underline text-[var(--color-brand)]">Terms & Conditions</Link> 
          {' '}and our <Link to="/legal/community-guidelines" className="underline text-[var(--color-brand)]">Community Guidelines</Link>. 
          Consequences of violations include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Immediate deletion of the listing from public view.</li>
          <li>Loss of seller badging and search weight.</li>
          <li>Temporary block on creating listings or sending chat messages.</li>
          <li>Permanent account termination and ban from the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contact-us" title="9. Contact Us">
        <p className="mb-4">
          If you are unsure whether an item is allowed or want to appeal a listing removal, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Listing Moderation Desk:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Compliance Operations:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
