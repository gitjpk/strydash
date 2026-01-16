import { getRolling7DayStats } from '@/lib/db';
import TrendsClient from '@/components/TrendsClient';

export const dynamic = 'force-dynamic';

export default function TrendsPage() {
  const rollingStats = getRolling7DayStats();

  return <TrendsClient rollingStats={rollingStats} />;
}
