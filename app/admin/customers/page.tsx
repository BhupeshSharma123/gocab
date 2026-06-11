'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }).then(({ data }) => setCustomers(data || []));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr className="text-left"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Status</th><th className="p-3">Joined</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.full_name}</td>
                <td className="p-3 text-xs">{c.email}</td>
                <td className="p-3 text-xs">{c.phone}</td>
                <td className="p-3"><Badge variant={c.is_active ? 'success' : 'destructive'} className="text-[10px]">{c.is_active ? 'Active' : 'Banned'}</Badge></td>
                <td className="p-3 text-xs text-gray-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
