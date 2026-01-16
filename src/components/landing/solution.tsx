"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Store,
  Share2,
  UserSquare2,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================
   Solution Section - Cadence Style
   Showcase features with interactive tabs
   Clean, minimal design with stats dashboard
   ============================================ */

const features = [
  {
    id: "mini-store",
    icon: Store,
    label: "Mini Stores",
    title: "Seller-Hosted Digital Catalogs",
    description:
      "Launch your dedicated mini-store on Vestis. Showcase your full catalog where buyers can browse, virtually try items, and discover your brand through social links.",
    stats: {
      primary: { value: "100%", label: "Inventory Online", change: "Instant setup" },
      secondary: { value: "24/7", label: "Store Access", change: "Via social links" },
    },
    chartData: [120, 180, 240, 300, 420, 580, 650, 820],
    cta: "Launch your store",
  },
  {
    id: "social-content",
    icon: Share2,
    label: "Social Content",
    title: "Viral Social Content Generation",
    description:
      "Generate stunning virtual try-on visuals for your social media. Create a closed loop where every post connects directly back to your actionable mini-store.",
    stats: {
      primary: { value: "3x", label: "Engagement", change: "Vs static images" },
      secondary: { value: "60s", label: "Creation Time", change: "Per asset" },
    },
    chartData: [210, 260, 290, 380, 410, 390, 480, 550],
    cta: "Create content",
  },
  {
    id: "virtual-try-on",
    icon: UserSquare2,
    label: "Virtual Try-On",
    title: "AI-Powered Virtual Try-On",
    description:
      "Enable buyers to try products virtually using our platform-owned models. Build sizing confidence and trust without the need for physical models or studios.",
    stats: {
      primary: { value: "40%", label: "Less Returns", change: "Better visualization" },
      secondary: { value: "2x", label: "Conversion", change: "With try-on" },
    },
    chartData: [280, 320, 290, 350, 400, 380, 420, 390],
    cta: "Try it out",
  },
  {
    id: "conversion",
    icon: MessageCircle,
    label: "Conversion",
    title: "Direct Conversion Enablement",
    description:
      "We focus on enablement, not transaction fees. Buyers initiate purchase conversations directly with you via WhatsApp or Instagram, keeping you in control.",
    stats: {
      primary: { value: "100%", label: "Ownership", change: "Of client data" },
      secondary: { value: "0%", label: "Platform Fees", change: "On transactions" },
    },
    chartData: [150, 200, 180, 250, 300, 450, 500, 600],
    cta: "Start selling",
  },
];

// Simple line chart component
function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 280;
    const y = 80 - ((value - min) / range) * 60;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 280 100" className="w-full h-full">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      <line x1="0" y1="25" x2="280" y2="25" stroke="rgb(63, 63, 70)" strokeWidth="1" strokeDasharray="4" />
      <line x1="0" y1="50" x2="280" y2="50" stroke="rgb(63, 63, 70)" strokeWidth="1" strokeDasharray="4" />
      <line x1="0" y1="75" x2="280" y2="75" stroke="rgb(63, 63, 70)" strokeWidth="1" strokeDasharray="4" />
      {/* Area fill */}
      <polygon
        points={`0,100 ${points} 280,100`}
        fill="url(#chartGradient)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="rgb(59, 130, 246)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 280;
        const y = 80 - ((value - min) / range) * 60;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="3"
            fill="rgb(24, 24, 27)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

export function Solution() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section id="solution" className="py-16 md:py-32 bg-background">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
            How Vestis turns lost sales into confident buyers
          </h2>
          <p className="text-muted-foreground text-lg">
            When customers can clearly visualize , confidence follows.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature.id === feature.id;

            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {feature.label}
              </button>
            );
          })}
        </div>

        {/* Feature Content */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Dashboard Preview Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Primary Stat */}
              <Card className="bg-zinc-800/50 border-zinc-700 p-4 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-zinc-400 text-sm">{activeFeature.stats.primary.label}</span>
                  <Copy className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="text-2xl font-semibold text-white mb-1">
                  {activeFeature.stats.primary.value}
                </div>
                <div className="text-xs text-zinc-500">
                  {activeFeature.stats.primary.change}
                </div>
              </Card>

              {/* Secondary Stat */}
              <Card className="bg-zinc-800/50 border-zinc-700 p-4 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-zinc-400 text-sm">{activeFeature.stats.secondary.label}</span>
                  <Copy className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="text-2xl font-semibold text-white mb-1">
                  {activeFeature.stats.secondary.value}
                </div>
                <div className="text-xs text-zinc-500">
                  {activeFeature.stats.secondary.change}
                </div>
              </Card>
            </div>

            {/* Chart Card */}
            <Card className="bg-zinc-800/50 border-zinc-700 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 text-sm">{activeFeature.stats.primary.label}</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              {/* Y-axis labels */}
              <div className="flex">
                <div className="flex flex-col justify-between text-xs text-zinc-500 pr-2 h-24">
                  <span>400</span>
                  <span>300</span>
                  <span>200</span>
                </div>
                {/* Chart */}
                <div className="flex-1 h-24">
                  <MiniChart data={activeFeature.chartData} />
                </div>
              </div>
            </Card>
          </Card>

          {/* Content */}
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">
              {activeFeature.title}
            </h3>

            <p className="text-muted-foreground leading-relaxed">
              {activeFeature.description}
            </p>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6">
              {activeFeature.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Solution;
