import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-gray-100 text-gray-700 hover:bg-gray-200': variant === 'secondary',
            'bg-danger text-white hover:bg-red-600': variant === 'danger',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
export default Button;