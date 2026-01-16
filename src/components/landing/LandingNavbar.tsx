"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

/* ============================================
   Landing Page Navbar - Tailark Style
   Sleek, minimal, with smooth scroll behavior
   and glass morphism effect
   ============================================ */

const navLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler for anchor links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50"
          : "bg-transparent"
          }`}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/Vestis.svg"
                  alt="Vestis"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Vestis
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Button
                asChild
                className="h-10 px-5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-full text-sm font-medium"
              >
                <Link href="/signup">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isMobileMenuOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu content */}
        <div className={`absolute top-16 left-0 right-0 bg-zinc-900 border-b border-zinc-800 transition-all duration-300 ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}>
          <div className="px-6 py-8 space-y-6">
            {/* Mobile nav links */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Theme</span>
              <ThemeToggle />
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block text-lg text-zinc-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Mobile CTA */}
            <div className="pt-6 border-t border-zinc-800 space-y-4">
              <Link
                href="/login"
                className="block text-center text-zinc-400 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Button
                asChild
                className="w-full h-12 bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-medium"
              >
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

