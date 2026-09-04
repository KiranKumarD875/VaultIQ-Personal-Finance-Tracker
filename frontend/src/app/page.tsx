'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, LineChart, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-white text-lg leading-none">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              VaultIQ
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
          >
            <Bot size={16} />
            <span>VaultMind AI Engine 2.0 Now Live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8"
          >
            Smarter Finance, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Zero Effort.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            VaultIQ is your AI-powered financial brain. Automatically track spending, manage dynamic budgets, and chat with VaultMind to make precise financial decisions in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5">
              Start Building Wealth
              <ArrowRight size={20} />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all">
              See How It Works
            </a>
          </motion.div>
        </section>

        {/* Feature Cards Showcase */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm hover:bg-slate-900 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">VaultMind Assistant</h3>
              <p className="text-slate-400 leading-relaxed">
                Chat naturally with your data. Ask "Can I afford this?" or "Am I over budget?" and get instant, math-backed answers.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm hover:bg-slate-900 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
                <LineChart size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time FinScore</h3>
              <p className="text-slate-400 leading-relaxed">
                Watch your financial health improve in real-time. We calculate a dynamic score based on your savings, expenses, and safety buffer.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm hover:bg-slate-900 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Locked-In Budgets</h3>
              <p className="text-slate-400 leading-relaxed">
                Never accidentally spend rent money again. VaultIQ automatically isolates committed funds so you only see what's truly safe to spend.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mini Preview Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto bg-gradient-to-b from-slate-800/80 to-slate-900/80 p-1 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="bg-slate-950 rounded-[22px] p-8 md:p-12 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
              <Zap className="text-emerald-400 mb-6 w-12 h-12" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to take control?</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join users who are already saving thousands by letting VaultIQ handle the complex math of personal finance.
              </p>
              <Link href="/register" className="bg-white text-slate-950 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 mt-auto bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white">VaultIQ</span> © {new Date().getFullYear()}
          </div>
          <div className="text-sm text-slate-500">
            Powered by Render & Vercel
          </div>
        </div>
      </footer>
    </div>
  );
}