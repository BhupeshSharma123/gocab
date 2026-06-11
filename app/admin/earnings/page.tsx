'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

export default function AdminEarningsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({ gross: 0, platform: 0, driver: 0 });

  useEffect(() => {
    supabase.from('rides').select('final_price').eq('status', 'completed').then(({ data }) => {
      const total = (data || []).reduce((s, r) => s + (r.final_price || 0), 0);
      setStats({ gross: total, platform: total * 0.2, driver: total * 0.8 });
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Revenue</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Gross Revenue', value: formatCurrency(stats.gross), color: 'bg-blue-500' },
          { label: 'Platform Fee (20%)', value: formatCurrency(stats.platform), color: 'bg-green-500' },
          { label: 'Driver Earnings', value: formatCurrency(stats.driver), color: 'bg-purple-500' },
        ].map(c => (
          <Card key={c.label}><CardContent className="p-6"><DollarSign className="w-6 h-6 mb-2 text-gray-400" /><p className="text-2xl font-bold">{c.value}</p><p className="text-sm text-gray-500">{c.label}</p></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
