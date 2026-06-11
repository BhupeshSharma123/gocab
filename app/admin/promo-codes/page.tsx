'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export default function PromoCodesPage() {
  const supabase = createClient();
  const [promos, setPromos] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: 10, max_uses: 100 });

  useEffect(() => { supabase.from('promo_codes').select('*').order('created_at', { ascending: false }).then(({ data }) => setPromos(data || [])); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from('promo_codes').insert(form);
    if (error) toast.error(error.message);
    else { toast.success('Promo created'); setShowNew(false); setPromos([{...form, id: Date.now(), used_count: 0, is_active: true}, ...promos]); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Promo Codes</h1><Button onClick={() => setShowNew(!showNew)} className="gap-1"><Plus className="w-4 h-4" />New</Button></div>
      {showNew && (
        <Card><CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs">Code</label><input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} /></div>
            <div><label className="text-xs">Type</label><select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div>
            <div><label className="text-xs">Value</label><input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.discount_value} onChange={e => setForm({...form, discount_value: parseFloat(e.target.value)})} /></div>
            <div><label className="text-xs">Max Uses</label><input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.max_uses} onChange={e => setForm({...form, max_uses: parseInt(e.target.value)})} /></div>
          </div>
          <Button className="w-full" onClick={handleCreate}>Create Promo Code</Button>
        </CardContent></Card>
      )}
      <div className="space-y-2">
        {promos.map(p => (
          <Card key={p.id}><CardContent className="p-4 flex justify-between items-center"><div><p className="font-bold text-lg">{p.code}</p><p className="text-xs text-gray-500">{p.discount_type === 'percentage' ? `${p.discount_value}% off` : `$${p.discount_value} off`} • {p.used_count}/{p.max_uses} used</p></div><Badge variant={p.is_active ? 'success' : 'outline'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
