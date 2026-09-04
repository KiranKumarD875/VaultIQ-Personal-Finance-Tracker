'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

const TAX_KEYWORDS = [
  'aws', 'google cloud', 'zoom', 'internet', 'comcast', 'verizon', 
  'office depot', 'staples', 'adobe', 'figma', 'slack', 'notion', 
  'github', 'vercel', 'upwork', 'wework', 'linkedin', 'hosting', 
  'domain', 'stripe', 'mailchimp', 'canva'
];

export default function TaxPrepPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const taxWriteOffs = transactions.filter(t => {
    if (t.type !== 'EXPENSE') return false;
    
    const textToScan = ((t.merchant || '') + ' ' + (t.description || '')).toLowerCase();
    const isKnownTaxCategory = t.category?.name === 'Software' || t.category?.name === 'Office' || t.category?.name === 'Business';
    const hasTaxKeyword = TAX_KEYWORDS.some(kw => textToScan.includes(kw));
    
    return isKnownTaxCategory || hasTaxKeyword;
  });

  const totalDeductions = taxWriteOffs.reduce((sum, t) => sum + Number(t.amount), 0);

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="print:m-0 print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-primary-500" /> AI Tax Prep & Write-Off Finder
          </h1>
          <p className="text-gray-500 mt-1">
            Automatically scanning your transactions for potential business tax deductions.
          </p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900">
          <Download size={16} /> Export IRS Report
        </Button>
      </div>

      <div className="mb-8">
        <Card className="bg-gradient-to-r from-success/90 to-success text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100 text-sm font-medium uppercase tracking-wider">Total Potential Deductions</p>
              <h2 className="text-4xl font-bold mt-2">₹{totalDeductions.toFixed(2)}</h2>
              <p className="text-success-100 text-sm mt-2">Found {taxWriteOffs.length} qualifying business transactions</p>
            </div>
            <div className="hidden md:block text-right">
              <CheckCircle2 className="text-success-300 opacity-50" size={80} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="print:shadow-none print:border-0">
        <h3 className="font-semibold mb-4 text-gray-800 print:text-xl">Itemized Deductions (Schedule C)</h3>
        {loading ? (
          <div className="flex justify-center items-center h-32 text-gray-500">Scanning transactions...</div>
        ) : taxWriteOffs.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No potential tax write-offs found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200">
                <th className="py-3 px-2 font-medium">Date</th>
                <th className="py-3 px-2 font-medium">Merchant / Description</th>
                <th className="py-3 px-2 font-medium">Original Category</th>
                <th className="py-3 px-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {taxWriteOffs.map(t => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors print:border-gray-300">
                  <td className="py-3 px-2">{format(parseISO(t.transaction_date), 'MMM d, yyyy')}</td>
                  <td className="py-3 px-2 font-medium">{t.merchant || t.description || 'Unknown'}</td>
                  <td className="py-3 px-2 text-gray-500">{t.category?.name || 'Uncategorized'}</td>
                  <td className="py-3 px-2 text-right font-medium text-gray-800">₹{Number(t.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-800 font-bold">
              <tr>
                <td colSpan={3} className="py-4 px-2 text-right uppercase tracking-wider text-xs">Total Deductions:</td>
                <td className="py-4 px-2 text-right text-lg">₹{totalDeductions.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </Card>
    </div>
  );
}
