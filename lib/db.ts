import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'stryd_activities.db');
const db = new Database(dbPath, { readonly: true });

// Types
export interface Activity {
  id: number;
  user_id: string;
  name: string;
  description: string;
  type: string;
  date: string;
  distance: number;
  moving_time: number;
  average_speed: number;
  average_power: number;
  average_heart_rate: number;
  average_cadence: number;
  ftp: number;
  tags: string;
  calories: number;
  total_elevation_gain: number;
}

export interface TimeseriesData {
  timestamp: number;
  power?: number;
  heart_rate?: number;
  speed?: number;
  cadence?: number;
  distance?: number;
  stride_length?: number;
  elevation?: number;
}

export interface Lap {
  activity_id: number;
  lap_number: number;
  timestamp: number;
  trigger: number;
  workout_step: number;
}

export interface GPSPoint {
  timestamp: number;
  lat: number;
  lng: number;
  power?: number;
}

export interface RollingStats {
  date: string;
  distance_7d: number;
  duration_7d: number;
  distance_10d: number;
  duration_10d: number;
}

// Get rolling 7-day cumulative stats
export function getRolling7DayStats(startDate?: string): RollingStats[] {
  let query = `
    WITH daily_stats AS (
      SELECT 
        DATE(date) as day,
        SUM(distance) / 1000.0 as daily_distance_km,
        SUM(moving_time) / 60.0 as daily_duration_min
      FROM activities
      WHERE date IS NOT NULL`;
  
  if (startDate) {
    query += ` AND date >= '${startDate}'`;
  }
  
  query += `
      GROUP BY DATE(date)
      ORDER BY DATE(date)
    ),`;
  
  query += `
    rolling AS (
      SELECT 
        day,
        daily_distance_km,
        daily_duration_min,
        (
          SELECT SUM(ds2.daily_distance_km)
          FROM daily_stats ds2
          WHERE ds2.day <= ds1.day
            AND ds2.day >= DATE(ds1.day, '-6 days')
        ) as distance_7d,
        (
          SELECT SUM(ds2.daily_duration_min)
          FROM daily_stats ds2
          WHERE ds2.day <= ds1.day
            AND ds2.day >= DATE(ds1.day, '-6 days')
        ) as duration_7d,
        (
          SELECT SUM(ds2.daily_distance_km)
          FROM daily_stats ds2
          WHERE ds2.day <= ds1.day
            AND ds2.day >= DATE(ds1.day, '-9 days')
        ) as distance_10d,
        (
          SELECT SUM(ds2.daily_duration_min)
          FROM daily_stats ds2
          WHERE ds2.day <= ds1.day
            AND ds2.day >= DATE(ds1.day, '-9 days')
        ) as duration_10d
      FROM daily_stats ds1
    )
    SELECT 
      day as date,
      distance_7d,
      duration_7d,
      distance_10d,
      duration_10d
    FROM rolling
    WHERE distance_7d IS NOT NULL
    ORDER BY day
  `;
  
  return db.prepare(query).all() as RollingStats[];
}

// Get all activities with optional filters
export function getActivities(filters?: { tags?: string[]; types?: string[]; startDate?: string }): Activity[] {
  let query = `
    SELECT 
      id, user_id, name, description, type, date, distance, moving_time,
      average_speed, average_power, average_heart_rate, average_cadence,
      ftp, tags, calories, total_elevation_gain
    FROM activities
    WHERE 1=1
  `;
  
  // Add date filter if provided
  if (filters?.startDate) {
    query += ` AND date >= '${filters.startDate}'`;
  }
  
  query += `
    ORDER BY date DESC
  `;
  
  const activities = db.prepare(query).all() as Activity[];
  
  // Apply filters
  return activities.filter(activity => {
    // Filter by types
    if (filters?.types && filters.types.length > 0) {
      if (!filters.types.includes(activity.type)) {
        return false;
      }
    }
    
    // Filter by tags (activity must have at least one of the selected tags)
    if (filters?.tags && filters.tags.length > 0) {
      if (!activity.tags) return false;
      const activityTags = activity.tags.split(',').map(t => t.trim().toLowerCase());
      const hasMatchingTag = filters.tags.some(filterTag => 
        activityTags.includes(filterTag.toLowerCase())
      );
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
}

// Get unique tags from all activities
export function getAllTags(): string[] {
  const activities = db.prepare("SELECT tags FROM activities WHERE tags IS NOT NULL AND tags != ''").all() as { tags: string }[];
  const tagsSet = new Set<string>();
  
  activities.forEach(activity => {
    if (activity.tags) {
      const tags = activity.tags.split(',').map(t => t.trim());
      tags.forEach(tag => {
        if (tag) tagsSet.add(tag);
      });
    }
  });
  
  return Array.from(tagsSet).sort();
}

// Get unique activity types
export function getAllTypes(): string[] {
  const activities = db.prepare("SELECT DISTINCT type FROM activities WHERE type IS NOT NULL ORDER BY type").all() as { type: string }[];
  return activities.map(a => a.type);
}

// Get single activity by ID
export function getActivity(id: number): Activity | undefined {
  const query = `
    SELECT 
      id, user_id, name, description, type, date, distance, moving_time,
      average_speed, average_power, average_heart_rate, average_cadence,
      ftp, tags, calories, total_elevation_gain
    FROM activities
    WHERE id = ?
  `;
  return db.prepare(query).get(id) as Activity | undefined;
}

// Get timeseries data for an activity
export function getTimeseriesData(activityId: number): TimeseriesData[] {
  const query = `
    SELECT 
      p.timestamp,
      p.total_power as power,
      c.heart_rate,
      k.speed,
      k.cadence,
      k.distance,
      k.stride_length,
      e.elevation
    FROM timeseries_power p
    LEFT JOIN timeseries_cardio c ON p.activity_id = c.activity_id AND p.timestamp = c.timestamp
    LEFT JOIN timeseries_kinematics k ON p.activity_id = k.activity_id AND p.timestamp = k.timestamp
    LEFT JOIN timeseries_elevation e ON p.activity_id = e.activity_id AND p.timestamp = e.timestamp
    WHERE p.activity_id = ?
    ORDER BY p.timestamp
  `;
  
  return db.prepare(query).all(activityId) as TimeseriesData[];
}

// Get laps/splits for an activity
export function getLaps(activityId: number): Lap[] {
  const query = `
    SELECT activity_id, lap_number, timestamp, trigger, workout_step
    FROM laps
    WHERE activity_id = ?
    ORDER BY lap_number
  `;
  return db.prepare(query).all(activityId) as Lap[];
}

// Get GPS points for an activity with power data
export function getGPSPoints(activityId: number): GPSPoint[] {
  const query = `
    SELECT 
      g.timestamp,
      g.lat,
      g.lng,
      p.total_power as power
    FROM gps_points g
    LEFT JOIN timeseries_power p ON g.activity_id = p.activity_id AND g.timestamp = p.timestamp
    WHERE g.activity_id = ?
    ORDER BY g.timestamp
  `;
  return db.prepare(query).all(activityId) as GPSPoint[];
}

export default db;
