import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;