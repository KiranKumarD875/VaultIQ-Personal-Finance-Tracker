'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Transaction, Category } from '@/types';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { Search, Filter } from 'lucide-react';

interface FormData {
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category_id: string;
  description: string;
  merchant: string;
  transaction_date: string;
}

function getGroupName(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const diff = differenceInDays(new Date(), date);
  if (diff < 7) return 'This Week';
  if (diff < 30) return 'This Month';
  return format(date, 'MMMM yyyy');
}

function TransactionsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get('search') || '';
  const shouldAdd = searchParams?.get('add') === 'true';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [showForm, setShowForm] = useState(shouldAdd);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, getValues } = useForm<FormData>({
    defaultValues: { type: 'EXPENSE', transaction_date: format(new Date(), 'yyyy-MM-dd'), category_id: '' },
  });

  const descriptionValue = watch('description');
  const merchantValue = watch('merchant');

  const fetchCategories = async () => {
    const catRes = await api.get('/categories');
    setCategories(catRes.data);
  };

  const loadData = async (resetPage = false) => {
    try {
      setLoading(true);
      const currentPage = resetPage ? 0 : page;
      const limit = 10;
      
      const res = await api.get('/transactions', {
        params: {
          limit,
          offset: currentPage * limit,
          category_id: filterCat || undefined,
          type: filterType || undefined
        }
      });
      
      // Backend returns { data, total } if limit is used
      let newData = res.data.data || res.data; 
      
      // Client side search fallback
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        newData = newData.filter((t: Transaction) => 
          t.description?.toLowerCase().includes(q) || 
          t.merchant?.toLowerCase().includes(q) ||
          t.category?.name?.toLowerCase().includes(q)
        );
      }
      
      if (resetPage) {
        setTransactions(newData);
      } else {
        setTransactions(prev => [...prev, ...newData]);
      }
      
      setHasMore(newData.length === limit);
      if (resetPage) setPage(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    loadData(true);
  }, [searchQuery, filterCat, filterType]);

  const loadMore = () => {
    setPage(p => p + 1);
  };

  useEffect(() => {
    if (page > 0) loadData(false);
  }, [page]);

  const handleAutoCategorize = async () => {
    const text = descriptionValue || merchantValue;
    if (!text || text.trim().length < 3) return;

    try {
      const res = await api.post('/predictions/categorize', { description: text });
      const { category, confidence } = res.data;

      const matched = categories.find(
        (c) => c.name.toLowerCase() === category.toLowerCase(),
      );

      if (matched) {
        const currentCat = getValues('category_id');
        if (!currentCat) {
          setValue('category_id', matched.id);
          setSuggestion(`🤖 AI auto-selected "${category}" (${Math.round(confidence * 100)}% confident)`);
        } else {
          setSuggestion(`🤖 AI thinks this is "${category}" (${Math.round(confidence * 100)}% confident)`);
        }
      } else {
        setSuggestion(null);
      }
    } catch (err) {
      console.error('Auto-categorize failed', err);
    }
  };

  const onSubmit = async (data: FormData) => {
    await api.post('/transactions', { ...data, amount: Number(data.amount) });
    reset();
    setSuggestion(null);
    setShowForm(false);
    loadData(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    loadData(true);
  };

  let lastGroup = '';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border border-primary-100">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Amount" type="number" step="0.01" {...register('amount', { required: true })} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select {...register('type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                <option value="">-- Select --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {suggestion && <p className="text-xs text-primary-600 mt-1">{suggestion}</p>}
            </div>
            <Input label="Date" type="date" {...register('transaction_date', { required: true })} />
            <Input label="Merchant" {...register('merchant')} onBlur={handleAutoCategorize} />
            <Input label="Description" {...register('description')} onBlur={handleAutoCategorize} />
            <div className="md:col-span-2 mt-2">
              <Button type="submit" className="w-full">Save Transaction</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="mb-6 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={16} />
              <select 
                value={filterCat} 
                onChange={(e) => setFilterCat(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm rounded-lg py-2 px-3 min-w-[140px]"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg py-2 px-3"
            >
              <option value="">All Types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50/50">
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const group = getGroupName(tx.transaction_date);
                const showHeader = group !== lastGroup;
                lastGroup = group;

                return (
                  <React.Fragment key={tx.id}>
                    {showHeader && (
                      <tr className="bg-gray-50/80 border-b border-t first:border-t-0">
                        <td colSpan={5} className="py-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {group}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{tx.merchant || 'Unknown'}</div>
                        {tx.description && <div className="text-xs text-gray-500 mt-0.5">{tx.description}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          {tx.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${tx.type === 'EXPENSE' ? 'text-gray-900' : 'text-success'}`}>
                        {tx.type === 'EXPENSE' ? '-' : '+'}₹{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-danger text-xs font-medium transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {hasMore && transactions.length > 0 && (
          <div className="p-4 border-t text-center bg-gray-50/30">
            <Button 
              onClick={loadMore} 
              disabled={loading}
              className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-primary-600 px-8"
            >
              {loading ? 'Loading...' : 'Load More Previous Transactions'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading transactions...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}