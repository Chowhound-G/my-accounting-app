'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartData {
  date: string;
  income: number;
  expense: number;
}

export default function TrendChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const res = await fetch('/api/transactions');
      const json = await res.json();
      const transactions = json.transactions || [];

      // Group by date
      const grouped: Record<string, ChartData> = {};

      transactions.forEach((tx: any) => {
        const date = tx.trans_date.split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { date, income: 0, expense: 0 };
        }
        if (tx.type === 'income') {
          grouped[date].income += parseFloat(tx.amount);
        } else {
          grouped[date].expense += parseFloat(tx.amount);
        }
      });

      // Sort by date and take last 30 days
      const sorted = Object.values(grouped)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      setData(sorted);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['收入', '支出'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date.slice(5)), // MM-DD
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: data.map((d) => d.income),
        itemStyle: {
          color: '#10b981',
        },
      },
      {
        name: '支出',
        type: 'bar',
        data: data.map((d) => d.expense),
        itemStyle: {
          color: '#ef4444',
        },
      },
    ],
  };

  if (isLoading) {
    return <div className="h-80 flex items-center justify-center text-gray-500">加载中...</div>;
  }

  if (data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-gray-500">暂无数据</div>;
  }

  return <ReactECharts option={option} style={{ height: '400px' }} />;
}
