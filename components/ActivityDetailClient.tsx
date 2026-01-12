'use client';

import Link from 'next/link';
import { type Activity, type TimeseriesDataPoint, type Lap, type GPSPoint } from '@/lib/db';
import { ArrowLeft, Calendar, Activity as ActivityIcon, Zap, Heart, TrendingUp, Gauge, Clock, ExternalLink } from 'lucide-react';
import TimeseriesChart from '@/components/TimeseriesChart';
import RouteMap from '@/components/RouteMap';
import PowerZones from '@/components/PowerZones';
import { usePreferences } from './PreferencesProvider';

interface ActivityDetailClientProps {
  activity: Activity;
  timeseriesData: TimeseriesDataPoint[];
  laps: Lap[];
  gpsPoints: GPSPoint[];
}

export default function ActivityDetailClient({
  activity,
  timeseriesData,
  laps,
  gpsPoints,
}: ActivityDetailClientProps) {
  const { t, language } = usePreferences();

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  const formatSpeed = (mps: number) => {
    const minPerKm = 1000 / (mps * 60);
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}${t('units.hours')} ${minutes}${t('units.minutes')} ${secs}s`;
    }
    return `${minutes}${t('units.minutes')} ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 sm:mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('activityDetail.backToActivities')}
        </Link>

        {/* Activity Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                {activity.name}
              </h1>
              <div className="flex items-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(activity.date)}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <a
                href={`https://www.stryd.com/powercenter/athletes/${activity.user_id}/calendar/entries/activities/${activity.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 lg:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all group"
              >
                <span className="hidden sm:inline">{t('activityDetail.viewOnStryd')}</span>
                <span className="sm:hidden">Stryd</span>
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <span className="flex-1 lg:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-center">
                {activity.type}
              </span>
            </div>
          </div>

          {activity.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activity.description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <ActivityIcon className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">{t('activityList.distance')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatDistance(activity.distance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.km')}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center text-purple-600 dark:text-purple-400 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">{t('activityList.duration')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatDuration(activity.moving_time)}
              </p>
            </div>

            {activity.average_speed > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 rounded-xl p-4 border border-green-100 dark:border-green-800">
                <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">{t('activityDetail.avgPace')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatSpeed(activity.average_speed)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">/{t('units.km')}</p>
              </div>
            )}

            {activity.average_power > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800">
                <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-2">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">{t('activityDetail.avgPower')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(activity.average_power)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.watts')}</p>
              </div>
            )}

            {activity.average_heart_rate > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 rounded-xl p-4 border border-red-100 dark:border-red-800">
                <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
                  <Heart className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">{t('activityDetail.avgHeartRate')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activity.average_heart_rate}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.bpm')}</p>
              </div>
            )}

            {activity.average_cadence > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                  <Gauge className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">{t('activityDetail.avgCadence')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activity.average_cadence}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('units.spm')}</p>
              </div>
            )}
          </div>

          {/* Power Zones Distribution */}
          <PowerZones timeseriesData={timeseriesData} cp={activity.ftp} />

          {/* Tags */}
          {activity.tags && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('activityList.tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm rounded-full bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeseries Chart */}
        {timeseriesData.length > 0 && (
          <TimeseriesChart 
            data={timeseriesData} 
            laps={laps}
            activityStartTime={new Date(activity.date).getTime() / 1000}
          />
        )}

        {/* Route Map */}
        <RouteMap gpsPoints={gpsPoints} />
      </div>
    </div>
  );
}
