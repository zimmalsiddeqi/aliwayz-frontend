import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Camera, Loader2, MapPin, Phone, Shield } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { updateProfileSchema } from '@lib/validators';
import UserService from '@api/services/user.service';
import AuthService from '@api/services/auth.service';
import { queryKeys } from '@lib/queryClient';
import useAuthStore from '@store/auth.store';
import Input from '@components/ui/Input';
import Textarea from '@components/ui/Textarea';
import Button from '@components/ui/Button';
import Avatar from '@components/ui/Avatar';
import { Card } from '@components/ui/Card';
import Separator from '@components/ui/Separator';
import PageHeader from '@components/common/PageHeader';
import { cn, getErrorMessage } from '@lib/utils';
import {
  setFormErrors,
  validateImageFile,
  createFilePreview,
  revokeFilePreview,
} from '@utils/helpers';
import toast from '@lib/toast';

export default function EditProfilePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [phoneStep, setPhoneStep]         = useState('idle');
  const [phoneOtp, setPhoneOtp]           = useState('');
  const [phoneNumber, setPhoneNumber]     = useState('');

  const {
    register, handleSubmit, setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver:     zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      username:  user?.username  || '',
      bio:       user?.bio       || '',
    },
  });

  // Avatar upload
  const avatarMutation = useMutation({
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

  const onDrop = useCallback(
    (files) => {
      const file = files[0];
      if (!file) return;
      const v = validateImageFile(file);
      if (!v.valid) { toast.error(v.error); return; }
      if (avatarPreview) revokeFilePreview(avatarPreview);
      setAvatarPreview(createFilePreview(file));
      setAvatarFile(file);
      avatarMutation.mutate(file);
    },
    [avatarPreview]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept:   { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize:  10 * 1024 * 1024,
  });

  // Update profile
  const profileMutation = useMutation({
    mutationFn: (data) => UserService.updateProfile(data),
    onSuccess:  (res) => {
      setUser(res.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success('Profile updated!');
      navigate('/profile');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setFormErrors(err, setError);
    },
  });

  // Phone verification
  const requestOtpMutation = useMutation({
    mutationFn: () =>
      AuthService.requestPhoneVerification({
        phone: phoneNumber,
      }),
    onSuccess: () => {
      setPhoneStep('otp');
      toast.success('OTP sent to your phone');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const confirmOtpMutation = useMutation({
    mutationFn: () =>
      AuthService.confirmPhoneVerification({
        phone: phoneNumber,
        otp:   phoneOtp,
      }),
    onSuccess: () => {
      setUser({ phone_verified: true, phone: phoneNumber });
      setPhoneStep('done');
      toast.success('Phone verified! ✅');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <Helmet>
        <title>Edit Profile — Aliwayz</title>
      </Helmet>

      <div className="container-app py-4 sm:py-6 max-w-lg pb-24 md:pb-8">
        <PageHeader showBack title="Edit Profile" />

        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Avatar upload */}
          <div className="flex justify-center">
            <div
              {...getRootProps()}
              className="relative cursor-pointer group"
            >
              <input {...getInputProps()} />
              <div className="relative">
                <Avatar
                  src={avatarPreview || user?.avatar_url}
                  name={user?.full_name || user?.username}
                  size="2xl"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarMutation.isPending ? (
                    <Loader2 size={24} className="text-white animate-spin" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </div>
              </div>
              <p
                className="text-xs text-center mt-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Tap to change photo
              </p>
            </div>
          </div>

          {/* Profile form */}
          <Card className="p-5">
            <h3
              className="font-semibold text-sm mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Basic Information
            </h3>
            <form
              onSubmit={handleSubmit((d) =>
                profileMutation.mutate(d)
              )}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Username"
                placeholder="johndoe"
                hint="Letters, numbers, and underscores only"
                error={errors.username?.message}
                {...register('username')}
              />
              <Textarea
                label="Bio"
                placeholder="Tell others about yourself..."
                maxLength={500}
                error={errors.bio?.message}
                {...register('bio')}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  isLoading={profileMutation.isPending}
                  loadingText="Saving..."
                  disabled={!isDirty}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Phone verification */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Phone
                size={16}
                style={{ color: 'var(--color-info)' }}
              />
              <h3
                className="font-semibold text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Phone Verification
              </h3>
              {user?.phone_verified ? (
                <span
                  className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor:
                      'rgba(16,185,129,0.1)',
                    color: 'var(--color-success)',
                  }}
                >
                  ✅ Verified
                </span>
              ) : (
                <span
                  className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor:
                      'rgba(245,158,11,0.1)',
                    color: 'var(--color-warning)',
                  }}
                >
                  Not verified
                </span>
              )}
            </div>

            {user?.phone_verified ? (
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Phone number verified. This helps
                unlock Verified Seller badge.
              </p>
            ) : phoneStep === 'idle' ? (
              <div className="space-y-3">
                <p
                  className="text-xs"
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Verify your phone to unlock the
                  Verified Seller badge and increase
                  trust with buyers.
                </p>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1234567890"
                  hint="E.164 format: +1234567890"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value)
                  }
                />
                <Button
                  fullWidth
                  variant="outline"
                  isLoading={requestOtpMutation.isPending}
                  loadingText="Sending OTP..."
                  disabled={!phoneNumber.trim()}
                  onClick={() =>
                    requestOtpMutation.mutate()
                  }
                >
                  Send OTP
                </Button>
              </div>
            ) : phoneStep === 'otp' ? (
              <div className="space-y-3">
                <p
                  className="text-xs"
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Enter the 6-digit OTP sent to{' '}
                  <strong>{phoneNumber}</strong>
                </p>
                <Input
                  label="OTP Code"
                  placeholder="123456"
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) =>
                    setPhoneOtp(e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setPhoneStep('idle')}
                  >
                    Back
                  </Button>
                  <Button
                    fullWidth
                    isLoading={
                      confirmOtpMutation.isPending
                    }
                    loadingText="Verifying..."
                    disabled={phoneOtp.length !== 6}
                    onClick={() =>
                      confirmOtpMutation.mutate()
                    }
                  >
                    Verify
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-success)' }}
                >
                  ✅ Phone verified successfully!
                </p>
              </div>
            )}
          </Card>

          {/* Account info */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield
                size={16}
                style={{ color: '#8B5CF6' }}
              />
              <h3
                className="font-semibold text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Account Security
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Email
                </span>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {user?.email}
                  </span>
                  {user?.email_verified ? (
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: 'var(--color-success)' }}
                    >
                      ✅
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: 'var(--color-warning)' }}
                    >
                      ⚠️ Unverified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Account Type
                </span>
                <span
                  className="capitalize"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Auth Provider
                </span>
                <span
                  className="capitalize"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {user?.auth_provider || 'Email'}
                </span>
              </div>
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="p-5">
            <h3
              className="font-semibold text-sm mb-3"
              style={{ color: 'var(--color-error)' }}
            >
              Danger Zone
            </h3>
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Once you delete your account, there is no
              going back. All your data will be
              permanently deleted.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    'Are you absolutely sure? This cannot be undone.'
                  )
                ) {
                  UserService.deleteAccount().then(
                    () => {
                      useAuthStore.getState().logout();
                    }
                  );
                }
              }}
            >
              Delete Account
            </Button>
          </Card>
        </motion.div>
      </div>
    </>
  );
}