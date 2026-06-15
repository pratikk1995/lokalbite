'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StoreNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: '/store', icon: '📊' },
    { label: 'History', path: '/store/orders', icon: '📋' },
    { label: 'Products', path: '/store/products', icon: '🍔' },
    { label: 'Settings', path: '/store/settings', icon: '⚙️' },
    { label: 'Customer Panel', path: '/customer', icon: '👤' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/store' && pathname.startsWith(item.path));
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
