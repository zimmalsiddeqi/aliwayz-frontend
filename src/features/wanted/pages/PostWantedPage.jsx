import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, X } from 'lucide-react';
import WantedService from '@api/services/wanted.service';
import useAuthStore from '@store/auth.store';
import WantedNavTabs from '../components/WantedNavTabs';
import CategorySelectorStep from '../components/wizard/CategorySelectorStep';
import RealEstateWizard from '../components/wizard/RealEstateWizard';
import AutomotiveWizard from '../components/wizard/AutomotiveWizard';
import MarketplaceWizard from '../components/wizard/MarketplaceWizard';
import WantedSuccessStep from '../components/wizard/WantedSuccessStep';
import toast from '@lib/toast';

export default function PostWantedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to post a wanted request');
      navigate('/login?redirect=/wanted/create', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'real_estate');
  const [isCategoryChosen, setIsCategoryChosen] = useState(!!categoryParam);
  const [createdRequest, setCreatedRequest] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => WantedService.create(data),
    onSuccess: (res) => {
      const newReq = res?.data || res;
      setCreatedRequest(newReq);
      queryClient.invalidateQueries({ queryKey: ['wanted-home-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-wanted-requests'] });
      queryClient.invalidateQueries({ queryKey: ['wanted-feed-requests'] });
      toast.success('Your wanted request is now live!');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create wanted request';
      toast.error(msg);
    },
  });

  const handleFormSubmit = (formData) => {
    if (!isAuthenticated) {
      toast.error('Please log in or sign up to post a request');
      navigate('/login?redirect=/wanted/create');
      return;
    }
    createMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Helmet>
        <title>Post a Wanted Request — Aliwayz</title>
      </Helmet>

      {/* Desktop header navigation only - hidden on mobile view to give full screen space */}
      <div className="hidden md:block">
        <WantedNavTabs />
      </div>

      {/* Mobile-only compact wizard header with clean back/cancel action */}
      <div className="md:hidden sticky top-14 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => {
            if (isCategoryChosen) {
              setIsCategoryChosen(false);
            } else {
              navigate('/wanted');
            }
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          <span>{isCategoryChosen ? 'Back' : 'Wanted'}</span>
        </button>
        <span className="text-xs font-black text-[var(--color-text-primary)]">
          Post Wanted
        </span>
        <button
          onClick={() => navigate('/wanted')}
          className="p-1 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg"
          title="Cancel"
        >
          <X size={17} />
        </button>
      </div>

      <div className="container-app py-3 sm:py-6 pb-24">
        {createdRequest ? (
          <WantedSuccessStep
            createdRequest={createdRequest}
            onReset={() => {
              setCreatedRequest(null);
              setIsCategoryChosen(false);
            }}
          />
        ) : !isCategoryChosen ? (
          <CategorySelectorStep
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onNext={() => {
              setSearchParams({ category: selectedCategory });
              setIsCategoryChosen(true);
            }}
          />
        ) : (
          <div>
            {selectedCategory === 'real_estate' ? (
              <RealEstateWizard
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending}
                onBackToCategory={() => setIsCategoryChosen(false)}
              />
            ) : selectedCategory === 'automotive' ? (
              <AutomotiveWizard
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending}
                onBackToCategory={() => setIsCategoryChosen(false)}
              />
            ) : (
              <MarketplaceWizard
                category={selectedCategory}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending}
                onBackToCategory={() => setIsCategoryChosen(false)}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
