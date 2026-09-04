'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import { RecurringSubscription, AnomalyFlag } from '@/types';
import { AlertTriangle, Repeat, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

const severityColor: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
  LOW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function InsightsPage() {
  const [anomalies, setAnomalies] = useState<AnomalyFlag[]>([]);
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [anomalyRes, recurringRes] = await Promise.all([
          api.get('/predictions/anomalies'),
          api.get('/predictions/recurring'),
        ]);
        setAnomalies(anomalyRes.data);
        setSubscriptions(recurringRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Analyzing your spending...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI Insights</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="text-danger" size={20} />
            <h3 className="font-semibold">Unusual Spending Detected</h3>
          </div>

          {anomalies.length === 0 && (
            <p className="text-gray-400 text-sm">No anomalies found in your recent spending. 🎉</p>
          )}

          <div className="space-y-3">
            {anomalies.map((a) => (
              <div
                key={a.id}
                className={clsx('border rounded-lg p-3 text-sm', severityColor[a.severity] || 'bg-gray-50 text-gray-700 border-gray-200')}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold">{a.category || 'Uncategorized'}</span>
                  <span className="text-xs font-medium uppercase">{a.severity}</span>
                </div>
                <p>{a.reason}</p>
                <p className="text-xs opacity-70 mt-1">{a.date}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="text-primary-600" size={20} />
            <h3 className="font-semibold">Detected Recurring Subscriptions</h3>
          </div>

          {subscriptions.length === 0 && (
            <p className="text-gray-400 text-sm">No recurring payments detected yet. Add more transaction history for better results.</p>
          )}

          <div className="space-y-3">
            {subscriptions.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 text-sm flex justify-between items-center">
                <div>
                  <p className="font-semibold">{s.merchant}</p>
                  <p className="text-gray-500 text-xs">
                    Every ~{s.frequency_days} days · Last seen {s.last_seen}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{s.avg_amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{Math.round(s.confidence * 100)}% confidence</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 bg-primary-50 border-primary-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-primary-600 shrink-0 mt-1" size={20} />
          <p className="text-sm text-primary-800">
            These insights are generated automatically by analyzing your transaction patterns.
            The more transactions you log, the more accurate anomaly detection and subscription
            tracking become.
          </p>
        </div>
      </Card>
    </div>
  );
}