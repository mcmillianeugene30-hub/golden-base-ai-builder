'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Code2, 
  CreditCard, 
  Plug2, 
  Store, 
  Settings,
  Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Builder', href: '/dashboard/builder', icon: Sparkles },
  { name: 'My Apps', href: '/dashboard/apps', icon: Code2 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Connectors', href: '/dashboard/connectors', icon: Plug2 },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Golden Base AI</span>
        </Link>
      </div>

      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border border-yellow-400/30'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
