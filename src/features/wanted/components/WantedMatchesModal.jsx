import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Home, ExternalLink, MessageCircle, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

export default function WantedMatchesModal({ isOpen, onClose, request }) {
  const navigate = useNavigate();

  if (!isOpen || !request) return null;

  // Strictly use real dynamic matches from backend/database
  const rawMatches = Array.isArray(request.wanted_matches) ? request.wanted_matches : [];
  const matches = rawMatches.filter((m) => m && (m.products || m.id));

  const handleViewProduct = (productId) => {
    onClose();
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/marketplace`);
    }
  };

  const handleMessageSeller = (productId, sellerId) => {
    onClose();
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/inbox`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-3 sm:pb-4 gap-3">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Matched Seller Proposals
            </span>
            <h2 className="text-base sm:text-xl font-bold text-[var(--color-text-primary)] leading-tight truncate">
              {request.title || 'Wanted Item'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              Budget: ${Number(request.budget_min || 0).toLocaleString()} – ${Number(request.budget_max || 0).toLocaleString()} • {request.location_city || 'Philadelphia, PA'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Matches List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
              Seller Responses ({matches.length})
            </h3>
            {matches.length > 0 && (
              <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={13} /> {matches.length} matching offer{matches.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 sm:p-8 text-center bg-[var(--color-bg-card)]">
              <Sparkles className="mx-auto mb-2 text-indigo-500" size={32} />
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                No matched seller proposals yet
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
                Local sellers in Philadelphia will be able to propose their matching inventory here as soon as they respond to your request.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {matches.map((m) => {
                const product = m.products || {};
                const seller = m.users || {};
                const img =
                  product?.product_images?.[0]?.cdn_url ||
                  product?.product_images?.[0]?.storage_url ||
                  request?.images?.[0] ||
                  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=70';

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-3.5 sm:p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Product Thumbnail & Basic Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-14 w-14 sm:h-18 sm:w-18 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/70 dark:border-gray-700/70">
                          <img
                            src={img}
                            alt={product.title || 'Matching product'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-[var(--color-text-primary)] truncate">
                            {product.title || 'Matching Listing'}
                          </h4>
                          <p className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            ${Number(product.price || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5 truncate">
                            <MapPin size={11} className="text-gray-400 shrink-0" />
                            <span className="truncate">{product.location_city || request.location_city || 'Philadelphia, PA'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Seller Info Badge */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]/60">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[var(--color-text-primary)]">
                            {seller.username || 'Local Seller'}
                          </span>
                          <ShieldCheck size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Verified Seller
                        </span>
                      </div>
                    </div>

                    {/* Seller Message / Note */}
                    {m.message && (
                      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5 sm:p-3 text-xs text-[var(--color-text-secondary)] leading-relaxed border border-[var(--color-border)]/50">
                        <span className="font-semibold text-[var(--color-text-primary)] mr-1">Seller Note:</span>
                        "{m.message}"
                      </div>
                    )}

                    {/* Actions: View Product & Message Seller */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                      {product?.id && (
                        <button
                          type="button"
                          onClick={() => handleViewProduct(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] transition-all shadow-sm"
                        >
                          <ExternalLink size={13} />
                          <span>View Product</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleMessageSeller(product.id, m.seller_id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition-all transform active:scale-95"
                      >
                        <MessageCircle size={13} />
                        <span>Message Seller</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

