import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles } from 'lucide-react'

export default function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-32 bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6">
                {/* Hero Section */}
                <div className="mx-auto max-w-3xl space-y-6 text-center mb-6">
                    <h1 className="text-center text-4xl font-bold lg:text-5xl">
                        Simple & Transparent <span className="text-primary">Pricing</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Choose the plan that fits your business.<br />
                    </p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-16 md:grid-cols-3">
                    {/* Starter Plan - FREE */}
                    <Card className="relative border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                        <CardHeader>
                            <CardTitle className="font-medium flex items-center gap-2">
                                Starter
                                <span className="text-xs font-normal bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Free</span>
                            </CardTitle>
                            <span className="my-3 block text-3xl font-bold">
                                0 TZS
                            </span>
                            <CardDescription className="text-sm">
                                Experience Vestis with zero risk.
                            </CardDescription>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-4 w-full">
                                <Link href="/signup">Start for Free</Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">What&apos;s included</p>
                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '10 image generations (one-time)',
                                    'No credit card required',
                                    'Standard resolution',
                                    'Watermarked images',
                                    'Single garment per image',
                                    'Standard processing speed'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-3 text-green-500 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Seller Plan */}
                    <Card className="relative">
                        <CardHeader>
                            <CardTitle className="font-medium">Seller</CardTitle>
                            <span className="my-3 block text-3xl font-bold">
                                23,500 TZS <span className="text-base font-normal text-muted-foreground">/ mo</span>
                            </span>
                            <CardDescription className="text-sm">
                                For sellers ready to sell professionally online.
                            </CardDescription>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-4 w-full">
                                <Link href="/signup">Start Selling</Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Everything in Starter, plus</p>
                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '100 image generations / month',
                                    'No watermark',
                                    'Commercial usage rights',
                                    'Faster processing speed',
                                    'Secure cloud storage',
                                    'Email support'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-3 text-primary shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Growth Plan - Most Popular */}
                    <Card className="relative border-2 border-primary shadow-lg shadow-primary/10">
                        <span className="bg-primary absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-white/20">
                            Most Popular
                        </span>
                        <CardHeader>
                            <CardTitle className="font-medium">Growth</CardTitle>
                            <span className="my-3 block text-3xl font-bold">
                                47,500 TZS <span className="text-base font-normal text-muted-foreground">/ mo</span>
                            </span>
                            <CardDescription className="text-sm">
                                For serious sellers and growing fashion brands.
                            </CardDescription>
                            <Button
                                asChild
                                className="mt-4 w-full">
                                <Link href="/signup">Scale Your Business</Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Everything in Seller, plus</p>
                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '300 image generations / month',
                                    'Priority processing',
                                    'Priority cloud storage',
                                    'Batch uploads',
                                    'Email + chat support',
                                    'Perfect for high content velocity'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="size-3 text-primary shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
