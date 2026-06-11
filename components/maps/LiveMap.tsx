'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const carIcon = L.divIcon({ html: '<div style="background:black;width:24px;height:24px;border-radius:50%;border:3px solid #F5C518;display:flex;align-items:center;justify-content:center"><span style="color:#F5C518;font-size:10px">🚗</span></div>', className: '', iconSize: [30, 30], iconAnchor: [15, 15] });
const pickupIcon = L.divIcon({ html: '<div style="background:black;width:16px;height:16px;border-radius:50%;border:2px solid white"></div>', className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
const dropoffIcon = L.divIcon({ html: '<div style="background:#DC2626;width:16px;height:16px;border-radius:50%;border:2px solid white"></div>', className: '', iconSize: [16, 16], iconAnchor: [8, 8] });

interface Props {
  rideId: string;
  driverLat: number;
  driverLng: number;
  pickupLat: number;
  pickupLng: number;
}

export default function LiveMap({ rideId, driverLat, driverLng, pickupLat, pickupLng }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    if (!pickupLat || !pickupLng) return;
    const map = L.map(`live-map-${rideId}`).setView([pickupLat, pickupLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
    L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map).bindPopup('Pickup');
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [rideId, pickupLat, pickupLng]);

  useEffect(() => {
    if (!mapRef.current || !driverLat || !driverLng) return;
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLat, driverLng]);
    } else {
      driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: carIcon }).addTo(mapRef.current).bindPopup('Driver');
    }
    mapRef.current.setView([driverLat, driverLng], mapRef.current.getZoom());
  }, [driverLat, driverLng]);

  return <div id={`live-map-${rideId}`} className="w-full h-full" />;
}
