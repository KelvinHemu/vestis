import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("grid gap-2", className)} {...props} />
    )
)
Field.displayName = "Field"

const FieldLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
    ({ className, ...props }, ref) => (
        <Label ref={ref} className={cn(className)} {...props} />
    )
)
FieldLabel.displayName = "FieldLabel"

const FieldError = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm font-medium text-red-500", className)} {...props} />
    )
)
FieldError.displayName = "FieldError"

export { Field, FieldLabel, FieldError }
