'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const driverHTML = '<div style="width:32px;height:32px;border-radius:50%;background:#2563EB;border:3px solid #1E293B;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(37,99,235,0.5)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>';
const pickupHTML = '<div style="width:14px;height:14px;border-radius:50%;background:#22C55E;border:2px solid #1E293B;box-shadow:0 0 8px rgba(34,197,94,0.4)"></div>';
const dropoffHTML = '<div style="width:14px;height:14px;border-radius:50%;background:#DC2626;border:2px solid #1E293B;box-shadow:0 0 8px rgba(220,38,38,0.4)"></div>';
const driverIcon = L.divIcon({ html: driverHTML, className: '', iconSize: [38, 38], iconAnchor: [19, 19] });
const pickupIcon = L.divIcon({ html: pickupHTML, className: '', iconSize: [18, 18], iconAnchor: [9, 9] });
const dropoffIcon = L.divIcon({ html: dropoffHTML, className: '', iconSize: [18, 18], iconAnchor: [9, 9] });

interface Props { rideId: string; driverLat: number; driverLng: number; pickupLat: number; pickupLng: number; }

export default function LiveMap({ rideId, driverLat, driverLng, pickupLat, pickupLng }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (mapRef.current || !pickupLat) return;
    const map = L.map('live-map-' + rideId, { zoomControl: false, attributionControl: false }).setView([pickupLat, pickupLng], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map).bindPopup('Pickup');
    mapRef.current = map;
  }, [rideId, pickupLat, pickupLng]);

  useEffect(() => {
    if (!mapRef.current || !driverLat) return;
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLat, driverLng]);
    } else {
      driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: driverIcon, zIndexOffset: 100 }).addTo(mapRef.current).bindPopup('Driver');
    }
    // Draw line from driver to pickup
    if (lineRef.current) mapRef.current.removeLayer(lineRef.current);
    if (pickupLat) {
      lineRef.current = L.polyline([[driverLat, driverLng], [pickupLat, pickupLng]], { color: '#2563EB', weight: 3, opacity: 0.6, dashArray: '8 5' }).addTo(mapRef.current);
    }
    mapRef.current.setView([driverLat, driverLng], mapRef.current.getZoom());
  }, [driverLat, driverLng, pickupLat, pickupLng]);

  return <div id={'live-map-' + rideId} className="w-full h-full" />;
}
