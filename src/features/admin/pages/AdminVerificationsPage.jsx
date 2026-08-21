import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, X, Eye, ThumbsUp, ThumbsDown, 
  Clock, ShieldAlert, Calendar, Mail, FileText, 
  MapPin, Check, AlertOctagon, User, CheckCircle,
  ExternalLink, Maximize2, Shield, AlertTriangle, Camera,
  RefreshCw
} from 'lucide-react';
import AdminService from '@api/services/admin.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import useDebounce from '@hooks/useDebounce';
import { cn, getErrorMessage } from '@lib/utils';
import { formatDate } from '@utils/formatters';
import toast from '@lib/toast';

export default function AdminVerificationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [reviewAction, setReviewAction] = useState(null); // 'approved' | 'rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const debouncedSearch = useDebounce(search, 300);
  const limit = 20;

  // Fetch verification requests
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.admin.verifications({
      status: statusFilter,
      search: debouncedSearch,
      page,
      limit,
    }),
    queryFn: () =>
      AdminService.getVerifications({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
        page,
        limit,
      }),
  });

  const submissions = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const pagination = data?.pagination;

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason, notes }) =>
      AdminService.reviewVerification(id, {
        status,
        rejection_reason,
        notes,
      }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      toast.success(`Seller verification request successfully ${status}! 🎉`);
      setSelectedVerif(null);
      setReviewAction(null);
      setRejectionReason('');
      setReviewNotes('');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleReviewSubmit = (status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please specify a rejection reason for the seller.');
      return;
    }
    reviewMutation.mutate({
      id: selectedVerif.id,
      status,
      rejection_reason: status === 'rejected' ? rejectionReason : null,
      notes: reviewNotes || null,
    });
  };

  const filterTabs = [
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Seller Verification Queue — Admin Panel</title>
      </Helmet>

      <PageHeader 
        title="Seller Identity Moderation" 
        subtitle="Review identity documents (CNIC/ID/Passport) and liveness selfies to approve or reject seller applications."
        rightAction={
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            Refresh Queue
          </Button>
        }
      />

      {/* Top Filter & Search Controls */}
      <Card variant="glass" className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'hover:bg-[var(--glass-bg-strong)] text-theme-secondary border border-transparent'
                }`}
                style={{
                  backgroundColor: !isActive ? 'var(--color-bg-secondary)' : undefined,
                  borderColor: !isActive ? 'var(--color-border)' : undefined,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Search seller by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </Card>

      {/* Error state alert */}
      {isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-500 flex items-start gap-3">
          <ShieldAlert size={20} className="flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Failed to Load Seller Verifications</h4>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {getErrorMessage(error) || 'An error occurred while communicating with the moderation service.'}
            </p>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Queue Table */}
      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !isError && submissions.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={48} className="text-theme-muted" />}
          title="No verification requests found"
          description={`There are currently no seller verification submissions matching "${statusFilter}".`}
        />
      ) : !isError && (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <th className="p-4">Seller Applicant</th>
                <th className="p-4">Submission Date</th>
                <th className="p-4">ID / CNIC Type</th>
                <th className="p-4 text-center">Attempt</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr 
                  key={sub.id} 
                  className="border-b transition-colors text-sm hover:bg-[var(--glass-bg-strong)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 font-bold text-xs uppercase">
                        {sub.users?.username?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-theme-primary">{sub.users?.username || 'Unknown Seller'}</span>
                        <span className="text-xs text-theme-muted">{sub.users?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs">{formatDate(sub.submitted_at)}</td>
                  <td className="p-4 text-xs font-medium capitalize">
                    {sub.id_type === 'drivers_license' ? "Driver's License" : sub.id_type?.replace('_', ' ')}
                  </td>
                  <td className="p-4 text-center text-xs font-semibold">#{sub.attempt_number}</td>
                  <td className="p-4">
                    {sub.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <Clock size={12} />
                        Pending Review
                      </span>
                    )}
                    {sub.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <CheckCircle size={12} />
                        Approved
                      </span>
                    )}
                    {sub.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-red-500/10 text-red-500 border-red-500/20">
                        <ShieldAlert size={12} />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={sub.status === 'pending' ? 'brand' : 'outline'}
                        leftIcon={<Eye size={14} />}
                        onClick={() => setSelectedVerif(sub)}
                      >
                        {sub.status === 'pending' ? 'Review & Verify' : 'View Details'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Comprehensive Moderation Modal */}
      <Modal
        isOpen={!!selectedVerif}
        onClose={() => {
          setSelectedVerif(null);
          setReviewAction(null);
          setRejectionReason('');
          setReviewNotes('');
        }}
        title="Seller Identity Verification Review"
        size="xl"
      >
        {selectedVerif && (
          <div className="space-y-6 p-4 max-h-[82vh] overflow-y-auto">
            {/* Duplicate hash security alert */}
            {selectedVerif.verification_metadata?.duplicate_detected && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 flex gap-3 text-red-500 text-xs">
                <AlertOctagon size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider">Duplicate Document Fingerprint Warning</p>
                  <p className="mt-0.5 text-theme-secondary">
                    The SHA-256 hash of this identity document matches an already approved seller profile in the system.
                  </p>
                </div>
              </div>
            )}

            {/* Applicant Details Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border text-xs" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <span className="text-[10px] font-bold uppercase text-theme-muted">Seller Username</span>
                <p className="font-bold text-sm text-theme-primary mt-0.5">{selectedVerif.users?.username}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-theme-muted">Submission Date</span>
                <p className="font-semibold text-theme-primary mt-0.5">{formatDate(selectedVerif.submitted_at)}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-theme-muted">Document Type</span>
                <p className="font-semibold text-theme-primary mt-0.5 capitalize">{selectedVerif.id_type?.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-theme-muted">Expiration Date</span>
                <p className="font-semibold text-theme-primary mt-0.5">{selectedVerif.document_expiration_date}</p>
              </div>
            </div>

            {/* Side-by-side Document & Selfie Inspection Panels */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-theme-primary">Identity Document & Selfie Comparison</h4>
                <span className="text-[11px] text-theme-muted">Click image to enlarge</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Government ID Photo */}
                <div className="space-y-2 border rounded-xl p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                      <FileText size={14} className="text-brand-500" />
                      Government ID / CNIC (Front)
                    </span>
                    <a 
                      href={selectedVerif.id_front_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Fullsize
                    </a>
                  </div>
                  <div 
                    onClick={() => setPreviewImage(selectedVerif.id_front_url)}
                    className="relative rounded-lg overflow-hidden aspect-video border cursor-pointer group bg-black/20 flex items-center justify-center"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <img src={selectedVerif.id_front_url} className="h-full w-full object-cover" alt="ID Front" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-xs font-medium gap-1">
                      <Maximize2 size={16} /> Click to Enlarge
                    </div>
                  </div>
                </div>

                {/* Live Selfie Portrait */}
                <div className="space-y-2 border rounded-xl p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                      <Camera size={14} className="text-brand-500" />
                      Live Selfie Photo
                    </span>
                    <a 
                      href={selectedVerif.selfie_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Fullsize
                    </a>
                  </div>
                  <div 
                    onClick={() => setPreviewImage(selectedVerif.selfie_url)}
                    className="relative rounded-lg overflow-hidden aspect-square max-h-[180px] mx-auto border cursor-pointer group bg-black/20 flex items-center justify-center"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <img src={selectedVerif.selfie_url} className="h-full w-full object-cover" alt="Selfie" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-xs font-medium gap-1">
                      <Maximize2 size={16} /> Click to Enlarge
                    </div>
                  </div>
                </div>

                {/* Back ID Photo if uploaded */}
                {selectedVerif.id_back_url && (
                  <div className="space-y-2 border rounded-xl p-3 md:col-span-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                        <FileText size={14} className="text-brand-500" />
                        Government ID / CNIC (Back Side)
                      </span>
                      <a 
                        href={selectedVerif.id_back_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Fullsize
                      </a>
                    </div>
                    <div 
                      onClick={() => setPreviewImage(selectedVerif.id_back_url)}
                      className="relative rounded-lg overflow-hidden aspect-video max-h-[160px] border cursor-pointer group bg-black/20 flex items-center justify-center"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <img src={selectedVerif.id_back_url} className="h-full w-full object-cover" alt="ID Back" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-xs font-medium gap-1">
                        <Maximize2 size={16} /> Click to Enlarge
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Moderation Decision Form */}
            {selectedVerif.status === 'pending' ? (
              reviewAction ? (
                <div className="border-t pt-4 space-y-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold capitalize text-theme-primary">
                      Confirm Verification {reviewAction}
                    </h4>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      reviewAction === 'approved' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                    }`}>
                      {reviewAction}
                    </span>
                  </div>
                  
                  {reviewAction === 'rejected' && (
                    <Input
                      label="Rejection Reason (Visible to Seller)"
                      placeholder="Specify reason (e.g. ID photo blurry, details do not match selfie)"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      error={rejectionReason.trim() === '' ? 'Rejection reason is required' : null}
                    />
                  )}

                  <Input
                    label="Internal Moderator Notes (Optional)"
                    placeholder="Internal audit notes for compliance logs"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" onClick={() => setReviewAction(null)} disabled={reviewMutation.isPending}>
                      Cancel
                    </Button>
                    <Button 
                      variant={reviewAction === 'approved' ? 'brand' : 'danger'}
                      onClick={() => handleReviewSubmit(reviewAction)}
                      isLoading={reviewMutation.isPending}
                      loadingText="Processing..."
                    >
                      Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4 flex flex-col sm:flex-row gap-3 justify-end items-center" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-xs text-theme-muted mr-auto">
                    Action will update seller status and promote any drafted store profiles.
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      variant="danger"
                      fullWidth
                      leftIcon={<ThumbsDown size={16} />} 
                      onClick={() => setReviewAction('rejected')}
                    >
                      Reject Request
                    </Button>
                    <Button 
                      variant="brand"
                      fullWidth
                      leftIcon={<ThumbsUp size={16} />} 
                      onClick={() => setReviewAction('approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Approve & Verify
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="border-t pt-4 flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-theme-secondary">Current Status: <strong className="capitalize text-theme-primary">{selectedVerif.status}</strong></span>
                {selectedVerif.rejection_reason && (
                  <span className="text-red-500 font-medium">Rejection Reason: {selectedVerif.rejection_reason}</span>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Image Preview Lightbox */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Document Preview"
        size="lg"
      >
        {previewImage && (
          <div className="p-2 flex items-center justify-center bg-black/80 rounded-2xl overflow-hidden min-h-[300px]">
            <img src={previewImage} className="max-h-[70vh] w-auto object-contain rounded-xl" alt="Enlarged Document" />
          </div>
        )}
      </Modal>
    </div>
  );
}
