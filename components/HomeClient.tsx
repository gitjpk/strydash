'use client';

import { type Activity } from '@/lib/db';
import ActivityList from './ActivityList';
import FilterBar from './FilterBar';
import { usePreferences } from './PreferencesProvider';

interface HomeClientProps {
  activities: Activity[];
  allTags: string[];
  allTypes: string[];
  selectedTags: string[];
  selectedTypes: string[];
}

export default function HomeClient({
  activities,
  allTags,
  allTypes,
  selectedTags,
  selectedTypes,
}: HomeClientProps) {
  const { t } = usePreferences();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            {t('activityList.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {activities.length} {activities.length !== 1 ? t('activityList.activities') : t('activityList.activity')}
            {(selectedTags.length > 0 || selectedTypes.length > 0) && ` ${t('activityList.filtered')}`}
          </p>
        </div>

        {/* Filter Bar (only active filters) */}
        <FilterBar 
          allTags={allTags}
          allTypes={allTypes}
          selectedTags={selectedTags}
          selectedTypes={selectedTypes}
        />

        {/* Activities Grid */}
        <ActivityList activities={activities} />
      </div>
    </div>
  );
}
