'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => { supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).then(({ data }) => setTickets(data || [])); }, []);

  const handleReply = async (id: string) => {
    const reply = replyText[id] || '';
    await supabase.from('support_tickets').update({ admin_reply: reply, status: 'resolved' }).eq('id', id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, admin_reply: reply, status: 'resolved' } : t));
    toast.success('Reply sent');
  };

  const statusColors: Record<string, string> = { open: 'warning', in_progress: 'default', resolved: 'success' };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <div className="space-y-3">
        {tickets.map(t => (
          <div key={t.id} className="bg-white border rounded-xl p-4 space-y-3">
            <div className="flex justify-between"><div><p className="font-semibold">{t.subject}</p><p className="text-xs text-gray-500">{t.message}</p></div><Badge variant={statusColors[t.status] as any || 'outline'} className="capitalize text-[10px]">{t.status}</Badge></div>
            {t.admin_reply && <p className="text-sm bg-green-50 p-2 rounded-lg">Reply: {t.admin_reply}</p>}
            {t.status !== 'resolved' && (
              <div className="flex gap-2">
                <input className="flex-1 border rounded-xl px-3 py-2 text-sm" placeholder="Type reply..." value={replyText[t.id] || ''} onChange={e => setReplyText({...replyText, [t.id]: e.target.value})} />
                <Button size="sm" onClick={() => handleReply(t.id)}>Send</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
