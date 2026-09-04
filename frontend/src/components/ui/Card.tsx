import { ReactNode } from 'react';
import clsx from 'clsx';

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 p-6', className)}>
      {children}
    </div>
  );
}