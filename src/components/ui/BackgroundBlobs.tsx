import { memo } from "react"

/**
 * BackgroundBlobs - Blue gradient blob backgrounds for visual depth
 * Adds subtle blue-tinted gradient blobs to the background
 * Hidden in dark mode to maintain pure black background
 */
export const BackgroundBlobs = memo(() => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:hidden">
      {/* Top right blob - blue */}
      <div 
        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl"
        aria-hidden="true"
      />
      
      {/* Bottom left blob - subtle blue */}
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"
        aria-hidden="true"
      />
      
      {/* Center wash */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl bg-blue-50/30"
        aria-hidden="true"
      />
    </div>
  )
})

BackgroundBlobs.displayName = 'BackgroundBlobs'
