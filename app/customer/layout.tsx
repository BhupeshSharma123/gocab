'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, MapPin, Clock, User, MessageSquare, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b px-4 h-16 flex items-center">
        <Link href="/customer/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Car className="w-6 h-6 text-brand" /> <span>GoCab</span>
        </Link>
      </header>
      <main className="pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="flex justify-around py-2 max-w-lg mx-auto">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/customer/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'text-black' : 'text-gray-400'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
