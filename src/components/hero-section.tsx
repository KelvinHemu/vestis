import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { HeroHeader } from '@/components/header'
import LogoCloud from '@/components/logo-cloud'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    const imagePairs = [
        {
            before: '/images/before-1.jpeg',
            after: '/images/after-1.png',
        },
        {
            before: '/images/before-2.jpeg',
            after: '/images/after-2.png',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % imagePairs.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + imagePairs.length) % imagePairs.length);
    };

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring' as const,
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-0">
                            <Image
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="hidden size-full dark:block"
                                width="3276"
                                height="4095"
                                unoptimized
                            />
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">


                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    Sell Clothes Online With Confidence
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    Vestis helps Instagram & WhatsApp fashion sellers create realistic try-on visuals and mini stores that customers trust.
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-md px-8 py-6 text-base bg-blue-600 hover:bg-blue-500 text-white font-medium">
                                        <Link href="/signup">
                                            <span className="text-nowrap">Try Vestis for free</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>

                                {/* Logo Cloud - Trusted by section */}
                                <LogoCloud />
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="mask-b-from-55% relative mt-8 overflow-hidden px-4 sm:mt-12 md:mt-20 lg:px-8">
                                <div className="inset-shadow-2xs ring-white dark:inset-shadow-white/20 bg-white relative mx-auto max-w-6xl overflow-hidden rounded-2xl border-white p-2 shadow-lg shadow-zinc-950/15 ring-1">
                                    <div className="relative">
                                        <div className="flex gap-2 rounded-xl overflow-hidden">
                                            <div className="relative flex-1">
                                                <Image
                                                    src={imagePairs[currentIndex].before}
                                                    alt="Flat lay clothing photo"
                                                    width={960}
                                                    height={1080}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                                                    Before
                                                </span>
                                            </div>
                                            <div className="relative flex-1">
                                                <Image
                                                    src={imagePairs[currentIndex].after}
                                                    alt="AI-generated model wearing the clothes"
                                                    width={960}
                                                    height={1080}
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                                                    After
                                                </span>
                                            </div>
                                        </div>

                                        {/* Navigation Buttons */}
                                        <button
                                            onClick={prevSlide}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all hover:scale-110"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        {/* Dots Indicator */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {imagePairs.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                                        ? 'bg-white w-6'
                                                        : 'bg-white/50 hover:bg-white/75'
                                                        }`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>

            </main>
        </>
    )
}
