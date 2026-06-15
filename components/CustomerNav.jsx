'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CustomerNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Browse', path: '/customer', icon: '🏪' },
    { label: 'Cart', path: '/customer/cart', icon: '🛒' },
    { label: 'Orders', path: '/customer/orders', icon: '📦' },
    { label: 'Profile', path: '/customer/profile', icon: '👤' },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/customer' && pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center justify-center flex-1 h-full py-1"
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className={`text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
