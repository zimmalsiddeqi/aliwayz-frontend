import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, QrCode, Zap, Lock } from 'lucide-react';
import InboxSidebar from '../components/InboxSidebar';

export default function InboxPage() {
  return (
    <>
      <Helmet>
        <title>Inbox — Aliwayz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex w-full h-[calc(100vh-var(--navbar-height)-4rem)] md:h-[calc(100vh-var(--navbar-height))] overflow-hidden bg-[var(--color-bg)]">
        {/* ═══ LEFT PANE: INBOX LIST (Full on mobile, fixed sidebar on tablet/desktop) ═══ */}
        <div className="w-full md:w-[360px] lg:w-[390px] xl:w-[430px] flex-shrink-0 h-full">
          <InboxSidebar activeConversationId={null} className="w-full h-full" />
        </div>

        {/* ═══ RIGHT PANE: WHATSAPP WEB STYLE WELCOME PLACEHOLDER (Tablet / Desktop) ═══ */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden bg-[var(--color-bg)]">
          {/* Subtle background decorative shapes */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'var(--color-brand)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: 'var(--color-success)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md flex flex-col items-center relative z-10"
          >
            {/* WhatsApp-style Hero Graphic */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl relative"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
                boxShadow: '0 12px 30px rgba(91,110,245,0.25)',
              }}
            >
              <MessageSquare size={38} className="text-white" />
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
              >
                <QrCode size={15} />
              </div>
            </div>

            <h1
              className="text-2xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Aliwayz Web Messenger
            </h1>

            <p
              className="text-xs sm:text-sm leading-relaxed mb-8 max-w-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Select a chat from the left panel to send real-time messages, agree on terms, and complete verified purchases with QR codes.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8 text-left">
              <div
                className="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(91,110,245,0.15)',
                    color: 'var(--color-brand-light)',
                  }}
                >
                  <QrCode size={15} />
                </div>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  QR Protection
                </h4>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  Scan to finalize deals safely in person.
                </p>
              </div>

              <div
                className="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    color: 'var(--color-success)',
                  }}
                >
                  <Zap size={15} />
                </div>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Instant Chat
                </h4>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  Live messages, typing states & online presence.
                </p>
              </div>

              <div
                className="p-3 rounded-2xl border flex flex-col gap-1.5 transition-all"
                style={{
                  backgroundColor: 'var(--glass-bg)',
                  borderColor: 'var(--color-border-subtle)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(59,130,246,0.15)',
                    color: '#60A5FA',
                  }}
                >
                  <ShieldCheck size={15} />
                </div>
                <h4 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Verified Stores
                </h4>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  Official verified seller storefront badges.
                </p>
              </div>
            </div>

            {/* Bottom Footer Note (WhatsApp-style lock message) */}
            <div
              className="flex items-center gap-1.5 text-[11px] font-medium"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              <Lock size={12} />
              <span>Protected by Aliwayz Verified Handshake™</span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
