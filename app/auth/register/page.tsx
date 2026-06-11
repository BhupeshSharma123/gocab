'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Car, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'customer' as 'customer' | 'driver' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone, role: form.role } },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    // Update profile role
    if (data.user) {
      await supabase.from('profiles').update({ role: form.role, phone: form.phone, full_name: form.fullName }).eq('id', data.user.id);
    }

    toast.success('Account created! Check your email to verify.');
    router.push('/login');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
            <Car className="w-7 h-7 text-brand" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500">Join GoCab today</p>
        </div>
        <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-sm border space-y-4">
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            {(['customer', 'driver'] as const).map(r => (
              <button key={r} type="button" onClick={() => setForm({...form, role: r})}
                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${form.role === r ? 'bg-black text-white' : 'text-gray-500'}`}>
                {r}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <div className="relative mt-1"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" required className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" required className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <div className="relative mt-1"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" required className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw ? 'text' : 'password'} required className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
