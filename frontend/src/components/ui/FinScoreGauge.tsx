'use client';
import { motion } from 'framer-motion';

interface FinScoreProps {
  score: number; // 0 to 1000
}

export default function FinScoreGauge({ score }: FinScoreProps) {
  // Determine color and status based on score
  let color = 'text-success';
  let strokeColor = '#10b981'; // emerald-500
  let status = 'Excellent';
  let message = "Your financial health is outstanding.";

  if (score < 400) {
    color = 'text-danger';
    strokeColor = '#ef4444'; // red-500
    status = 'Critical';
    message = "You are overspending. Time to review your budget.";
  } else if (score < 700) {
    color = 'text-warning';
    strokeColor = '#f59e0b'; // amber-500
    status = 'Fair';
    message = "You're doing okay, but there is room for improvement.";
  }

  // Calculate SVG stroke dasharray (circle circumference is 2 * pi * r)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // We only want a half circle (gauge), so we use 180 degrees
  const offset = circumference - (score / 1000) * (circumference / 2);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-24 overflow-hidden flex justify-center items-end">
        {/* Background Track (Half Circle) */}
        <svg className="absolute w-48 h-48 transform -rotate-180" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference / 2}
            strokeLinecap="round"
          />
          {/* Animated Value Track */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset + (circumference / 2) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <span className={`text-4xl font-black ${color}`}>{score}</span>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">FinScore</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <h4 className={`font-bold ${color}`}>{status}</h4>
        <p className="text-sm text-gray-500 mt-1 max-w-[200px]">{message}</p>
      </div>
    </div>
  );
}
