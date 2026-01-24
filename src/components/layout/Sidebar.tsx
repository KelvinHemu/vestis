"use client";

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, User, Grid, Zap, Plus, CreditCard, Users, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useCredits } from '@/hooks/useUser';

/* ============================================
   Menu Configuration
   Define sidebar navigation items here
   ============================================ */
const menuItems = [
  { icon: Home, label: 'Home', path: '/dashboard', badge: null },
  { icon: Plus, label: 'Create', path: '/create', badge: null },
  { icon: Users, label: 'Models', path: '/models', badge: null },
  { icon: Image, label: 'Backgrounds', path: '/backgrounds', badge: null },
  { icon: Grid, label: 'Projects', path: '/projects', badge: null },
  { icon: CreditCard, label: 'Payment', path: '/payment', badge: null },
];


/* ============================================
   Sidebar Component
   Main navigation sidebar with user profile
   and credits display at the bottom
   ============================================ */
export function Sidebar() {
  const pathname = usePathname();
  // Use TanStack Query for reactive user data with automatic caching
  const { data: user } = useUser();
  // Fetch credits from dedicated endpoint for real-time accuracy
  const { credits } = useCredits();


  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white dark:bg-[#1A1A1A] border-r border-transparent dark:border-gray-700 flex flex-col items-center py-4 z-40">
      {/* Brand Logo with Beta Badge - Links to Dashboard */}
      <Link href="/dashboard" className="mb-6 relative block">
        <NextImage
          src="/Vestis.svg"
          alt="Vestis Logo"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className="absolute -top-1 -right-4 text-[7px] font-bold text-amber-500">Beta</span>
      </Link>

      {/* Main Navigation Menu */}
      <nav className="flex-1 flex flex-col items-center space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "relative group flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>

              {/* Optional Badge (e.g., for notifications) */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-gray-600 dark:bg-gray-500 text-white px-1 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Profile & Credits */}
      <div className="flex flex-col items-center space-y-3 mb-4">
        {/* Profile Button with Avatar */}
        <Link
          href="/profile"
          className="relative group transition-all duration-200"
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-9 h-9 rounded-lg object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </Link>

        {/* Credits Display with Link to Payment */}
        <Link
          href="/payment"
          className="flex flex-col items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          title="Buy credits"
        >
          <Zap className="w-3 h-3 fill-gray-900 dark:fill-white text-gray-900 dark:text-white mb-0.5" />
          <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">{credits}</span>
        </Link>
      </div>
    </aside>
  );
}
