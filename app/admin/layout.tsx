'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Users, DollarSign, Ticket, Settings, MessageSquare, BarChart3, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/rides', label: 'Rides', icon: Car },
  { href: '/admin/drivers', label: 'Drivers', icon: Users },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/admin/pricing', label: 'Pricing', icon: BarChart3 },
  { href: '/admin/promo-codes', label: 'Promos', icon: Ticket },
  { href: '/admin/support', label: 'Support', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-64 bg-black text-white h-screen fixed">
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl"><Car className="w-6 h-6 text-brand" />GoCab Admin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-brand text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 w-full"><LogOut className="w-4 h-4" />Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
