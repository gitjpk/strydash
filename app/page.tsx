import Link from 'next/link';
import { getActivities, getAllTags, getAllTypes } from '@/lib/db';
import ActivityList from '@/components/ActivityList';
import FilterBar from '@/components/FilterBar';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string | string[]; types?: string | string[] }>
}) {
  // Parse filters from URL
  const params = await searchParams;
  const selectedTags = params.tags 
    ? (Array.isArray(params.tags) ? params.tags : [params.tags])
    : [];
  const selectedTypes = params.types
    ? (Array.isArray(params.types) ? params.types : [params.types])
    : [];

  const activities = getActivities({
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
  });
  const allTags = getAllTags();
  const allTypes = getAllTypes();

  return (
    <HomeClient 
      activities={activities}
      allTags={allTags}
      allTypes={allTypes}
      selectedTags={selectedTags}
      selectedTypes={selectedTypes}
    />
  );
}
