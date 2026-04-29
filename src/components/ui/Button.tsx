'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:   'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-sm hover:shadow-md active:scale-[0.98]',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-300 active:scale-[0.98]',
      ghost:     'hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
      danger:    'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm active:scale-[0.98]',
      outline:   'border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-brand-300 active:scale-[0.98]',
    };

    const sizes = {
      sm:   'h-8 px-3 text-xs',
      md:   'h-10 px-4 text-sm',
      lg:   'h-12 px-6 text-base',
      icon: 'h-9 w-9 text-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
