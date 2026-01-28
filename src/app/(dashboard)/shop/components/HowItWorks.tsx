"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { features } from "./features";

interface HowItWorksProps {
  onContinue: () => void;
  shopName: string;
}

export default function HowItWorks({ onContinue, shopName }: HowItWorksProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 w-full py-8 sm:py-12">
          {/* Success Header */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              🎉 {shopName} is ready!
            </h1>
            <p className="text-muted-foreground">
              Your shop has been created. Here&apos;s how to get started.
            </p>
          </div>

          {/* How It Works Section */}
          <div className="mb-10 sm:mb-12">
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-8">
              How It Works
            </h2>
            
            <div className="grid gap-6 sm:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex gap-4 sm:gap-6 items-start p-4 sm:p-6 rounded-xl bg-muted/50 border"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Add your best AI-generated fashion images as products</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Share your shop link on social media to attract customers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Set clear prices and descriptions for each item</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky CTA Footer */}
      <div className="sticky bottom-0 bg-background border-t p-4 sm:p-6">
        <div className="mx-auto max-w-md">
          <Button
            size="lg"
            onClick={onContinue}
            className="w-full h-12 text-base font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Go to My Shop
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
