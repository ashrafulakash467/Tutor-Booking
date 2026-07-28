"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Carousel({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }) {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <div
      data-slot="carousel"
      ref={carouselRef}
      className={cn("overflow-hidden", className)}
      role="region"
      aria-roledescription="carousel"
      {...props}
    >
      <div
        data-slot="carousel-content"
        className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col")}
      >
        {children}
      </div>
    </div>
  )
}

function CarouselContent({ className, ...props }) {
  return <div data-slot="carousel-content" className={cn("flex min-w-0 shrink-0 grow-0 basis-full pl-4", className)} {...props} />
}

function CarouselItem({ className, ...props }) {
  return <div data-slot="carousel-item" className={cn("min-w-0 shrink-0 grow-0 basis-full", className)} {...props} />
}

function CarouselPrevious({ className, variant = "outline", size = "icon", ...props }) {
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("absolute size-8 rounded-full", className)}
      {...props}
    >
      <ArrowLeft className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({ className, variant = "outline", size = "icon", ...props }) {
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("absolute size-8 rounded-full", className)}
      {...props}
    >
      <ArrowRight className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }