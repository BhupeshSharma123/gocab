'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pickupHTML = '<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid #1E293B;box-shadow:0 0 12px rgba(37,99,235,0.5)"></div>';
const dropoffHTML = '<div style="width:16px;height:16px;border-radius:50%;background:#DC2626;border:3px solid #1E293B;box-shadow:0 0 12px rgba(220,38,38,0.5)"></div>';
const pickupIcon = L.divIcon({ html: pickupHTML, className: '', iconSize: [22, 22], iconAnchor: [11, 11] });
const dropoffIcon = L.divIcon({ html: dropoffHTML, className: '', iconSize: [22, 22], iconAnchor: [11, 11] });

interface Props {
  onPickupSelect: (loc: { lat: number; lng: number; address: string }) => void;
  onDropoffSelect: (loc: { lat: number; lng: number; address: string }) => void;
  selecting: 'pickup' | 'dropoff' | 'confirm';
}

export default function BookingMap({ onPickupSelect, onDropoffSelect, selecting }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const lineRef = useRef<L.Polyline | null>(null);
  const pickupPoint = useRef<{lat:number;lng:number} | null>(null);
  const dropoffPoint = useRef<{lat:number;lng:number} | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map('booking-map', { zoomControl: false, attributionControl: false }).setView([40.7128, -74.006], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      let address = lat.toFixed(4) + ', ' + lng.toFixed(4);
      try {
        const url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng;
        const res = await fetch(url);
        const data = await res.json();
        if (data.display_name) address = data.display_name;
      } catch (err) {}

      if (selecting === 'pickup') {
        pickupPoint.current = { lat, lng };
        markersRef.current.forEach(function(m) { m.remove(); });
        markersRef.current = [];
        const m = L.marker([lat, lng], { icon: pickupIcon }).addTo(map).bindPopup('Pickup');
        markersRef.current.push(m);
        onPickupSelect({ lat, lng, address });
      } else if (selecting === 'dropoff') {
        dropoffPoint.current = { lat, lng };
        if (markersRef.current.length > 1) markersRef.current[1].remove();
        const m = L.marker([lat, lng], { icon: dropoffIcon }).addTo(map).bindPopup('Dropoff');
        if (markersRef.current.length >= 1) markersRef.current.push(m);
        else markersRef.current = [m];
        onDropoffSelect({ lat, lng, address });

        if (lineRef.current) map.removeLayer(lineRef.current);
        if (pickupPoint.current) {
          lineRef.current = L.polyline(
            [[pickupPoint.current.lat, pickupPoint.current.lng], [lat, lng]],
            { color: '#2563EB', weight: 4, opacity: 0.8, dashArray: '10 6' }
          ).addTo(map);
          map.fitBounds(lineRef.current.getBounds(), { padding: [50, 50] });
        }
      }
    });

    mapRef.current = map;
    return function() { map.remove(); mapRef.current = null; };
  }, []);

  return <div id="booking-map" className="w-full h-full" />;
}
