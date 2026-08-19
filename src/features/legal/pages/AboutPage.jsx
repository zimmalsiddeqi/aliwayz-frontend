import { Link } from 'react-router-dom';
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * AboutPage - Describes Aliwayz mission, core features (meetup marketplace, QR scans),
 * and platform categories.
 */
export default function AboutPage() {
  return (
    <LegalLayout slug="about">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Welcome to Aliwayz
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Aliwayz is a local marketplace connecting buyers and sellers for physical, peer-to-peer transactions.
        </p>
      </div>

      <LegalSection id="our-mission" title="1. Our Mission">
        <p className="mb-4">
          At Aliwayz, our mission is to simplify local commerce by building a secure, trust-centered, 
          and transparent platform for peer-to-peer trading. We believe that buying and selling within 
          your community should be straightforward and safe.
        </p>
        <p>
          We provide the listing tools and communication features needed to connect neighbors, leaving 
          negotiations and physical settlements entirely in the hands of the transacting parties.
        </p>
      </LegalSection>

      <LegalSection id="how-aliwayz-works" title="2. How Aliwayz Works">
        <p className="mb-4">
          Aliwayz focuses on local, face-to-face exchanges:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Browse & Search:</strong> Users can search listings within their local radius or filter by specific categories.</li>
          <li><strong>List Your Items:</strong> Sellers list goods, upload descriptions and images, and configure pricing.</li>
          <li><strong>In-App Chat:</strong> Buyers and sellers discuss details, ask questions, and arrange meetups using our secure chat.</li>
          <li><strong>Meet Up & Complete:</strong> Meet in a safe public location to inspect the item, complete payment, and verify the meeting using a unique QR code.</li>
        </ul>
      </LegalSection>

      <LegalSection id="what-we-offer" title="3. What We Offer">
        <p className="mb-4">
          Our marketplace is structured into three main category hubs designed to serve all local trading needs:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Everyday Essentials:</strong> Furniture, electronics, tools, clothing, and household goods. 
            Browse listings on our <Link to="/essentials" className="underline text-[var(--color-brand)]">Essentials</Link> page.
          </li>
          <li>
            <strong>Vehicles:</strong> Local cars, trucks, motorcycles, and auto accessories. 
            Browse listings on our <Link to="/vehicles" className="underline text-[var(--color-brand)]">Vehicles</Link> page.
          </li>
          <li>
            <strong>Real Estate:</strong> Properties for sale or rent, apartments, and land. 
            Browse listings on our <Link to="/real-estate" className="underline text-[var(--color-brand)]">Real Estate</Link> page.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="qr-verification" title="4. QR Verified Transactions">
        <p className="mb-4">
          To build trust and verify transactions, we provide a secure in-person QR code verification system:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>At the meetup, once the buyer inspects the item and completes offline payment, they generate a transaction QR code in the app.</li>
          <li>The seller scans the buyer&apos;s QR code using the camera scanner in the Aliwayz app.</li>
          <li>This scan logs the meetup as completed, updates seller transaction badges, and allows the buyer to submit a profile review.</li>
        </ul>
      </LegalSection>

      <LegalSection id="our-commitment" title="5. Our Commitment">
        <p className="mb-4">
          We are committed to maintaining a safe and compliant marketplace:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>No Payment Risks:</strong> By not processing payments inside the platform, we eliminate credit card scams and processing risks.</li>
          <li><strong>Active Moderation:</strong> We review reported items and enforce our guidelines to keep the platform clean.</li>
          <li><strong>Data Privacy:</strong> We protect your account details and do not sell your personal information.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contact-us" title="6. Contact Us">
        <p className="mb-4">
          If you want to learn more about the platform, press inquiries, or partnerships, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>General Inquiries:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
          <p className="text-xs">
            <strong>Legal and Compliance:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
