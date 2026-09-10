import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Store, PlusCircle, CheckCircle2, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import ProductService from '@api/services/product.service';
import WantedService from '@api/services/wanted.service';
import useAuthStore from '@store/auth.store';
import toast from '@lib/toast';
import { cn } from '@lib/utils';

export default function IHaveThisModal({ isOpen, onClose, request }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [mode, setMode] = useState('choice'); // 'choice' | 'select_listing'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [sellerMessage, setSellerMessage] = useState('');

  // Fetch user's listings (including available and draft)
  const { data: userListings, isLoading: loadingListings } = useQuery({
    queryKey: ['my-listings-for-match'],
    queryFn: () => ProductService.getMyListings({ limit: 50 }),
    enabled: isOpen && isAuthenticated,
  });

  const listings = Array.isArray(userListings?.data) ? userListings.data : (Array.isArray(userListings) ? userListings : []);

  const submitMutation = useMutation({
    mutationFn: (data) => WantedService.submitMatch(request.id, data),
    onSuccess: () => {
      toast.success('Your match proposal was sent to the buyer!');
      queryClient.invalidateQueries({ queryKey: ['wanted-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-wanted-requests'] });
      onClose();
      setMode('choice');
      setSelectedProductId(null);
      setSellerMessage('');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to submit match');
    },
  });

  if (!isOpen || !request) return null;

  const handleCreateNew = () => {
    onClose();
    navigate('/sell/create');
  };

  const handleSubmitExisting = () => {
    if (!selectedProductId) {
      toast.error('Please select one of your listings');
      return;
    }
    submitMutation.mutate({
      product_id: selectedProductId,
      message: sellerMessage,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Sparkles className="text-blue-600 dark:text-blue-400" size={20} />
              <span>I Have This</span>
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Matching for: <span className="font-semibold text-[var(--color-text-primary)]">{request.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        {mode === 'choice' ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Do you already have a matching listing on Aliwayz?
            </p>

            {/* Option 1: Use Existing Listing */}
            <div
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please log in to respond with your listings');
                  navigate('/login');
                  return;
                }
                setMode('select_listing');
              }}
              className="group cursor-pointer rounded-2xl border-2 border-blue-500/30 bg-blue-50/50 p-4 transition-all hover:border-blue-600 hover:bg-blue-50 dark:bg-blue-950/20 dark:border-blue-700/50 dark:hover:bg-blue-950/40"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Store size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-blue-600">
                    Use Existing Listing
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Select from your active and draft listings to notify the buyer immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Create New Listing */}
            <div
              onClick={handleCreateNew}
              className="group cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all hover:border-[var(--color-brand)] hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-indigo-600">
                    Create New Listing
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    List a new item or property tailored specifically for this request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Select Listing Step */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Select Your Listing
              </span>
              <button
                onClick={() => setMode('choice')}
                className="text-xs font-semibold text-[var(--color-brand)] hover:underline"
              >
                &larr; Back to options
              </button>
            </div>

            {loadingListings ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
                <Building2 className="mx-auto mb-2 text-[var(--color-text-muted)]" size={32} />
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">No listings found</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">
                  You don't have any existing listings yet.
                </p>
                <Button size="sm" onClick={handleCreateNew}>
                  Create New Listing
                </Button>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {listings.map((item) => {
                  const isSelected = selectedProductId === item.id;
                  const img = item.product_images?.[0]?.cdn_url || item.product_images?.[0]?.storage_url;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProductId(item.id)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all',
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                          {img ? (
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                              No Pic
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {item.title}
                          </p>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            ${Number(item.price).toLocaleString()}
                            {item.status === 'draft' && (
                              <span className="ml-2 rounded bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5">
                                Draft
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note/Message to Buyer */}
            <div className="mt-3">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Optional Note for Buyer
              </label>
              <textarea
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                placeholder="e.g. This home has a newly renovated kitchen and fits your exact budget..."
                rows={2}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-xs text-[var(--color-text-primary)] focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setMode('choice')}>
                Cancel
              </Button>
              <Button
                variant="brand"
                size="sm"
                disabled={!selectedProductId || submitMutation.isPending}
                loading={submitMutation.isPending}
                onClick={handleSubmitExisting}
              >
                Send Match Proposal
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
