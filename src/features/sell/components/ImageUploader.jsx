import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@lib/utils';
import { validateImageFile, createFilePreview, revokeFilePreview } from '@utils/helpers';
import { MAX_PRODUCT_IMAGES } from '@utils/constants';
import toast from '@lib/toast';

export default function ImageUploader({ images = [], onChange }) {
  const onDrop = useCallback((files) => {
    const remaining = MAX_PRODUCT_IMAGES - images.length;
    for (const file of files.slice(0, remaining)) {
      const v = validateImageFile(file);
      if (!v.valid) { toast.error(v.error); continue; }
      onChange([...images, { file, preview: createFilePreview(file) }]);
    }
  }, [images, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
  });

  const remove = (index) => {
    revokeFilePreview(images[index].preview);
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="floating-label">Photos ({images.length}/{MAX_PRODUCT_IMAGES})</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <motion.div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ border: '1px solid var(--color-border)' }}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <img src={img.preview} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={12} />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-brand)] text-white font-bold">Cover</span>
            )}
          </motion.div>
        ))}
        {images.length < MAX_PRODUCT_IMAGES && (
          <div {...getRootProps()}
            className={cn('aspect-square rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200')}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--color-brand)' : 'var(--color-border)'}`,
              backgroundColor: isDragActive ? 'var(--color-brand-glow)' : 'var(--color-surface)',
            }}>
            <input {...getInputProps()} />
            <ImagePlus size={20} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Add Photo</span>
          </div>
        )}
      </div>
    </div>
  );
}