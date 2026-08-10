import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import UserService from '@api/services/user.service';
import useAuthStore from '@store/auth.store';
import Avatar from '@components/ui/Avatar';
import { validateImageFile, createFilePreview, revokeFilePreview } from '@utils/helpers';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export default function AvatarUploader({ size = '2xl' }) {
  const { user, setUser } = useAuthStore();
  const [preview, setPreview] = useState(null);

  const mutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return UserService.uploadAvatar(formData);
    },
    onSuccess: (res) => {
      setUser({ avatar_url: res.data.avatar_url });
      toast.success('Avatar updated!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.valid) { toast.error(v.error); return; }
    if (preview) revokeFilePreview(preview);
    setPreview(createFilePreview(file));
    mutation.mutate(file);
  }, [preview]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()} className="relative cursor-pointer group inline-block">
      <input {...getInputProps()} />
      <Avatar src={preview || user?.avatar_url} name={user?.username} size={size} />
      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {mutation.isPending ? (
          <Loader2 size={22} className="text-white animate-spin" />
        ) : (
          <Camera size={22} className="text-white" />
        )}
      </div>
    </div>
  );
}