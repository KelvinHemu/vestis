import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings2, Sparkles, Zap } from 'lucide-react'
import { ReactNode } from 'react'

export function Features() {
  return (
    <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Professional Fashion Photography, Reimagined</h2>
          <p className="mt-4">Create stunning on-model editorials from your existing assets. No models, photographers, or studios needed.</p>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Zap
                  className="size-6"
                  aria-hidden
                />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Flat Lay to Model</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm">Turn clarity into reality. Instantly transform basic flat lay photos into high-fashion lifestyle shots on real human models.</p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Settings2
                  className="size-6"
                  aria-hidden
                />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Mannequin Transformation</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">Ghost Mannequin? No Problem. Generate realistic human models wearing your clothes with perfect fit and lighting.</p>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Sparkles
                  className="size-6"
                  aria-hidden
                />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Creative Backgrounds</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">Infinite Scenes. Place your models in any environment, from studio cycs to Parisian streets, in seconds.</p>
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
