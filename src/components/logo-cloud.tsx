import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LogoCloud() {
    return (
        <div className="mt-16 mb-8">
            <p className="text-center text-xs text-muted-foreground mb-4">Trusted by 100+ businesses worldwide</p>
            <div className="relative mx-auto max-w-xl">
                <InfiniteSlider
                    speedOnHover={20}
                    speed={40}
                    gap={48}>
                    <div className="flex items-center">
                        <img
                            className="mx-auto h-4 w-fit dark:invert opacity-60"
                            src="https://html.tailus.io/blocks/customers/column.svg"
                            alt="Column Logo"
                            height="16"
                            width="auto"
                        />
                    </div>
                    <div className="flex items-center">
                        <img
                            className="mx-auto h-4 w-fit dark:invert opacity-60"
                            src="https://html.tailus.io/blocks/customers/nike.svg"
                            alt="Nike Logo"
                            height="16"
                            width="auto"
                        />
                    </div>
                    <div className="flex items-center">
                        <img
                            className="mx-auto h-4 w-fit dark:invert opacity-60"
                            src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                            alt="Lemon Squeezy Logo"
                            height="16"
                            width="auto"
                        />
                    </div>
                    <div className="flex items-center">
                        <img
                            className="mx-auto h-3 w-fit dark:invert opacity-60"
                            src="https://html.tailus.io/blocks/customers/laravel.svg"
                            alt="Laravel Logo"
                            height="12"
                            width="auto"
                        />
                    </div>
                    <div className="flex items-center">
                        <img
                            className="mx-auto h-5 w-fit dark:invert opacity-60"
                            src="https://html.tailus.io/blocks/customers/lilly.svg"
                            alt="Lilly Logo"
                            height="20"
                            width="auto"
                        />
                    </div>
                </InfiniteSlider>

                <ProgressiveBlur
                    className="pointer-events-none absolute left-0 top-0 h-full w-16"
                    direction="left"
                    blurIntensity={1}
                />
                <ProgressiveBlur
                    className="pointer-events-none absolute right-0 top-0 h-full w-16"
                    direction="right"
                    blurIntensity={1}
                />
            </div>
        </div>
    )
}
