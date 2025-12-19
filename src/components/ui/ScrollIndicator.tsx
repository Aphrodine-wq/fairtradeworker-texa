import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLElement>
  className?: string
  orientation?: "vertical" | "horizontal"
  dotCount?: number
}

export function ScrollIndicator({
  containerRef,
  className,
  orientation = "vertical",
  dotCount = 10
}: ScrollIndicatorProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const indicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScrollPosition = () => {
      if (orientation === "vertical") {
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight - container.clientHeight
        setScrollPosition(scrollTop)
        setMaxScroll(scrollHeight)
      } else {
        const scrollLeft = container.scrollLeft
        const scrollWidth = container.scrollWidth - container.clientWidth
        setScrollPosition(scrollLeft)
        setMaxScroll(scrollWidth)
      }
    }

    updateScrollPosition()
    container.addEventListener("scroll", updateScrollPosition)
    window.addEventListener("resize", updateScrollPosition)

    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(updateScrollPosition)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener("scroll", updateScrollPosition)
      window.removeEventListener("resize", updateScrollPosition)
      resizeObserver.disconnect()
    }
  }, [containerRef, orientation])

  // Don't show indicator if content doesn't scroll
  if (maxScroll <= 0) return null

  const activeDotIndex = Math.round(
    (scrollPosition / maxScroll) * (dotCount - 1)
  )

  return (
    <div
      ref={indicatorRef}
      className={cn(
        "flex items-center gap-1.5 pointer-events-none",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: dotCount }).map((_, index) => {
        const isActive = index === activeDotIndex
        const distance = Math.abs(index - activeDotIndex)
        const opacity = Math.max(0.2, 1 - distance * 0.3)

        return (
          <div
            key={index}
            className={cn(
              "rounded-full transition-all duration-200",
              orientation === "vertical" ? "w-1.5 h-1.5" : "w-1.5 h-1.5",
              isActive
                ? "bg-foreground w-2 h-2"
                : "bg-foreground/40"
            )}
            style={{
              opacity: isActive ? 1 : opacity,
              transform: isActive ? "scale(1.2)" : "scale(1)"
            }}
          />
        )
      })}
    </div>
  )
}

interface ScrollableContainerProps {
  children: React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal"
  showIndicator?: boolean
  indicatorPosition?: "left" | "right" | "top" | "bottom"
  indicatorClassName?: string
}

export function ScrollableContainer({
  children,
  className,
  orientation = "vertical",
  showIndicator = true,
  indicatorPosition = "right",
  indicatorClassName
}: ScrollableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const positionClasses = {
    vertical: {
      left: "left-2 top-1/2 -translate-y-1/2",
      right: "right-2 top-1/2 -translate-y-1/2"
    },
    horizontal: {
      top: "top-2 left-1/2 -translate-x-1/2",
      bottom: "bottom-2 left-1/2 -translate-x-1/2"
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className={cn(
          "overflow-auto",
          orientation === "vertical" ? "overflow-y-auto overflow-x-hidden" : "overflow-x-auto overflow-y-hidden"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        {children}
      </div>
      {showIndicator && containerRef.current && (
        <div
          className={cn(
            "absolute z-10",
            orientation === "vertical"
              ? positionClasses.vertical[indicatorPosition as "left" | "right"]
              : positionClasses.horizontal[indicatorPosition as "top" | "bottom"]
          )}
        >
          <ScrollIndicator
            containerRef={containerRef}
            orientation={orientation}
            className={indicatorClassName}
          />
        </div>
      )}
    </div>
  )
}