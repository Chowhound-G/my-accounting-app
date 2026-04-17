'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  note: string | null;
  trans_date: string;
  account_name: string;
  category_name: string | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这笔交易吗？')) return;

    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">交易记录</h2>
          <p className="text-gray-600">查看和管理你的所有交易</p>
        </div>
        <Link href="/dashboard/transactions/new">
          <Button>新建交易</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500 mb-4">还没有交易记录</div>
          <Link href="/dashboard/transactions/new">
            <Button>创建第一笔交易</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{tx.note || tx.category_name || '未分类'}</div>
                  <div className="text-sm text-gray-500">
                    {tx.trans_date?.split('T')[0]} · {tx.account_name}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={tx.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {tx.type === 'income' ? '+' : '-'}¥ {tx.amount}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tx.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
