'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Car } from 'lucide-react';

export default function DriverDocumentsPage() {
  const supabase = createClient();
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('driver_profiles').select('*').eq('user_id', user.id).single();
      setDriver(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-4 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Documents</h1>
      <div className="flex items-center gap-2">
        <Badge variant={driver?.status === 'approved' ? 'success' : driver?.status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">{driver?.status || 'Unknown'}</Badge>
      </div>
      <Card><CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-3"><Car className="w-5 h-5 text-gray-500" /><div><p className="font-medium">{driver?.vehicle_make} {driver?.vehicle_model} ({driver?.vehicle_year})</p><p className="text-xs text-gray-500">{driver?.vehicle_color} • {driver?.vehicle_plate} • {driver?.vehicle_type}</p></div></div>
        <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-500" /><div><p className="font-medium">License: {driver?.license_number}</p><p className="text-xs text-gray-500">Expires: {driver?.license_expiry || 'N/A'}</p></div></div>
      </CardContent></Card>
    </div>
  );
}

export const dynamic = "force-dynamic";
