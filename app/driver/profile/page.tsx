'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { User, LogOut, Phone } from 'lucide-react';

export default function DriverProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) { setProfile(p); setName(p.full_name || ''); setPhone(p.phone || ''); }
    }
    load();
  }, []);

  const handleSave = async () => {
    await supabase.from('profiles').update({ full_name: name, phone }).eq('id', profile.id);
    toast.success('Profile updated');
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div><label className="text-sm font-medium">Name</label><input className="w-full border rounded-xl px-3 py-2 mt-1 text-sm" value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label className="text-sm font-medium">Phone</label><input className="w-full border rounded-xl px-3 py-2 mt-1 text-sm" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <Button className="w-full" onClick={handleSave}>Save</Button>
      </div>
      <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-full py-3 text-red-500 font-medium border border-red-200 rounded-xl flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
    </div>
  );
}

export const dynamic = "force-dynamic";
