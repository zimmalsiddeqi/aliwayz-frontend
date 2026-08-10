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
        a: 'Aliwayz is a local marketplace where you can buy and sell cars, property, and everyday products in your area. All transactions are verified using our secure QR code system to ensure safe, in-person exchanges.',
      },
      {
        q: 'Is Aliwayz free to use?',
        a: 'Yes! Creating an account, browsing listings, and posting items for sale is completely free. There are no hidden fees or commissions on your sales.',
      },
      {
        q: 'How does Aliwayz work?',
        a: 'It\'s simple: 1) Create an account, 2) Browse or list items in Cars, Property, or Daily Use Products, 3) Chat with buyers/sellers, 4) Meet locally, 5) Complete the sale with QR verification, 6) Leave a review.',
      },
      {
        q: 'Where is Aliwayz available?',
        a: 'Aliwayz is available nationwide across the United States. You can buy and sell in any city or state.',
      },
      {
        q: 'Do I need to create a store to sell something?',
        a: 'No! You can use our "Quick Listing" feature to sell a single item without setting up a store. However, if you plan to sell multiple items regularly, we recommend setting up a seller profile for better visibility and credibility.',
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
        a: 'No, Aliwayz does not process payments. All payments are handled directly between the buyer and seller during the in-person meetup. You can use cash, Venmo, Zelle, or any method you both agree on.',
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
        q: 'How do I list an item for sale?',
        a: 'Click "Sell" in the navigation, choose your category (Daily Use, Cars, or Property), fill in the details, add photos, and publish. Your listing will be visible to buyers immediately.',
      },
      {
        q: 'How many items can I list?',
        a: 'There\'s no limit! You can list as many items as you want across all categories.',
      },
      {
        q: 'How do I complete a sale?',
        a: 'Once you and the buyer agree on terms via chat: 1) Meet in person, 2) Open the chat and tap "Generate QR," 3) Show the QR code to the buyer, 4) The buyer scans it to confirm the purchase, 5) The item is automatically marked as sold.',
      },
      {
        q: 'Can I edit or delete my listing?',
        a: 'Yes. Go to "My Listings" in your seller dashboard. You can edit details, change the status (available, reserved, hidden), or delete the listing entirely.',
      },
      {
        q: 'How do I get more buyers?',
        a: 'Add high-quality photos (up to 20), write detailed descriptions, price competitively, and maintain good reviews. Verified sellers and those with badges tend to get more interest.',
      },
      {
        q: 'What\'s the difference between Quick Listing and a Seller Profile?',
        a: 'Quick Listing lets you sell a single item instantly without setup. A Seller Profile (Shop) creates a dedicated storefront where buyers can browse all your listings, follow you, and see your reviews and ratings.',
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
        q: 'How do I sell my car on Aliwayz?',
        a: 'Click "Sell," choose "Vehicle," then fill in the details including make, model, year, mileage, transmission, and condition. Add photos of the exterior, interior, engine, and dashboard for the best results.',
      },
      {
        q: 'What information should I include in my car listing?',
        a: 'Include the make, model, year, mileage, fuel type, transmission, body type, engine size, color, number of previous owners, condition, and any notable features. The more details, the more serious buyers you\'ll attract.',
      },
      {
        q: 'Can I sell a car with a lien on it?',
        a: 'You can list a car with a lien, but you should disclose this in the description. The lien must be resolved before transferring the title to the buyer.',
      },
      {
        q: 'Do I need a dealer license to sell cars?',
        a: 'For selling your personal vehicle, no license is needed. However, if you\'re regularly buying and selling cars for profit, your state may require a dealer license. Check your local regulations.',
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
        q: 'Can I list property for rent on Aliwayz?',
        a: 'Yes! When creating a property listing, you can choose "For Sale" or "For Rent" as the purpose. Rental listings work great for apartments, rooms, and houses.',
      },
      {
        q: 'What types of property can I list?',
        a: 'Houses, apartments, condos, plots/land, commercial spaces, offices, shops, warehouses, and farmhouses. Both residential and commercial properties are welcome.',
      },
      {
        q: 'Is Aliwayz a licensed real estate platform?',
        a: 'Aliwayz is a marketplace for connecting buyers and sellers. We are not a licensed real estate broker. For legal transactions involving property, we recommend consulting a licensed real estate attorney or agent in your state.',
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
        a: 'QR verification is our secure way to confirm that a sale has been completed. The seller generates a unique, encrypted QR code in the chat. The buyer scans it to confirm the purchase. This ensures both parties agree the transaction is done.',
      },
      {
        q: 'How long is a QR code valid?',
        a: 'Each QR code expires after 10 minutes. If it expires, the seller can generate a new one. This time limit adds an extra layer of security.',
      },
      {
        q: 'Can a QR code be used more than once?',
        a: 'No. Each QR code is single-use. Once scanned, it\'s permanently consumed and cannot be used again. The seller can generate a new one if needed.',
      },
      {
        q: 'What happens after the QR is scanned?',
        a: 'The product is automatically marked as "Sold," both parties receive a notification, and a review prompt appears so you can rate your experience.',
      },
      {
        q: 'Can I cancel a sale after QR verification?',
        a: 'If both parties agree to cancel, the seller can regenerate a new QR code and relist the item. Contact the other party through the chat to discuss.',
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
        a: 'Always meet in a well-lit, public place (police station parking lots are ideal). Bring a friend if possible. Never share personal financial information. Trust your instincts — if something feels off, walk away.',
      },
      {
        q: 'How do I report a suspicious user?',
        a: 'Tap the flag icon on any user profile, product listing, or store page to submit a report. You can also report users directly from the chat. Our moderation team reviews all reports within 24 hours.',
      },
      {
        q: 'What are seller badges?',
        a: 'Badges are earned based on your activity and reputation: New Seller (just started), Verified Seller (phone verified + 1 sale), 100 Rated (100+ sales with 4.0+ rating), 500 Rated (500+ sales), Top Seller (highest tier), and Trusted Buyer (10+ purchases with great reviews).',
      },
      {
        q: 'Can I block someone?',
        a: 'Yes. In any chat conversation, tap the menu icon and select "Block User." Blocked users cannot message you or see your listings.',
      },
      {
        q: 'What happens if I get reported?',
        a: 'Our admin team reviews each report. If the report is valid, actions range from a warning to account suspension or permanent ban, depending on the severity.',
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
        a: 'Click "Sign Up," choose your role (Buyer, Seller, or Both), enter your email and password, and you\'re in! You can also sign up with Google for faster access.',
      },
      {
        q: 'Can I be both a buyer and seller?',
        a: 'Yes! When signing up, choose "Both" as your role. You\'ll have full access to buying and selling features.',
      },
      {
        q: 'How do I verify my account?',
        a: 'Email verification happens automatically after signup. For phone verification (which unlocks the Verified Seller badge), go to Profile → Settings → Phone Verification.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Profile → Edit Profile → scroll down to "Danger Zone" and click "Delete Account." This permanently removes your account and all associated data.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page, click "Forgot password?" Enter your email address, and we\'ll send you a reset link. The link expires after 1 hour.',
      },
    ],
  },
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