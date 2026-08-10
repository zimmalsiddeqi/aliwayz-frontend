import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, ShoppingBag,
  Store, ArrowRight,
} from 'lucide-react';
import { registerSchema } from '@lib/validators';
import useAuth from '@hooks/useAuth';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Separator from '@components/ui/Separator';
import { cn } from '@lib/utils';
import { setFormErrors } from '@utils/helpers';

const ROLE_OPTIONS = [
  {
    value:       'buyer',
    label:       'Buyer',
    description: 'Browse and buy products locally',
    icon:        ShoppingBag,
    color:       'var(--color-brand)',
  },
  {
    value:       'seller',
    label:       'Seller',
    description: 'Create a store and sell products',
    icon:        Store,
    color:       '#8B5CF6',
  },
  {
    value:       'both',
    label:       'Both',
    description: 'Buy and sell on the marketplace',
    icon:        ArrowRight,
    color:       '#10B981',
  },
];

export default function RegisterPage() {
  const { signup } = useAuth();
  const [step, setStep]       = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver:     zodResolver(registerSchema),
    defaultValues: {
      email:     '',
      password:  '',
      username:  '',
      full_name: '',
      role:      '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signup(data);
    } catch (error) {
      setFormErrors(error, setError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="flex items-center gap-2.5 mb-6 lg:hidden justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand), #8B5CF6)',
              boxShadow:  'var(--shadow-brand)',
            }}
          >
            <span className="text-white text-lg font-bold">A</span>
          </div>
          <span className="text-xl font-bold text-gradient-brand">Aliwayz</span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {step === 1 ? 'How will you use Aliwayz?' : 'Create your account'}
        </h2>
        <p
          className="mt-1.5 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {step === 1
            ? 'Choose how you want to get started'
            : 'Fill in your details below'}
        </p>
      </div>

      {/* ── STEP 1: Role Selection ────────────────────────── */}
      {step === 1 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                {ROLE_OPTIONS.map((option) => {
                  const Icon     = option.icon;
                  const selected = field.value === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => field.onChange(option.value)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
                      style={{
                        backgroundColor: selected
                          ? `${option.color}12`
                          : 'var(--color-surface)',
                        border: `1px solid ${selected ? option.color : 'var(--color-border)'}`,
                        boxShadow: selected
                          ? `0 0 20px ${option.color}15`
                          : 'var(--shadow-xs)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${option.color}18`,
                          color:           option.color,
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="flex-1">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {option.label}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {option.description}
                        </p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor:     selected ? option.color : 'var(--color-border)',
                          backgroundColor: selected ? option.color : 'transparent',
                        }}
                      >
                        {selected && (
                          <motion.div
                            className="w-2 h-2 rounded-full bg-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          />

          {errors.role && (
            <p
              className="text-xs text-center"
              style={{ color: 'var(--color-error)' }}
            >
              Please select how you want to use Aliwayz
            </p>
          )}

          <Button
            fullWidth
            size="lg"
            disabled={!selectedRole}
            onClick={() => selectedRole && setStep(2)}
            rightIcon={<ArrowRight size={16} />}
          >
            Continue
          </Button>
        </motion.div>
      )}

      {/* ── STEP 2: Registration Form ────────────────────── */}
      {step === 2 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs font-medium flex items-center gap-1 hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Change role ({selectedRole})
          </button>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              error={errors.full_name?.message}
              autoFocus
              {...register('full_name')}
            />

            <Input
              label="Username"
              placeholder="johndoe"
              leftIcon={<span className="text-xs font-mono">@</span>}
              error={errors.username?.message}
              hint="Letters, numbers, and underscores only"
              {...register('username')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars with uppercase, number, special"
              leftIcon={<Lock size={16} />}
              showPasswordToggle
              error={errors.password?.message}
              autoComplete="new-password"
              {...register('password')}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Create account
            </Button>
          </form>

          <p
            className="text-xs text-center leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            By creating an account, you agree to our{' '}
            <span className="underline cursor-pointer">Terms</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </motion.div>
      )}

      {/* Login link */}
      <p
        className="text-sm text-center"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold hover:underline"
          style={{ color: 'var(--color-brand)' }}
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}