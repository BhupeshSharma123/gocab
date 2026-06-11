'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Clock, User, MessageSquare } from 'lucide-react';

const NAV = [
  { href: '/customer/dashboard', label: 'Home', icon: Home },
  { href: '/customer/book-ride', label: 'Book', icon: MapPin },
  { href: '/customer/ride-history', label: 'History', icon: Clock },
  { href: '/customer/support', label: 'Support', icon: MessageSquare },
  { href: '/customer/profile', label: 'Profile', icon: User },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-surface">
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="glass-card-elevated border-t border-border rounded-t-2xl mx-2 mb-2">
          <div className="flex justify-around py-2 px-1">
            {NAV.map(item => {
              const active = pathname === item.href || (item.href !== '/customer/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-xl transition-all min-w-[56px] ${
                    active ? 'text-brand bg-brand/10' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  <item.icon className={`w-5 h-5 ${active ? 'text-brand' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
