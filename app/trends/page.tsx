import { getRolling7DayStats } from '@/lib/db';
import TrendsClient from '@/components/TrendsClient';

export const dynamic = 'force-dynamic';

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string }>
}) {
  const params = await searchParams;
  const startDate = params.startDate;

  const rollingStats = getRolling7DayStats(startDate);

  return <TrendsClient rollingStats={rollingStats} />;
}
