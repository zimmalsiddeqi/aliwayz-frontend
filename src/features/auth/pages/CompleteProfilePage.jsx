import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, MapPin, ShoppingBag, Store, ArrowRight } from 'lucide-react';
import { completeProfileSchema } from '@lib/validators';
import AuthService from '@api/services/auth.service';
import useAuthStore from '@store/auth.store';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { cn, getErrorMessage } from '@lib/utils';
import { setFormErrors } from '@utils/helpers';
import toast from '@lib/toast';

const ROLES = [
  { value: 'buyer',  label: 'Buyer',  icon: ShoppingBag, color: 'var(--color-brand)' },
  { value: 'seller', label: 'Seller', icon: Store,       color: '#8B5CF6' },
  { value: 'both',   label: 'Both',   icon: ArrowRight,  color: '#10B981' },
];

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const setUser  = useAuthStore((s) => s.setUser);

  const {
    register, handleSubmit, control, setError,
    formState: { errors },
  } = useForm({
    resolver:     zodResolver(completeProfileSchema),
    defaultValues: {
      username:      '',
      full_name:     '',
      role:          'buyer',
      location_city: '',
    },
  });

  const mutation = useMutation({
    mutationFn: AuthService.completeProfile,
    onSuccess:  (response) => {
      setUser(response.data.user);
      toast.success('Profile completed!');
      navigate('/');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setFormErrors(err, setError);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ backgroundColor: 'var(--color-bg)' }}>
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Complete your profile
          </h2>
          <p
            className="mt-1.5 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Set up your username and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
          <Input
            label="Username"
            placeholder="johndoe"
            leftIcon={<User size={16} />}
            hint="This is your unique handle"
            error={errors.username?.message}
            autoFocus
            {...register('username')}
          />

          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="City"
            placeholder="New York"
            leftIcon={<MapPin size={16} />}
            error={errors.location_city?.message}
            {...register('location_city')}
          />

          <div className="space-y-2">
            <label className="floating-label">I want to</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => {
                    const Icon     = r.icon;
                    const selected = field.value === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => field.onChange(r.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200',
                        )}
                        style={{
                          backgroundColor: selected ? `${r.color}12` : 'var(--color-surface)',
                          border: `1px solid ${selected ? r.color : 'var(--color-border)'}`,
                          color: selected ? r.color : 'var(--color-text-secondary)',
                        }}
                      >
                        <Icon size={18} />
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={mutation.isPending}
            loadingText="Saving..."
          >
            Complete setup
          </Button>
        </form>
      </motion.div>
    </div>
  );
}