import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Video, X } from 'lucide-react';
import { cn } from '@lib/utils';
import { validateVideoFile } from '@utils/helpers';
import toast from '@lib/toast';

export default function VideoUploader({ video, onChange }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const v = validateVideoFile(file);
    if (!v.valid) { toast.error(v.error); return; }
    setPreview(URL.createObjectURL(file));
    onChange(file);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  const remove = () => { setPreview(null); onChange(null); };

  return (
    <div className="space-y-2">
      <label className="floating-label">Video (optional, 1 max)</label>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <video src={preview} className="w-full max-h-48 object-contain" controls />
          <button type="button" onClick={remove} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div {...getRootProps()}
          className={cn('h-24 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all')}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--color-brand)' : 'var(--color-border)'}`,
            backgroundColor: 'var(--color-surface)',
          }}>
          <input {...getInputProps()} />
          <Video size={24} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Drop video or click to upload</span>
        </div>
      )}
    </div>
  );
}