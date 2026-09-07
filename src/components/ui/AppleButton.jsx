import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@lib/utils';

/**
 * AppleButton
 *
 * Reusable Apple Sign-In button matched to the Aliwayz design system.
 */
const AppleButton = forwardRef(
  ({ className, isLoading, disabled, onClick, children = 'Continue with Apple', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={cn(
          'relative flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          'bg-black text-white hover:bg-neutral-900 border border-neutral-800 shadow-sm',
          (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin text-white" size={20} />
        ) : (
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 170 170"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.48-6.08-3.32-2.67-7.23-7.3-11.73-13.9-6.3-9.23-11.27-19.67-14.9-31.32-3.63-11.65-5.45-22.9-5.45-33.75 0-14.34 3.73-26.17 11.2-35.5 7.46-9.33 16.85-14.07 28.17-14.22 4.83 0 10.22 1.25 16.16 3.75 5.94 2.5 9.87 3.75 11.78 3.75 1.6 0 5.68-1.33 12.24-4 6.56-2.67 12.06-3.88 16.5-3.63 12.35.63 22.37 5.17 30.07 13.63-10.96 6.64-16.33 15.82-16.12 27.54.21 9.17 3.82 16.92 10.82 23.25 7 6.33 15.42 9.77 25.26 10.33-2.58 7.67-6.04 15.46-10.37 23.38zM119.22 31.85c0-7.25 2.67-14.27 8.01-21.06 5.34-6.79 11.96-10.79 19.86-12 0.58 7.37-2.02 14.44-7.8 21.21-5.78 6.77-12.44 10.63-19.98 11.58-.09-.59-.09-1.16-.09-1.73z"/>
          </svg>
        )}
        <span>{children}</span>
      </motion.button>
    );
  }
);

AppleButton.displayName = 'AppleButton';

export default AppleButton;
