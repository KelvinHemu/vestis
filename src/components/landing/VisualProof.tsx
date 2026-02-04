"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ============================================
   Visual Proof Section
   Before → After transformation showcase
   Trust through visuals, not words
   ============================================ */

export function VisualProof() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

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
            id="visual-proof"
            className="relative py-16 md:py-24 bg-background"
        >
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header - minimal */}
                <div
                    className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        See the difference
                    </h2>
                </div>

                {/* Before/After Grid */}
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                >
                    {/* Before */}
                    <div className="relative">
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-zinc-900/80 text-white text-sm font-medium px-3 py-1.5 rounded-full">
                                Before
                            </span>
                        </div>
                        <div className="aspect-[4/5] relative rounded-2xl overflow-hidden border bg-muted">
                            <Image
                                src="/sample/flatlay-1.jpg"
                                alt="Flat lay clothing photo"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-3">
                            Your flat lay photo
                        </p>
                    </div>

                    {/* After */}
                    <div className="relative">
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-full">
                                After
                            </span>
                        </div>
                        <div className="aspect-[4/5] relative rounded-2xl overflow-hidden border bg-muted">
                            <Image
                                src="/sample/model-1.jpg"
                                alt="On-model try-on result"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-3">
                            Professional try-on image
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
