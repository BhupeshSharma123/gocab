'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export default function AdminDriversPage() {
  const supabase = createClient();
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('driver_profiles').select('*, user:user_id(full_name, email, phone)').order('created_at', { ascending: false }).then(({ data }) => setDrivers(data || []));
  }, []);

  const handleAction = async (userId: string, status: string) => {
    await supabase.from('driver_profiles').update({ status }).eq('user_id', userId);
    setDrivers(prev => prev.map(d => d.user_id === userId ? { ...d, status } : d));
    toast.success(`Driver ${status}`);
  };

  const statusColors: Record<string, string> = { approved: 'success', pending: 'warning', rejected: 'destructive', suspended: 'destructive' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Drivers</h1>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr className="text-left"><th className="p-3">Name</th><th className="p-3">Vehicle</th><th className="p-3">Plate</th><th className="p-3">Rating</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><p className="font-medium">{d.user?.full_name}</p><p className="text-xs text-gray-500">{d.user?.email}</p></td>
                <td className="p-3">{d.vehicle_make} {d.vehicle_model}</td>
                <td className="p-3 font-mono text-xs">{d.vehicle_plate}</td>
                <td className="p-3">{d.rating?.toFixed(1)}</td>
                <td className="p-3"><Badge variant={statusColors[d.status] as any || 'outline'} className="capitalize text-[10px]">{d.status}</Badge></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {d.status === 'pending' && <><Button size="sm" variant="outline" className="h-7 text-green-600" onClick={() => handleAction(d.user_id, 'approved')}><Check className="w-3 h-3" /></Button><Button size="sm" variant="outline" className="h-7 text-red-600" onClick={() => handleAction(d.user_id, 'rejected')}><X className="w-3 h-3" /></Button></>}
                    {d.status === 'approved' && <Button size="sm" variant="destructive" className="h-7" onClick={() => handleAction(d.user_id, 'suspended')}>Suspend</Button>}
                    {d.status === 'suspended' && <Button size="sm" variant="outline" className="h-7" onClick={() => handleAction(d.user_id, 'approved')}>Activate</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
