import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#eab308',
      },
    },
  },
  plugins: [],
};
export default config;