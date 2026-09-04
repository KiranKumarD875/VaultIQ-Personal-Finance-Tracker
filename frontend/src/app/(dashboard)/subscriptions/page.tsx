'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import { RecurringSubscription } from '@/types';
import { RefreshCw, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { addDays, format, isPast, isToday } from 'date-fns';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/predictions/recurring');
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    // Convert frequency to monthly estimate
    const monthlyMultiplier = 30 / sub.frequency_days;
    return sum + (sub.avg_amount * monthlyMultiplier);
  }, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Automated Subscription Auditor</h1>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Run AI Audit
        </button>
      </div>

      <div className="mb-8">
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Estimated Monthly Cost</p>
              <h2 className="text-4xl font-bold mt-2 text-danger">₹{totalMonthly.toFixed(2)}</h2>
              <p className="text-gray-400 text-sm mt-2">Based on AI analysis of your transaction history</p>
            </div>
            <div className="hidden md:block text-right">
              <RefreshCw className="text-gray-600 opacity-50" size={80} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4 text-gray-800">Detected Recurring Charges</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-500 flex flex-col items-center">
            <RefreshCw className="animate-spin mb-2" size={24} />
            <p>AI is scanning your transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3 px-2">Merchant</th>
                  <th className="py-3 px-2 text-right">Avg Cost</th>
                  <th className="py-3 px-2 text-center">Frequency</th>
                  <th className="py-3 px-2">Next Expected Charge</th>
                  <th className="py-3 px-2 text-center">AI Confidence</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => {
                  const lastSeenDate = new Date(sub.last_seen || Date.now()); // Ensure fallback if missing
                  const nextExpected = addDays(lastSeenDate, sub.frequency_days || 30); // Default to 30 days
                  
                  let statusColor = "text-gray-600";
                  let StatusIcon = Clock;
                  let statusText = format(nextExpected, 'MMM d, yyyy');

                  if (isPast(nextExpected) && !isToday(nextExpected)) {
                    statusColor = "text-warning";
                    StatusIcon = AlertTriangle;
                    statusText = "Overdue / Cancelled?";
                  } else if (Math.abs(new Date().getTime() - nextExpected.getTime()) < 3 * 24 * 60 * 60 * 1000) {
                    statusColor = "text-danger";
                    StatusIcon = AlertTriangle;
                    statusText = `Due Soon (${format(nextExpected, 'MMM d')})`;
                  }

                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 font-medium">{sub.merchant}</td>
                      <td className="py-4 px-2 text-right">₹{(sub.avg_amount || 0).toFixed(2)}</td>
                      <td className="py-4 px-2 text-center text-gray-500">Every {Math.round(sub.frequency_days || 30)} days</td>
                      <td className={`py-4 px-2 flex items-center gap-2 ${statusColor}`}>
                        <StatusIcon size={16} />
                        <span className="font-medium">{statusText}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(sub.confidence || 0) > 0.8 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {Math.round((sub.confidence || 0) * 100)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <CheckCircle2 className="mx-auto mb-2 opacity-50" size={32} />
                      <p>No recurring subscriptions found in your transaction history.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
