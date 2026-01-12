'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Activity } from '@/lib/db';
import { Activity as ActivityIcon, Calendar, TrendingUp, Zap, Heart, Clock } from 'lucide-react';
import { usePreferences } from './PreferencesProvider';

interface ActivityListProps {
  activities: Activity[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  const { t, language } = usePreferences();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const params = new URLSearchParams(searchParams);
    const currentTags = params.getAll('tags');
    
    if (!currentTags.includes(tag)) {
      params.append('tags', tag);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleTypeClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const params = new URLSearchParams(searchParams);
    const currentTypes = params.getAll('types');
    
    if (!currentTypes.includes(type)) {
      params.append('types', type);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  const formatSpeed = (mps: number) => {
    // Convert m/s to min/km
    const minPerKm = 1000 / (mps * 60);
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}${t('units.hours')} ${minutes}${t('units.minutes')}`;
    }
    return `${minutes}${t('units.minutes')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Link
          key={activity.id}
          href={`/activities/${activity.id}`}
          className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 p-6 group"
        >
          {/* Left: Main Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all mb-2">
              {activity.name}
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 w-28">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                {formatDate(activity.date)}
              </div>
              <button
                onClick={(e) => handleTypeClick(e, activity.type)}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 hover:border-blue-200 dark:hover:border-blue-700 transition-colors cursor-pointer"
              >
                {activity.type}
              </button>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-8">
            {/* Distance */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-1 h-5">
                <ActivityIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{t('activityList.distance')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatDistance(activity.distance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.km')}</p>
            </div>

            {/* Duration */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-1 h-5">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">{t('activityList.duration')}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatDuration(activity.moving_time)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 invisible">.</p>
            </div>

            {/* Speed */}
            {activity.average_speed > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-500 mb-1 h-5">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">{t('activityList.pace')}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatSpeed(activity.average_speed)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">/{t('units.km')}</p>
              </div>
            )}

            {/* Power */}
            {activity.average_power > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1 h-5">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-medium">{t('activityList.power')}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(activity.average_power)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.watts')}</p>
              </div>
            )}

            {/* Heart Rate */}
            {activity.average_heart_rate > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-red-500 mb-1 h-5">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-medium">{t('activityList.hr')}</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {activity.average_heart_rate}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.bpm')}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="w-40 flex-shrink-0">
            {activity.tags && (
              <div className="flex flex-col gap-1">
                {activity.tags.split(',').map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleTagClick(e, tag.trim())}
                    className="px-2 py-0.5 text-xs rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-400 transition-colors cursor-pointer"
                  >
                    {tag.trim()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
