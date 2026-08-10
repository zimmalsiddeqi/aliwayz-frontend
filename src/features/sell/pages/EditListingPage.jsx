import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X, Trash2, Save, Eye, EyeOff, Archive } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { updateProductSchema } from '@lib/validators';
import ProductService from '@api/services/product.service';
import CategoryService from '@api/services/category.service';
import { queryKeys } from '@lib/queryClient';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Select from '@components/ui/Select';
import Button from '@components/ui/Button';
import Spinner from '@components/ui/Spinner';
import Modal from '@components/ui/Modal';
import PageHeader from '@components/common/PageHeader';
import { cn, getErrorMessage } from '@lib/utils';
import { setFormErrors, validateImageFile, createFilePreview, revokeFilePreview, getAllImageUrls } from '@utils/helpers';
import { CONDITIONS, MAX_PRODUCT_IMAGES } from '@utils/constants';
import toast from '@lib/toast';
import ConfirmDeleteModal from '@components/modals/ConfirmDeleteModal';

export default function EditListingPage() {
const { id }      = useParams();
const navigate    = useNavigate();
const queryClient = useQueryClient();

const [existingImages, setExistingImages] = useState([]);
const [newImages, setNewImages]           = useState([]);
const [deletingImageId, setDeletingImageId] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showStatusModal, setShowStatusModal] = useState(false);
const [selectedStatus, setSelectedStatus]   = useState('');

const { data: productData, isLoading } = useQuery({
queryKey: queryKeys.products.byId(id),
queryFn:  () => ProductService.getById(id),
enabled:  !!id,
});

const product = productData?.data;

const { data: categories = [] } = useQuery({
queryKey: queryKeys.categories.flat(),
queryFn:  () => CategoryService.getFlat().then((r) => r.data),
});

useEffect(() => {
if (product?.product_images) {
setExistingImages(
product.product_images.map((img) => ({
id:         img.id,
url:        img.cdn_url || img.storage_url,
is_primary: img.is_primary,
isExisting: true,
}))
);
}
}, [product]);

const {
register,
handleSubmit,
setError,
formState: { errors, isDirty },
} = useForm({
resolver: zodResolver(updateProductSchema),
values:   product
? {
title:         product.title,
description:   product.description || '',
category_id:   product.categories?.id || '',
condition:     product.condition,
price:         product.price,
brand:         product.brand || '',
color:         product.color || '',
quantity:      product.quantity,
location_city: product.location_city || '',
}
: undefined,
});

const totalImages = existingImages.length + newImages.length;

const onDrop = useCallback(
(files) => {
const remaining = MAX_PRODUCT_IMAGES - totalImages;
for (const file of files.slice(0, remaining)) {
const v = validateImageFile(file);
if (!v.valid) {
toast.error(v.error);
continue;
}
setNewImages((prev) => [
...prev,
{ file, preview: createFilePreview(file) },
]);
}
},
[totalImages]
);

const { getRootProps, getInputProps, isDragActive } = useDropzone({
onDrop,
accept:   { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
maxSize:  10 * 1024 * 1024,
disabled: totalImages >= MAX_PRODUCT_IMAGES,
});

const removeNewImage = (index) => {
revokeFilePreview(newImages[index].preview);
setNewImages((prev) => prev.filter((_, i) => i !== index));
};

const deleteImageMutation = useMutation({
mutationFn: (imageId) => ProductService.deleteImage(id, imageId),
onSuccess:  (_, imageId) => {
setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
toast.success('Image removed');
setDeletingImageId(null);
},
onError: (err) => {
toast.error(getErrorMessage(err));
setDeletingImageId(null);
},
});

const uploadImagesMutation = useMutation({
mutationFn: async () => {
if (newImages.length === 0) return;
const formData = new FormData();
newImages.forEach((img) => formData.append('file', img.file, img.file.name));
return ProductService.uploadImages(id, formData);
},
onSuccess: () => {
newImages.forEach((img) => revokeFilePreview(img.preview));
setNewImages([]);
queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
toast.success('New images uploaded!');
},
onError: (err) => toast.error(getErrorMessage(err)),
});

const updateMutation = useMutation({
mutationFn: async (data) => {
await ProductService.update(id, data);
if (newImages.length > 0) {
const formData = new FormData();
newImages.forEach((img) => formData.append('file', img.file, img.file.name));
await ProductService.uploadImages(id, formData);
}
},
onSuccess: () => {
newImages.forEach((img) => revokeFilePreview(img.preview));
queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
queryClient.invalidateQueries({ queryKey: ['my-listings'] });
toast.success('Listing updated!');
navigate(`/product/${id}`);
},
onError: (err) => {
toast.error(getErrorMessage(err));
setFormErrors(err, setError);
},
});

const statusMutation = useMutation({
mutationFn: (status) => ProductService.updateStatus(id, { status }),
onSuccess:  () => {
queryClient.invalidateQueries({ queryKey: queryKeys.products.byId(id) });
queryClient.invalidateQueries({ queryKey: ['my-listings'] });
setShowStatusModal(false);
toast.success('Status updated!');
},
onError: (err) => toast.error(getErrorMessage(err)),
});

const deleteMutation = useMutation({
mutationFn: () => ProductService.delete(id),
onSuccess:  () => {
queryClient.invalidateQueries({ queryKey: ['my-listings'] });
toast.success('Listing deleted');
navigate('/sell/my-listings');
},
onError: (err) => toast.error(getErrorMessage(err)),
});

if (isLoading) {
return ( <div className="flex justify-center py-12"> <Spinner size="lg" /> </div>
);
}

if (!product) {
return ( <div className="text-center py-12">
<p style={{ color: 'var(--color-text-muted)' }}>Product not found</p> </div>
);
}

const STATUS_OPTIONS = [
{ value: 'available', label: 'Available', icon: Eye,     color: 'var(--color-success)', desc: 'Visible to everyone' },
{ value: 'hidden',    label: 'Hidden',    icon: EyeOff,  color: 'var(--color-warning)', desc: 'Only you can see it' },
{ value: 'draft',     label: 'Draft',     icon: Archive, color: 'var(--color-text-muted)', desc: 'Not published yet' },
];

return (
<> <Helmet> <title>Edit: {product.title} — Aliwayz</title> </Helmet>

  <div className="max-w-2xl mx-auto">
    <PageHeader
      showBack
      title="Edit Listing"
      rightAction={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowStatusModal(true)}>
            Status: {product.status}
          </Button>

          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      }
    />

    {/* FORM CONTENT SAME AS BEFORE */}

    {/* ── Status Modal ────────────────────────────────── */}
    <Modal
      isOpen={showStatusModal}
      onClose={() => setShowStatusModal(false)}
      title="Change Status"
      size="sm"
    >
      {/* SAME CONTENT */}
    </Modal>

    {/* ── Delete Confirmation with Countdown ──────────── */}
    <ConfirmDeleteModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={() => deleteMutation.mutate()}
      isLoading={deleteMutation.isPending}
      title="Delete this listing?"
      description="This will permanently remove this product listing and all its images. Buyers will no longer be able to find or purchase it."
      itemName={product?.title}
      itemType="Product"
      countdownSeconds={10}
    />
  </div>
</>
);
}
