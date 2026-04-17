import { getServerSession } from '@/lib/auth';
import { authOptions } from '@/lib/auth';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">设置</h2>
        <p className="text-gray-600">管理你的账户设置</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">账户信息</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">邮箱</label>
            <p className="text-gray-900">{session.user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">姓名</label>
            <p className="text-gray-900">{session.user?.name || '未设置'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">应用信息</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>版本：1.0.0</p>
          <p>技术栈：Next.js 14 + PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}
