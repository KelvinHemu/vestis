"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ============================================
   Hero Section - Tailark Style
   The main attraction - bold, dramatic, 
   designed to make jaws drop
   ============================================ */

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />

      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Floating orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-[96px] animate-pulse delay-1000" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* Announcement badge */}
        <div
          className={`flex justify-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4 py-2 text-sm text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
          >
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span>Now with AI-powered background removal</span>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Main headline */}
        <div className="text-center">
          <h1
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <span className="text-white">Transform your</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              fashion photography
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            Generate stunning product shots in seconds. From flat lays to on-model imagery,
            Vestis gives you professional-grade visuals without the production hassle.
          </p>

          {/* CTA buttons */}
          <div
            className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-medium shadow-lg shadow-white/20 hover:shadow-white/30 transition-all"
            >
              <Link href="/signup">
                Start creating free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 px-8 text-base text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full font-medium"
            >
              <Link href="#demo">
                <Play className="mr-2 h-4 w-4" />
                Watch demo
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero image showcase */}
        <div
          className={`mt-20 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect behind the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/30 via-transparent to-transparent rounded-3xl blur-2xl" />

            {/* Main showcase container */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-2 shadow-2xl">
              {/* Browser chrome mockup */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-64 h-6 mx-auto rounded-md bg-zinc-800/80 flex items-center justify-center">
                    <span className="text-xs text-zinc-500">vestis.ai/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard preview */}
              <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center p-8">
                  {/* Feature grid preview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                    {[
                      { title: "Flat Lay", color: "from-violet-500 to-purple-500" },
                      { title: "On Model", color: "from-fuchsia-500 to-pink-500" },
                      { title: "Mannequin", color: "from-cyan-500 to-blue-500" },
                      { title: "Background", color: "from-amber-500 to-orange-500" },
                    ].map((feature, i) => (
                      <div
                        key={feature.title}
                        className="aspect-[3/4] rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 flex flex-col items-center justify-center gap-3 hover:border-zinc-600 transition-colors group"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                        <span className="text-sm text-zinc-400 font-medium">{feature.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div
          className={`mt-20 text-center transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-8">
            Trusted by forward-thinking brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {["ASOS", "Zalando", "H&M", "Zara", "Uniqlo"].map((brand) => (
              <span key={brand} className="text-xl font-semibold text-zinc-600 tracking-tight">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

