'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function TopNav() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/transactions?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const getInitials = () => {
    if (!user || !user.full_name) return 'U';
    const parts = user.full_name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <form onSubmit={handleSearch} className="flex items-center text-slate-400">
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions, merchants..." 
          className="bg-transparent border-none focus:outline-none text-sm w-64 text-slate-700" 
        />
      </form>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/transactions?add=true')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Quick Add
        </button>
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm" title={user?.full_name || 'User Profile'}>
          {getInitials()}
        </div>
      </div>
    </header>
  );
}
