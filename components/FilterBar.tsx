'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { usePreferences } from './PreferencesProvider';

interface FilterBarProps {
  allTags: string[];
  allTypes: string[];
  selectedTags: string[];
  selectedTypes: string[];
}

export default function FilterBar({ allTags, allTypes, selectedTags, selectedTypes }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = usePreferences();

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const currentTags = params.getAll('tags');
    
    if (currentTags.includes(tag)) {
      // Remove tag
      params.delete('tags');
      currentTags.filter(t => t !== tag).forEach(t => params.append('tags', t));
    } else {
      // Add tag
      params.append('tags', tag);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

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

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedTypes.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Active Filters Summary */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('activityList.activeFilters')}:</span>
        <div className="flex flex-wrap gap-2 flex-1">
          {selectedTypes.map((type) => (
            <span
              key={`type-${type}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white"
            >
              {t('activityList.type')}: {type}
              <button
                onClick={() => toggleType(type)}
                className="hover:bg-blue-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedTags.map((tag) => (
            <span
              key={`tag-${tag}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-600 text-white"
            >
              {t('activityList.tag')}: {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:bg-purple-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
        >
          {t('activityList.clearAll')}
        </button>
      </div>
    </div>
  );
}
