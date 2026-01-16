'use client';

import { type Activity } from '@/lib/db';
import ActivityList from './ActivityList';
import FilterBar from './FilterBar';
import { usePreferences } from './PreferencesProvider';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleType = (type: string) => {
    const params = new URLSearchParams(searchParams);
    const currentTypes = params.getAll('types');
    
    if (currentTypes.includes(type)) {
      // Remove type
      params.delete('types');
      currentTypes.filter(t => t !== type).forEach(t => params.append('types', t));
    } else {
      // Add type
      params.append('types', type);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header with gradient and Type Filter */}
        <div className="mb-6 lg:mb-8 flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
          <div className="flex-1 w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              {t('activityList.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {activities.length} {activities.length !== 1 ? t('activityList.activities') : t('activityList.activity')}
              {(selectedTags.length > 0 || selectedTypes.length > 0) && ` ${t('activityList.filtered')}`}
            </p>
          </div>

          {/* Type Filter Dropdown */}
          {allTypes.length > 0 && (
            <div className="relative w-full lg:w-64" ref={dropdownRef}>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                {t('activityList.selectType')}
              </label>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedTypes.length > 0
                    ? `${selectedTypes.length} ${t('activityList.type')}${selectedTypes.length > 1 ? 's' : ''} ${t('activityList.selected')}`
                    : t('activityList.allTypes')}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {allTypes.map((type) => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <label
                        key={type}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleType(type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
