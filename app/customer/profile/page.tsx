'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, LogOut } from 'lucide-react';

export default function CustomerProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (profile) { setName(profile.full_name || ''); setPhone(profile.phone || ''); } }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', profile?.id);
    if (error) toast.error(error.message);
    else { toast.success('Profile updated'); setProfile({ ...profile!, full_name: name, phone }); }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">{profile?.full_name?.[0] || '?'}</div>
        <div>
          <p className="font-semibold">{profile?.full_name}</p>
          <p className="text-sm text-gray-500">{profile?.email}</p>
        </div>
      </div>
      <div className="space-y-4 bg-white p-6 rounded-xl border">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <div className="flex items-center gap-2 mt-1 border rounded-xl px-3 py-2"><User className="w-4 h-4 text-gray-400" /><input className="flex-1 text-sm focus:outline-none" value={name} onChange={e => setName(e.target.value)} /></div>
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <div className="flex items-center gap-2 mt-1 border rounded-xl px-3 py-2"><Phone className="w-4 h-4 text-gray-400" /><input className="flex-1 text-sm focus:outline-none" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </div>
        <Button className="w-full" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
      </div>
      <button onClick={handleSignOut} className="w-full py-3 text-red-500 font-medium border border-red-200 rounded-xl flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</button>
    </div>
  );
}

export const dynamic = "force-dynamic";
