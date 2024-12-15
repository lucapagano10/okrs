import React from 'react';
import { Objective } from '../types/okr';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ProgressChartsProps {
  objectives: Objective[];
  isDarkMode: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ objectives, isDarkMode }) => {
  // Prepare data for category progress chart
  const categoryProgress = objectives.reduce((acc, obj) => {
    if (!acc[obj.category]) {
      acc[obj.category] = {
        category: obj.category,
        totalProgress: 0,
        count: 0
      };
    }
    acc[obj.category].totalProgress += obj.progress;
    acc[obj.category].count += 1;
    return acc;
  }, {} as Record<string, { category: string; totalProgress: number; count: number }>);

  const categoryData = Object.values(categoryProgress).map(item => ({
    category: item.category,
    progress: item.totalProgress / item.count
  }));

  // Prepare data for status distribution
  const statusCount = objectives.reduce((acc, obj) => {
    acc[obj.status] = (acc[obj.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Category Progress Chart */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Progress by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
              />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: isDarkMode ? '#F3F4F6' : '#111827'
                }}
              />
              <Bar dataKey="progress" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Status Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: isDarkMode ? '#F3F4F6' : '#111827'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
