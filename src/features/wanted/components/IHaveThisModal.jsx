import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Store,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  Search,
  Tag,
  DollarSign,
  MapPin,
  FileEdit,
  SlidersHorizontal,
} from 'lucide-react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import ProductService from '@api/services/product.service';
import StoreService from '@api/services/store.service';
import WantedService from '@api/services/wanted.service';
import useAuthStore from '@store/auth.store';
import useMyStore from '@hooks/useMyStore';
import toast from '@lib/toast';
import { cn } from '@lib/utils';

/**
 * Smart feature matcher: evaluates similarity across Price, Item/Keywords, and Location
 */
function evaluateMatchFeatures(item, request) {
  if (!item || !request) return { score: 0, badges: [] };

  const badges = [];

  // 1. ITEM / CATEGORY / KEYWORD MATCH
  const reqCat = (request.category || '').toLowerCase().replace(/\s+|_/g, '');
  const itemCatName = (item.categories?.name || '').toLowerCase().replace(/\s+|_/g, '');
  const itemCatSlug = (item.categories?.slug || '').toLowerCase().replace(/\s+|_/g, '');
  const reqTitle = (request.title || '').toLowerCase();
  const itemTitle = (item.title || '').toLowerCase();
  const reqItemType = (request.item_type || '').toLowerCase();

  const isCategoryMatch =
    (reqCat && (reqCat.includes(itemCatSlug) || itemCatSlug.includes(reqCat) || reqCat.includes(itemCatName) || itemCatName.includes(reqCat))) ||
    ((reqCat.includes('vehicle') || reqCat.includes('auto')) && (itemCatSlug.includes('vehicle') || itemCatSlug.includes('auto') || itemCatSlug.includes('car'))) ||
    ((reqCat.includes('real') || reqCat.includes('estate') || reqCat.includes('property')) && (itemCatSlug.includes('real') || itemCatSlug.includes('estate') || itemCatSlug.includes('property') || itemCatSlug.includes('housing')));

  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'for', 'with', 'and', 'or', 'to', 'of', 'at', 'by', 'from', 'is', 'i', 'need', 'want', 'looking', 'wanted']);
  const reqWords = `${reqTitle} ${reqItemType}`
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const itemWords = `${itemTitle} ${(item.description || '').toLowerCase()}`
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const matchedKeywords = reqWords.filter((w) => itemWords.some((iw) => iw.includes(w) || w.includes(iw)));
  const hasKeywordMatch = matchedKeywords.length > 0;

  if (isCategoryMatch || hasKeywordMatch) {
    const text = matchedKeywords.length > 0
      ? `Item: "${matchedKeywords.slice(0, 2).join(', ')}"`
      : `Category Match`;
    badges.push({ type: 'item', text, icon: Tag });
  }

  // 2. PRICE / BUDGET MATCH
  const bMin = Number(request.budget_min || 0);
  const bMax = Number(request.budget_max || 0);
  const pPrice = Number(item.price || 0);

  let isPriceMatch = false;
  let priceText = '';

  if (bMax > 0 && bMin > 0) {
    if (pPrice >= bMin * 0.75 && pPrice <= bMax * 1.25) {
      isPriceMatch = true;
      priceText = `Price $${pPrice.toLocaleString()} fits budget`;
    }
  } else if (bMax > 0) {
    if (pPrice <= bMax * 1.25) {
      isPriceMatch = true;
      priceText = `Price $${pPrice.toLocaleString()} fits budget`;
    }
  } else if (bMin > 0) {
    if (pPrice >= bMin * 0.75) {
      isPriceMatch = true;
      priceText = `Price $${pPrice.toLocaleString()} matches target`;
    }
  }

  if (isPriceMatch) {
    badges.push({ type: 'price', text: priceText, icon: DollarSign });
  }

  // 3. LOCATION MATCH
  const reqCity = (request.location_city || '').trim().toLowerCase();
  const itemCity = (item.location_city || '').trim().toLowerCase();
  const prefAreas = (Array.isArray(request.preferred_areas) ? request.preferred_areas : []).map((a) => a.toLowerCase());

  let isLocationMatch = false;
  let locationText = '';

  if (reqCity && itemCity) {
    const cleanReq = reqCity.split(',')[0].trim();
    const cleanItem = itemCity.split(',')[0].trim();
    if (cleanReq && cleanItem && (cleanReq.includes(cleanItem) || cleanItem.includes(cleanReq))) {
      isLocationMatch = true;
      locationText = `Location: ${item.location_city}`;
    }
  }

  if (!isLocationMatch && itemCity && prefAreas.length > 0) {
    if (prefAreas.some((area) => itemCity.includes(area) || area.includes(itemCity))) {
      isLocationMatch = true;
      locationText = `Area Match: ${item.location_city}`;
    }
  }

  if (isLocationMatch) {
    badges.push({ type: 'location', text: locationText, icon: MapPin });
  }

  return {
    score: badges.length,
    badges,
  };
}

