'use client';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ 
  value, 
  prefix = '', 
  decimals = 2, 
  duration = 1500, 
  className = '' 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo function for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(easeProgress * endValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}
    </span>
  );
}
