'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { MessageSquare, Plus, ChevronDown } from 'lucide-react';

export default function SupportPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setTickets(data || []);
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!subject) { toast.error('Subject required'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('support_tickets').insert({ user_id: user!.id, subject, message });
    if (error) toast.error(error.message);
    else { toast.success('Ticket submitted'); setShowNew(false); setTickets([{ subject, message, status: 'open', created_at: new Date().toISOString() }, ...tickets]); }
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support</h1>
        <button onClick={() => setShowNew(!showNew)} className="bg-black text-white p-2 rounded-xl"><Plus className="w-5 h-5" /></button>
      </div>

      {showNew && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <input className="w-full border rounded-xl px-3 py-2 text-sm" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <textarea className="w-full border rounded-xl px-3 py-2 text-sm" rows={3} placeholder="Describe your issue..." value={message} onChange={e => setMessage(e.target.value)} />
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</Button>
        </div>
      )}

      <div className="space-y-2">
        {tickets.map(t => (
          <div key={t.id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{t.subject}</p>
                <p className="text-xs text-gray-500 mt-1">{t.message}</p>
                {t.admin_reply && <p className="text-xs text-green-600 mt-1 bg-green-50 p-2 rounded-lg">Reply: {t.admin_reply}</p>}
              </div>
              <Badge variant={t.status === 'resolved' ? 'success' : t.status === 'in_progress' ? 'warning' : 'outline'} className="capitalize text-[10px]">{t.status}</Badge>
            </div>
          </div>
        ))}
        {tickets.length === 0 && !showNew && <p className="text-center text-gray-500 py-12">No support tickets</p>}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
