async function getAccounts() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/accounts`, { cache: 'no-store' });
  return res.json();
}

async function getTransactions() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/transactions`, { cache: 'no-store' });
  return res.json();
}

export default async function DashboardPage() {
  const accountsData = await getAccounts();
  const transactionsData = await getTransactions();

  const totalBalance = accountsData.accounts?.reduce((sum: number, acc: any) => sum + (parseFloat(acc.current_balance) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">仪表盘</h2>
        <p className="text-gray-600">欢迎回来！这是你的财务概览。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">总资产</div>
          <div className="text-2xl font-bold">¥ {totalBalance.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">账户数</div>
          <div className="text-2xl font-bold">{accountsData.accounts?.length || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">交易数</div>
          <div className="text-2xl font-bold">{transactionsData.transactions?.length || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">最近交易</h3>
        </div>
        <div className="divide-y">
          {transactionsData.transactions?.slice(0, 10).map((tx: any) => (
            <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-medium">{tx.note || tx.category_name || '未分类'}</div>
                <div className="text-sm text-gray-500">{tx.trans_date?.split('T')[0]} · {tx.account_name}</div>
              </div>
              <div className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {tx.type === 'income' ? '+' : '-'}¥ {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
