import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">💰 我的记账本</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
              <a href="/api/auth/signout" className="text-sm text-gray-600 hover:text-gray-900">
                退出
              </a>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>📊</span>
              <span>仪表盘</span>
            </a>
            <a href="/dashboard/transactions" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>💳</span>
              <span>交易</span>
            </a>
            <a href="/dashboard/accounts" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>🏦</span>
              <span>账户</span>
            </a>
            <a href="/dashboard/categories" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>🏷️</span>
              <span>分类</span>
            </a>
            <a href="/dashboard/statistics" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
              <span>📈</span>
              <span>统计</span>
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
