import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import WantedService from '@api/services/wanted.service';
import useAuthStore from '@store/auth.store';
import WantedNavTabs from '../components/WantedNavTabs';
import WizardProgressBar from '../components/wizard/WizardProgressBar';
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

  return (
    <>
      <Helmet>
        <title>Post a Wanted Request — Aliwayz</title>
      </Helmet>

      <WantedNavTabs />

      <div className="container-app py-4 sm:py-6 pb-24">
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
            <div className="mb-4">
              <WizardProgressBar currentStep={1} />
            </div>

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
