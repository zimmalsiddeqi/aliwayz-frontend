import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Star, Trash2 } from 'lucide-react';
import AdminService from '@api/services/admin.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import BadgeUI from '@components/ui/Badge';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import PageHeader from '@components/common/PageHeader';
import EmptyState from '@components/common/EmptyState';
import useDebounce from '@hooks/useDebounce';
import usePagination from '@hooks/usePagination';
import { formatPrice } from '@utils/formatters';
import { getErrorMessage, getStatusColor, cn } from '@lib/utils';
import toast from '@lib/toast';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const ds = useDebounce(search, 300);
  const { page, limit, nextPage, prevPage } = usePagination(1, 20);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.products({ search: ds, page, limit }),
    queryFn:  () => AdminService.getProducts({ search: ds, page, limit }),
  });

  const products   = data?.data || [];
  const pagination = data?.pagination;

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => AdminService.featureProduct(id, { is_featured: featured }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Updated'); },
    onError:    (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => AdminService.deleteProduct(id, { reason: 'Admin removal' }),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Product deleted'); },
    onError:    (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Helmet><title>Products — Admin</title></Helmet>
      <PageHeader title="Products" subtitle={`${pagination?.total || 0} total`} />
      <div className="mb-6">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={16} />} />
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : products.length === 0 ? <EmptyState icon="📦" title="No products" /> : (
        <div className="space-y-2">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{p.title}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize', getStatusColor(p.status))}>{p.status}</span>
                      {p.is_featured && <BadgeUI size="xs" variant="brand">⭐</BadgeUI>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {formatPrice(p.price, p.currency)} · by @{p.users?.username}
                    </p>
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => featureMutation.mutate({ id: p.id, featured: !p.is_featured })} title="Toggle feature">
                    <Star size={14} fill={p.is_featured ? 'var(--color-warning)' : 'none'} style={{ color: 'var(--color-warning)' }} />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }}>
                    <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          {pagination?.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" disabled={!pagination.has_prev} onClick={prevPage}>Previous</Button>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{pagination.page}/{pagination.total_pages}</span>
              <Button variant="outline" size="sm" disabled={!pagination.has_next} onClick={nextPage}>Next</Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}