'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getPreferences } from '@/lib/preferences';

export default function DateFilterSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const prefs = getPreferences();
    const currentStartDate = searchParams.get('startDate');
    
    // If we have a startDate preference and it's not in the URL, add it
    if (prefs.startDate && prefs.startDate !== currentStartDate) {
      const params = new URLSearchParams(searchParams);
      params.set('startDate', prefs.startDate);
      router.replace(`${pathname}?${params.toString()}`);
    }
    // If we don't have a preference but there's one in the URL, remove it
    else if (!prefs.startDate && currentStartDate) {
      const params = new URLSearchParams(searchParams);
      params.delete('startDate');
      const newSearch = params.toString();
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname);
    }
  }, [pathname, searchParams, router]);

  return null;
}
