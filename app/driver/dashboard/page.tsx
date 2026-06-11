'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Power, MapPin, DollarSign, Star, Clock, TrendingUp } from 'lucide-react';

export default function DriverDashboard() {
  const supabase = createClient();
  const { profile, setProfile } = useAuthStore();
  const [driver, setDriver] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (p) setProfile(p);
        const { data: dp } = await supabase.from('driver_profiles').select('*').eq('user_id', user.id).single();
        setDriver(dp); setIsOnline(dp?.is_online || false);
        if (dp) {
          const { data: ar } = await supabase.from('rides').select('*').eq('driver_id', user.id).in('status', ['accepted','arriving','in_progress']).single();
          setActiveRide(ar);
        }
      } catch(e) {}
      setLoading(false);
    }
    load();
  }, []);

  const toggleOnline = async () => {
    if (!driver) return;
    const newStatus = !isOnline;
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      await supabase.from('driver_profiles').update({ is_online: newStatus, current_lat: pos.coords.latitude, current_lng: pos.coords.longitude }).eq('user_id', driver.user_id);
      setIsOnline(newStatus);
      toast.success(newStatus ? 'You are online' : 'Offline');
    }, async () => {
      await supabase.from('driver_profiles').update({ is_online: newStatus }).eq('user_id', driver.user_id);
      setIsOnline(newStatus);
      toast.success(newStatus ? 'Online' : 'Offline');
    });
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-12 h-12 border-2 border-brand border-t-transparent rounded-full animate-spin"/></div>;
  if (driver?.status === 'pending') return <div className="min-h-screen bg-surface flex items-center justify-center p-8 text-center"><div><div className="w-16 h-16 mx-auto rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4"><Clock className="w-8 h-8 text-warning"/></div><h2 className="text-xl font-bold text-foreground">Approval Pending</h2><p className="text-muted-foreground text-sm mt-2">Documents under review. You'll be notified once approved.</p></div></div>;

  const stats = [
    { label: 'Rides', value: driver?.total_rides || 0, icon: MapPin, color: 'text-brand' },
    { label: 'Earnings', value: formatCurrency(driver?.total_earnings || 0), icon: DollarSign, color: 'text-success' },
    { label: 'Rating', value: driver?.rating?.toFixed(1) || '5.0', icon: Star, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-surface p-5 space-y-6">
      <div className="flex items-center justify-between pt-8">
        <div><h1 className="text-2xl font-extrabold text-foreground">Hi, {profile?.full_name?.split(' ')[0] || 'Driver'}</h1><p className="text-muted-foreground text-sm">Ready to earn today?</p></div>
        <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-lg">{driver?.vehicle_plate?.slice(-3) || '🚗'}</div>
      </div>

      {/* Online Toggle */}
      <div className="text-center">
        <button onClick={toggleOnline} className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
          isOnline ? 'bg-success shadow-xl shadow-success/30 scale-105' : 'bg-muted border-2 border-border'
        }`}>
          <Power className={`w-12 h-12 ${isOnline ? 'text-white' : 'text-muted-foreground'}`} />
        </button>
        <p className={`mt-3 font-bold text-lg ${isOnline ? 'text-success' : 'text-muted-foreground'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</p>
        <p className="text-xs text-muted-foreground">{isOnline ? 'Receiving ride requests' : 'Tap to go online'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active Ride */}
      {activeRide && (
        <div className="glass-card-elevated p-5 space-y-3 animate-slide-up">
          <span className="status-accepted text-xs font-semibold px-3 py-1 rounded-full capitalize">{activeRide.status.replace('_',' ')}</span>
          <div className="space-y-2">
            <div className="flex items-start gap-2"><div className="w-3 h-3 rounded-full bg-brand mt-1 shrink-0"/><p className="text-sm text-foreground/70">{activeRide.pickup_address}</p></div>
            <div className="flex items-start gap-2"><div className="w-3 h-3 rounded-full bg-destructive mt-1 shrink-0"/><p className="text-sm text-foreground/70">{activeRide.dropoff_address}</p></div>
          </div>
          <a href="/driver/active-ride" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">View Active Ride <TrendingUp className="w-3.5 h-3.5"/></a>
        </div>
      )}

      {!activeRide && isOnline && (
        <div className="glass-card p-8 text-center">
          <div className="w-12 h-12 mx-auto border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-foreground font-medium">Waiting for ride requests...</p>
          <p className="text-xs text-muted-foreground mt-1">We'll notify you when a rider is nearby</p>
        </div>
      )}
    </div>
  );
}
