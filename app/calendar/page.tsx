import { getActivities } from '@/lib/db';
import CalendarClient from '@/components/CalendarClient';

export const dynamic = 'force-dynamic';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string }>
}) {
  const params = await searchParams;
  const startDate = params.startDate;

  const activities = getActivities({ startDate });

  return <CalendarClient activities={activities} />;
}
