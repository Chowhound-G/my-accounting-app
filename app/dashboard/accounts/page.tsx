'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Account {
  id: number;
  name: string;
  type: string;
  current_balance: number;
  currency: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    initialBalance: '0',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          initialBalance: parseFloat(formData.initialBalance),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '创建失败');
      }

      setFormData({ name: '', type: 'cash', initialBalance: '0' });
      setShowForm(false);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const accountTypeLabels: Record<string, string> = {
    cash: '现金',
    alipay: '支付宝',
    wechat: '微信',
    card: '银行卡',
    investment: '投资',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">账户管理</h2>
          <p className="text-gray-600">管理你的所有账户</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消' : '新建账户'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">创建新账户</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="name">账户名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：招商银行储蓄卡"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">账户类型</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="cash">现金</option>
                <option value="alipay">支付宝</option>
                <option value="wechat">微信</option>
                <option value="card">银行卡</option>
                <option value="investment">投资</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="initialBalance">初始余额</Label>
              <Input
                id="initialBalance"
                type="number"
                step="0.01"
                min="0"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                创建
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', type: 'cash', initialBalance: '0' });
                }}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500 mb-4">还没有账户</div>
          <Button onClick={() => setShowForm(true)}>创建第一个账户</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{account.name}</h3>
                  <p className="text-sm text-gray-500">{accountTypeLabels[account.type] || account.type}</p>
                </div>
                <div className="text-2xl">💰</div>
              </div>
              <div className="text-2xl font-bold">
                ¥ {parseFloat(account.current_balance).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
