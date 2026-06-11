'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter(); const supabase = createClient();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false); const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    try {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      router.push('/' + (profile?.role || 'customer') + '/dashboard');
    } catch { router.push('/customer/dashboard'); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Car className="w-8 h-8 text-brand" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to GoCab</p>
        </div>
        <form onSubmit={handleLogin} className="glass-card-elevated p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="email" required className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type={showPw ? 'text' : 'password'} required className="w-full pl-10 pr-10 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none transition-all" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-center text-sm text-muted-foreground">No account? <Link href="/auth/register" className="text-brand font-semibold hover:underline">Register</Link></p>
        </form>
      </div>
    </div>
  );
}
