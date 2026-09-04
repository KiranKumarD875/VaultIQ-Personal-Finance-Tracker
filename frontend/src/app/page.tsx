import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 text-white px-4">
      <h1 className="text-5xl font-bold mb-4 text-center">💰 FinSight AI</h1>
      <p className="text-lg text-primary-50 mb-8 text-center max-w-xl">
        Your AI-powered financial assistant. Track spending, predict future expenses with
        Deep Learning, and catch overspending before it happens.
      </p>
      <div className="flex gap-4">
        <Link href="/register" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50">
          Get Started
        </Link>
        <Link href="/login" className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10">
          Login
        </Link>
      </div>
    </div>
  );
}