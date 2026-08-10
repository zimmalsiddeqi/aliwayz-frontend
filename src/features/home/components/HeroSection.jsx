import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SearchBar from '@components/common/SearchBar';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[100px]"
             style={{ background: 'var(--color-brand)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-15 blur-[80px]"
             style={{ background: '#8B5CF6' }} />
      </div>

      <div className="container-app relative pt-8 pb-10 sm:pt-14 sm:pb-16">
        <motion.div
          className="max-w-2xl mx-auto text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium badge-brand">
            <Sparkles size={12} /> QR Verified Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ color: 'var(--color-text-primary)' }}>
            Discover & sell{' '}
            <span className="text-gradient">locally</span>
          </h1>
          <p className="text-base sm:text-lg max-w-lg mx-auto"
             style={{ color: 'var(--color-text-secondary)' }}>
            Meet real people. Verify with QR. Build trust through reviews.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
        </motion.div>
      </div>
    </section>
  );
}