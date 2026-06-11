'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getGreeting, formatCurrency, formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';

export default function CustomerDashboard() {
  const supabase = createClient();
  const { profile, setProfile } = useAuthStore();
  const [activeRide, setActiveRide] = useState<any>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) setProfile(p);

      // Active ride
      const { data: active } = await supabase.from('rides').select('*, driver:driver_id(full_name, phone)').eq('customer_id', user.id).in('status', ['searching','accepted','arriving','in_progress']).order('created_at', { ascending: false }).limit(1).single();
      setActiveRide(active);

      // Recent rides
      const { data: recent } = await supabase.from('rides').select('*').eq('customer_id', user.id).in('status', ['completed','cancelled']).order('created_at', { ascending: false }).limit(5);
      setRecentRides(recent || []);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <div className="p-4 space-y-4"><Skeleton className="h-40" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
          <p className="text-gray-500 text-sm">Where are you going?</p>
        </div>
      </div>

      {/* Active Ride Card */}
      {activeRide && (
        <Link href={`/customer/ride-tracking/${activeRide.id}`}>
          <Card className="bg-black text-white border-0">
            <CardContent className="p-6">
              <Badge className="bg-brand text-black mb-3">{activeRide.status.replace('_',' ')}</Badge>
              <div className="space-y-2">
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-brand" /><p className="text-sm">{activeRide.pickup_address}</p></div>
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-red-400" /><p className="text-sm">{activeRide.dropoff_address}</p></div>
              </div>
              {activeRide.driver && <p className="text-xs text-gray-300 mt-2">Driver: {activeRide.driver.full_name}</p>}
              <button className="mt-3 text-sm font-semibold text-brand flex items-center gap-1">Track Ride <ArrowRight className="w-3 h-3" /></button>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Book Button */}
      {!activeRide && (
        <Link href="/customer/book-ride">
          <div className="bg-black text-white rounded-2xl p-6 text-center hover:bg-gray-900 transition-colors cursor-pointer">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-brand" />
            <h2 className="text-lg font-bold">Book a Ride</h2>
            <p className="text-sm text-gray-400 mt-1">Enter pickup and dropoff</p>
          </div>
        </Link>
      )}

      {/* Recent Rides */}
      {recentRides.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Rides</h2>
          <div className="space-y-2">
            {recentRides.map(ride => (
              <div key={ride.id} className="bg-white border rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{ride.pickup_address} → {ride.dropoff_address}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(ride.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{ride.final_price ? formatCurrency(ride.final_price) : '--'}</p>
                    <Badge variant={ride.status === 'completed' ? 'success' : 'outline'} className="capitalize text-[10px]">{ride.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
