'use client';
import { useEffect, useRef } from 'react';
import type { MapMarkerData } from '@/types';
import { ACTIVITY_COLORS, ACTIVITY_ICONS } from '@/lib/utils';

interface MapViewProps {
  markers: MapMarkerData[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (marker: MapMarkerData) => void;
}

export default function MapView({ markers, center, zoom = 12, className = '', onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const validMarkers = markers.filter((m) => m.lat && m.lng);
    const defaultCenter: [number, number] = validMarkers.length > 0
      ? [validMarkers[0].lat, validMarkers[0].lng]
      : (center || [48.8566, 2.3522]);

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix Leaflet icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.setView(center || defaultCenter, zoom);

      // Add markers
      validMarkers.forEach((marker) => {
        const color = marker.activityType
          ? ACTIVITY_COLORS[marker.activityType]
          : marker.type === 'stay' ? '#f97316' : marker.type === 'transport' ? '#64748b' : '#6366f1';

        const icon = marker.activityType
          ? ACTIVITY_ICONS[marker.activityType]
          : marker.type === 'stay' ? '🏨' : '✈️';

        const divIcon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50%;
            background:${color};color:white;
            display:flex;align-items:center;justify-content:center;
            font-size:16px;border:3px solid white;
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            cursor:pointer;transition:transform 0.2s;
          ">${icon}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const m = L.marker([marker.lat, marker.lng], { icon: divIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px;padding:8px 0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <div style="width:32px;height:32px;border-radius:8px;background:${color}18;display:flex;align-items:center;justify-content:center;font-size:16px">${icon}</div>
                <div>
                  <p style="font-weight:600;font-size:13px;margin:0;color:#0f172a">${marker.name}</p>
                  <p style="font-size:11px;margin:0;color:#64748b;text-transform:capitalize">${marker.activityType || marker.type}</p>
                </div>
              </div>
              ${marker.day !== undefined ? `<p style="font-size:11px;color:#6366f1;font-weight:500;margin:0">Day ${marker.day}</p>` : ''}
            </div>
          `);

        if (onMarkerClick) {
          m.on('click', () => onMarkerClick(marker));
        }

        markersRef.current.push(m);
      });

      // Fit bounds if multiple markers
      if (validMarkers.length > 1) {
        const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      // Remove old markers
      markersRef.current.forEach((m) => (m as { remove: () => void }).remove());
      markersRef.current = [];

      const validMarkers = markers.filter((m) => m.lat && m.lng);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapInstanceRef.current as any;

      validMarkers.forEach((marker) => {
        const color = marker.activityType
          ? ACTIVITY_COLORS[marker.activityType]
          : marker.type === 'stay' ? '#f97316' : marker.type === 'transport' ? '#64748b' : '#6366f1';

        const icon = marker.activityType
          ? ACTIVITY_ICONS[marker.activityType]
          : marker.type === 'stay' ? '🏨' : '✈️';

        const divIcon = L.divIcon({
          html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer">${icon}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const m = L.marker([marker.lat, marker.lng], { icon: divIcon })
          .addTo(map)
          .bindPopup(`<div style="min-width:160px"><p style="font-weight:600;font-size:13px;margin:0">${marker.name}</p><p style="font-size:11px;margin:4px 0 0;color:#64748b;text-transform:capitalize">${marker.activityType || marker.type}</p>${marker.day !== undefined ? `<p style="font-size:11px;color:#6366f1;margin:4px 0 0">Day ${marker.day}</p>` : ''}</div>`);

        if (onMarkerClick) m.on('click', () => onMarkerClick(marker));
        markersRef.current.push(m);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  return <div ref={mapRef} className={`map-container ${className}`} style={{ zIndex: 0 }} />;
}
