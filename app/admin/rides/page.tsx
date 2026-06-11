'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminRidesPage() {
  const supabase = createClient();
  const [rides, setRides] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let q = supabase.from('rides').select('*, customer:customer_id(full_name), driver:driver_id(full_name)').order('created_at', { ascending: false }).limit(100);
    if (filter !== 'all') q = q.eq('status', filter);
    q.then(({ data }) => setRides(data || []));
  }, [filter]);

  const statusColors: Record<string, string> = { completed: 'success', cancelled: 'destructive', searching: 'warning', accepted: 'default', arriving: 'default', in_progress: 'default' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rides</h1>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {['all','searching','accepted','arriving','in_progress','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap ${filter === f ? 'bg-black text-white' : 'bg-gray-100'}`}>{f.replace('_',' ')}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr className="text-left"><th className="p-3">Customer</th><th className="p-3">Driver</th><th className="p-3">From → To</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
          <tbody>
            {rides.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.customer?.full_name || '--'}</td>
                <td className="p-3">{r.driver?.full_name || '--'}</td>
                <td className="p-3 text-xs max-w-[200px] truncate">{r.pickup_address} → {r.dropoff_address}</td>
                <td className="p-3 font-medium">{r.final_price ? formatCurrency(r.final_price) : '--'}</td>
                <td className="p-3"><Badge variant={statusColors[r.status] as any || 'outline'} className="capitalize text-[10px]">{r.status.replace('_',' ')}</Badge></td>
                <td className="p-3 text-xs text-gray-500">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
