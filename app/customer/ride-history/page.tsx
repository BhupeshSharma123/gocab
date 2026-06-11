'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function RideHistoryPage() {
  const supabase = createClient();
  const [rides, setRides] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let q = supabase.from('rides').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
      if (filter !== 'all') q = q.eq('status', filter);
      const { data } = await q.limit(50);
      setRides(data || []);
    }
    load();
  }, [filter]);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Ride History</h1>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {['all','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap ${filter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-2">
        {rides.map(ride => (
          <Card key={ride.id} className="cursor-pointer" onClick={() => setExpanded(expanded === ride.id ? null : ride.id)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 text-black shrink-0" /><p className="text-sm truncate">{ride.pickup_address}</p></div>
                  <div className="flex items-start gap-2 mt-1"><MapPin className="w-3.5 h-3.5 mt-0.5 text-red-500 shrink-0" /><p className="text-sm truncate">{ride.dropoff_address}</p></div>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <p className="font-semibold">{ride.final_price ? formatCurrency(ride.final_price) : '--'}</p>
                  <Badge variant={ride.status === 'completed' ? 'success' : 'destructive'} className="capitalize text-[10px]">{ride.status}</Badge>
                </div>
              </div>
              {expanded === ride.id && (
                <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
                  <p>Date: {formatDate(ride.created_at)}</p>
                  <p>Distance: {ride.distance_km?.toFixed(1)} km</p>
                  <p>Vehicle: {ride.vehicle_type}</p>
                  <p>Payment: {ride.payment_method} • {ride.payment_status}</p>
                  {ride.customer_rating && <p>Rating: {'⭐'.repeat(ride.customer_rating)}</p>}
                  {expanded === ride.id ? <ChevronUp className="w-4 h-4 mx-auto mt-1" /> : <ChevronDown className="w-4 h-4 mx-auto mt-1" />}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {rides.length === 0 && <p className="text-center text-gray-500 py-12">No rides found</p>}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
