'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQsThree() {
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'clock',
            question: 'What does Vestis do?',
            answer: 'Vestis helps fashion sellers create realistic virtual try-on images and mini stores that convert social media traffic into sales.',
        },
        {
            id: 'item-2',
            icon: 'credit-card',
            question: 'Does Vestis handle payments?',
            answer: 'No. Sellers talk to buyers and receive payments directly via WhatsApp, Instagram, or their own channels.',
        },
        {
            id: 'item-3',
            icon: 'truck',
            question: 'Who pays for Vestis?',
            answer: 'Only sellers pay. Buyers use Vestis for free and never see pricing.',
        },
        {
            id: 'item-4',
            icon: 'globe',
            question: 'How does pricing work?',
            answer: 'Sellers pay a monthly subscription that includes a set number of virtual try-ons. Extra usage can be billed per try-on.',
        },
        {
            id: 'item-5',
            icon: 'package',
            question: 'Who owns the customers and data?',
            answer: 'Sellers fully own their customers and transactions. Vestis only uses anonymized usage data to improve the platform.',
        },
    ]

    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can't find what you're looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    customer support team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
