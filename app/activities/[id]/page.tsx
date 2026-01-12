import { notFound } from 'next/navigation';
import { getActivity, getTimeseriesData, getLaps, getGPSPoints } from '@/lib/db';
import ActivityDetailClient from '@/components/ActivityDetailClient';

export const dynamic = 'force-dynamic';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const activityId = parseInt(resolvedParams.id);
  const activity = getActivity(activityId);

  if (!activity) {
    notFound();
  }

  const timeseriesData = getTimeseriesData(activityId);
  const laps = getLaps(activityId);
  const gpsPoints = getGPSPoints(activityId);

  return (
    <ActivityDetailClient
      activity={activity}
      timeseriesData={timeseriesData}
      laps={laps}
      gpsPoints={gpsPoints}
    />
  );
}

