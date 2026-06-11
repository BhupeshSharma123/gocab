'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Car, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter(); const supabase = createClient();
  const [loading, setLoading] = useState(false); const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'customer' as 'customer' | 'driver' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.fullName, phone: form.phone, role: form.role } } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (data.user) {
      try { await supabase.from('profiles').update({ role: form.role, phone: form.phone, full_name: form.fullName }).eq('id', data.user.id); } catch {}
    }
    toast.success('Account created! Check email to verify.');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center"><Car className="w-8 h-8 text-brand" /></div>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join GoCab today</p>
        </div>
        <form onSubmit={handleRegister} className="glass-card-elevated p-6 space-y-4">
          <div className="flex gap-2 bg-surface rounded-xl p-1">
            {(['customer','driver'] as const).map(r => (
              <button key={r} type="button" onClick={() => setForm({...form, role: r})}
                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${form.role === r ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-muted-foreground'}`}>{r}</button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <div className="relative mt-1.5"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" required className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="email" required className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Phone</label>
            <div className="relative mt-1.5"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="tel" required className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Password</label>
            <div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type={showPw ? 'text' : 'password'} required className="w-full pl-10 pr-10 py-3 bg-surface border border-border rounded-xl text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-brand/25 transition-all disabled:opacity-50">{loading ? 'Creating account...' : 'Create Account'}</button>
          <p className="text-center text-sm text-muted-foreground">Have an account? <Link href="/auth/login" className="text-brand font-semibold hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
