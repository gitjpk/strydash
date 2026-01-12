'use client';

import { useEffect, useRef, useState } from 'react';
import { usePreferences } from './PreferencesProvider';
import { getPreferences } from '@/lib/preferences';
import dynamic from 'next/dynamic';

// Dynamically import MapLibre component
const MapLibreMap = dynamic(() => import('./MapLibreMap'), { ssr: false });

interface RouteMapProps {
  gpsPoints: Array<{ lat: number; lng: number; power?: number }>;
}

// Function to get color based on power value
function getPowerColor(power: number | undefined, minPower: number, maxPower: number): string {
  if (!power || minPower === maxPower) return '#3B82F6'; // Default blue
  
  // Normalize power value between 0 and 1
  const normalized = (power - minPower) / (maxPower - minPower);
  
  // Color gradient: green (low) -> yellow (medium) -> red (high)
  if (normalized < 0.5) {
    // Green to Yellow
    const t = normalized * 2;
    const r = Math.round(16 + (234 - 16) * t);
    const g = Math.round(185 + (179 - 185) * t);
    const b = Math.round(129 + (18 - 129) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Red
    const t = (normalized - 0.5) * 2;
    const r = Math.round(234 + (239 - 234) * t);
    const g = Math.round(179 - (179 - 68) * t);
    const b = Math.round(18 + (68 - 18) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default function RouteMap({ gpsPoints }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { t } = usePreferences();
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'maplibre'>('leaflet');

  // Get map provider preference
  useEffect(() => {
    const prefs = getPreferences();
    setMapProvider(prefs.mapProvider || 'leaflet');
  }, []);

  useEffect(() => {
    if (!mapRef.current || gpsPoints.length === 0 || mapProvider !== 'leaflet') return;
    
    // Import Leaflet only on client side
    import('leaflet').then((L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map
      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
      });
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Calculate min/max power for color scaling
      const powerValues = gpsPoints.filter(p => p.power != null).map(p => p.power!);
      const minPower = powerValues.length > 0 ? Math.min(...powerValues) : 0;
      const maxPower = powerValues.length > 0 ? Math.max(...powerValues) : 0;

      // Draw route as segments with power-based colors
      const bounds = L.latLngBounds([]);
      for (let i = 0; i < gpsPoints.length - 1; i++) {
        const start = gpsPoints[i];
        const end = gpsPoints[i + 1];
        
        const color = getPowerColor(start.power, minPower, maxPower);
        
        const segment = L.polyline(
          [[start.lat, start.lng], [end.lat, end.lng]],
          {
            color: color,
            weight: 4,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
          }
        ).addTo(map);
        
        bounds.extend([start.lat, start.lng]);
        bounds.extend([end.lat, end.lng]);
      }

      // Add start marker (green)
      if (gpsPoints.length > 0) {
        const firstPoint = gpsPoints[0];
        const startIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([firstPoint.lat, firstPoint.lng], { icon: startIcon })
          .bindPopup(t('activityDetail.start'))
          .addTo(map);
      }

      // Add end marker (red)
      if (gpsPoints.length > 1) {
        const endPoint = gpsPoints[gpsPoints.length - 1];
        const endIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #EF4444; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
          .bindPopup(t('activityDetail.finish'))
          .addTo(map);
      }

      // Fit bounds to show entire route
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [gpsPoints, mapProvider]);

  if (gpsPoints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          {t('activityDetail.route')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{t('activityDetail.noGpsData')}</p>
      </div>
    );
  }

  // Calculate power range for legend
  const powerValues = gpsPoints.filter(p => p.power != null).map(p => p.power!);
  const minPower = powerValues.length > 0 ? Math.min(...powerValues) : 0;
  const maxPower = powerValues.length > 0 ? Math.max(...powerValues) : 0;
  const hasPowerData = powerValues.length > 0;

  // Convert GPS points for MapLibre (uses lon instead of lng, and keep power)
  const mapLibrePoints = gpsPoints.map(p => ({ lat: p.lat, lon: p.lng, power: p.power }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
        {t('activityDetail.route')}
      </h2>
      <div 
        className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600" 
        style={{ height: '500px' }}
      >
        {mapProvider === 'maplibre' ? (
          <MapLibreMap gpsData={mapLibrePoints} />
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {gpsPoints.length} {t('activityDetail.gpsPoints')} · 
          <span className="ml-2 inline-block w-3 h-3 rounded-full bg-green-500"></span> {t('activityDetail.start')} · 
          <span className="ml-2 inline-block w-3 h-3 rounded-full bg-red-500"></span> {t('activityDetail.finish')}
        </p>
        {hasPowerData && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('activityList.power')}:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(minPower)}W</span>
              <div className="w-32 h-4 rounded-full" style={{
                background: 'linear-gradient(to right, rgb(16, 185, 129), rgb(234, 179, 18), rgb(239, 68, 68))'
              }}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(maxPower)}W</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
