"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, User, Grid, Zap, Plus, CreditCard, Users, Image, Store, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useCredits } from '@/hooks/useUser';

/* ============================================
   Menu Configuration
   Define sidebar navigation items here
   ============================================ */
const menuItems = [
  { icon: Store, label: 'Shop', path: '/shop', badge: null },
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
   - Desktop: Fixed sidebar on left
   - Mobile: Hidden sidebar with hamburger menu
   ============================================ */
export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use TanStack Query for reactive user data with automatic caching
  const { data: user } = useUser();
  // Fetch credits from dedicated endpoint for real-time accuracy
  const { credits } = useCredits();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-50 md:hidden">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <NextImage
            src="/Vestis.svg"
            alt="Vestis Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <span className="font-semibold text-gray-900 dark:text-white">Vestis</span>
          <span className="text-[8px] font-bold text-amber-500">Beta</span>
        </Link>

        {/* Right side: Credits + Hamburger */}
        <div className="flex items-center gap-3">
          {/* Credits Display */}
          <Link
            href="/payment"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          >
            <Zap className="w-3 h-3 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">{credits}</span>
          </Link>

          {/* Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={cn(
        "fixed top-14 right-0 bottom-0 w-64 bg-white dark:bg-[#1A1A1A] border-l border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <nav className="flex flex-col p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-gray-600 dark:bg-gray-500 text-white px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section at Bottom of Mobile Menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">
                {user?.name || 'Profile'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email || 'View profile'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-white dark:bg-[#1A1A1A] border-r border-transparent dark:border-gray-700 flex-col items-center py-4 z-40">
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
    </>
  );
}
