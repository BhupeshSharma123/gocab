'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Car, Users, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({ rides: 0, customers: 0, drivers: 0, revenue: 0, activeRides: 0, onlineDrivers: 0 });

  useEffect(() => {
    async function load() {
      const [{ count: rides }, { count: customers }, { count: drivers }, { count: activeRides }, { count: onlineDrivers }] = await Promise.all([
        supabase.from('rides').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
        supabase.from('rides').select('*', { count: 'exact', head: true }).in('status', ['searching','accepted','arriving','in_progress']),
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('is_online', true),
      ]);
      setStats({ rides: rides || 0, customers: customers || 0, drivers: drivers || 0, revenue: 0, activeRides: activeRides || 0, onlineDrivers: onlineDrivers || 0 });
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Rides', value: stats.rides, icon: Car, color: 'text-blue-600' },
    { label: 'Active Rides', value: stats.activeRides, icon: Activity, color: 'text-green-600' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'text-purple-600' },
    { label: 'Drivers', value: stats.drivers, icon: Users, color: 'text-orange-600' },
    { label: 'Online Drivers', value: stats.onlineDrivers, icon: Activity, color: 'text-emerald-600' },
    { label: 'Revenue', value: formatCurrency(0), icon: DollarSign, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => (
          <Card key={c.label}><CardContent className="p-4"><c.icon className={`w-5 h-5 ${c.color} mb-2`} /><p className="text-2xl font-bold">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
