import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import useAuthStore from '@store/auth.store';
import SearchBar from '@components/common/SearchBar';
import LocationSelector from '@components/common/LocationSelector';
import { isSeller } from '@lib/utils';

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const CATEGORIES = [
  {
    id:          'essentials',
    name:        'Everyday Essentials',
    emoji:       '🛒',
    description: 'Electronics, fashion, home goods & more',
    gradient:    'linear-gradient(135deg, #4C1D95 0%, #7C3AED 60%, #A78BFA 100%)',
    glow:        'rgba(124,58,237,0.35)',
    path:        '/essentials',
    sellPath:    '/sell/create?category=essentials',
    bgPattern:   '📱👟🛋️📚🎮',
    stats:       ['Electronics', 'Fashion', 'Home'],
  },
  {
    id:          'vehicles',
    name:        'Vehicles',
    emoji:       '🚗',
    description: 'Cars, trucks, motorcycles & powersports',
    gradient:    'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 60%, #60A5FA 100%)',
    glow:        'rgba(59,130,246,0.35)',
    path:        '/vehicles',
    sellPath:    '/sell/create?category=vehicles',
    bgPattern:   '🚗🏎️🚙🛻🏍️',
    stats:       ['Cars & Trucks', 'Motorcycles', 'Parts'],
  },
  {
    id:          'real-estate',
    name:        'Real Estate',
    emoji:       '🏠',
    description: 'Homes, apartments, land & commercial spaces',
    gradient:    'linear-gradient(135deg, #065F46 0%, #10B981 60%, #34D399 100%)',
    glow:        'rgba(16,185,129,0.35)',
    path:        '/real-estate',
    sellPath:    '/sell/create?category=real-estate',
    bgPattern:   '🏠🏢🏡🏗️🌍',
    stats:       ['For Sale', 'For Rent', 'Land'],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const sellerOnly = user?.role === 'seller';

  const greeting = isAuthenticated
    ? `Welcome back, ${user?.full_name?.split(' ')[0] || user?.username}! 👋`
    : 'Buy & Sell Locally';

  const subtitle = sellerOnly
    ? 'Select a category to list your items'
    : 'Vehicles · Real Estate · Everyday Essentials — all verified with QR';

  return (
    <>
      <Helmet>
        <title>Aliwayz — Local Marketplace</title>
        <meta
          name="description"
          content="Buy and sell vehicles, real estate, and everyday items locally."
        />
      </Helmet>

      <div className="min-h-screen pb-24 md:pb-10">
        {/* ═══ HERO ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-10 blur-[80px]"
              style={{ background: '#3B82F6' }}
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-10 right-0 w-80 h-80 rounded-full opacity-8 blur-[80px]"
              style={{ background: '#10B981' }}
              animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full opacity-8 blur-[80px]"
              style={{ background: '#7C3AED' }}
              animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="container-app relative pt-10 pb-8 sm:pt-16 sm:pb-12">
            <motion.div
              className="max-w-3xl mx-auto text-center space-y-6"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--color-brand-glow)',
                    color: 'var(--color-brand-light)',
                    border: '1px solid rgba(91,110,245,0.25)',
                  }}
                >
                  <Sparkles size={13} />
                  {sellerOnly ? 'Seller Marketplace' : 'QR Verified Marketplace'}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {greeting}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-base sm:text-xl max-w-xl mx-auto leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {subtitle}
              </motion.p>

              {!sellerOnly && (
                <motion.div variants={fadeUp} className="max-w-xl mx-auto">
                  <SearchBar />
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ═══ LOCATION SELECTOR ══════════════════════════ */}
        <section className="container-app py-3">
          <LocationSelector />
        </section>

        {/* ═══ 3 MAIN CATEGORIES ══════════════════════════ */}
        <section className="container-app py-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
          >
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                sellerOnly={sellerOnly}
                onNavigate={(path) => navigate(path)}
              />
            ))}
          </motion.div>
        </section>
      </div>
    </>
  );
}

function CategoryCard({ cat, sellerOnly, onNavigate }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1, y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl cursor-pointer group"
        style={{
          background: cat.gradient,
          boxShadow: `0 8px 32px ${cat.glow}`,
          minHeight: '300px',
        }}
        whileHover={{ y: -6, boxShadow: `0 20px 60px ${cat.glow}` }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate(cat.path)}
      >
        <div className="absolute inset-0 flex flex-wrap gap-4 p-4 opacity-[0.06] text-4xl pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="select-none">
              {cat.bgPattern.split('').filter((c) => c.trim())[i % 5]}
            </span>
          ))}
        </div>

        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative z-10 p-6 h-full flex flex-col justify-between min-h-[300px]">
          <div className="flex items-start justify-between">
            <motion.div
              className="text-6xl"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {cat.emoji}
            </motion.div>

            <div
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {sellerOnly ? 'View & Sell' : 'Browse'}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap my-4">
            {cat.stats.map((stat) => (
              <span
                key={stat}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {stat}
              </span>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{cat.name}</h2>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">{cat.description}</p>

            <motion.div
              className="flex items-center gap-2 w-fit px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
              }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)', x: 4 }}
            >
              {sellerOnly ? `View ${cat.name}` : `Explore ${cat.name}`}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}