'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { type Activity } from '@/lib/db';
import { usePreferences } from './PreferencesProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarClientProps {
  activities: Activity[];
}

interface WeekData {
  weekStart: Date;
  days: {
    date: Date;
    activities: Activity[];
  }[];
  totalDistance: number;
  totalTime: number;
}

// Simple sparkline component for power data
function PowerSparkline({ activity }: { activity: Activity }) {
  // Create a simple visualization based on average power
  const points = 30;
  const avgPower = activity.average_power || 0;
  
  if (avgPower === 0) return null;

  // Generate a wave pattern around the average power
  const dataPoints = Array.from({ length: points }, (_, i) => {
    const variation = Math.sin(i / 2) * 0.2 + Math.random() * 0.1;
    return avgPower * (1 + variation);
  });

  const maxPower = Math.max(...dataPoints);
  const minPower = Math.min(...dataPoints);
  const range = maxPower - minPower;

  return (
    <div className="w-full h-8 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`gradient-${activity.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        <polygon
          points={`0,30 ${dataPoints
            .map((power, i) => {
              const x = (i / (points - 1)) * 100;
              const y = 30 - ((power - minPower) / range) * 25;
              return `${x},${y}`;
            })
            .join(' ')} 100,30`}
          fill={`url(#gradient-${activity.id})`}
        />
        <polyline
          points={dataPoints
            .map((power, i) => {
              const x = (i / (points - 1)) * 100;
              const y = 30 - ((power - minPower) / range) * 25;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export default function CalendarClient({ activities }: CalendarClientProps) {
  const { t, language } = usePreferences();
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<Record<string, number>>({});

  // Group activities by week
  const weeks = useMemo(() => {
    const weeksMap = new Map<string, WeekData>();

    activities.forEach((activity) => {
      const date = new Date(activity.date);
      
      // Get Monday of this week
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(date);
      monday.setDate(date.getDate() + diff);
      monday.setHours(0, 0, 0, 0);

      const weekKey = monday.toISOString();

      if (!weeksMap.has(weekKey)) {
        const days = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);
          return {
            date: day,
            activities: [],
          };
        });

        weeksMap.set(weekKey, {
          weekStart: monday,
          days,
          totalDistance: 0,
          totalTime: 0,
        });
      }

      const week = weeksMap.get(weekKey)!;
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      week.days[dayIndex].activities.push(activity);
      week.totalDistance += activity.distance;
      week.totalTime += activity.moving_time;
    });

    return Array.from(weeksMap.values()).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    );
  }, [activities]);

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getDayName = (dayIndex: number) => {
    const days = [
      'calendar.monday',
      'calendar.tuesday',
      'calendar.wednesday',
      'calendar.thursday',
      'calendar.friday',
      'calendar.saturday',
      'calendar.sunday',
    ];
    return t(days[dayIndex]).slice(0, 3).toUpperCase();
  };

  const getDayKey = (weekIdx: number, dayIdx: number) => `${weekIdx}-${dayIdx}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            {t('calendar.title')}
          </h1>
        </div>

        <div className="space-y-2">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx}>
              {/* Week Header with Days */}
              <div className="grid grid-cols-8 gap-2 mb-2">
                {Array.from({ length: 7 }).map((_, dayIdx) => (
                  <div key={dayIdx} className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                    {getDayName(dayIdx)}
                  </div>
                ))}
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">
                  SUMMARY
                </div>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-8 gap-2">
                {/* Days */}
                {week.days.map((day, dayIdx) => {
                  const dayKey = getDayKey(weekIdx, dayIdx);
                  const currentIndex = selectedActivityIndex[dayKey] || 0;
                  const currentActivity = day.activities[currentIndex];
                  const hasMultiple = day.activities.length > 1;

                  return (
                    <div
                      key={dayIdx}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 min-h-[160px] relative border border-gray-200 dark:border-gray-700"
                    >
                      {/* Day Number */}
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {day.date.getDate()}
                      </div>

                      {currentActivity ? (
                        <Link
                          href={`/activities/${currentActivity.id}`}
                          className="block group relative"
                        >
                          {/* Activity Title and Type */}
                          <div className="mb-3">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                              {currentActivity.name}
                            </div>
                            {currentActivity.type && (
                              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {currentActivity.type}
                              </span>
                            )}
                          </div>

                          {/* Activity Info */}
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {formatDistance(currentActivity.distance)} km
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {formatDuration(currentActivity.moving_time)}
                            </div>
                          </div>

                          {/* Tooltip on hover */}
                          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="text-sm font-semibold mb-2 text-white">
                              {currentActivity.name}
                            </div>
                            <div className="space-y-1 text-xs">
                              {currentActivity.average_power && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">{t('activityDetail.avgPower')}:</span>
                                  <span className="font-medium text-white">{Math.round(currentActivity.average_power)} W</span>
                                </div>
                              )}
                              {currentActivity.average_speed && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">{t('activityDetail.avgSpeed')}:</span>
                                  <span className="font-medium text-white">{(currentActivity.average_speed * 3.6).toFixed(1)} km/h</span>
                                </div>
                              )}
                              {currentActivity.average_heart_rate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">{t('activityDetail.avgHeartRate')}:</span>
                                  <span className="font-medium text-white">{Math.round(currentActivity.average_heart_rate)} bpm</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="text-xs text-gray-500 dark:text-gray-600 italic mt-8">
                          {t('calendar.noActivities')}
                        </div>
                      )}

                      {/* Navigation arrows for multiple activities */}
                      {hasMultiple && (
                        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedActivityIndex((prev) => ({
                                ...prev,
                                [dayKey]: Math.max(0, currentIndex - 1),
                              }));
                            }}
                            disabled={currentIndex === 0}
                            className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                          </button>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {day.activities.length} {t('activityList.activities')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedActivityIndex((prev) => ({
                                ...prev,
                                [dayKey]: Math.min(day.activities.length - 1, currentIndex + 1),
                              }));
                            }}
                            disabled={currentIndex === day.activities.length - 1}
                            className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Week Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/40 dark:to-purple-900/40 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t('calendar.totalDistance')}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatDistance(week.totalDistance)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">km</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t('calendar.totalTime')}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDuration(week.totalTime)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Week Date Label */}
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 ml-2">
                {t('calendar.weekOf')} {formatDate(week.weekStart)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
