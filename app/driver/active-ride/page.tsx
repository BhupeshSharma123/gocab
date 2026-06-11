'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import nextDynamic from 'next/dynamic';
import { MapPin, Phone, Navigation } from 'lucide-react';

export default function ActiveRidePage() {
  const supabase = createClient();
  const [ride, setRide] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRide();
    const channel = supabase.channel('active-ride')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides' }, () => fetchRide())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRide = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: r } = await supabase.from('rides').select('*, customer:customer_id(full_name, phone)').eq('driver_id', user.id).in('status', ['accepted','arriving','in_progress']).single();
    if (r) { setRide(r); setCustomer(r.customer); }
  };

  const updateStatus = async (status: string) => {
    if (!ride) return;
    setLoading(true);
    const updates: any = { status };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('rides').update(updates).eq('id', ride.id);
    if (error) toast.error(error.message);
    else { setRide({ ...ride, ...updates }); toast.success(`Ride ${status.replace('_',' ')}`); }
    setLoading(false);

    // Update tracking
    if (status === 'arriving' || status === 'in_progress') {
      navigator.geolocation?.getCurrentPosition(async (pos) => {
        await supabase.from('ride_tracking').insert({ ride_id: ride.id, driver_lat: pos.coords.latitude, driver_lng: pos.coords.longitude });
        await supabase.from('driver_profiles').update({ current_lat: pos.coords.latitude, current_lng: pos.coords.longitude }).eq('user_id', ride.driver_id);
      });
    }
  };

  if (!ride) return <div className="p-8 text-center text-gray-500">No active ride</div>;

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Active Ride</h1><Badge variant="warning" className="capitalize">{ride.status.replace('_',' ')}</Badge></div>

      {customer && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">{customer.full_name?.[0]}</div>
            <div className="flex-1"><p className="font-semibold">{customer.full_name}</p><div className="flex gap-2"><a href={`tel:${customer.phone}`} className="text-xs text-green-600 flex items-center gap-1"><Phone className="w-3 h-3" />Call</a></div></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-black mt-0.5" /><div><p className="text-xs text-gray-400">Pickup</p><p className="text-sm">{ride.pickup_address}</p></div></div>
          <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-red-500 mt-0.5" /><div><p className="text-xs text-gray-400">Dropoff</p><p className="text-sm">{ride.dropoff_address}</p></div></div>
          <div className="flex justify-between pt-2 border-t text-sm"><span>Price</span><span className="font-bold">{formatCurrency(ride.estimated_price || 0)}</span></div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {ride.status === 'accepted' && <Button className="w-full" onClick={() => updateStatus('arriving')} disabled={loading}>I&apos;m Arriving</Button>}
        {ride.status === 'arriving' && <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => updateStatus('in_progress')} disabled={loading}>Start Ride</Button>}
        {ride.status === 'in_progress' && <Button className="w-full bg-black hover:bg-gray-800" onClick={() => updateStatus('completed')} disabled={loading}>Complete Ride</Button>}
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${ride.pickup_lat},${ride.pickup_lng}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 border rounded-xl text-sm font-medium">
          <Navigation className="w-4 h-4" /> Navigate to Pickup
        </a>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
