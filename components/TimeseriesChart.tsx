'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TimeseriesData, Lap } from '@/lib/db';
import { usePreferences } from './PreferencesProvider';

interface TimeseriesChartProps {
  data: TimeseriesData[];
  laps: Lap[];
  activityStartTime: number;
}

interface SeriesConfig {
  key: keyof TimeseriesData;
  labelKey: string;
  color: string;
  enabled: boolean;
  yAxisId?: string;
}

export default function TimeseriesChart({ data, laps, activityStartTime }: TimeseriesChartProps) {
  const { t } = usePreferences();
  
  // Series configuration
  const [series, setSeries] = useState<SeriesConfig[]>([
    { key: 'power', labelKey: 'chart.power', color: '#F59E0B', enabled: true, yAxisId: 'left' },
    { key: 'heart_rate', labelKey: 'chart.heartRate', color: '#EF4444', enabled: true, yAxisId: 'left' },
    { key: 'speed', labelKey: 'chart.pace', color: '#10B981', enabled: true, yAxisId: 'right' },
    { key: 'cadence', labelKey: 'chart.cadence', color: '#3B82F6', enabled: true, yAxisId: 'left' },
    { key: 'stride_length', labelKey: 'chart.strideLength', color: '#8B5CF6', enabled: false, yAxisId: 'right' },
    { key: 'elevation', labelKey: 'chart.elevation', color: '#6B7280', enabled: false, yAxisId: 'right' },
  ]);

  // Lap/Split filtering
  const [selectedLaps, setSelectedLaps] = useState<number[]>([]);

  // Toggle series visibility
  const toggleSeries = (key: keyof TimeseriesData) => {
    setSeries((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Toggle lap selection
  const toggleLap = (lapNumber: number) => {
    setSelectedLaps((prev) =>
      prev.includes(lapNumber)
        ? prev.filter((l) => l !== lapNumber)
        : [...prev, lapNumber]
    );
  };

  // Select all laps
  const selectAllLaps = () => {
    setSelectedLaps(laps.map((l) => l.lap_number));
  };

  // Clear lap selection
  const clearLapSelection = () => {
    setSelectedLaps([]);
  };

  // Filter data based on selected laps
  const filteredData = useMemo(() => {
    if (selectedLaps.length === 0) {
      return data;
    }

    // Create time ranges for selected laps
    const lapRanges = selectedLaps.map((lapNum) => {
      const currentLap = laps.find((l) => l.lap_number === lapNum);
      const nextLap = laps.find((l) => l.lap_number === lapNum + 1);
      
      if (!currentLap) return null;
      
      return {
        start: currentLap.timestamp,
        end: nextLap ? nextLap.timestamp : Infinity,
      };
    }).filter(Boolean);

    return data.filter((point) => {
      return lapRanges.some((range) => 
        range && point.timestamp >= range.start && point.timestamp < range.end
      );
    });
  }, [data, selectedLaps, laps]);

  // Format data for chart
  const chartData = useMemo(() => {
    return filteredData.map((point, index) => {
      // Convert speed (m/s) to pace (min/km) - inverted scale
      const pace = point.speed && point.speed > 0 ? 1000 / (point.speed * 60) : null;
      
      return {
        ...point,
        speed: pace, // Replace speed with pace
        time: index, // Use index as time axis
        elapsedSeconds: point.timestamp - (filteredData[0]?.timestamp || 0),
      };
    });
  }, [filteredData]);

  // Format time for tooltip
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format pace (already in min/km decimal) to min:sec/km
  const formatPace = (minPerKm: number) => {
    if (!minPerKm || minPerKm === 0) return 'N/A';
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get lap names based on trigger/workout_step
  const getLapName = (lap: Lap) => {
    // You can customize this based on trigger values
    // For now, just return lap number
    return `${t('chart.lap')} ${lap.lap_number}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
        {t('chart.title')}
      </h2>

      {/* Series Toggle */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t('chart.selectSeries')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {series.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                s.enabled
                  ? 'bg-gradient-to-r from-gray-800 to-gray-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.enabled ? s.color : '#9CA3AF' }}
              />
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Lap/Split Filter */}
      {laps.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('chart.filterByLap')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={selectAllLaps}
                className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-md transition-all"
              >
                {t('chart.selectAll')}
              </button>
              <button
                onClick={clearLapSelection}
                className="px-3 py-1 text-xs rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                {t('chart.clear')}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {laps.map((lap) => (
              <button
                key={lap.lap_number}
                onClick={() => toggleLap(lap.lap_number)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedLaps.includes(lap.lap_number)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getLapName(lap)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="w-full" style={{ height: 'clamp(300px, 50vw, 500px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="elapsedSeconds"
              tickFormatter={formatTime}
              stroke="#9CA3AF"
              label={{ value: 'Temps', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#9CA3AF"
              label={{ value: 'Puissance / FC / Cadence', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9CA3AF"
              label={{ value: 'Allure / Élévation', angle: 90, position: 'insideRight', fill: '#9CA3AF' }}
              reversed
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelFormatter={(value) => `Temps: ${formatTime(value as number)}`}
              formatter={(value: any, name: string, props: any) => {
                // Check if this is the speed/pace data
                if (props.dataKey === 'speed') {
                  return [typeof value === 'number' && value > 0 ? formatPace(value) : 'N/A', t('chart.pace')];
                }
                return [typeof value === 'number' ? value.toFixed(1) : value, name];
              }}
            />
            <Legend />

            {/* Draw lines for enabled series */}
            {series.map(
              (s) =>
                s.enabled && (
                  <Line
                    key={s.key}
                    yAxisId={s.yAxisId || 'left'}
                    type="monotone"
                    dataKey={s.key}
                    name={t(s.labelKey)}
                    stroke={s.color}
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                )
            )}

            {/* Add reference lines for lap boundaries if filtering */}
            {selectedLaps.length > 0 &&
              selectedLaps.map((lapNum) => {
                const lap = laps.find((l) => l.lap_number === lapNum);
                if (!lap) return null;
                
                const dataIndex = chartData.findIndex((d) => d.timestamp === lap.timestamp);
                if (dataIndex === -1) return null;

                return (
                  <ReferenceLine
                    key={`lap-${lapNum}`}
                    x={chartData[dataIndex].elapsedSeconds}
                    yAxisId="left"
                    stroke="#6B7280"
                    strokeDasharray="3 3"
                    label={{
                      value: `${t('chart.lap')} ${lapNum}`,
                      position: 'top',
                      fill: '#6B7280',
                    }}
                  />
                );
              })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredData.length} {t('chart.dataPoints')}{' '}
          {selectedLaps.length > 0 && `(${selectedLaps.length} ${t('chart.lap')}${selectedLaps.length > 1 ? 's' : ''})`}
        </p>
      </div>
    </div>
  );
}
