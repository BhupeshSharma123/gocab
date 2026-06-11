'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MapPin, Clock, X, Check } from 'lucide-react';

export default function RideRequestsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<Record<string, number>>({});

  useEffect(() => {
    const channel = supabase
      .channel('driver-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides', filter: 'status=eq.searching' }, (payload: any) => {
        setRequests(prev => [...prev, payload.new]);
      })
      .subscribe();

    // Load existing searching rides
    supabase.from('rides').select('*').eq('status', 'searching').order('created_at', { ascending: false }).limit(10).then(({ data }) => {
      setRequests(data || []);
    });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAccept = async (ride: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('rides').update({ driver_id: user.id, status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', ride.id);
    if (error) { toast.error('Ride already taken'); setRequests(prev => prev.filter(r => r.id !== ride.id)); return; }
    toast.success('Ride accepted!');
    router.push('/driver/active-ride');
  };

  const handleDecline = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Ride Requests</h1>
      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><MapPin className="w-12 h-12 mx-auto mb-3" /><p>No ride requests right now</p><p className="text-xs mt-1">Go online to receive requests</p></div>
      ) : (
        requests.map(ride => (
          <Card key={ride.id} className="border-l-4 border-l-brand">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" /><p className="text-sm">{ride.pickup_address}</p></div>
                <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" /><p className="text-sm">{ride.dropoff_address}</p></div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{ride.distance_km?.toFixed(1)} km • {ride.vehicle_type}</span>
                <span className="font-bold text-black">{ride.estimated_price ? formatCurrency(ride.estimated_price) : '--'}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1 gap-1" onClick={() => handleDecline(ride.id)}><X className="w-4 h-4" /> Decline</Button>
                <Button className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleAccept(ride)}><Check className="w-4 h-4" /> Accept</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
