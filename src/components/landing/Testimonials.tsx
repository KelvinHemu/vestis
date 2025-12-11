export function Testimonials() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl">
          <blockquote>
            <p className="text-lg font-semibold sm:text-xl md:text-3xl">Vestis increased our sales by helping us present products more clearly and consistently. Our visuals look professional, and customers now engage with our catalog far more confidently.</p>

            <div className="mt-12 flex items-center gap-6">
              <img className="h-7 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Nvidia Logo" height="20" width="auto" />
              <div className="space-y-1 border-l pl-6">
                <cite className="font-medium">Cecilia Said.</cite>
                <span className="text-muted-foreground block text-sm">CEO, Lemonsqueezy</span>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
