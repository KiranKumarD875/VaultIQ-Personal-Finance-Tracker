import React from 'react';
import { 
  Pizza, 
  Car, 
  Home, 
  ShoppingCart, 
  HeartPulse, 
  GraduationCap, 
  Film, 
  Gamepad2,
  Briefcase,
  Zap,
  Coffee,
  Plane,
  Smartphone,
  Gift,
  HelpCircle
} from 'lucide-react';

export const getCategoryIcon = (categoryName: string, size = 18, className = '') => {
  const name = categoryName.toLowerCase();
  const strokeWidth = 1.25;
  
  if (name.includes('food') || name.includes('dining') || name.includes('restaurant')) return <Pizza size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('transport') || name.includes('car') || name.includes('gas') || name.includes('fuel')) return <Car size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('hous') || name.includes('rent') || name.includes('mortgage')) return <Home size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('grocer') || name.includes('shop') || name.includes('retail')) return <ShoppingCart size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('health') || name.includes('medical') || name.includes('doctor')) return <HeartPulse size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('education') || name.includes('school') || name.includes('college')) return <GraduationCap size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('entertainment') || name.includes('movie')) return <Film size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('game') || name.includes('hobby')) return <Gamepad2 size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('work') || name.includes('business') || name.includes('office')) return <Briefcase size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('utilit') || name.includes('electric') || name.includes('water')) return <Zap size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('coffee') || name.includes('cafe')) return <Coffee size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('travel') || name.includes('flight') || name.includes('vacation')) return <Plane size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('phone') || name.includes('internet') || name.includes('mobile')) return <Smartphone size={size} strokeWidth={strokeWidth} className={className} />;
  if (name.includes('gift') || name.includes('donation')) return <Gift size={size} strokeWidth={strokeWidth} className={className} />;
  
  return <HelpCircle size={size} strokeWidth={strokeWidth} className={className} />;
};
