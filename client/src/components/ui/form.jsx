"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const Form = React.forwardRef(({ ...props }, ref) => {
  return <form ref={ref} {...props} />
})
Form.displayName = "Form"

function FormField({ className, ...props }) {
  return <div data-slot="form-field" className={cn("grid gap-2", className)} {...props} />
}

function FormItem({ className, ...props }) {
  return <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
}

function FormLabel({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="form-label"
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function FormControl({ ...props }) {
  return <Slot data-slot="form-control" {...props} />
}

function FormDescription({ className, ...props }) {
  return (
    <p
      data-slot="form-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }) {
  return (
    <p
      data-slot="form-message"
      className={cn("text-destructive text-sm", className)}
      {...props}
    />
  )
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage }