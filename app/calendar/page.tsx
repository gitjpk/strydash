import { getActivities } from '@/lib/db';
import CalendarClient from '@/components/CalendarClient';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const activities = getActivities();

  return <CalendarClient activities={activities} />;
}
