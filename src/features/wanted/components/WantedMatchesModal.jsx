import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Home, ExternalLink, MessageCircle, Bed, Bath, Maximize2, MapPin } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

export default function WantedMatchesModal({ isOpen, onClose, request }) {
  const navigate = useNavigate();

  if (!isOpen || !request) return null;

  const matches = Array.isArray(request.wanted_matches) ? request.wanted_matches : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Request Details & Matches
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              {request.title}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Budget: ${Number(request.budget_min).toLocaleString()} - ${Number(request.budget_max).toLocaleString()} • {request.location_city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Matches Section */}
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center justify-between">
            <span>Seller Responses ({matches.length})</span>
            {matches.length > 0 && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> {matches.length} active match proposal{matches.length > 1 ? 's' : ''}
              </span>
            )}
          </h3>

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
              <Home className="mx-auto mb-2 text-[var(--color-text-muted)]" size={32} />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                No direct seller proposals yet
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Local sellers and agents have been notified of your request.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {matches.map((m) => {
                const product = m.products;
                const seller = m.users;
                const img = product?.product_images?.[0]?.cdn_url || product?.product_images?.[0]?.storage_url;

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          {img ? (
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                              <Home size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                            {product?.title || 'Matching Listing'}
                          </h4>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            ${Number(product?.price || 0).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                            <MapPin size={11} /> {product?.location_city || request.location_city}
                          </p>
                        </div>
                      </div>

                      {/* Seller Tag */}
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] block">
                          Seller: {seller?.username || 'Verified Member'}
                        </span>
                      </div>
                    </div>

                    {m.message && (
                      <div className="rounded-xl bg-[var(--color-bg-secondary)] p-2.5 text-xs text-[var(--color-text-secondary)] italic">
                        "{m.message}"
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--color-border)]">
                      {product?.id && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            onClose();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View Listing
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="brand"
                        onClick={() => {
                          onClose();
                          navigate(`/inbox?seller=${m.seller_id}`);
                        }}
                      >
                        <MessageCircle size={14} className="mr-1" />
                        Message Seller
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
