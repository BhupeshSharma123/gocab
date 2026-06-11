'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const iconHtml = '<div style="background:black;width:12px;height:12px;border-radius:50%;border:2px solid #F5C518"></div>';
const markerIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [12, 12], iconAnchor: [6, 6] });

interface Props {
  onPickupSelect: (loc: { lat: number; lng: number; address: string }) => void;
  onDropoffSelect: (loc: { lat: number; lng: number; address: string }) => void;
  selecting: 'pickup' | 'dropoff' | 'confirm';
}

export default function BookingMap({ onPickupSelect, onDropoffSelect, selecting }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map('booking-map').setView([40.7128, -74.006], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    map.on('click', async (e: L.LeafletMouseEvent) => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: markerIcon }).addTo(map);
      markersRef.current.push(marker);

      // Get address
      let address = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const data = await res.json();
        if (data.display_name) address = data.display_name;
      } catch {}

      if (selecting === 'pickup') onPickupSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address });
      else if (selecting === 'dropoff') onDropoffSelect({ lat: e.latlng.lat, lng: e.latlng.lng, address });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div id="booking-map" className="w-full h-full" />;
}
