'use client';

import { useState } from 'react';
import { usePreferences } from './PreferencesProvider';

interface PowerZonesProps {
  timeseriesData: Array<{ timestamp: number; power?: number }>;
  cp: number; // Critical Power (or FTP)
}

interface PowerZone {
  name: string;
  min: number;
  max: number;
  color: string;
  label: string;
}

export default function PowerZones({ timeseriesData, cp }: PowerZonesProps) {
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);
  const { t } = usePreferences();
  
  // Filter data points with power values
  const powerData = timeseriesData.filter(d => d.power != null && d.power > 0);
  
  if (powerData.length === 0 || !cp || cp <= 0) {
    return null;
  }

  // Define power zones based on % of CP (Critical Power)
  const zones: PowerZone[] = [
    { name: 'Easy', min: 0, max: 0.80, color: '#94A3B8', label: 'Z1' },
    { name: 'Moderate', min: 0.80, max: 0.90, color: '#3B82F6', label: 'Z2' },
    { name: 'Threshold', min: 0.90, max: 1.00, color: '#22C55E', label: 'Z3' },
    { name: 'Interval', min: 1.00, max: 1.15, color: '#EAB308', label: 'Z4' },
    { name: 'Repetition', min: 1.15, max: 1.30, color: '#EF4444', label: 'Z5' },
  ];

  // Calculate time in each zone (assuming 1 second between data points)
  const zoneDistribution = zones.map(zone => {
    const minPower = zone.min * cp;
    const maxPower = zone.max * cp;
    const count = powerData.filter(d => d.power! >= minPower && d.power! < maxPower).length;
    return {
      ...zone,
      timeInSeconds: count,
      percentage: powerData.length > 0 ? (count / powerData.length) * 100 : 0,
    };
  });

  // Find the maximum time to scale bars
  const maxTime = Math.max(...zoneDistribution.map(z => z.timeInSeconds));
  
  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('powerZones.title')}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">CP: {Math.round(cp)}W</span>
      </div>
      
      {/* Vertical bar chart */}
      <div className="relative pb-2">
        <div className="flex items-end justify-around gap-4 px-4" style={{ height: '200px' }}>
          {zoneDistribution.map((zone, idx) => {
            // Calculate height in pixels based on max time
            const heightPx = maxTime > 0 ? (zone.timeInSeconds / maxTime) * 180 : 0;
            
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end relative"
              >
                {/* Time label above bar */}
                {zone.timeInSeconds > 0 && (
                  <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {formatTime(zone.timeInSeconds)} ({zone.percentage.toFixed(0)}%)
                  </div>
                )}
                
                {/* Bar */}
                <div
                  className="w-full rounded-t-lg cursor-pointer transition-all duration-200 hover:opacity-80"
                  style={{ 
                    height: `${heightPx}px`,
                    backgroundColor: zone.color,
                  }}
                  onMouseEnter={() => setHoveredZone(idx)}
                  onMouseLeave={() => setHoveredZone(null)}
                  title={zone.timeInSeconds > 0 ? `${zone.name}: ${formatTime(zone.timeInSeconds)}` : ''}
                />
                
                {/* Zone label below */}
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {zone.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
