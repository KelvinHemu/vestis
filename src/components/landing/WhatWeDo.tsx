"use client";

import { ScanFace, Store, Zap, Diamond, Target, Sparkles, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

/* ============================================
   What We Do Section
   Refined to match the requested compact card style
   With Light Mode Support
   ============================================ */

export function WhatWeDo() {
    return (
        <section id="what-we-do" className="py-32 bg-background relative overflow-hidden transition-colors duration-300">
            <div className="container px-6 mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-foreground tracking-tight mb-6">
                        Make your sales feel effortless
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Vestis streamlines your fashion business with AI-powered tools that just work.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
                    <FeatureCard
                        title="Seller Mini Store"
                        description="Your own dedicated digital catalog. Buyers browse products, visualize items on models, and initiate contact directly."
                        href="#mini-store"
                    >
                        <Diamond className="w-10 h-10 text-foreground" strokeWidth={1.5} />
                    </FeatureCard>

                    <FeatureCard
                        title="Social Content Gen"
                        description="Generate high-quality virtual try-on visuals for social media. Create a closed loop between your content and your store."
                        href="#social-content"
                    >
                        <Target className="w-10 h-10 text-foreground" strokeWidth={1.5} />
                    </FeatureCard>

                    <FeatureCard
                        title="Smart Visuals"
                        description="AI-powered visuals that adapt to your brand style automatically, ensuring consistency across your entire catalog."
                        href="#smart-visuals"
                    >
                        <Sparkles className="w-10 h-10 text-foreground" strokeWidth={1.5} />
                    </FeatureCard>

                    <FeatureCard
                        title="Speed & Efficiency"
                        description="Create weeks worth of content in minutes, not days. Focus on selling while we handle the visuals."
                        href="#efficiency"
                    >
                        <Zap className="w-10 h-10 text-foreground" strokeWidth={1.5} />
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}

const FeatureCard = ({
    title,
    description,
    children,
    href = '#'
}: {
    title: string;
    description: string;
    children: React.ReactNode;
    href?: string
}) => {
    return (
        <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-all duration-300">
            <div className="relative flex flex-col h-full">
                <div className="mb-2 text-foreground">{children}</div>

                <div className="space-y-2 py-6 flex-grow">
                    <h3 className="text-base font-medium text-foreground">{title}</h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
                </div>
            </div>
        </Card>
    );
}
