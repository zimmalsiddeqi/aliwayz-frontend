import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  User,
  Store,
  MapPin,
  Tag,
  Edit3,
  Rocket,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { formatPrice } from '@utils/formatters';
import { getCleanDescriptionText } from '@utils/categoryHelpers';
import { parseStoreMeta } from '@utils/sellerMeta';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';

export default function ListingReviewModal({
  isOpen,
  pendingPayload,
  sellerIdentity,
  onChangeIdentity,
  user,
  store,
  isSubmitting,
  onEdit,
  onConfirmPublish,
}) {
  const storeMeta = useMemo(() => parseStoreMeta(store), [store]);
  const hasBusinessProfile = Boolean(store && storeMeta.isBusinessProfile);

  const imagePreviews = useMemo(() => {
    if (!pendingPayload?.images?.length) return [];
    return pendingPayload.images.map((file) => {
      if (typeof file === 'string') return file;
      try {
        return URL.createObjectURL(file);
      } catch {
        return null;
      }
    }).filter(Boolean);
  }, [pendingPayload?.images]);

  if (!isOpen || !pendingPayload) return null;

  const isBusiness = sellerIdentity === 'business' && hasBusinessProfile;
  const displayName = isBusiness
    ? store?.store_name || 'Business Seller'
    : user?.full_name || user?.username || store?.store_name || 'Personal Seller';
  const displayAvatar = isBusiness
    ? store?.logo_url || user?.avatar_url
    : user?.avatar_url || store?.logo_url;
  const cleanDesc = getCleanDescriptionText(pendingPayload.description || '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1"
                style={{
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand)',
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Final Review Before Publishing
              </span>
              <h3
                className="text-lg sm:text-xl font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Review Your Listing
              </h3>
            </div>
            <button
              type="button"
              onClick={onEdit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-opacity hover:opacity-80"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Details
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Seller Identity Confirmation Card */}
            <div
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Publishing Identity
                </span>

                {hasBusinessProfile && (
                  <div
                    className="inline-flex rounded-xl p-0.5 border"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onChangeIdentity?.('personal')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                      style={{
                        backgroundColor:
                          sellerIdentity === 'personal'
                            ? 'var(--color-brand)'
                            : 'transparent',
                        color:
                          sellerIdentity === 'personal'
                            ? '#ffffff'
                            : 'var(--color-text-secondary)',
                      }}
                    >
                      <User className="w-3 h-3" />
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeIdentity?.('business')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                      style={{
                        backgroundColor:
                          sellerIdentity === 'business'
                            ? 'var(--color-brand)'
                            : 'transparent',
                        color:
                          sellerIdentity === 'business'
                            ? '#ffffff'
                            : 'var(--color-text-secondary)',
                      }}
                    >
                      <Store className="w-3 h-3" />
                      Business
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Avatar src={displayAvatar} name={displayName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {displayName}
                    </p>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(91, 110, 245, 0.12)',
                        color: 'var(--color-brand)',
                      }}
                    >
                      {isBusiness
                        ? storeMeta.businessTypeLabel || 'Business Seller'
                        : 'Personal Seller'}
                    </span>
                  </div>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {isBusiness && storeMeta.hasStorefront
                      ? storeMeta.addressVisibility === 'exact' &&
                        storeMeta.streetAddress
                        ? `${storeMeta.streetAddress}, ${store?.location_city || ''}`
                        : `${store?.location_city || ''} (Approximate Storefront Location)`
                      : user?.location_city ||
                        store?.location_city ||
                        pendingPayload.location_city ||
                        'Local Seller'}
                  </p>
                </div>
              </div>
            </div>

            {/* Listing Preview Card */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Images Preview */}
              {imagePreviews.length > 0 ? (
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {imagePreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <img
                          src={src}
                          alt={`Listing preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span
                            className="absolute bottom-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-white"
                          >
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 text-center border-b"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-60" />
                  <p className="text-xs">No photos attached</p>
                </div>
              )}

              {/* Core Info */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4
                    className="text-base sm:text-lg font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {pendingPayload.title}
                  </h4>
                  <span
                    className="text-lg sm:text-xl font-extrabold"
                    style={{ color: 'var(--color-brand)' }}
                  >
                    {formatPrice(pendingPayload.price)}
                  </span>
                </div>

                <div
                  className="flex flex-wrap items-center gap-3 text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {pendingPayload.location_city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {pendingPayload.location_city}
                    </span>
                  )}
                  {pendingPayload.condition && (
                    <span className="inline-flex items-center gap-1 capitalize">
                      <Tag className="w-3.5 h-3.5" />
                      {String(pendingPayload.condition).replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {cleanDesc && (
                  <div
                    className="pt-3 border-t text-xs sm:text-sm whitespace-pre-line line-clamp-6"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {cleanDesc}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ShieldCheck
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--color-brand)' }}
              />
              <span>
                By publishing, your listing will be live on Aliwayz under{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {displayName}
                </strong>
                .
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onEdit}
              disabled={isSubmitting}
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              loading={isSubmitting}
              onClick={onConfirmPublish}
              icon={Rocket}
            >
              {isBusiness
                ? 'Publish as Business Seller'
                : 'Publish as Personal Seller'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
