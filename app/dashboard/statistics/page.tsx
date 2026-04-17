import TrendChart from '@/components/statistics/TrendChart';

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">数据统计</h2>
        <p className="text-gray-600">查看你的财务数据分析</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">收支趋势（最近30天）</h3>
          <TrendChart />
        </div>
      </div>
    </div>
  );
}
