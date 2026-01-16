'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { type RollingStats } from '@/lib/db';
import { usePreferences } from './PreferencesProvider';

interface TrendsClientProps {
  rollingStats: RollingStats[];
}

export default function TrendsClient({ rollingStats }: TrendsClientProps) {
  const { t, language } = usePreferences();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return rollingStats.map((stat) => ({
      ...stat,
      dateFormatted: formatDate(stat.date),
    }));
  }, [rollingStats, language]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          {t('trends.title')}
        </h1>

        {/* Duration Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
            {t('trends.duration7d')}
          </h2>
          <div className="w-full" style={{ height: 'clamp(280px, 45vw, 400px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  label={{
                    value: t('units.minutes'),
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#9CA3AF' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(0)} ${t('units.minutes')}`,
                    t('trends.duration7d'),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="duration_7d"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
            {t('trends.distance7d')}
          </h2>
          <div className="w-full" style={{ height: 'clamp(280px, 45vw, 400px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                  label={{
                    value: t('units.km'),
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#9CA3AF' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(1)} ${t('units.km')}`,
                    t('trends.distance7d'),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="distance_7d"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
