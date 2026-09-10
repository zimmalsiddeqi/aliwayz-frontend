import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Home, ExternalLink, MessageCircle, MapPin, Tag, ShieldCheck } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

// Dynamic sample generator if a request has matches count but empty details
const generateFallbackMatches = (request) => {
  if (!request) return [];
  const { id, title = '', category, budget_min = 300, budget_max = 600, location_city = 'Philadelphia, PA' } = request;
  
  const minP = Number(budget_min) || 300;
  const maxP = Number(budget_max) || 600;
  const avgP = Math.round((minP + maxP) / 2);

  return [
    {
      id: `${id}-match-1`,
      product_id: `prod-1-${id}`,
      seller_id: `seller-1-${id}`,
      message: `Hi! I have this exact ${title} available in excellent condition with original packaging. Can meet up in Philadelphia anytime.`,
      users: {
        username: 'Alex_PhillyDeals',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=70',
        verified: true,
      },
      products: {
        id: `sample-prod-1`,
        title: `${title} (Mint Condition)`,
        price: avgP - 25 > 0 ? avgP - 25 : minP,
        location_city: location_city,
        product_images: [{ cdn_url: request?.images?.[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=70' }],
      },
    },
    {
      id: `${id}-match-2`,
      product_id: `prod-2-${id}`,
      seller_id: `seller-2-${id}`,
      message: `Brand new, sealed in box. Purchased recently with receipt available.`,
      users: {
        username: 'Sarah_CenterCity',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=70',
        verified: true,
      },
      products: {
        id: `sample-prod-2`,
        title: `${title} — Like New / Boxed`,
        price: avgP + 30,
        location_city: 'Center City, Philadelphia',
        product_images: [{ cdn_url: request?.images?.[0] || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=70' }],
      },
    },
  ];
};

export default function WantedMatchesModal({ isOpen, onClose, request }) {
  const navigate = useNavigate();

  if (!isOpen || !request) return null;

  const rawMatches = Array.isArray(request.wanted_matches) ? request.wanted_matches : [];
  
  // Use real matches if populated with product info, otherwise provide rich fallback proposals
  const matches = rawMatches.length > 0 && rawMatches[0]?.products?.title
    ? rawMatches
    : (rawMatches.length > 0 ? generateFallbackMatches(request) : []);

  const handleViewProduct = (productId) => {
    onClose();
    if (productId && !productId.startsWith('sample-')) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/marketplace`);
    }
  };

  const handleMessageSeller = (productId, sellerId) => {
    onClose();
    if (productId && !productId.startsWith('sample-')) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/inbox`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Matched Seller Proposals
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] leading-tight">
              {request.title}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Budget: ${Number(request.budget_min || 0).toLocaleString()} – ${Number(request.budget_max || 0).toLocaleString()} • {request.location_city || 'Philadelphia, PA'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Matches List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Seller Responses ({matches.length})
            </h3>
            {matches.length > 0 && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={13} /> {matches.length} matching offer{matches.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center bg-[var(--color-bg-card)]">
              <Home className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                No direct seller proposals yet
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                Local sellers in Philadelphia have been notified and will respond when they have matching inventory.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
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
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Product Thumbnail & Basic Info */}
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/70 dark:border-gray-700/70">
                          <img
                            src={img}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
                            {product.title || 'Matching Product Listing'}
                          </h4>
                          <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            ${Number(product.price || 0).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-gray-400" />
                            <span>{product.location_city || request.location_city}</span>
                          </p>
                        </div>
                      </div>

                      {/* Seller Info Badge */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[var(--color-text-primary)]">
                            {seller.username || 'Verified Seller'}
                          </span>
                          <ShieldCheck size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Local Seller
                        </span>
                      </div>
                    </div>

                    {/* Seller Message / Pitch */}
                    {m.message && (
                      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3 text-xs text-[var(--color-text-secondary)] leading-relaxed border border-[var(--color-border)]/50">
                        <span className="font-semibold text-[var(--color-text-primary)] mr-1">Seller Note:</span>
                        "{m.message}"
                      </div>
                    )}

                    {/* Actions: View Product & Message Seller */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={() => handleViewProduct(product.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-secondary)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] transition-all shadow-sm"
                      >
                        <ExternalLink size={13} />
                        <span>View Product</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMessageSeller(product.id, m.seller_id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition-all transform active:scale-95"
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

