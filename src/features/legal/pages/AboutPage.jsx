import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';
import LegalContactDesks from '../components/LegalContactDesks';

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
            <strong>Marketplace:</strong> Furniture, electronics, tools, clothing, and household goods. 
            Browse listings on our <Link to="/essentials" className="underline text-[var(--color-brand)]">Marketplace</Link> page.
          </li>
          <li>
            <strong>Automotive:</strong> Local cars, trucks, motorcycles, and auto accessories. 
            Browse listings on our <Link to="/vehicles" className="underline text-[var(--color-brand)]">Automotive</Link> page.
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
          <li>This scan logs the meetup as completed, automatically decrements the item&apos;s available stock quantity by 1, updates the listing status to &quot;Sold&quot; when stock is exhausted, updates seller transaction badges, and enables the buyer to submit a profile review.</li>
        </ul>
      </LegalSection>

      <LegalSection id="platform-architecture" title="5. Platform Architecture">
        <p className="mb-4">
          Aliwayz is built on modern web technologies to ensure optimal performance, security, and reliability:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Frontend:</strong> React 18, Vite, and Tailwind CSS.</li>
          <li><strong>Backend:</strong> Node.js, Express, and PostgreSQL.</li>
          <li><strong>Authentication & Storage:</strong> Supabase authentication and secure storage buckets.</li>
          <li><strong>Hosting:</strong> Scalable cloud infrastructure.</li>
        </ul>
      </LegalSection>

      <LegalSection id="safety-principles" title="6. Safety Principles">
        <p className="mb-4">
          We encourage all buyers and sellers to prioritize safety by following our recommendations:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Always meet in well-lit, public spaces during daylight hours.</li>
          <li>Inspect items thoroughly before handing over payment.</li>
          <li>Never share sensitive financial or personal information in chats.</li>
          <li>Report suspicious listings or behavior immediately.</li>
        </ul>
        <p className="mt-4">
          To read our complete safety guide, visit our <Link to="/legal/safety-guidelines" className="underline text-[var(--color-brand)]">Safety Guidelines</Link>.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="7. Contact Us">
        <p className="mb-4">
          If you want to learn more about the platform, press inquiries, or partnerships, please contact:
        </p>
        <LegalContactDesks desks={['general', 'legal']} />
      </LegalSection>
    </LegalLayout>
  );
}
