"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Wand2, Download, ArrowRight } from "lucide-react";

/* ============================================
   How It Works Section - Tailark Style
   Three simple steps to showcase the 
   dead-simple workflow
   ============================================ */

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your garment",
    description: "Drag and drop your product image. We accept JPG, PNG, and WebP formats up to 50MB.",
    accent: "violet",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Choose your style",
    description: "Select from flat lay, on-model, mannequin, or background change. Customize settings to match your brand.",
    accent: "fuchsia",
  },
  {
    number: "03",
    icon: Download,
    title: "Download & use",
    description: "Get your professional images in seconds. High-resolution files ready for your store or social media.",
    accent: "pink",
  },
];

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="how-it-works"
      className="relative py-24 lg:py-32 bg-background"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      {/* Decorative blurred orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[128px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div 
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Simple as it gets
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Three steps to
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              stunning imagery
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No photography skills required. No expensive equipment needed. 
            Just your product and a few clicks.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden lg:block absolute top-24 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-pink-500/50" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                {/* Step card */}
                <div className="relative rounded-2xl border bg-card p-8 h-full">
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-8">
                    <div className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white
                      ${step.accent === "violet" ? "bg-violet-500" : ""}
                      ${step.accent === "fuchsia" ? "bg-fuchsia-500" : ""}
                      ${step.accent === "pink" ? "bg-pink-500" : ""}
                    `}>
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`
                    inline-flex p-4 rounded-2xl mb-6 mt-4
                    ${step.accent === "violet" ? "bg-violet-500/10" : ""}
                    ${step.accent === "fuchsia" ? "bg-fuchsia-500/10" : ""}
                    ${step.accent === "pink" ? "bg-pink-500/10" : ""}
                  `}>
                    <step.icon className={`
                      w-8 h-8
                      ${step.accent === "violet" ? "text-violet-500" : ""}
                      ${step.accent === "fuchsia" ? "text-fuchsia-500" : ""}
                      ${step.accent === "pink" ? "text-pink-500" : ""}
                    `} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow indicator (not on last) */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-6">
                      <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
