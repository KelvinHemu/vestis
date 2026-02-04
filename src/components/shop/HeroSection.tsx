"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShopItem } from "@/types/shop";

interface HeroSectionProps {
  shopSlug: string;
  items: ShopItem[];
}

export function HeroSection({ shopSlug, items }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const displayItems = items.slice(0, 6);

  return (
    <section className="min-h-[calc(100vh-56px)] p-8 lg:p-12">
      <div className="max-w-7xl h-full flex flex-col">
        {/* Hero Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tight uppercase mb-2">
                NEW<br />COLLECTION
              </h1>
           
            </div>

            <div className="flex items-center gap-6">
              <Button 
                asChild
                className="group bg-neutral-300/50 hover:bg-neutral-300 text-foreground px-8 py-6 text-base font-medium rounded-sm w-64 justify-between"
              >
                <Link href={`/shop/${shopSlug}?view=all`}>
                  Go To Shop
                  <span className="text-xl">→</span>
                </Link>
              </Button>

              {/* Carousel Controls */}
              {displayItems.length > 2 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 2))}
                    disabled={currentSlide === 0}
                    className="h-12 w-12 rounded-sm border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide(Math.min(displayItems.length - 2, currentSlide + 2))}
                    disabled={currentSlide >= displayItems.length - 2}
                    className="h-12 w-12 rounded-sm border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Carousel */}
          {displayItems.length > 0 && (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {displayItems.slice(currentSlide, currentSlide + 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${shopSlug}/item/${item.id}`}
                    className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-white shadow-lg"
                  >
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                        <span className="text-6xl">👔</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
