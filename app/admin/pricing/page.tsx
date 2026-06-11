'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const supabase = createClient();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { supabase.from('pricing_config').select('*').then(({ data }) => setConfigs(data || [])); }, []);

  const handleSave = async (vt: string, field: string, value: number) => {
    setLoading(true);
    await supabase.from('pricing_config').update({ [field]: value }).eq('vehicle_type', vt);
    setConfigs(prev => prev.map(c => c.vehicle_type === vt ? { ...c, [field]: value } : c));
    setLoading(false);
    toast.success('Updated');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pricing Configuration</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {configs.map(c => (
          <Card key={c.vehicle_type}>
            <CardHeader><CardTitle className="capitalize">{c.vehicle_type}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Base Fare', field: 'base_fare', value: c.base_fare },
                { label: 'Per KM Rate', field: 'per_km_rate', value: c.per_km_rate },
                { label: 'Per Min Rate', field: 'per_minute_rate', value: c.per_minute_rate },
                { label: 'Minimum Fare', field: 'minimum_fare', value: c.minimum_fare },
              ].map(f => (
                <div key={f.field}>
                  <label className="text-xs text-gray-500">{f.label}</label>
                  <div className="flex gap-2"><input type="number" step="0.01" className="flex-1 border rounded-lg px-2 py-1.5 text-sm" defaultValue={f.value} onBlur={e => handleSave(c.vehicle_type, f.field, parseFloat(e.target.value))} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
