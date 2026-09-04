'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Receipt, Target, Wallet, LogOut, Lightbulb, Repeat, Activity, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/subscriptions', label: 'Subscriptions', icon: Repeat },
  { href: '/simulator', label: 'Simulator', icon: Activity },
  { href: '/tax', label: 'Tax Prep', icon: FileText },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col p-4 fixed left-0 top-0 shadow-xl z-50">
      <div className="mb-8 px-2 mt-4">
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl p-2 shadow-indigo-500/40 shadow-xl border border-indigo-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="12" cy="12" r="3"/><path d="M12 15v4"/></svg>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Vault</span><span className="text-indigo-400">IQ</span>
        </h1>
        {user && <p className="text-sm text-slate-400 mt-2 font-medium">{user.full_name}</p>}
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <span
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 font-semibold shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon strokeWidth={1.5} className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      >
        <LogOut strokeWidth={1.5} size={18} />
        Logout
      </button>
    </aside>
  );
}