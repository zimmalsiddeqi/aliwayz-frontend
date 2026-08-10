import { Link } from 'react-router-dom';
import { QrCode, ScanLine } from 'lucide-react';
import Button from '@components/ui/Button';
import useAuthStore from '@store/auth.store';
import { isSeller } from '@lib/utils';

export default function QRActionBar({ conversation }) {
  const { user } = useAuthStore();
  const isSellerUser = isSeller(user?.role) && conversation?.seller_id === user?.id;
  const isBuyerUser  = !isSellerUser && conversation?.buyer_id === user?.id;
  const product      = conversation?.products;

  if (!product || product.status === 'sold') return null;

  return (
    <div className="px-4 py-2 flex gap-2"
         style={{ borderTop: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--glass-bg)' }}>
      {isSellerUser && (
        <Link to={`/qr/${product.id}`} className="flex-1">
          <Button variant="brand" size="sm" fullWidth leftIcon={<QrCode size={14} />}>
            Generate QR
          </Button>
        </Link>
      )}
      {isBuyerUser && (
        <Link to={`/qr/${product.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth leftIcon={<ScanLine size={14} />}>
            Scan QR
          </Button>
        </Link>
      )}
    </div>
  );
}