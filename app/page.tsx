'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    async function check() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) { router.push('/auth/login'); return; }
        
        try {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          if (profile?.role === 'admin') { router.push('/admin/dashboard'); return; }
          if (profile?.role === 'driver') { router.push('/driver/dashboard'); return; }
        } catch (e) {
          // Profiles table may not exist yet - that's OK
        }
        router.push('/customer/dashboard');
      } catch (e) {
        router.push('/auth/login');
      }
    }
    check();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading GoCab...</p>
      </div>
    </div>
  );
}
