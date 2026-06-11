'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [fee, setFee] = useState(20);
  const [name, setName] = useState('GoCab');

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card><CardHeader><CardTitle>Platform</CardTitle></CardHeader><CardContent className="space-y-3">
        <div><label className="text-sm font-medium">Platform Name</label><input className="w-full border rounded-xl px-3 py-2 mt-1 text-sm" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="text-sm font-medium">Platform Fee (%)</label><input type="number" className="w-full border rounded-xl px-3 py-2 mt-1 text-sm" value={fee} onChange={e => setFee(parseInt(e.target.value))} /></div>
        <Button onClick={() => toast.success('Settings saved')}>Save Settings</Button>
      </CardContent></Card>
    </div>
  );
}

export const dynamic = "force-dynamic";
