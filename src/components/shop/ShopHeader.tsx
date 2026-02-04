"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ShopHeaderProps {
  shopSlug: string;
  shopName?: string;
}

export function ShopHeader({ shopSlug, shopName }: ShopHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: `/shop/${shopSlug}` },
    { label: "Collections", href: `/shop/${shopSlug}?view=collections` },
    { label: "New", href: `/shop/${shopSlug}?view=new` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-neutral-200/50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left Section - Menu & Navigation */}
          <div className="flex items-center gap-6">
            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-neutral-800" />
              ) : (
                <Image 
                  src="/images/shop/sandwitch.svg" 
                  alt="Menu" 
                  width={20} 
                  height={20} 
                  className="text-neutral-800"
                />
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  style={{ fontFamily: "'Beatrice Deck Trial', sans-serif" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center - Logo */}
          <Link 
            href={`/shop/${shopSlug}`}
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {/* Play button style logo */}
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-neutral-900"
              >
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </Link>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* Clock/Time Icon */}
            <button 
              className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors"
              aria-label="Recent"
            >
              <Clock className="h-4 w-4 text-white" />
            </button>

            {/* Cart Button */}
            <button 
              className="h-10 px-4 rounded-full bg-neutral-900 flex items-center gap-2 hover:bg-neutral-800 transition-colors"
              aria-label="Cart"
            >
              <span 
                className="text-sm font-medium text-white"
                style={{ fontFamily: "'Beatrice Deck Trial', sans-serif" }}
              >
                Cart
              </span>
              <div className="h-6 w-6 rounded-full bg-neutral-700 flex items-center justify-center">
                <ShoppingBag className="h-3 w-3 text-white" />
              </div>
            </button>

            {/* User/Profile Icon */}
            <button 
              className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors"
              aria-label="Account"
            >
              <User className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-48 border-t border-neutral-200" : "max-h-0"
          )}
        >
          <nav className="flex flex-col py-4 px-4 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                style={{ fontFamily: "'Beatrice Deck Trial', sans-serif" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
