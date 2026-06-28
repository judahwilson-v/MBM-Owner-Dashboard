"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function SalesChart({ data }: { data: any[] }) {
  // Aggregate sales by date
  const aggregated = data.reduce((acc: any, curr) => {
    const date = new Date(curr.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    if (!acc[date]) {
      acc[date] = { name: date, total: 0 };
    }
    acc[date].total += curr.final_amount || 0;
    return acc;
  }, {});

  const chartData = Object.values(aggregated);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
        <p className="text-gray-500">No sales data for the last 7 days.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
          />
          <Tooltip 
            cursor={{ fill: '#f39c12', opacity: 0.1 }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, 'Revenue']}
          />
          <Bar dataKey="total" fill="#f39c12" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
