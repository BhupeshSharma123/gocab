'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function EarningsPage() {
  const supabase = createClient();
  const [driver, setDriver] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: dp } = await supabase.from('driver_profiles').select('*').eq('user_id', user.id).single();
      setDriver(dp);
      const { data: r } = await supabase.from('rides').select('*').eq('driver_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(50);
      setRides(r || []);
    }
    load();
  }, []);

  const totalEarnings = rides.reduce((sum, r) => sum + (r.final_price || 0) * 0.8, 0);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <Card className="bg-black text-white border-0"><CardContent className="p-6 text-center"><p className="text-sm text-gray-300">Total Earnings</p><p className="text-3xl font-bold mt-1">{formatCurrency(totalEarnings)}</p><p className="text-xs text-gray-400 mt-2">{rides.length} completed rides</p></CardContent></Card>
      <div className="space-y-2">
        {rides.slice(0, 20).map(r => (
          <div key={r.id} className="flex justify-between items-center bg-white border rounded-xl p-3"><div><p className="text-sm font-medium truncate max-w-[200px]">{r.pickup_address}</p><p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p></div><p className="font-semibold">{formatCurrency((r.final_price || 0) * 0.8)}</p></div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
