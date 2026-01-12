'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  gpsData: Array<{ lat: number; lon: number; power?: number }>;
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

export default function MapLibreMap({ gpsData }: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || gpsData.length === 0) return;

    // Calculate min/max power for color scaling
    const powerValues = gpsData.filter(p => p.power != null).map(p => p.power!);
    const minPower = powerValues.length > 0 ? Math.min(...powerValues) : 0;
    const maxPower = powerValues.length > 0 ? Math.max(...powerValues) : 0;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [gpsData[0].lon, gpsData[0].lat],
      zoom: 13,
    });

    // Wait for map to load
    map.current.on('load', () => {
      if (!map.current) return;

      // Draw route as segments with power-based colors
      for (let i = 0; i < gpsData.length - 1; i++) {
        const start = gpsData[i];
        const end = gpsData[i + 1];
        
        const color = getPowerColor(start.power, minPower, maxPower);
        
        // Add a source for each segment
        map.current!.addSource(`route-segment-${i}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [[start.lon, start.lat], [end.lon, end.lat]],
            },
          },
        });

        // Add a layer for each segment with its color
        map.current!.addLayer({
          id: `route-segment-${i}`,
          type: 'line',
          source: `route-segment-${i}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      }

      // Add start marker
      new maplibregl.Marker({ color: '#10B981' })
        .setLngLat([gpsData[0].lon, gpsData[0].lat])
        .addTo(map.current!);

      // Add finish marker
      new maplibregl.Marker({ color: '#EF4444' })
        .setLngLat([gpsData[gpsData.length - 1].lon, gpsData[gpsData.length - 1].lat])
        .addTo(map.current!);

      // Fit bounds to show entire route
      const bounds = new maplibregl.LngLatBounds();
      gpsData.forEach(point => bounds.extend([point.lon, point.lat]));
      map.current!.fitBounds(bounds, { padding: 50 });
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [gpsData]);

  return <div ref={mapContainer} className="w-full h-full rounded-xl" />;
}
