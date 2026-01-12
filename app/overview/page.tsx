'use client';

import { usePreferences } from '@/components/PreferencesProvider';

export default function OverviewPage() {
  const { t } = usePreferences();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          {t('overview.title')}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
          <p className="text-gray-600 dark:text-gray-400">
            {t('overview.comingSoon')}
          </p>
        </div>
      </div>
    </div>
  );
}