export default function IHaveThisModal({ isOpen, onClose, request }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { store } = useMyStore();

  const [mode, setMode] = useState('choice'); // 'choice' | 'select_listing'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [sellerMessage, setSellerMessage] = useState('');
  const [informBuyer, setInformBuyer] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch user's direct listings
  const { data: userListingsRes, isLoading: loadingMyProducts } = useQuery({
    queryKey: ['my-listings-direct'],
    queryFn: () => ProductService.getMyListings({ limit: 100 }),
    enabled: isOpen && isAuthenticated,
  });

  // 2. Fallback / Merge with store products if store exists
  const { data: storeProductsRes, isLoading: loadingStoreProducts } = useQuery({
    queryKey: ['my-store-listings-for-match', store?.slug],
    queryFn: () =>
      StoreService.getProducts(store.slug, {
        page: 1,
        limit: 100,
        status: 'all',
      }),
    enabled: isOpen && isAuthenticated && !!store?.slug,
  });

  // Merge and deduplicate all listings
  const allListings = useMemo(() => {
    const listA = Array.isArray(userListingsRes?.data) ? userListingsRes.data : (Array.isArray(userListingsRes) ? userListingsRes : []);
    const listB = Array.isArray(storeProductsRes?.data) ? storeProductsRes.data : (Array.isArray(storeProductsRes) ? storeProductsRes : []);
    
    const combined = [...listA, ...listB];
    const seen = new Set();
    const unique = [];

    for (const item of combined) {
      if (item?.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  }, [userListingsRes, storeProductsRes]);

  const isLoading = loadingMyProducts && (loadingStoreProducts || !store?.slug);

  // Score and categorize listings
  const scoredListings = useMemo(() => {
    if (!allListings.length || !request) return [];

    return allListings.map((item) => {
      const matchResult = evaluateMatchFeatures(item, request);
      return {
        ...item,
        matchScore: matchResult.score,
        matchBadges: matchResult.badges,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [allListings, request]);

  // Filter listings based on user search query
  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return scoredListings;
    const q = searchQuery.toLowerCase();
    return scoredListings.filter((item) =>
      (item.title || '').toLowerCase().includes(q) ||
      (item.location_city || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q)
    );
  }, [scoredListings, searchQuery]);

  // Suggested matches (score >= 2 or score >= 1 if none >= 2)
  const suggestedMatches = useMemo(() => {
    const high = filteredListings.filter((item) => item.matchScore >= 2);
    if (high.length > 0) return high;
    return filteredListings.filter((item) => item.matchScore >= 1);
  }, [filteredListings]);

  const otherListings = useMemo(() => {
    const suggestedIds = new Set(suggestedMatches.map((s) => s.id));
    return filteredListings.filter((item) => !suggestedIds.has(item.id));
  }, [filteredListings, suggestedMatches]);

  // Auto-select the best matching listing upon entering select mode
  useEffect(() => {
    if (mode === 'select_listing' && !selectedProductId && scoredListings.length > 0) {
      const topMatch = scoredListings[0];
      if (topMatch) {
        setSelectedProductId(topMatch.id);
      }
    }
  }, [mode, selectedProductId, scoredListings]);

  const submitMutation = useMutation({
    mutationFn: (data) => WantedService.submitMatch(request.id, data),
    onSuccess: () => {
      toast.success(
        informBuyer
          ? 'Match proposal sent and buyer automatically notified! 🎯'
          : 'Match proposal submitted successfully!'
      );
      queryClient.invalidateQueries({ queryKey: ['wanted-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-wanted-requests'] });
      queryClient.invalidateQueries({ queryKey: ['wanted-request', request.id] });
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
    const mappedCategory =
      request.category === 'automotive' || request.category === 'vehicles'
        ? 'vehicles'
        : request.category === 'real_estate' || request.category === 'real-estate'
        ? 'real-estate'
        : 'essentials';

    const reIntent = request.intent === 'buy' ? 'sale' : (request.intent || 'sale');
    const extraParams = mappedCategory === 'real-estate' ? `&intent=${reIntent}&step=1` : '';

    navigate(`/sell/create?category=${mappedCategory}${extraParams}&wanted_request_id=${request.id}`, {
      state: {
        wantedRequestId: request.id,
        wantedTitle: request.title,
        buyerId: request.buyer_id,
        category: request.category,
        budget_min: request.budget_min,
        budget_max: request.budget_max,
        location_city: request.location_city,
      },
    });
  };

  const handleSubmitExisting = () => {
    if (!selectedProductId) {
      toast.error('Please select one of your listings');
      return;
    }
    submitMutation.mutate({
      product_id: selectedProductId,
      message: sellerMessage,
      inform_buyer: informBuyer,
    });
  };

  const selectedItem = scoredListings.find((i) => i.id === selectedProductId);

  const handleAutoFillNote = () => {
    if (!selectedItem) {
      toast.info('Select a listing first to auto-generate a note');
      return;
    }
    const loc = selectedItem.location_city ? ` in ${selectedItem.location_city}` : '';
    setSellerMessage(
      `Hi! I have "${selectedItem.title}"${loc} for $${Number(selectedItem.price || 0).toLocaleString()} that matches your request.`
    );
  };

  const renderListingRow = (item, isRecommended = false) => {
    const isSelected = selectedProductId === item.id;
    const img = item.product_images?.[0]?.thumbnail_cdn_url ||
      item.product_images?.[0]?.cdn_url ||
      item.product_images?.[0]?.storage_url;

    return (
      <div
        key={item.id}
        onClick={() => setSelectedProductId(item.id)}
        className={cn(
          'p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2',
          isSelected
            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/30'
            : isRecommended
            ? 'border-blue-200/80 bg-blue-50/30 hover:border-blue-400 dark:border-blue-900/40 dark:bg-blue-950/20'
            : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/70 dark:border-gray-700/70">
              {img ? (
                <img src={img} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                  No Pic
                </div>
              )}
            </div>
            <div className="truncate min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] truncate">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  ${Number(item.price || 0).toLocaleString()}
                </span>
                {item.location_city && (
                  <span className="text-[11px] text-[var(--color-text-muted)] truncate flex items-center gap-0.5">
                    <MapPin size={10} className="shrink-0" />
                    {item.location_city}
                  </span>
                )}
                {item.status === 'draft' && (
                  <span className="rounded bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 font-semibold">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {isSelected ? (
              <CheckCircle2 size={22} className="text-indigo-600 dark:text-indigo-400" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
            )}
          </div>
        </div>

        {/* Matched Criteria Badges (Price, Item, Location) */}
        {item.matchBadges && item.matchBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[var(--color-border)]/50">
            <span className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1',
              item.matchScore >= 3
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : item.matchScore === 2
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}>
              <Sparkles size={10} />
              {item.matchScore >= 3 ? '3/3 Features Match (Top Pick)' : `${item.matchScore}/3 Features Match`}
            </span>
            {item.matchBadges.map((badge, idx) => {
              const IconComp = badge.icon;
              return (
                <span
                  key={idx}
                  className="text-[10px] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-md border border-[var(--color-border)] flex items-center gap-1"
                >
                  <IconComp size={10} className="text-indigo-500" />
                  {badge.text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 sm:pb-4">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
              <span>I Have This — Match Proposal</span>
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              Matching for buyer: <span className="font-semibold text-[var(--color-text-primary)]">{request.title}</span>
              {request.budget_max > 0 && ` (Budget: up to $${Number(request.budget_max).toLocaleString()})`}
              {request.location_city && ` • ${request.location_city}`}
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
            <p className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
              How would you like to fulfill this buyer's request?
            </p>

            {/* Option 1: Use Existing Listing */}
            <div
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Please log in to select your listing');
                  navigate('/login');
                  return;
                }
                setMode('select_listing');
              }}
              className="group cursor-pointer rounded-2xl border-2 border-indigo-500/30 bg-indigo-50/50 p-4 transition-all hover:border-indigo-600 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-700/50 dark:hover:bg-indigo-950/40"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <Store size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-indigo-600">
                      Use Existing Listing
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      Smart Match Suggestion
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Pick an existing item from your inventory. We'll automatically suggest items that match the Price, Item, and Location!
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Create New Listing */}
            <div
              onClick={handleCreateNew}
              className="group cursor-pointer rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition-all hover:border-indigo-500 hover:bg-[var(--color-bg-secondary)]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-violet-600">
                    Create New Listing
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    List a new product or property. Once published, the buyer is automatically notified of your match proposal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Select Listing Step with Smart Matching */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-indigo-600" />
                Select Your Matching Listing
              </span>
              <button
                onClick={() => setMode('choice')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                &larr; Back to options
              </button>
            </div>

            {/* Search filter if user has multiple items */}
            {allListings.length > 4 && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter your inventory by title, city..."
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] pl-9 pr-3 py-1.5 text-xs text-[var(--color-text-primary)] focus:border-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Spinner size="md" />
                <span className="text-xs text-[var(--color-text-muted)]">Loading your listings & scoring matches...</span>
              </div>
            ) : allListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 sm:p-8 text-center bg-[var(--color-bg-card)]">
                <Building2 className="mx-auto mb-2 text-indigo-500" size={32} />
                <p className="text-sm font-bold text-[var(--color-text-primary)]">No listings found in your account</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4 max-w-sm mx-auto">
                  You don't have any listings yet. Create a new listing tailored for this buyer request now.
                </p>
                <Button size="sm" onClick={handleCreateNew} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  <PlusCircle size={15} className="mr-1.5" />
                  Create New Listing
                </Button>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {/* 1. Suggested Matches Section */}
                {suggestedMatches.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles size={12} />
                        Recommended Matches ({suggestedMatches.length})
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        Matched on Price, Item, or Location
                      </span>
                    </div>
                    <div className="space-y-2">
                      {suggestedMatches.map((item) => renderListingRow(item, true))}
                    </div>
                  </div>
                )}

                {/* 2. Other Listings Section */}
                {otherListings.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {suggestedMatches.length > 0 && (
                      <span className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                        All Other Listings ({otherListings.length})
                      </span>
                    )}
                    <div className="space-y-2">
                      {otherListings.map((item) => renderListingRow(item, false))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Note/Message to Buyer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Message for Buyer (Optional)
                </label>
                {selectedItem && (
                  <button
                    type="button"
                    onClick={handleAutoFillNote}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <FileEdit size={11} />
                    Auto-generate note
                  </button>
                )}
              </div>
              <textarea
                value={sellerMessage}
                onChange={(e) => setSellerMessage(e.target.value)}
                placeholder="e.g. This item is in excellent condition and fits your exact price and location..."
                rows={2}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] p-2.5 text-xs text-[var(--color-text-primary)] focus:border-indigo-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Inform Buyer Option */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={informBuyer}
                  onChange={(e) => setInformBuyer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                    Automatically inform buyer about matching product
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] block mt-0.5">
                    Sends an immediate notification to the buyer with your listing details, price, and note.
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <Button variant="ghost" size="sm" onClick={() => setMode('choice')}>
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!selectedProductId || submitMutation.isPending}
                  loading={submitMutation.isPending}
                  onClick={handleSubmitExisting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 shadow-md shadow-indigo-500/20"
                >
                  <Sparkles size={14} className="mr-1.5" />
                  {informBuyer ? 'Send Match & Inform Buyer' : 'Submit Match Proposal'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

