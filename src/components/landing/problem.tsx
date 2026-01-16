import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Wallet, EyeOff, Clock, Users } from 'lucide-react'
import { ReactNode } from 'react'

export function Problem() {
    return (
        <section id="problem" className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">What's holding your business back?</h2>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">The hidden barriers standing between your products and your customers.</p>
                </div>
                <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Wallet
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-lg font-medium">High Production Costs</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Professional photoshoots involving models, studios, and photographers drain your budget and eat into margins.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <EyeOff
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-lg font-medium">Low Buyer Confidence</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Flat-lays and mannequins fail to show realistic fit and drape, causing customer hesitation and abandoned carts.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Clock
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-lg font-medium">Slow Speed to Market</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Coordinating complex shoots takes weeks. By the time you get photos, you've missed the trend and the sale.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Users
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-lg font-medium">Lack of Local Relevance</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Generic AI tools miss local body types and cultural nuance, resulting in inauthentic visuals that don't connect.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
