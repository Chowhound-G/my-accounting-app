'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Account {
  id: number;
  name: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    accountId: '',
    type: 'expense',
    amount: '',
    categoryId: '',
    note: '',
    transDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ]);

      const accountsData = await accountsRes.json();
      const categoriesData = await categoriesRes.json();

      setAccounts(accountsData.accounts || []);
      setCategories(categoriesData.categories || []);

      // Set default account
      if (accountsData.accounts?.length > 0) {
        setFormData(prev => ({ ...prev, accountId: accountsData.accounts[0].id.toString() }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: parseInt(formData.accountId),
          type: formData.type,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          note: formData.note || null,
          transDate: formData.transDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建失败');
      }

      router.push('/dashboard/transactions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">新建交易</h2>
        <p className="text-gray-600">记录一笔新的收入或支出</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">类型</Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, categoryId: '' })}
              required
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="accountId">账户</Label>
            <Select
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">金额</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryId">分类</Label>
            <Select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">无分类</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="note">备注</Label>
            <Input
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="可选"
            />
          </div>

          <div>
            <Label htmlFor="transDate">日期</Label>
            <Input
              id="transDate"
              type="date"
              value={formData.transDate}
              onChange={(e) => setFormData({ ...formData, transDate: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? '保存中...' : '保存'}
            </Button>
            <Link href="/dashboard/transactions" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                取消
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
