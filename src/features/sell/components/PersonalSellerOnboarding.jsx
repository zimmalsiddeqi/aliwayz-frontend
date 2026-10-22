import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Phone,
  Camera,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Navigation,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import UserService from '@api/services/user.service';
import StoreService from '@api/services/store.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import { CATEGORY_IDS } from '@utils/constants';
import { encodeStoreDescription, parseStoreMeta } from '@utils/sellerMeta';
import GoogleLocationPicker from '@components/common/GoogleLocationPicker';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Avatar from '@components/ui/Avatar';
import ImageCropperModal from '@components/modals/ImageCropperModal';
import { getErrorMessage } from '@lib/utils';
import toast from '@lib/toast';

export function isPersonalProfileComplete(user) {
  if (!user) return false;
  const hasName = Boolean((user.full_name || '').trim());
  const hasUsername = Boolean((user.username || '').trim());
  const hasCity = Boolean((user.location_city || '').trim());
  return hasName && hasUsername && hasCity;
}

export default function PersonalSellerOnboarding({
  user,
  existingStore,
  onBack,
  onComplete,
}) {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    location_city: user?.location_city || existingStore?.location_city || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const [coords, setCoords] = useState({
    lat: user?.location_lat || existingStore?.location_lat || null,
    lng: user?.location_lng || existingStore?.location_lng || null,
  });

  const storeMeta = parseStoreMeta(existingStore);
  const [addressVisibility, setAddressVisibility] = useState(
    storeMeta.addressVisibility || 'approximate'
  );

  const [errors, setErrors] = useState({});
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [cropperState, setCropperState] = useState({ open: false, file: null });

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropperState({ open: true, file });
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile, previewUrl) => {
    setCropperState({ open: false, file: null });
    setAvatarFile(croppedFile);
    setAvatarPreview(previewUrl || URL.createObjectURL(croppedFile));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location services are not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            '';
          const state = data?.address?.state || '';
          const formatted = [city, state].filter(Boolean).join(', ');
          if (formatted) {
            handleFieldChange('location_city', formatted);
            toast.success(`Location set to ${formatted}`);
          } else {
            toast.error('Could not determine city and state. Please enter manually.');
          }
        } catch {
          toast.error('Failed to detect location. Please enter your city and state.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error('Location permission denied. Please enter your city and state.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      nextErrors.full_name = 'Please enter your full name';
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      nextErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      nextErrors.username = 'Only letters, numbers, and underscores are allowed';
    }
    if (!formData.location_city.trim() || formData.location_city.trim().length < 2) {
      nextErrors.location_city = 'Please enter your city and state (e.g. Austin, TX)';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      let latestUser = user;

      // 1. Upgrade buyer role to 'both' so they can sell
      if (!user?.role || user.role === 'buyer') {
        try {
          const roleRes = await UserService.updateRole({ role: 'both' });
          const roleUser = roleRes?.data?.user || roleRes?.data || roleRes?.user;
          if (roleUser && typeof roleUser === 'object') {
            latestUser = { ...latestUser, ...roleUser, role: roleUser.role || 'both' };
            setUser(latestUser);
          } else {
            latestUser = { ...latestUser, role: 'both' };
            setUser({ role: 'both' });
          }
        } catch {
          latestUser = { ...latestUser, role: 'both' };
          setUser({ role: 'both' });
        }
      }

      // 2. Upload avatar if changed
      if (avatarFile) {
        try {
          const fd = new FormData();
          fd.append('file', avatarFile, avatarFile.name);
          const avatarRes = await UserService.uploadAvatar(fd);
          const uploadedUser = avatarRes?.data?.user || avatarRes?.data || avatarRes?.user;
          if (uploadedUser && typeof uploadedUser === 'object') {
            latestUser = { ...latestUser, ...uploadedUser };
            setUser(uploadedUser);
          }
        } catch {
          toast.error('Profile saved, but photo upload failed.');
        }
      }

      // 3. Update personal user profile
      const profilePayload = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim() || undefined,
      };

      const profileRes = await UserService.updateProfile(profilePayload);
      const profileUser = profileRes?.data?.user || profileRes?.data || profileRes?.user;
      const updatedUser = {
        ...latestUser,
        ...(profileUser && typeof profileUser === 'object' ? profileUser : profilePayload),
        location_city: formData.location_city.trim(),
        role: latestUser?.role === 'admin' ? 'admin' : 'both',
      };
      setUser(updatedUser);

      // 4. Update coordinates & city on user record
      try {
        await UserService.updateLocation({
          location_city: formData.location_city.trim(),
          location_lat: coords.lat || 0,
          location_lng: coords.lng || 0,
        });
      } catch {
        // Non-fatal
      }

      // 5. Ensure user has a store record for publishing listings without overwriting an existing Business store
      let activeStore = existingStore;
      if (!activeStore) {
        const rawName =
          formData.full_name.trim() || formData.username.trim() || 'Personal Seller';
        const safeStoreName =
          rawName.length >= 3 ? rawName.slice(0, 100) : `${rawName} Seller`;
        const description = encodeStoreDescription(
          formData.bio.trim() || 'Personal seller profile',
          {
            sellerType: 'personal',
            hasStorefront: false,
            addressVisibility: addressVisibility || 'approximate',
            businessPhone: formData.phone.trim() || undefined,
          }
        );

        const storePayload = {
          store_name: safeStoreName,
          category_id: CATEGORY_IDS.OTHER,
          description,
          location_city: formData.location_city.trim(),
          ...(coords.lat && coords.lng
            ? { location_lat: coords.lat, location_lng: coords.lng }
            : {}),
        };

        try {
          const storeRes = await StoreService.create(storePayload);
          activeStore = storeRes?.data?.store || storeRes?.data || storeRes?.store;
        } catch (createErr) {
          const myStoreRes = await StoreService.getMyStore().catch(() => null);
          const foundStore = myStoreRes?.data?.store || myStoreRes?.data;
          if (foundStore?.id) {
            activeStore = foundStore;
          } else {
            throw createErr;
          }
        }
      } else {
        // Only update the store if it's currently a quick or personal profile (never overwrite a business profile)
        const meta = parseStoreMeta(activeStore);
        if (!meta.isBusinessProfile) {
          const rawName =
            formData.full_name.trim() || activeStore.store_name || 'Personal Seller';
          const safeStoreName =
            rawName.length >= 3 ? rawName.slice(0, 100) : `${rawName} Seller`;
          const description = encodeStoreDescription(
            formData.bio.trim() || 'Personal seller profile',
            {
              sellerType: 'personal',
              hasStorefront: false,
              addressVisibility: addressVisibility || 'approximate',
              businessPhone: formData.phone.trim() || undefined,
            }
          );
          const storeRes = await StoreService.update(activeStore.id, {
            store_name: safeStoreName,
            description,
            location_city: formData.location_city.trim(),
            ...(coords.lat && coords.lng
              ? { location_lat: coords.lat, location_lng: coords.lng }
              : {}),
          });
          activeStore = storeRes?.data?.store || storeRes?.data || storeRes?.store || activeStore;
        }
      }

      if (user?.id) {
        localStorage.setItem(`aliwayz_personal_seller_ready_${user.id}`, 'true');
        if (!parseStoreMeta(activeStore).isBusinessProfile) {
          localStorage.setItem(`aliwayz_seller_mode_${user.id}`, 'personal');
        }
      }
      if (activeStore) {
        queryClient.setQueryData(['my-store', user?.id], activeStore);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-store'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() }),
      ]);
      toast.success('Personal seller profile ready!');
      onComplete?.({ user: updatedUser, store: activeStore });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto py-2"
    >
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(91, 110, 245, 0.12)',
            color: 'var(--color-brand)',
          }}
        >
          <User className="w-3.5 h-3.5" />
          Personal Seller
        </span>
      </div>

      <div
        className="rounded-3xl overflow-hidden border shadow-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Modern Aesthetic Header Banner + Avatar */}
        <div
          className="relative h-24 sm:h-28 border-b"
          style={{
            borderColor: 'var(--color-border)',
            background:
              'linear-gradient(135deg, rgba(91, 110, 245, 0.18) 0%, rgba(139, 92, 246, 0.14) 50%, rgba(16, 185, 129, 0.10) 100%)',
          }}
        />

        <div className="px-6 sm:px-8 pb-7">
          {/* Overlapping Avatar & Cleanly Positioned Title */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
            <div className="relative w-fit -mt-11 flex-shrink-0">
              <div
                className="rounded-2xl p-1.5 shadow-lg border"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <Avatar
                  src={avatarPreview}
                  name={formData.full_name || formData.username}
                  size="xl"
                />
              </div>
              <label
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-brand)',
                  color: '#ffffff',
                }}
                title="Upload profile photo"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 pt-1 sm:pt-3.5">
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Personal Seller Profile
              </h2>
              <p
                className="text-xs sm:text-sm mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Confirm your name and location so local buyers know who they&apos;re buying from.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Alex Morgan"
                leftIcon={<User size={16} />}
                value={formData.full_name}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                error={errors.full_name}
              />
              <Input
                label="Username *"
                placeholder="e.g. alexmorgan"
                value={formData.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                error={errors.username}
              />
            </div>

            {/* Google Location Map (Exact vs. Approximate) */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Seller Location &amp; Map *
              </label>
              <p
                className="text-xs mb-3"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Set where you sell from. Choose an approximate neighborhood area to protect your privacy, or set an exact location.
              </p>
              <GoogleLocationPicker
                value={{
                  lat: coords.lat,
                  lng: coords.lng,
                  locationCity: formData.location_city,
                  addressVisibility: addressVisibility,
                }}
                onChange={(loc) => {
                  setCoords({ lat: loc.lat, lng: loc.lng });
                  handleFieldChange('location_city', loc.locationCity || '');
                  setAddressVisibility(loc.addressVisibility);
                }}
                defaultVisibility="approximate"
                sellerType="individual"
              />
              {errors.location_city && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--color-danger)' }}>
                  {errors.location_city}
                </p>
              )}
            </div>

            {/* Optional Phone */}
            <Input
              label="Phone Number (Optional)"
              placeholder="e.g. (555) 234-5678"
              leftIcon={<Phone size={16} />}
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
            />

            {/* Short Bio */}
            <Textarea
              label="Short Bio (Optional)"
              placeholder="e.g. Local seller in Austin, TX. Fast responses!"
              rows={2}
              maxLength={300}
              showCount
              value={formData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
            />

            {/* Actions */}
            <div
              className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-2 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Button type="button" variant="secondary" onClick={onBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
                rightIcon={<ArrowRight size={16} />}
              >
                Save &amp; Continue
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ImageCropperModal
        isOpen={cropperState.open}
        file={cropperState.file}
        aspectRatio={1}
        shape="round"
        title="Crop Profile Photo"
        onClose={() => setCropperState({ open: false, file: null })}
        onCropComplete={handleCropComplete}
      />
    </motion.div>
  );
}
