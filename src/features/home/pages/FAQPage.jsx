import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Search, MessageSquare,
  Shield, CreditCard, QrCode,
  Users, Package, HelpCircle, Star,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@lib/utils';

const FAQ_SECTIONS = [
  {
    id:    'general',
    title: 'General',
    icon:  HelpCircle,
    color: 'var(--color-brand)',
    faqs: [
      {
        q: 'What is Aliwayz?',
        a: 'Aliwayz is a premier local marketplace where you can buy and sell cars, property, and everyday products in your area. All transactions are verified using our secure QR code system to ensure safe, transparent in-person exchanges.',
      },
      {
        q: 'Is Aliwayz free to use?',
        a: 'Yes! Creating an account, browsing listings, generating printable QR signs, and posting items for sale is completely free. There are no hidden listing fees or sales commissions.',
      },
      {
        q: 'How does Aliwayz work?',
        a: 'It\'s simple: 1) Create an account with Email, Google, or Apple, 2) Browse or list items in Cars, Property, or Daily Use Products, 3) Chat with buyers/sellers, 4) Meet locally, 5) Complete the sale with QR verification or print physical QR placards for vehicles & property, 6) Leave a review.',
      },
      {
        q: 'Where is Aliwayz available?',
        a: 'Aliwayz is available nationwide across the United States. You can buy and sell in any city or state.',
      },
      {
        q: 'Do I need to create a store to sell something?',
        a: 'No! You can list a single item immediately without setting up a store. However, if you plan to sell multiple items regularly, setting up a seller store profile gives you a dedicated storefront, custom URL, and a private QR Code manager.',
      },
    ],
  },
  {
    id:    'buying',
    title: 'Buying',
    icon:  Package,
    color: 'var(--color-success)',
    faqs: [
      {
        q: 'How do I buy something on Aliwayz?',
        a: 'Find a product you like, click "Message Seller" to discuss details, agree on a price and meeting location, meet in person to inspect the item, then complete the purchase using QR verification.',
      },
      {
        q: 'How do physical Listing QR placards work for buyers?',
        a: 'When you see a car with a "FOR SALE" sign or a house with a "FOR SALE / RENT" placard displaying an Aliwayz QR code, simply open your phone\'s camera and scan it! You will immediately be taken to the live listing on Aliwayz where you can check pricing, specs, vehicle/property details, and message the seller directly.',
      },
      {
        q: 'Is it safe to buy on Aliwayz?',
        a: 'Yes. Every transaction is verified through our QR code system, which ensures both buyer and seller confirm the exchange. We also have a review system so you can check a seller\'s reputation before buying.',
      },
      {
        q: 'Can I negotiate the price?',
        a: 'Absolutely! Use the in-app chat to negotiate directly with the seller. All communication stays within Aliwayz for your safety.',
      },
      {
        q: 'What if the item isn\'t as described?',
        a: 'Always inspect items in person before completing the QR verification. Once the QR code is scanned, the sale is final. We recommend meeting in a safe, public location and thoroughly checking the item.',
      },
      {
        q: 'How do I save items I\'m interested in?',
        a: 'Tap the heart icon on any listing to add it to your Favorites. You\'ll also get notified if the price drops on any of your saved items.',
      },
      {
        q: 'Does Aliwayz handle payments?',
        a: 'No, Aliwayz does not process payment funds. Payments are handled directly between buyer and seller during the in-person meetup using cash, Venmo, Zelle, or any agreed-upon method.',
      },
    ],
  },
  {
    id:    'selling',
    title: 'Selling',
    icon:  Star,
    color: '#8B5CF6',
    faqs: [
      {
        q: 'How do I post a product or list an item for sale?',
        a: '1) Click "Sell" in the top navigation. 2) Choose your category (Daily Essentials, Automotive, or Real Estate). 3) Fill out details like pricing, location, condition, and stock quantity. 4) Upload photos. 5) Click "Publish Listing". For Automotive and Real Estate, a printable/downloadable QR placard will automatically generate on your screen!',
      },
      {
        q: 'How does stock quantity tracking work?',
        a: 'When creating a listing, you can specify your available stock quantity (e.g. 10 units). Each completed sale automatically decrements your stock quantity by 1. When quantity reaches 0, the item automatically updates to "Sold". If stock remains, it stays available for other buyers!',
      },
      {
        q: 'How do I print or download a QR sign for my vehicle or property?',
        a: 'When you publish an Automotive or Real Estate listing, a QR sign modal opens automatically with "Download PNG" and "Print Sign" buttons. You can also re-download your QR placards anytime from the "▣ QR Codes" tab in your Profile Listing Dashboard or Store Profile!',
      },
      {
        q: 'How do I complete a sale in person?',
        a: 'Once you and the buyer agree on terms via chat: 1) Meet in person, 2) Open the chat and tap "Generate QR," 3) Show the QR code to the buyer, 4) The buyer scans it to confirm the purchase, 5) The stock quantity decrements, and the deal is complete.',
      },
      {
        q: 'Can I edit or delete my listing?',
        a: 'Yes. Go to "My Listings" in your seller dashboard. You can update details, adjust available quantity, change the status (available, reserved, hidden), or delete the listing entirely.',
      },
      {
        q: 'How do I get more buyers?',
        a: 'Add high-quality photos (up to 20), write detailed descriptions, price competitively, and print physical Aliwayz QR placards to place on your vehicle windshield or property yard to drive local foot traffic!',
      },
    ],
  },
  {
    id:    'cars',
    title: 'Cars',
    icon:  Package,
    color: '#3B82F6',
    faqs: [
      {
        q: 'How do I sell my car or vehicle on Aliwayz?',
        a: 'Click "Sell," choose "Automotive," then fill in vehicle details including make, model, year, mileage, transmission, and condition. Upload photos, click "Publish Listing", and immediately download or print your high-res "FOR SALE" windshield QR placard!',
      },
      {
        q: 'How do buyers interact with my vehicle\'s QR sign?',
        a: 'Place your printed Aliwayz QR placard on your car window. People passing by your vehicle can scan the QR code with their phone camera to instantly open your car\'s full listing, photos, price, specs, and message you directly.',
      },
      {
        q: 'What information should I include in my car listing?',
        a: 'Include the make, model, year, mileage, fuel type, transmission, body type, engine size, color, number of previous owners, condition, and notable features.',
      },
      {
        q: 'Can I sell a car with a lien on it?',
        a: 'You can list a car with a lien, but disclose this in the description. The lien must be resolved before transferring the title to the buyer.',
      },
    ],
  },
  {
    id:    'property',
    title: 'Property',
    icon:  Package,
    color: 'var(--color-success)',
    faqs: [
      {
        q: 'Can I list property for sale, rent, or commercial lease?',
        a: 'Yes! Our Real Estate listing form handles four main transaction types: Sell a Property, Rent a Property, Commercial Lease, and Vacation Rental. The form dynamically updates pricing fields like Monthly Rent, HOA fees, or Nightly Rates.',
      },
      {
        q: 'How do physical Real Estate QR placards work?',
        a: 'When you list a property, Aliwayz generates a downloadable "FOR SALE / RENT" placard. You can print and display this QR sign on your property yard, window, or flyer. Prospective buyers/tenants scanning the QR sign get immediate access to virtual tour info, pricing, photos, and direct seller contact.',
      },
      {
        q: 'Do I have to show the exact address of my property?',
        a: 'No. In the Property Location section, choose between "Exact location" (pin on map) and "Approximate location" (shows neighborhood radius).',
      },
      {
        q: 'What types of property can I list?',
        a: 'Houses, townhomes, condos, apartments, land/plots, commercial spaces, offices, shops, warehouses, and farmhouses.',
      },
    ],
  },
  {
    id:    'qr',
    title: 'QR Verification',
    icon:  QrCode,
    color: 'var(--color-warning)',
    faqs: [
      {
        q: 'What is QR verification?',
        a: 'QR verification is our secure, instant proof-of-sale system. The seller generates a unique, encrypted QR code in the chat during meetup, and the buyer scans it to confirm the purchase. It automatically completes the deal, decrements stock quantity, and records the sale.',
      },
      {
        q: 'What is the difference between a Deal QR Code and a Listing QR Placard?',
        a: 'A **Listing QR Placard** is a downloadable sign you print and display on your vehicle window or real estate yard to attract buyers. A **Deal QR Code** is generated inside the private chat during a physical meetup to complete and verify the final sale.',
      },
      {
        q: 'How long is a in-chat Deal QR code valid?',
        a: 'Each deal QR code expires after 10 minutes for security. If it expires, the seller can generate a new one instantly in the chat.',
      },
      {
        q: 'Can a Deal QR code be used more than once?',
        a: 'No. Each deal QR code is single-use and encrypted. Once scanned, it is permanently consumed and records the verified sale.',
      },
    ],
  },
  {
    id:    'safety',
    title: 'Trust & Safety',
    icon:  Shield,
    color: 'var(--color-error)',
    faqs: [
      {
        q: 'How do I stay safe when meeting in person?',
        a: 'Always meet in a well-lit, public place (police station designated exchange zones are ideal). Bring a friend if possible. Inspect the item thoroughly before scanning the Deal QR code.',
      },
      {
        q: 'How do I report a suspicious user or listing?',
        a: 'Click the flag icon on any listing or profile page. Unauthenticated users clicking report are seamlessly directed to sign in. Our moderation team reviews reports promptly.',
      },
      {
        q: 'What are seller badges?',
        a: 'Badges are earned based on activity and reputation: New Seller, Verified Seller (phone verified + 1 sale), 100 Rated, 500 Rated, Top Seller, and Trusted Buyer.',
      },
      {
        q: 'Can I block someone?',
        a: 'Yes. In any chat conversation, tap the menu icon and select "Block User." Blocked users cannot message you or see your listings.',
      },
    ],
  },
  {
    id:    'account',
    title: 'Account',
    icon:  Users,
    color: 'var(--color-info)',
    faqs: [
      {
        q: 'How do I create an account?',
        a: 'Click "Create Account," choose your role (Buyer, Seller, or Both), and sign up with Email, Google, or Apple for fast, secure access!',
      },
      {
        q: 'Can I sign in with Apple or Google?',
        a: 'Yes! Aliwayz supports one-click social authentication with both Google and Apple Sign-In on web and mobile devices.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Profile → Edit Profile → scroll down to "Account Management" and click "Delete Account." This permanently removes your account and associated data.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page, click "Forgot password?" Enter your email address, and we\'ll send you a password reset link.',
      },
    ],
  },
];
];

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [searchQuery, setSearchQuery]     = useState('');
  const [openItems, setOpenItems]         = useState({});

  const toggleItem = (sectionId, index) => {
    const key = `${sectionId}-${index}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Search across all FAQs
  const filteredSections = searchQuery.trim()
    ? FAQ_SECTIONS.map((section) => ({
        ...section,
        faqs: section.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((section) => section.faqs.length > 0)
    : FAQ_SECTIONS.filter((s) => s.id === activeSection);

  return (
    <>
      <Helmet>
        <title>FAQ — Aliwayz</title>
        <meta name="description" content="Frequently asked questions about buying and selling on Aliwayz." />
      </Helmet>

      <div className="container-app py-6 sm:py-10 max-w-4xl pb-24 md:pb-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm mb-2 transition-colors hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Frequently Asked Questions
          </h1>
          <p
            className="text-base max-w-lg mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Everything you need to know about buying and selling on Aliwayz
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative mt-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="input-base pl-10"
            />
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Category Sidebar */}
          {!searchQuery && (
            <motion.div
              className="lg:w-56 flex-shrink-0"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-20">
                {FAQ_SECTIONS.map((section) => {
                  const Icon     = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                        isActive ? 'text-white' : 'hover:bg-[var(--glass-bg-strong)]'
                      )}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${section.color}, ${section.color}dd)`
                          : undefined,
                        color: isActive ? 'white' : 'var(--color-text-secondary)',
                        boxShadow: isActive
                          ? `0 4px 15px ${section.color}30`
                          : undefined,
                      }}
                    >
                      <Icon size={16} />
                      {section.title}
                      <span
                        className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(255,255,255,0.2)'
                            : 'var(--color-surface-elevated)',
                          color: isActive ? 'white' : 'var(--color-text-muted)',
                        }}
                      >
                        {section.faqs.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* FAQ Content */}
          <div className="flex-1 space-y-4">
            {searchQuery && filteredSections.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  No results for "{searchQuery}"
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Try different keywords
                </p>
              </div>
            )}

            {filteredSections.map((section) => (
              <div key={section.id}>
                {searchQuery && (
                  <h3
                    className="text-sm font-bold mb-3 flex items-center gap-2"
                    style={{ color: section.color }}
                  >
                    <section.icon size={16} />
                    {section.title}
                  </h3>
                )}

                <div className="space-y-2">
                  {section.faqs.map((faq, index) => {
                    const key    = `${section.id}-${index}`;
                    const isOpen = openItems[key];

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: `1px solid ${isOpen ? section.color + '40' : 'var(--color-border)'}`,
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <button
                          onClick={() => toggleItem(section.id, index)}
                          className="w-full flex items-start gap-3 p-4 sm:p-5 text-left"
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold"
                            style={{
                              backgroundColor: isOpen ? `${section.color}15` : 'var(--color-surface-elevated)',
                              color: isOpen ? section.color : 'var(--color-text-muted)',
                              transition: 'all 0.2s',
                            }}
                          >
                            Q
                          </div>

                          <span
                            className={cn('flex-1 text-sm sm:text-base font-medium leading-snug', isOpen ? 'font-semibold' : '')}
                            style={{
                              color: isOpen ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            }}
                          >
                            {faq.q}
                          </span>

                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0 mt-0.5"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <ChevronDown size={18} />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div
                                className="px-4 sm:px-5 pb-4 sm:pb-5 pl-14 sm:pl-16"
                              >
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{ color: 'var(--color-text-secondary)' }}
                                >
                                  {faq.a}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center rounded-3xl p-8 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(91,110,245,0.08), rgba(139,92,246,0.05))',
            border: '1px solid rgba(91,110,245,0.15)',
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-4xl block mb-3">💬</span>
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Still have questions?
          </h3>
          <p
            className="text-sm max-w-md mx-auto mb-5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Can't find what you're looking for? Reach out to our support team and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@aliwayz.com"
              className="btn-brand inline-flex items-center gap-2 text-sm"
            >
              <MessageSquare size={16} />
              Contact Support
            </a>
            <Link
              to="/"
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}