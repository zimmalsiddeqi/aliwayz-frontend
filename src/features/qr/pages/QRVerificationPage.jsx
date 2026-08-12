import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ScanLine, RefreshCw, CheckCircle, Clock, X } from 'lucide-react';
import QRService from '@api/services/qr.service';
import ProductService from '@api/services/product.service';
import ChatService from '@api/services/chat.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import Button from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import { cn, formatPrice, getErrorMessage, isSeller, isBuyer } from '@lib/utils';
import { formatQRExpiry } from '@utils/formatters';
import toast from '@lib/toast';
import ReviewPanel from '../components/ReviewPanel';
import QRScanner from '../components/QRScanner';

export default function QRVerificationPage() {
  const { productId } = useParams();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const { user }  = useAuthStore();

  const [qrData, setQrData]       = useState(null);
  const [countdown, setCountdown] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [buyerId, setBuyerId]     = useState('');
  const [showReview, setShowReview] = useState(false);

  const userIsSeller = isSeller(user?.role);
  const userIsBuyer  = isBuyer(user?.role);

  // Product info
  const { data: productData } = useQuery({
    queryKey: queryKeys.products.byId(productId),
    queryFn:  () => ProductService.getById(productId),
    enabled:  !!productId,
  });

  const product = productData?.data;

  // QR status
  const { data: statusData } = useQuery({
    queryKey: queryKeys.qr.status(productId),
    queryFn:  () => QRService.getStatus(productId),
    enabled:  !!productId && userIsSeller,
    refetchInterval: 10000,
  });

  // Conversations for this product
  const { data: conversationsData } = useQuery({
    queryKey: ['product-conversations', productId],
    queryFn:  () => ChatService.getConversations({ page: 1, limit: 50 }),
    enabled:  userIsSeller,
  });

  const conversations = (conversationsData?.data || []).filter(
    (c) => c.products?.id === productId || c.product_id === productId
  );

  // Countdown timer
  useEffect(() => {
    if (!qrData?.expires_at) return;
    const interval = setInterval(() => {
      const remaining = formatQRExpiry(qrData.expires_at);
      setCountdown(remaining);
      if (remaining === 'Expired') {
        setQrData(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData?.expires_at]);

  // Generate QR
  const generateMutation = useMutation({
    mutationFn: (data) => QRService.generate(data),
    onSuccess:  (response) => {
      setQrData(response.data);
      toast.success('QR code generated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Scan QR
  const scanMutation = useMutation({
    mutationFn: (data) => QRService.scan({ ...data, product_id: productId }),
    onSuccess:  (response) => {
      setScanResult(response.data);
      qc.invalidateQueries({ queryKey: queryKeys.products.byId(productId) });
      toast.success('Sale completed! 🎉');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Cancel QR
  const cancelMutation = useMutation({
    mutationFn: () => QRService.cancel({ product_id: productId }),
    onSuccess:  () => {
      setQrData(null);
      toast.success('QR cancelled');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Regenerate
  const regenerateMutation = useMutation({
    mutationFn: (data) => QRService.regenerate(data),
    onSuccess:  (response) => {
      setQrData(response.data);
      toast.success('New QR generated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Sale complete view
  if (scanResult) {
    return (
      <div className="container-app py-6 max-w-md mx-auto">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Sale Complete!</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {scanResult.product?.title} — {formatPrice(scanResult.product?.price, scanResult.product?.currency)}
          </p>

          {!showReview ? (
            <div className="flex gap-3 mt-4">
              <Button fullWidth variant="outline" onClick={() => navigate('/')}>Go Home</Button>
              <Button fullWidth onClick={() => setShowReview(true)}>Leave Review</Button>
            </div>
          ) : (
            <ReviewPanel 
              sellerId={scanResult.product?.seller_id || product?.seller_id}
              productId={scanResult.product?.id || productId}
              onComplete={() => navigate('/')} 
            />
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>QR Verification — Aliwayz</title></Helmet>

      <div className="container-app py-6 max-w-lg mx-auto">
        <PageHeader showBack title="QR Verification" />

        {/* Product info */}
        {product && (
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                {product.product_images?.[0] ? (
                  <img src={product.product_images[0].cdn_url || product.product_images[0].storage_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><span className="text-xl">📦</span></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{product.title}</h3>
                <p className="text-lg font-bold text-gradient-brand">{formatPrice(product.price, product.currency)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* ── SELLER VIEW: Generate QR ────────────────────── */}
        {userIsSeller && product?.users?.id === user?.id && (
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {qrData ? (
              <div className="text-center space-y-4">
                <Card className="p-6 inline-block mx-auto">
                  <img src={qrData.qr_code} alt="QR Code" className="w-64 h-64 mx-auto rounded-xl" />
                </Card>

                <div className="flex items-center justify-center gap-2">
                  <Clock size={16} style={{ color: countdown === 'Expired' ? 'var(--color-error)' : 'var(--color-warning)' }} />
                  <span className="text-lg font-mono font-bold" style={{ color: countdown === 'Expired' ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                    {countdown}
                  </span>
                </div>

                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Show this QR code to the buyer to complete the sale
                </p>

                <div className="flex gap-3">
                  <Button variant="danger" fullWidth onClick={() => cancelMutation.mutate()} isLoading={cancelMutation.isPending}>
                    Cancel
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => regenerateMutation.mutate({ product_id: productId, buyer_id: buyerId })} isLoading={regenerateMutation.isPending} leftIcon={<RefreshCw size={14} />}>
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(91,110,245,0.1)' }}>
                    <QrCode size={32} style={{ color: 'var(--color-brand)' }} />
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Generate QR Code</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Select the buyer you agreed with
                  </p>
                </div>

                {conversations.length > 0 ? (
                  <div className="space-y-2">
                    <label className="floating-label">Select Buyer</label>
                    {conversations.map((conv) => {
                      const buyer = conv.buyer;
                      const selected = buyerId === buyer?.id;
                      return (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => setBuyerId(buyer?.id)}
                          className={cn('w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200')}
                          style={{
                            backgroundColor: selected ? 'var(--color-brand-glow)' : 'var(--color-surface)',
                            border: `1px solid ${selected ? 'var(--color-brand)' : 'var(--color-border)'}`,
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                            {buyer?.username?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            @{buyer?.username}
                          </span>
                        </button>
                      );
                    })}

                    <Button
                      fullWidth
                      size="lg"
                      disabled={!buyerId}
                      isLoading={generateMutation.isPending}
                      loadingText="Generating..."
                      onClick={() => generateMutation.mutate({ product_id: productId, buyer_id: buyerId })}
                      leftIcon={<QrCode size={18} />}
                    >
                      Generate QR Code
                    </Button>
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No conversations for this product yet. A buyer must message you first.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── BUYER VIEW: Scan QR ─────────────────────────── */}
        {userIsBuyer && product?.users?.id !== user?.id && (
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(91,110,245,0.1)' }}>
                <ScanLine size={32} style={{ color: 'var(--color-brand)' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Scan QR Code</h3>
              <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Ask the seller to show you the QR code, then paste the token below
              </p>
            </div>

            <div className="space-y-3">
              <QRScanner
                isLoading={scanMutation.isPending}
                onScan={(token) => {
                  if (!token) { toast.error('Invalid QR token'); return; }
                  scanMutation.mutate({ token });
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}