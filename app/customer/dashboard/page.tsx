'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatTimeAgo, getGreeting } from '@/lib/utils';
import { MapPin, Navigation, Clock, Star, ArrowRight, ChevronRight, Shield } from 'lucide-react';

export default function CustomerDashboard() {
  const supabase = createClient();
  const { profile, setProfile } = useAuthStore();
  const [activeRide, setActiveRide] = useState<any>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (p) setProfile(p);

        const { data: active } = await supabase.from('rides').select('*, driver:driver_id(full_name, phone)').eq('customer_id', user.id).in('status', ['searching','accepted','arriving','in_progress']).order('created_at', { ascending: false }).limit(1).single();
        setActiveRide(active);

        const { data: recent } = await supabase.from('rides').select('*').eq('customer_id', user.id).in('status', ['completed','cancelled']).order('created_at', { ascending: false }).limit(5);
        setRecentRides(recent || []);
      } catch (e) {}
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusStyle = (status: string) => {
    const map: Record<string, string> = { searching: 'status-searching', accepted: 'status-accepted', arriving: 'status-arriving', in_progress: 'status-in-progress' };
    return map[status] || 'status-searching';
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{getGreeting()} 👋</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Where are you going today?</p>
          </div>
          <Link href="/customer/profile" className="w-10 h-10 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors">
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </Link>
        </div>
      </div>

      {/* Active Ride Card */}
      {activeRide && (
        <div className="px-5 mb-6 animate-slide-up">
          <Link href={`/customer/ride-tracking/${activeRide.id}`}>
            <div className="glass-card-elevated p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyle(activeRide.status)}`}>
                  {activeRide.status.replace('_', ' ')}
                </span>
                {activeRide.estimated_price && <span className="text-lg font-bold text-foreground">{formatCurrency(activeRide.estimated_price)}</span>}
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                  </div>
                  <p className="text-sm text-foreground/80">{activeRide.pickup_address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                  </div>
                  <p className="text-sm text-foreground/80">{activeRide.dropoff_address}</p>
                </div>
              </div>
              {activeRide.driver && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-sm font-bold text-brand">{activeRide.driver.full_name?.[0]}</div>
                  <span className="text-sm text-foreground/60">{activeRide.driver.full_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm font-semibold text-brand">
                Track Ride <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Book */}
      {!activeRide && (
        <div className="px-5 mb-6 animate-slide-up">
          <Link href="/customer/book-ride">
            <div className="glass-card-elevated p-8 text-center group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                <Navigation className="w-8 h-8 text-brand" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Book a Ride</h2>
              <p className="text-muted-foreground text-sm mt-1">Enter pickup and dropoff to get started</p>
            </div>
          </Link>
        </div>
      )}

      {/* Safety + Quick Actions */}
      <div className="px-5 mb-6">
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Safety Toolkit</p>
              <p className="text-xs text-muted-foreground">Emergency contacts & safety features</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Recent Rides */}
      {recentRides.length > 0 && (
        <div className="px-5 mb-20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground/70 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Rides</h2>
            <Link href="/customer/ride-history" className="text-xs text-brand font-medium">View All</Link>
          </div>
          <div className="space-y-2">
            {recentRides.map(ride => (
              <div key={ride.id} className="glass-card p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground/80">{ride.pickup_address} → {ride.dropoff_address}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(ride.created_at)}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-foreground">{ride.final_price ? formatCurrency(ride.final_price) : '--'}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${ride.status === 'completed' ? 'status-completed' : 'status-cancelled'}`}>{ride.status}</span>
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
