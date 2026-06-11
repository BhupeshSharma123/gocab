'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Power, MapPin, DollarSign, Star, Clock } from 'lucide-react';

export default function DriverDashboard() {
  const supabase = createClient();
  const { profile, setProfile } = useAuthStore();
  const [driver, setDriver] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) setProfile(p);
      const { data: dp } = await supabase.from('driver_profiles').select('*').eq('user_id', user.id).single();
      setDriver(dp);
      setIsOnline(dp?.is_online || false);
      if (dp) {
        const { data: ar } = await supabase.from('rides').select('*').eq('driver_id', user.id).in('status', ['accepted','arriving','in_progress']).single();
        setActiveRide(ar);
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleOnline = async () => {
    if (!driver) return;
    const newStatus = !isOnline;
    // Get current location
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      await supabase.from('driver_profiles').update({ is_online: newStatus, current_lat: pos.coords.latitude, current_lng: pos.coords.longitude }).eq('user_id', driver.user_id);
      setIsOnline(newStatus);
      toast.success(newStatus ? 'You are now online' : 'You are now offline');
    }, async () => {
      await supabase.from('driver_profiles').update({ is_online: newStatus }).eq('user_id', driver.user_id);
      setIsOnline(newStatus);
      toast.success(newStatus ? 'Online (enable location)' : 'Offline');
    });
  };

  if (loading) return <div className="p-4 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-24" /></div>;

  if (driver?.status === 'pending') {
    return <div className="p-8 text-center"><div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-yellow-600" /></div><h2 className="text-xl font-bold">Account Pending</h2><p className="text-gray-500 mt-2">Your documents are being reviewed. You'll be notified once approved.</p></div>;
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Online/Offline Toggle */}
      <div className="text-center">
        <button onClick={toggleOnline} className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${isOnline ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
          <Power className="w-10 h-10" />
        </button>
        <p className={`mt-2 font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</p>
        <p className="text-xs text-gray-400 mt-1">{isOnline ? 'Receiving ride requests' : 'Tap to go online'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Rides', value: driver?.total_rides || 0, icon: MapPin },
          { label: 'Earnings', value: formatCurrency(driver?.total_earnings || 0), icon: DollarSign },
          { label: 'Rating', value: driver?.rating?.toFixed(1) || '5.0', icon: Star },
        ].map(stat => (
          <Card key={stat.label}><CardContent className="p-3 text-center"><stat.icon className="w-5 h-5 mx-auto mb-1 text-gray-500" /><p className="text-lg font-bold">{stat.value}</p><p className="text-[10px] text-gray-400">{stat.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Active Ride */}
      {activeRide && (
        <Card className="bg-black text-white border-0">
          <CardContent className="p-6">
            <Badge className="bg-brand text-black mb-3">{activeRide.status.replace('_',' ')}</Badge>
            <div className="space-y-2"><div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-brand" /><p className="text-sm">{activeRide.pickup_address}</p></div><div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-red-400" /><p className="text-sm">{activeRide.dropoff_address}</p></div></div>
            <a href={`/driver/active-ride`} className="mt-3 inline-block text-sm font-semibold text-brand">View Active Ride →</a>
          </CardContent>
        </Card>
      )}

      {!activeRide && isOnline && <p className="text-center text-sm text-gray-400">Waiting for ride requests...</p>}
    </div>
  );
}

export const dynamic = "force-dynamic";
