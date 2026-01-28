"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Store, ArrowLeft } from "lucide-react";
import Image from "next/image";

// Form schema
export const shopFormSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters").max(50, "Shop name must be less than 50 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  contact_email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  contact_whatsapp: z.string().optional(),
});

export type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopFormProps {
  onSubmit: (data: ShopFormValues) => void;
  onBack: () => void;
  isPending: boolean;
}

export default function ShopForm({ onSubmit, onBack, isPending }: ShopFormProps) {
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: "",
      description: "",
      contact_email: "",
      contact_whatsapp: "",
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full py-6 sm:py-8 relative">
          {/* Back button - top left */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 -ml-2 lg:absolute lg:left-6 lg:top-8 lg:mb-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16">
            {/* Image - Smaller on mobile, larger on desktop */}
            <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
              <Image
                src="/shopping.svg"
                alt="Set up your shop"
                width={500}
                height={400}
                className="w-[200px] sm:w-[280px] lg:w-[420px] xl:w-[500px]"
                draggable={false}
              />
            </div>

            {/* Form on Right */}
            <div className="flex-1 w-full max-w-md">
              {/* Header */}
              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Set up your shop</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Fill in your shop details. You can always update these later.
                </p>
              </div>

              {/* Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Fashion Store"
                            {...field}
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          This will be displayed on your storefront.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell customers about your shop and what makes it special..."
                            {...field}
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contact@yourshop.com"
                            {...field}
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Customers can reach you at this email.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+255712345678"
                            {...field}
                            className="h-10 sm:h-11"
                          />
                        </FormControl>
                        <FormDescription className="text-xs sm:text-sm">
                          Include country code for WhatsApp orders.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 text-base font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating your shop...
                        </>
                      ) : (
                        <>
                          <Store className="mr-2 h-5 w-5" />
                          Create Shop
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
