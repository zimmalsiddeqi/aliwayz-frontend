import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import { formatPrice } from '@utils/formatters';

export default function SaleCompleteCard({ product, transactionId }) {
  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
           style={{ background: 'rgba(16,185,129,0.15)' }}>
        <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
      </div>

      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Sale Complete! 🎉
        </h2>
        {product && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {product.title} — {formatPrice(product.price, product.currency)}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Link to="/" className="flex-1">
          <Button variant="outline" fullWidth>Go Home</Button>
        </Link>
        <Link to="/inbox" className="flex-1">
          <Button fullWidth>Leave a Review</Button>
        </Link>
      </div>
    </motion.div>
  );
}