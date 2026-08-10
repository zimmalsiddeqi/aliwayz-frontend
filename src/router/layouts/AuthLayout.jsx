import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '@components/common/LoadingScreen';
import ThemeToggle from '@components/common/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left panel — brand showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden items-center justify-center p-12">

        {/* Background gradient */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #8B5CF6 50%, #EC4899 100%)',
            opacity: 0.9,
          }}
        />

        {/* Glass pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Floating circles */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)' }}
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center text-white max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <span className="text-4xl font-bold">A</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
            Buy & Sell
            <br />
            Locally
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Discover unique items near you. Connect with real people.
            Complete sales safely with QR verification.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {['QR Verified', 'Local Meetup', 'Real Reviews', 'Safe & Secure'].map((text) => (
              <span key={text}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}