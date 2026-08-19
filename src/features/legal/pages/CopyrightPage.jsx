
import { SUPPORT_EMAILS } from '../data/legalPages';
import LegalLayout from '../components/LegalLayout';
import LegalSection from '../components/LegalSection';

/**
 * CopyrightPage - Detailing platform copyright terms and US DMCA notice templates.
 */
export default function CopyrightPage() {
  return (
    <LegalLayout slug="copyright">
      <div className="mb-6 p-4 rounded-xl border print:border-none" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Effective Date: October 15, 2026
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This Copyright Notice describes our intellectual property rights and details the process for DMCA reports.
        </p>
      </div>

      <LegalSection id="copyright-ownership" title="1. Copyright Ownership">
        <p className="mb-4">
          All contents, codebase layouts, design tokens, visual elements, graphics, icons, system databases, 
          and assets on Aliwayz are the exclusive property of the developer, <strong>Shawkat Ali</strong>, 
          and are protected by United States and international copyright, trademark, and trade dress laws.
        </p>
        <p>
          Copyright © 2026 Shawkat Ali. All rights reserved. Any unauthorized reproduction, redistribution, 
          or commercial reuse of platform elements is strictly prohibited.
        </p>
      </LegalSection>

      <LegalSection id="permitted-use" title="2. Permitted Use">
        <p className="mb-4">
          You are granted a limited, personal, non-transferable, and revocable license to access the platform. 
          Under this license, you are permitted to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Browse marketplace listings, upload listing descriptions, and download images for purchasing.</li>
          <li>Communicate with buyers or sellers via in-app chat systems.</li>
          <li>Share listing pages directly via the platform Share button.</li>
        </ul>
      </LegalSection>

      <LegalSection id="restrictions" title="3. Restrictions">
        <p className="mb-4">
          You are strictly prohibited from copying, reproducing, harvesting, or scraping platform data:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>No Scraping or Mining:</strong> Do not deploy spiders, scrapers, indexers, or automated bots 
            to extract data, user profiles, or listing catalogs.
          </li>
          <li>
            <strong>No Commercial Framing:</strong> Do not frame or mirror any brand marks, logos, codebase assets, 
            or search filters on external online channels.
          </li>
          <li>
            <strong>No Code Compilation:</strong> Do not compile, copy, or redistribute the underlying React, Vite, 
            or Tailwind CSS assets.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="user-content" title="4. User Content">
        <p className="mb-4">
          When you upload listings and product photos, you retain full copyright ownership of your original materials. 
          By uploading, you warrant that you are the creator or hold all permissions to the photos.
        </p>
        <p>
          You grant Aliwayz a royalty-free, perpetual, worldwide license to host and crop the images 
          for display in marketplace search results. This license terminates when you delete the listing or close your account.
        </p>
      </LegalSection>

      <LegalSection id="dmca-notice" title="5. DMCA Notice">
        <p className="mb-4">
          If you are a copyright owner or authorized agent and believe that content published on Aliwayz infringes 
          your copyright under the US Digital Millennium Copyright Act (DMCA), please submit a formal notice to our 
          Designated Copyright Agent:
        </p>
        <div className="p-4 rounded-xl border space-y-2 mb-4 text-xs" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="font-bold uppercase tracking-wider text-[var(--color-text-muted)]">DMCA Takedown Notice Requirements:</p>
          <ul className="list-decimal pl-4 space-y-1">
            <li>An electronic or physical signature of the person authorized to act on behalf of the copyright owner.</li>
            <li>A detailed description of the copyrighted work that you claim has been infringed.</li>
            <li>The URL or direct link to the specific infringing listing on Aliwayz.</li>
            <li>Your contact details: address, telephone number, and email.</li>
            <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement made under penalty of perjury that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
          </ul>
        </div>
        <p>
          Please email your complete notice to our Designated Agent at{' '}
          <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">legal@aliwayz.com</a>. 
          We process verified notices promptly and deactivate infringing listings.
        </p>
      </LegalSection>

      <LegalSection id="contact-us" title="6. Contact Us">
        <p className="mb-4">
          If you have questions regarding brand licensing, copyright authorizations, or wish to follow up on a DMCA notice, please contact:
        </p>
        <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs">
            <strong>Designated Copyright Agent:</strong> <a href={`mailto:${SUPPORT_EMAILS.legal}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.legal}</a>
          </p>
          <p className="text-xs">
            <strong>Compliance Operations:</strong> <a href={`mailto:${SUPPORT_EMAILS.general}`} className="underline text-[var(--color-brand)]">{SUPPORT_EMAILS.general}</a>
          </p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
