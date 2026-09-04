'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PieChart, ShieldCheck, TrendingUp, Sparkles, LayoutDashboard } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-200">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm leading-none">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              VaultIQ
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/register" className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 relative overflow-hidden">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[600px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
        </div>

        {/* Hero Section */}
        <section className="px-6 max-w-5xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-8"
          >
            <Sparkles size={14} className="text-emerald-500" />
            <span>The New Standard in Personal Finance</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]"
          >
            Master your money. <br />
            <span className="text-emerald-600">Without the spreadsheets.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            VaultIQ gives you total clarity over your finances. Track spending, lock in budgets, and get AI-driven insights to grow your wealth—all in one beautiful dashboard.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md">
              Start for free
              <ArrowRight size={18} />
            </Link>
            <a href="#bento" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-medium text-base hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
              See how it works
            </a>
          </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section id="bento" className="px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 auto-rows-[320px]">
            
            {/* Main Feature - AI Chat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative group"
            >
              <div className="relative z-10 w-2/3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Sparkles size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">VaultMind AI Assistant</h3>
                <p className="text-slate-500 text-base leading-relaxed">
                  Stop doing math. Ask "Can I afford dinner tonight?" or "How much did I spend on groceries?" and get instant, accurate answers based on your actual data.
                </p>
              </div>
              
              {/* Fake UI Element */}
              <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-80 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-700">V</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-sm text-slate-700">
                    ✅ Yes, you can afford it! You have ₹4,200 remaining in your Safe to Spend balance.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature - FinScore */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-white">Your FinScore</h3>
                <p className="text-slate-400 text-sm">Real-time financial health scoring based on savings and spending habits.</p>
              </div>
              <div className="relative z-10 flex items-end gap-2 mt-auto">
                <div className="text-6xl font-bold text-white tracking-tighter">780</div>
                <div className="text-emerald-400 text-sm font-medium mb-2 flex items-center">
                  <TrendingUp size={16} className="mr-1" /> Excellent
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            </motion.div>

            {/* Feature - Locked Budgets */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <ShieldCheck size={20} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Locked-in Budgets</h3>
              <p className="text-slate-500 text-sm">
                Reserve funds for rent and bills automatically. You only see what's truly safe to spend.
              </p>
            </motion.div>

            {/* Feature - Dashboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden"
            >
              <LayoutDashboard size={32} className="text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-emerald-900">Crystal Clear Analytics</h3>
              <p className="text-emerald-700/80 text-base max-w-md mx-auto mb-6">
                Understand exactly where your money goes with beautiful, interactive charts and automatic categorization.
              </p>
              <Link href="/register" className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-emerald-700 transition-colors shadow-sm">
                Get Started Today
              </Link>
            </motion.div>

          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">V</div>
            <span>VaultIQ © {new Date().getFullYear()}. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}